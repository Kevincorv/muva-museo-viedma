import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Component,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import {
  Loader2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  AlertCircle,
} from "lucide-react";
import * as THREE from "three";
import { sculptures, type Sculpture } from "../data/sculptures";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";

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

function EmbeddedModel({
  url,
  onLoaded,
}: {
  url: string;
  onLoaded: () => void;
}) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);
  const loadedRef = useRef(false);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  useEffect(() => {
    if (!ref.current || loadedRef.current) return;
    loadedRef.current = true;
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 2.2 / maxDim : 1;
    ref.current.scale.setScalar(scale);
    ref.current.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale
    );
    onLoaded();
  }, [cloned, onLoaded]);

  useFrame(() => {
    if (ref.current) {
      ref.current.position.y =
        Math.sin(Date.now() * 0.0008) * 0.015;
    }
  });

  return (
    <group ref={ref}>
      <primitive object={cloned} />
    </group>
  );
}

function SculptureCanvas({
  modelUrl,
  onError,
}: {
  modelUrl: string;
  onError: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const orbitRef = useRef<any>(null);
  const { locale } = useLanguage();

  const reset = () => orbitRef.current?.reset();
  const handleLoaded = useCallback(() => setLoading(false), []);

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-muva-dark md:aspect-[3/4]">
      <Canvas
        shadows
        dpr={[1, 1.2]}
        camera={{ position: [3.5, 2.2, 4.5], fov: 38 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(new THREE.Color(MUVA_BG));
          scene.fog = new THREE.Fog(MUVA_BG, 8, 18);
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <color attach="background" args={[MUVA_BG]} />
        <fog attach="fog" args={[MUVA_BG, 8, 18]} />

        <ambientLight intensity={0.35} color="#e8dcc4" />
        <directionalLight
          position={[5, 6, 5]}
          intensity={1.1}
          color="#f5ecda"
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight
          position={[-4, 3, -3]}
          intensity={0.4}
          color="#c9b89a"
        />

        <Suspense fallback={null}>
          <ModelErrorBoundary onError={onError}>
            <EmbeddedModel
              url={modelUrl}
              onLoaded={handleLoaded}
            />
            <ContactShadows
              position={[0, -1.2, 0]}
              opacity={0.5}
              scale={8}
              blur={2.5}
              far={4}
              color="#1a1410"
            />
            <Environment preset="apartment" />
          </ModelErrorBoundary>
        </Suspense>

        <OrbitControls
          ref={orbitRef}
          enableDamping
          dampingFactor={0.08}
          enablePan={true}
          panSpeed={0.5}
          minDistance={0.3}
          maxDistance={12}
          autoRotate={false}
          makeDefault
        />
      </Canvas>

      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-muva-dark/40 backdrop-blur-[2px]">
          <Loader2
            size={28}
            className="animate-spin text-muva-sand"
            strokeWidth={1.2}
          />
          <div className="mt-4 font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream/80">
            {t("collection3d.cargando", locale)}
          </div>
        </div>
      )}

      {!loading && (
        <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex flex-col gap-1.5 md:bottom-4 md:right-4">
          <button
            type="button"
            onClick={() => {
              if (!orbitRef.current) return;
              const cam = orbitRef.current.object;
              const target = orbitRef.current.target;
              const dir = new THREE.Vector3()
                .subVectors(cam.position, target)
                .normalize();
              cam.position.addScaledVector(dir, -0.8);
              orbitRef.current.update();
            }}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center border border-muva-cream/20 bg-muva-dark/60 text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream/60 hover:bg-muva-dark/90"
            aria-label={t("collection3d.acercar", locale)}
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (!orbitRef.current) return;
              const cam = orbitRef.current.object;
              const target = orbitRef.current.target;
              const dir = new THREE.Vector3()
                .subVectors(cam.position, target)
                .normalize();
              cam.position.addScaledVector(dir, 0.8);
              orbitRef.current.update();
            }}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center border border-muva-cream/20 bg-muva-dark/60 text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream/60 hover:bg-muva-dark/90"
            aria-label={t("collection3d.alejar", locale)}
          >
            <ZoomOut size={15} />
          </button>
          <button
            type="button"
            onClick={reset}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center border border-muva-cream/20 bg-muva-dark/60 text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream/60 hover:bg-muva-dark/90"
            aria-label={t("collection3d.reset", locale)}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      )}

      {!loading && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-20 hidden font-sans text-[9px] uppercase tracking-extra-wide text-muva-cream/50 md:bottom-4 md:left-4 md:flex md:items-center md:gap-1.5">
          <Move size={10} />
          {t("collection3d.arrastrar", locale)}
        </div>
      )}
    </div>
  );
}

function ThumbnailFallback({
  sculpture,
}: {
  sculpture: Sculpture;
}) {
  const { locale } = useLanguage();
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-muva-sand md:aspect-[3/4]">
      <img
        src={sculpture.thumbnail}
        alt={sculpture.title}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(150deg, #c9b89a 0%, #8a7560 50%, #3d2f22 100%)",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-muva-dark/40 p-4 text-center">
        <AlertCircle
          size={28}
          className="text-muva-sand"
          strokeWidth={1.4}
        />
        <p className="mt-3 font-serif text-lg text-muva-cream">
          {t("collection3d.noDisponible", locale)}
        </p>
      </div>
    </div>
  );
}

function SculptureCard({
  sculpture,
  index,
}: {
  sculpture: Sculpture;
  index: number;
}) {
  const [modelError, setModelError] = useState(false);
  const reveal = useScrollReveal<HTMLDivElement>();
  const { locale } = useLanguage();

  return (
    <article
      ref={reveal.ref}
      className={`reveal-on-scroll ${
        reveal.isVisible ? "is-visible" : ""
      }`}
    >
      {!modelError ? (
        <SculptureCanvas
          modelUrl={sculpture.model}
          onError={() => setModelError(true)}
        />
      ) : (
        <ThumbnailFallback sculpture={sculpture} />
      )}

      <div className="mt-5">
        <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
          {t("collection3d.pieza", locale)} {String(index + 1).padStart(2, "0")}
          {sculpture.inventoryNumber &&
            ` · ${sculpture.inventoryNumber}`}
        </div>
        <h3 className="mt-2 font-serif text-2xl text-muva-dark md:text-3xl">
          {sculpture.title}
        </h3>
        <div className="mt-1 font-serif text-base italic text-muva-brown">
          {sculpture.artist}
          {sculpture.year && (
            <span className="not-italic text-muva-stone">
              {" "}
              · {sculpture.year}
            </span>
          )}
        </div>
        {sculpture.material && (
          <div className="mt-2 font-sans text-[11px] uppercase tracking-extra-wide text-muva-stone">
            {sculpture.material}
            {sculpture.dimensions && (
              <span> · {sculpture.dimensions}</span>
            )}
          </div>
        )}
        <p className="mt-3 text-sm text-muva-brown text-pretty">
          {sculpture.description}
        </p>
      </div>
    </article>
  );
}

export default function Collection3D() {
  const titleReveal = useScrollReveal<HTMLDivElement>();
  const { locale } = useLanguage();

  return (
    <section
      id="coleccion"
      className="relative bg-muva-ivory py-28 md:py-40"
      aria-label="Colección 3D"
    >
      <div className="container-muva">
        <div
          ref={titleReveal.ref}
          className={`reveal-on-scroll ${
            titleReveal.isVisible ? "is-visible" : ""
          } max-w-4xl`}
        >
          <div className="eyebrow">{t("collection3d.eyebrow", locale)}</div>
          <h2 className="mt-6 font-serif font-light text-muva-dark text-display-xl text-balance">
            {t("collection3d.heading", locale)}
          </h2>
          <p className="mt-8 max-w-2xl font-serif text-xl italic text-muva-brown text-pretty">
            {t("collection3d.description", locale)}
          </p>
        </div>

        <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-3 md:mt-24 md:gap-10">
          {sculptures.map((sculpture, i) => (
            <SculptureCard
              key={sculpture.id}
              sculpture={sculpture}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
