import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import {
  AlertCircle,
  Loader2,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import * as THREE from "three";
import { museumTitle, type MuseumSculpture } from "../../data/sculptures";
import { useLanguage } from "../../i18n/LanguageContext";
import { fitCameraToModel } from "../../lib/fitCamera";
import { DRACO_PATH, releaseModel, retainModel } from "./modelCache";
import { useVmText } from "./texts";

const MUVA_BG = "#2a2018";

class ModelErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function Model360({
  sculpture,
  onLoaded,
  orbitRef,
}: {
  sculpture: MuseumSculpture;
  onLoaded: () => void;
  orbitRef: MutableRefObject<any>;
}) {
  const url = sculpture.model;
  const { scene } = useGLTF(url, DRACO_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const loadedRef = useRef(false);
  const { camera, size: canvasSize, invalidate } = useThree();
  const halfExtents = useRef<THREE.Vector3 | null>(null);

  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = false;
        mesh.receiveShadow = false;
      }
    });
    return clone;
  }, [scene]);

  useEffect(() => {
    retainModel(url);
    return () => releaseModel(url, cloned);
  }, [url, cloned]);

  const fitToFrame = () => {
    const half = halfExtents.current;
    if (!half) return;
    fitCameraToModel({
      camera: camera as THREE.PerspectiveCamera,
      canvasSize: { width: canvasSize.width, height: canvasSize.height },
      halfExtents: half,
      controls: orbitRef.current,
      margin: 1.12,
      invalidate,
    });
  };

  useEffect(() => {
    if (loadedRef.current) return;
    const group = groupRef.current;
    if (!group) return;
    loadedRef.current = true;

    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.4 / maxDim;
    group.scale.setScalar(scale);
    group.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    halfExtents.current = new THREE.Vector3(
      (size.x * scale) / 2,
      (size.y * scale) / 2,
      (size.z * scale) / 2
    );
    fitToFrame();
    onLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloned]);

  useEffect(() => {
    if (!halfExtents.current) return;
    fitToFrame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize.width, canvasSize.height]);

  return (
    <group ref={groupRef}>
      <primitive object={cloned} />
    </group>
  );
}

/**
 * Vista 360Â° de la obra: rota, zoom y acercamiento sobre el mismo .glb
 * del recorrido (sin descargar un segundo modelo).
 */
export default function SculptureViewer360({
  sculpture,
  onClose,
}: {
  sculpture: MuseumSculpture;
  onClose: () => void;
}) {
  const t = useVmText();
  const { locale } = useLanguage();
  const orbitRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const title = museumTitle(sculpture, locale);

  const buttonClass =
    "flex h-11 w-11 items-center justify-center border border-muva-cream/25 bg-muva-dark/70 text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream/70 hover:bg-muva-dark/95";

  const zoom = (delta: number) => {
    const controls = orbitRef.current as unknown as {
      object?: THREE.Camera;
      target?: THREE.Vector3;
      update?: () => void;
    } | null;
    if (!controls?.object || !controls.target) return;
    const direction = new THREE.Vector3()
      .subVectors(controls.object.position, controls.target)
      .normalize();
    controls.object.position.addScaledVector(direction, delta);
    controls.update?.();
  };

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col bg-muva-dark/95"
      role="dialog"
      aria-modal="true"
      aria-label={`${t("v360.title")} â€“ ${title}`}
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-muva-cream/15 px-5 py-4 md:px-8">
        <div className="min-w-0">
          <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-sand">
            {t("v360.title")}
          </div>
          <div className="truncate font-serif text-xl text-muva-cream md:text-2xl">
            {title}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("v360.close")}
          className={buttonClass}
        >
          <X size={18} />
        </button>
      </header>

      <div className="relative min-h-0 flex-1">
        {!error && (
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [3.4, 2.1, 4.4], fov: 38 }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
              stencil: false,
            }}
            onCreated={({ gl, scene }) => {
              gl.setClearColor(new THREE.Color(MUVA_BG));
              gl.toneMappingExposure = 1.35;
              scene.fog = new THREE.Fog(MUVA_BG, 9, 22);
            }}
          >
            <color attach="background" args={[MUVA_BG]} />
            <fog attach="fog" args={[MUVA_BG, 9, 22]} />

            <ambientLight intensity={1.35} color="#e8dcc4" />
            <directionalLight position={[5, 6, 5]} intensity={2.4} color="#f5ecda" />
            <directionalLight position={[-4, 3, -3]} intensity={1.1} color="#c9b89a" />
            <directionalLight position={[0, 2, 8]} intensity={0.8} color="#fff2df" />
            <spotLight position={[0, 6, 0]} angle={0.6} penumbra={0.7} intensity={1.5} color="#fdfaf3" />
            <hemisphereLight color="#f5ecda" groundColor="#3d2f22" intensity={1} />

            <OrbitControls
              ref={orbitRef}
              enableDamping
              dampingFactor={0.08}
              enablePan={false}
              minDistance={1.4}
              maxDistance={9}
              makeDefault
            />

            <Suspense fallback={null}>
              <ModelErrorBoundary onError={() => setError(true)}>
                <Model360
                  sculpture={sculpture}
                  onLoaded={() => setLoading(false)}
                  orbitRef={orbitRef}
                />
              </ModelErrorBoundary>
            </Suspense>
          </Canvas>
        )}

        {loading && !error && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 size={30} className="animate-spin text-muva-sand" strokeWidth={1.2} />
            <div className="mt-5 font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream/80">
              {t("v360.loading")}
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <AlertCircle size={32} className="text-muva-sand" strokeWidth={1.3} />
            <p className="mt-5 max-w-sm font-serif text-xl text-muva-cream">
              {t("v360.error")}
            </p>
          </div>
        )}
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-muva-cream/15 px-5 py-4 md:px-8">
        <div className="hidden font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream/50 md:block">
          {t("v360.hint")}
        </div>
        <div className="flex w-full items-center justify-center gap-2 md:w-auto md:justify-end">
          <button
            type="button"
            onClick={() => zoom(-0.7)}
            aria-label={t("v360.zoomIn")}
            className={buttonClass}
          >
            <ZoomIn size={18} />
          </button>
          <button
            type="button"
            onClick={() => zoom(0.7)}
            aria-label={t("v360.zoomOut")}
            className={buttonClass}
          >
            <ZoomOut size={18} />
          </button>
          <button
            type="button"
            onClick={() => orbitRef.current?.reset?.()}
            aria-label={t("v360.reset")}
            className={buttonClass}
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
}
