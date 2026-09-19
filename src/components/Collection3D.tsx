import { Suspense, useCallback, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Upload, Loader2, RotateCcw, ZoomIn, ZoomOut, Move } from "lucide-react";
import * as THREE from "three";
import { sculptures, type Sculpture } from "../data/sculptures";
import { useScrollReveal } from "../hooks/useScrollReveal";

const MUVA_BG = "#2a2018";

function EmbeddedModel({
  url,
  onLoaded,
}: {
  url: string;
  onLoaded: () => void;
}) {
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

  useMemo(() => {
    if (!ref.current) return;
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

function Sculpture3DViewer({
  modelUrl,
}: {
  modelUrl: string;
}) {
  const [loading, setLoading] = useState(true);
  const orbitRef = useRef<any>(null);

  const reset = () => orbitRef.current?.reset();

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-muva-dark md:aspect-[3/4]">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [3.5, 2.2, 4.5], fov: 38 }}
        gl={{ antialias: true, alpha: false }}
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
          shadow-mapSize={[512, 512]}
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
          <EmbeddedModel
            url={modelUrl}
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
      </Canvas>

      {loading && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-muva-dark/40 backdrop-blur-[2px]">
          <Loader2
            size={28}
            className="animate-spin text-muva-sand"
            strokeWidth={1.2}
          />
          <div className="mt-4 font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream/80">
            Cargando modelo 3D
          </div>
        </div>
      )}

      {/* Controls */}
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
            cam.position.addScaledVector(dir, 0.5);
            orbitRef.current.update();
          }}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center border border-muva-cream/20 bg-muva-dark/60 text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream/60 hover:bg-muva-dark/90"
          aria-label="Acercar"
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
            cam.position.addScaledVector(dir, -0.5);
            orbitRef.current.update();
          }}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center border border-muva-cream/20 bg-muva-dark/60 text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream/60 hover:bg-muva-dark/90"
          aria-label="Alejar"
        >
          <ZoomOut size={15} />
        </button>
        <button
          type="button"
          onClick={reset}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center border border-muva-cream/20 bg-muva-dark/60 text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream/60 hover:bg-muva-dark/90"
          aria-label="Restablecer vista"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 z-20 hidden font-sans text-[9px] uppercase tracking-extra-wide text-muva-cream/50 md:bottom-4 md:left-4 md:flex md:items-center md:gap-1.5">
        <Move size={10} />
        Arrastrar · Scroll · Zoom
      </div>
    </div>
  );
}

function SculptureUploadCard({
  sculpture,
  index,
}: {
  sculpture: Sculpture;
  index: number;
}) {
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(
    null
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reveal = useScrollReveal<HTMLDivElement>();

  const handleUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.name.endsWith(".glb")) {
        alert("Solo se aceptan archivos .glb");
        return;
      }
      if (customModelUrl) {
        URL.revokeObjectURL(customModelUrl);
      }
      const url = URL.createObjectURL(file);
      setCustomModelUrl(url);
      setFileName(file.name);
    },
    [customModelUrl]
  );

  const modelUrl =
    customModelUrl ?? sculpture.model;

  return (
    <article
      ref={reveal.ref}
      className={`reveal-on-scroll ${
        reveal.isVisible ? "is-visible" : ""
      }`}
    >
      <Sculpture3DViewer
        modelUrl={modelUrl}
      />

      <div className="mt-5">
        <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
          Pieza · {String(index + 1).padStart(2, "0")}
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

        {/* Upload button */}
        <div className="mt-5">
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb"
            onChange={handleUpload}
            className="hidden"
            aria-label={`Subir modelo 3D para ${sculpture.title}`}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group inline-flex items-center gap-2.5 border border-muva-earth/40 px-5 py-2.5 font-sans text-[11px] uppercase tracking-extra-wide text-muva-dark transition-all duration-300 hover:border-muva-earth hover:bg-muva-earth hover:text-muva-cream"
          >
            <Upload
              size={14}
              className="transition-transform duration-300 group-hover:-translate-y-0.5"
            />
            {fileName
              ? `Modelo: ${fileName}`
              : "Subir modelo 3D (.glb)"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Collection3D() {
  const titleReveal = useScrollReveal<HTMLDivElement>();

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
          <div className="eyebrow">Colección</div>
          <h2 className="mt-6 font-serif font-light text-muva-dark text-display-xl text-balance">
            Explorá la colección
            <br />
            en tres dimensiones
          </h2>
          <p className="mt-8 max-w-2xl font-serif text-xl italic text-muva-brown text-pretty">
            Recorré cada obra de Manuel Viedma en 360°. Girá,
            acercá y alejá cada pieza para descubrir sus
            detalles. Subí tus propios modelos{" "}
            <code className="text-muva-earth">.glb</code> para
            reemplazar o agregar esculturas.
          </p>
        </div>

        <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-3 md:mt-24 md:gap-10">
          {sculptures.map((sculpture, i) => (
            <SculptureUploadCard
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
