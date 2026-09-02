import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { AlertCircle, Loader2, RefreshCw, X, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import * as THREE from "three";
import { sculptures } from "../data/sculptures";

const MUVA_BG = "#2a2018";

class ErrorBoundary extends Component<
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

function SculptureModel({ url, onLoaded }: { url: string; onLoaded: () => void }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

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
    if (!ref.current) return;
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 2.4 / maxDim : 1;
    ref.current.scale.setScalar(scale);
    ref.current.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    onLoaded();
  }, [cloned, onLoaded]);

  useFrame(() => {
    if (ref.current) {
      ref.current.position.y = Math.sin(Date.now() * 0.0008) * 0.02;
    }
  });

  return (
    <group ref={ref}>
      <primitive object={cloned} />
    </group>
  );
}

function CameraController({ orbitRef }: { orbitRef: React.MutableRefObject<any> }) {
  const { camera } = useThree();

  useEffect(() => {
    const onZoom = (delta: number) => {
      if (!orbitRef.current) return;
      const cam = orbitRef.current.object;
      const target = orbitRef.current.target;
      const dir = new THREE.Vector3().subVectors(cam.position, target).normalize();
      cam.position.addScaledVector(dir, delta);
      orbitRef.current.update();
    };
    const onIn = () => onZoom(0.5);
    const onOut = () => onZoom(-0.5);
    window.addEventListener("muva:zoom-in", onIn);
    window.addEventListener("muva:zoom-out", onOut);
    return () => {
      window.removeEventListener("muva:zoom-in", onIn);
      window.removeEventListener("muva:zoom-out", onOut);
    };
  }, [camera, orbitRef]);

  return null;
}

export default function SculptureViewer() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<any>(null);

  const sculpture = activeId ? sculptures.find((s) => s.id === activeId) : null;

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail.id;
      setActiveId(id);
      setError(false);
      setLoading(true);
      setClosing(false);
    };
    window.addEventListener("muva:open-sculpture", handler);
    return () => window.removeEventListener("muva:open-sculpture", handler);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const close = () => {
    setClosing(true);
    window.setTimeout(() => {
      setActiveId(null);
      setClosing(false);
      setError(false);
      setLoading(false);
    }, 400);
  };

  const reset = () => orbitRef.current?.reset();
  const zoomIn = () => window.dispatchEvent(new Event("muva:zoom-in"));
  const zoomOut = () => window.dispatchEvent(new Event("muva:zoom-out"));

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  if (!activeId || !sculpture) return null;

  const buttonClass =
    "flex h-11 w-11 items-center justify-center border border-muva-cream/20 bg-muva-dark/60 text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream/60 hover:bg-muva-dark/90";

  return (
    <div
      className={`fixed inset-0 z-[80] transition-opacity duration-500 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={`Visor 3D – ${sculpture.title}`}
    >
      <div
        className="absolute inset-0 bg-muva-dark/95 backdrop-blur-md"
        onClick={close}
      />

      <div
        ref={containerRef}
        className="relative z-10 flex h-full w-full flex-col"
      >
        <div className="relative flex-1 overflow-hidden">
          <Canvas
            shadows
            dpr={[1, 1.8]}
            camera={{ position: [3.5, 2.2, 4.5], fov: 38 }}
            gl={{ antialias: true, preserveDrawingBuffer: false, alpha: false }}
            onCreated={({ gl, scene }) => {
              gl.setClearColor(new THREE.Color(MUVA_BG));
              scene.fog = new THREE.Fog(MUVA_BG, 8, 18);
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
              shadow-mapSize={[1024, 1024]}
            />
            <directionalLight
              position={[-4, 3, -3]}
              intensity={0.4}
              color="#c9b89a"
            />
            <spotLight
              position={[0, 6, 0]}
              angle={0.6}
              penumbra={0.7}
              intensity={0.8}
              color="#fdfaf3"
            />

            <Suspense fallback={null}>
              <ErrorBoundary onError={() => setError(true)}>
                <SculptureModel
                  url={sculpture.model}
                  onLoaded={() => setLoading(false)}
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
              </ErrorBoundary>
            </Suspense>

            <OrbitControls
              ref={orbitRef}
              enableDamping
              dampingFactor={0.08}
              enablePan={false}
              minDistance={2}
              maxDistance={9}
              autoRotate={false}
              makeDefault
            />
            <CameraController orbitRef={orbitRef} />
          </Canvas>

          {loading && !error && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-muva-dark/40 backdrop-blur-[2px]">
              <Loader2
                size={32}
                className="animate-spin text-muva-sand"
                strokeWidth={1.2}
              />
              <div className="mt-6 font-sans text-[11px] uppercase tracking-extra-wide text-muva-cream/80">
                Preparando la experiencia
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muva-dark/95 p-6 text-center">
              <AlertCircle size={36} className="text-muva-sand" strokeWidth={1.4} />
              <p className="mt-6 font-serif text-2xl text-muva-cream">
                No fue posible cargar esta obra.
              </p>
              <p className="mt-3 max-w-md text-sm text-muva-cream/60">
                Verificá que el archivo <code className="text-muva-sand">.glb</code>{" "}
                correspondiente se encuentre en la carpeta
                <code className="text-muva-sand"> /public/models/sculptures/</code>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setError(false);
                  setLoading(true);
                }}
                className="mt-8 inline-flex items-center gap-2 border border-muva-cream/40 px-6 py-3 font-sans text-[11px] uppercase tracking-extra-wide text-muva-cream transition-colors duration-300 hover:border-muva-cream hover:bg-muva-cream/10"
              >
                <RefreshCw size={14} />
                Intentar nuevamente
              </button>
            </div>
          )}

          {/* Top bar */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-5 md:p-7">
            <button
              type="button"
              onClick={close}
              className="pointer-events-auto group flex items-center gap-2 border border-muva-cream/20 bg-muva-dark/60 px-4 py-2.5 font-sans text-[11px] uppercase tracking-extra-wide text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream hover:bg-muva-cream hover:text-muva-dark"
              aria-label="Volver al inicio"
            >
              <X size={14} />
              <span className="hidden sm:inline">Volver</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className={`pointer-events-auto ${buttonClass}`}
              aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>

          {/* Right controls */}
          <div className="pointer-events-none absolute bottom-6 right-5 z-20 flex flex-col gap-2 md:bottom-8 md:right-8">
            <button
              type="button"
              onClick={zoomIn}
              className={`pointer-events-auto ${buttonClass}`}
              aria-label="Acercar"
            >
              <ZoomIn size={18} />
            </button>
            <button
              type="button"
              onClick={zoomOut}
              className={`pointer-events-auto ${buttonClass}`}
              aria-label="Alejar"
            >
              <ZoomOut size={18} />
            </button>
            <button
              type="button"
              onClick={reset}
              className={`pointer-events-auto ${buttonClass}`}
              aria-label="Restablecer vista"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Help text */}
          <div className="pointer-events-none absolute bottom-6 left-5 z-20 hidden font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream/50 md:bottom-8 md:left-8 md:block">
            Arrastrar · Rotar · Scroll · Zoom
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-muva-cream px-6 py-8 md:px-12 md:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid gap-8 md:grid-cols-12">
              <div className="md:col-span-7">
                <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
                  {sculpture.inventoryNumber} · {sculpture.year}
                </div>
                <h2 className="mt-3 font-serif text-3xl font-light text-muva-dark md:text-4xl">
                  {sculpture.title}
                </h2>
                <div className="mt-2 font-serif text-lg italic text-muva-brown">
                  {sculpture.artist}
                </div>
                <p className="mt-6 max-w-2xl text-muva-brown text-pretty">
                  {sculpture.description}
                </p>
                {sculpture.historicalContext && (
                  <p className="mt-4 max-w-2xl text-sm italic text-muva-stone text-pretty">
                    {sculpture.historicalContext}
                  </p>
                )}
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 self-center md:col-span-5 md:grid-cols-1 md:gap-y-3">
                {sculpture.material && (
                  <>
                    <dt className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
                      Material
                    </dt>
                    <dd className="-mt-2 text-sm text-muva-dark md:mt-0">
                      {sculpture.material}
                    </dd>
                  </>
                )}
                {sculpture.dimensions && (
                  <>
                    <dt className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
                      Dimensiones
                    </dt>
                    <dd className="-mt-2 text-sm text-muva-dark md:mt-0">
                      {sculpture.dimensions}
                    </dd>
                  </>
                )}
                {sculpture.year && (
                  <>
                    <dt className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
                      Año
                    </dt>
                    <dd className="-mt-2 text-sm text-muva-dark md:mt-0">
                      {sculpture.year}
                    </dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
