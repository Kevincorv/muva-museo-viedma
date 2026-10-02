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
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import {
  Loader2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
} from "lucide-react";
import * as THREE from "three";
import { sculptures, type Sculpture } from "../data/sculptures";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useNearViewport } from "../hooks/useNearViewport";
import { useLanguage } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";
import { shouldUseStatic3D, isSlowConnection } from "../lib/capabilities";
import { fitCameraToModel } from "../lib/fitCamera";
import { openSculptureViewer } from "../lib/viewer";
import { useWebGLSlot } from "../lib/webglSlots";
import AudioPlayer from "./AudioPlayer";
import SculptureStaticTile from "./SculptureStaticTile";

const MUVA_BG = "#2a2018";

function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

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

class CanvasErrorBoundary extends Component<
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
  orbitRef,
}: {
  url: string;
  onLoaded: () => void;
  orbitRef: React.MutableRefObject<any>;
}) {
  const { scene } = useGLTF(url, "/draco/");
  const ref = useRef<THREE.Group>(null);
  const loadedRef = useRef(false);
  const { camera, size: canvasSize, invalidate } = useThree();
  const halfExtents = useRef<THREE.Vector3 | null>(null);
  const fittedAspect = useRef(0);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
      }
    });
    return c;
  }, [scene]);

  const fitToFrame = () => {
    const half = halfExtents.current;
    if (!half) return;
    fitCameraToModel({
      camera: camera as THREE.PerspectiveCamera,
      canvasSize: { width: canvasSize.width, height: canvasSize.height },
      halfExtents: half,
      controls: orbitRef.current,
      margin: 1.1,
      invalidate,
    });
    fittedAspect.current = canvasSize.width / Math.max(canvasSize.height, 1);
  };

  useEffect(() => {
    if (!ref.current || loadedRef.current) return;
    loadedRef.current = true;
    const box = new THREE.Box3().setFromObject(cloned);
    const boxSize = new THREE.Vector3();
    const boxCenter = new THREE.Vector3();
    box.getSize(boxSize);
    box.getCenter(boxCenter);
    const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
    const scale = maxDim > 0 ? 2.2 / maxDim : 1;
    ref.current.scale.setScalar(scale);
    ref.current.position.set(
      -boxCenter.x * scale,
      -boxCenter.y * scale,
      -boxCenter.z * scale
    );
    halfExtents.current = new THREE.Vector3(
      (boxSize.x * scale) / 2,
      (boxSize.y * scale) / 2,
      (boxSize.z * scale) / 2
    );
    fitToFrame();
    onLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloned, onLoaded]);

  // Reencuadra si la tarjeta cambia de tamaño (rotar el celular, responsive).
  useEffect(() => {
    if (!halfExtents.current) return;
    const aspect = canvasSize.width / Math.max(canvasSize.height, 1);
    const last = fittedAspect.current;
    if (last && Math.abs(aspect - last) < last * 0.3) return;
    fitToFrame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize.width, canvasSize.height]);

  useEffect(() => {
    return () => {
      useGLTF.clear(url);
    };
  }, [url]);

  return (
    <group ref={ref}>
      <primitive object={cloned} />
    </group>
  );
}

/**
 * OrbitControls fuerza `touch-action: none`, lo que "traba" el scroll de la
 * página al deslizar el dedo sobre la escultura en un celular. Con `pan-y`
 * el deslizamiento vertical desplaza la página y el horizontal rota la pieza.
 * Cuando el canvas no es interactivo (carrusel en táctil) se restaura `auto`
 * para que el deslizamiento horizontal avance el carrusel.
 */
function TouchScrollGuard({ interactive = true }: { interactive?: boolean }) {
  const { gl } = useThree();

  useEffect(() => {
    const coarse =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
    if (!coarse) return;
    gl.domElement.style.touchAction = interactive ? "pan-y" : "auto";
  });

  return null;
}

export function SculptureCanvas({
  modelUrl,
  onError,
  compact = false,
  interactive = true,
}: {
  modelUrl: string;
  onError: () => void;
  compact?: boolean;
  interactive?: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const orbitRef = useRef<any>(null);
  const { locale } = useLanguage();
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const disposedRef = useRef(false);

  useEffect(() => {
    return () => {
      disposedRef.current = true;
      const gl = glRef.current;
      glRef.current = null;
      if (!gl) return;
      setTimeout(() => {
        try {
          gl.dispose();
          gl.forceContextLoss();
        } catch {
          /* el contexto ya fue liberado por el navegador */
        }
      }, 0);
    };
  }, []);

  const reset = () => orbitRef.current?.reset();
  const handleLoaded = useCallback(() => setLoading(false), []);

  return (
    <div className={`relative w-full overflow-hidden rounded-sm bg-muva-dark ${compact ? "aspect-square" : "aspect-[4/5] md:aspect-[3/4]"}`}>
      <CanvasErrorBoundary onError={onError}>
        <Canvas
          frameloop="demand"
          dpr={[1, 1]}
          camera={{ position: [3.5, 2.2, 4.5], fov: 38 }}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: "default",
            stencil: false,
            depth: true,
          }}
          onCreated={({ gl, scene }) => {
            glRef.current = gl;
            gl.setClearColor(new THREE.Color(MUVA_BG));
            gl.toneMappingExposure = 1.4;
            scene.fog = new THREE.Fog(MUVA_BG, 8, 18);
            gl.domElement.addEventListener(
              "webglcontextlost",
              (e: Event) => {
                e.preventDefault();
                if (disposedRef.current) return;
                onError();
              },
              false
            );
          }}
        >
          <color attach="background" args={[MUVA_BG]} />
          <fog attach="fog" args={[MUVA_BG, 8, 18]} />

          <ambientLight intensity={1.5} color="#e8dcc4" />
          <directionalLight
            position={[5, 6, 5]}
            intensity={2.6}
            color="#f5ecda"
          />
          <directionalLight
            position={[-4, 3, -3]}
            intensity={1.15}
            color="#c9b89a"
          />
          <directionalLight
            position={[0, 2, 8]}
            intensity={0.85}
            color="#fff2df"
          />

          <Suspense fallback={null}>
            <ModelErrorBoundary onError={onError}>
              <EmbeddedModel
                url={modelUrl}
                onLoaded={handleLoaded}
                orbitRef={orbitRef}
              />
            </ModelErrorBoundary>
          </Suspense>

          <OrbitControls
            ref={orbitRef}
            enabled={interactive}
            enableDamping
            dampingFactor={0.08}
            enablePan={true}
            panSpeed={0.5}
            minDistance={0.3}
            maxDistance={12}
            autoRotate={false}
            makeDefault
          />

          <TouchScrollGuard interactive={interactive} />
        </Canvas>
      </CanvasErrorBoundary>

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

      {!loading && !compact && (
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

      {!loading && !compact && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-20 hidden font-sans text-[9px] uppercase tracking-extra-wide text-muva-cream/50 md:bottom-4 md:left-4 md:flex md:items-center md:gap-1.5">
          <Move size={10} />
          {t("collection3d.arrastrar", locale)}
        </div>
      )}
    </div>
  );
}

export function ThumbnailFallback({
  sculpture,
  compact = false,
}: {
  sculpture: Sculpture;
  compact?: boolean;
}) {
  const { locale } = useLanguage();
  return (
    <div className={`relative w-full overflow-hidden bg-muva-sand ${compact ? "aspect-square" : "aspect-[4/5] md:aspect-[3/4]"}`}>
      <img
        src={sculpture.thumbnail}
        alt={sculpture.getTitle(locale)}
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

function PieceTexts({
  iconografia,
  historia,
}: {
  iconografia: string[];
  historia: string[];
}) {
  const [showHistoria, setShowHistoria] = useState(false);
  const { locale } = useLanguage();

  return (
    <div className="mt-4 space-y-4 text-sm text-muva-brown text-pretty">
      {iconografia.length > 0 && (
        <div>
          <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
            {t("sculpture.labelIconografia", locale)}
          </div>
          {iconografia.map((paragraph, i) => (
            <p key={i} className={i === 0 ? "mt-2" : "mt-3"}>
              {paragraph}
            </p>
          ))}
        </div>
      )}
      {iconografia.length > 0 && (
        <button
          type="button"
          onClick={() => setShowHistoria((v) => !v)}
          aria-expanded={showHistoria}
          className="group inline-flex items-center gap-1.5 self-start border-b border-muva-sand/60 pb-1 font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth transition-colors duration-300 hover:border-muva-dark hover:text-muva-dark"
        >
          {showHistoria
            ? t("collection3d.verMenos", locale)
            : t("collection3d.verMas", locale)}
          <ChevronDown
            size={12}
            className={`transition-transform duration-300 ${
              showHistoria ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
      {(showHistoria || iconografia.length === 0) && (
        <div>
          <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
            {t("sculpture.labelHistoria", locale)}
          </div>
          {historia.map((paragraph, i) => (
            <p key={i} className={i === 0 ? "mt-2" : "mt-3"}>
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function useCoarsePointer(): boolean {
  const [coarse] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches
  );
  return coarse;
}

function SculptureTexts({ sculpture }: { sculpture: Sculpture }) {
  const { locale } = useLanguage();
  const historia = toParagraphs(sculpture.getDescription(locale));
  const iconografia = sculpture.getIconografia
    ? toParagraphs(sculpture.getIconografia(locale))
    : [];
  const blocks = sculpture.blocks;

  return (
    <>
      {blocks ? (
        <div className="mt-6 space-y-8">
          {blocks.map((block, i) => {
            const blockSubtitle = block.getSubtitle?.(locale);
            const blockIconografia = block.getIconografia
              ? toParagraphs(block.getIconografia(locale))
              : [];
            return (
              <div
                key={block.titleKey}
                className={i > 0 ? "border-t border-muva-sand/50 pt-8" : ""}
              >
                <h4 className="font-serif text-xl text-muva-dark md:text-2xl">
                  {block.getTitle(locale)}
                </h4>
                {blockSubtitle && (
                  <div className="mt-1 font-serif text-base italic text-muva-brown">
                    {blockSubtitle}
                  </div>
                )}
                <PieceTexts
                  iconografia={blockIconografia}
                  historia={toParagraphs(block.getDescription(locale))}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <PieceTexts iconografia={iconografia} historia={historia} />
      )}
      {sculpture.getAudio && (
        <div className="mt-5 max-w-sm">
          <AudioPlayer src={sculpture.getAudio(locale)} compact />
        </div>
      )}
    </>
  );
}

function CarouselSlide({
  sculpture,
  index,
  isOpen,
  onToggle,
}: {
  sculpture: Sculpture;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [modelError, setModelError] = useState(false);
  const reveal = useScrollReveal<HTMLDivElement>();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const staticMode = shouldUseStatic3D();
  const hasModel = Boolean(sculpture.model);
  const wantCanvas =
    hasModel && !staticMode && !modelError && !isSlowConnection();
  const near = useNearViewport(canvasContainerRef, "80px 0px", wantCanvas);
  const hasSlot = useWebGLSlot(near && wantCanvas);
  const coarsePointer = useCoarsePointer();
  const { locale } = useLanguage();

  const subtitle = sculpture.getSubtitle?.(locale);

  return (
    <div
      ref={reveal.ref}
      data-slide
      className={`reveal-on-scroll ${
        reveal.isVisible ? "is-visible" : ""
      } w-full shrink-0 snap-start sm:w-[calc((100%_-_1.5rem)/2)] lg:w-[calc((100%_-_3rem)/3)]`}
    >
      <div
        ref={canvasContainerRef}
        className={`transition-shadow duration-300 ${
          isOpen ? "ring-1 ring-muva-earth ring-offset-4 ring-offset-muva-ivory" : ""
        }`}
      >
        {hasModel && hasSlot ? (
          <SculptureCanvas
            compact
            interactive={!coarsePointer}
            modelUrl={sculpture.model}
            onError={() => setModelError(true)}
          />
        ) : (
          <SculptureStaticTile
            sculpture={sculpture}
            compact
            reason={modelError ? "error" : undefined}
            showCta={hasModel && !modelError}
            note={!hasModel ? t("collection3d.proximamente", locale) : undefined}
          />
        )}
      </div>

      <div className="mt-4">
        <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
          {t("collection3d.pieza", locale)} {String(index + 1).padStart(2, "0")}
          {sculpture.inventoryNumber && ` · ${sculpture.inventoryNumber}`}
        </div>
        <h3 className="mt-2 font-serif text-xl text-muva-dark md:text-2xl">
          {sculpture.getTitle(locale)}
        </h3>
        {subtitle && (
          <div className="mt-1 font-serif text-sm italic text-muva-brown">
            {subtitle}
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className="inline-flex items-center gap-1.5 border-b border-muva-sand/60 pb-1 font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth transition-colors duration-300 hover:border-muva-dark hover:text-muva-dark"
          >
            {isOpen
              ? t("collection3d.cerrarFicha", locale)
              : t("collection3d.verFicha", locale)}
            <ChevronDown
              size={12}
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {hasModel && !modelError && (
            <button
              type="button"
              onClick={() => openSculptureViewer(sculpture.id)}
              className="inline-flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-extra-wide text-muva-stone transition-colors duration-300 hover:text-muva-dark"
            >
              <ExternalLink size={12} aria-hidden="true" />
              {t("collection3d.ver3d", locale)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FichaPanel({
  sculpture,
  index,
  onClose,
}: {
  sculpture: Sculpture;
  index: number;
  onClose: () => void;
}) {
  const { locale } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);
  const subtitle = sculpture.getSubtitle?.(locale);
  const material = sculpture.materialKey
    ? t(sculpture.materialKey, locale)
    : sculpture.material;
  const dimensions = sculpture.dimensionsKey
    ? t(sculpture.dimensionsKey, locale)
    : sculpture.dimensions;

  useEffect(() => {
    panelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, []);

  return (
    <div
      ref={panelRef}
      aria-live="polite"
      className="mt-10 border-t border-muva-sand/60 pt-8 md:mt-12 md:pt-10"
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-3xl">
          <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
            {t("collection3d.pieza", locale)} {String(index + 1).padStart(2, "0")}
            {sculpture.inventoryNumber && ` · ${sculpture.inventoryNumber}`}
          </div>
          <h3 className="mt-2 font-serif text-3xl text-muva-dark md:text-4xl">
            {sculpture.getTitle(locale)}
          </h3>
          {(subtitle || sculpture.artist) && (
            <div className="mt-2 font-serif text-lg italic text-muva-brown">
              {subtitle ?? sculpture.artist}
              {sculpture.year && (
                <span className="not-italic text-muva-stone">
                  {" "}
                  · {sculpture.year}
                </span>
              )}
            </div>
          )}
          {(material || dimensions) && (
            <div className="mt-3 font-sans text-[11px] uppercase tracking-extra-wide text-muva-stone">
              {material}
              {dimensions && <span> · {dimensions}</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {sculpture.model && (
            <button
              type="button"
              onClick={() => openSculptureViewer(sculpture.id)}
              className="inline-flex items-center gap-2 border border-muva-dark/30 px-4 py-2.5 font-sans text-[10px] uppercase tracking-extra-wide text-muva-dark transition-all duration-300 hover:bg-muva-dark hover:text-muva-cream"
            >
              <ExternalLink size={13} aria-hidden="true" />
              {t("collection3d.ver3d", locale)}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 border border-muva-dark/30 px-4 py-2.5 font-sans text-[10px] uppercase tracking-extra-wide text-muva-dark transition-all duration-300 hover:bg-muva-dark hover:text-muva-cream"
          >
            <X size={13} aria-hidden="true" />
            {t("collection3d.cerrarFicha", locale)}
          </button>
        </div>
      </div>

      <SculptureTexts sculpture={sculpture} />
    </div>
  );
}

export default function Collection3D() {
  const titleReveal = useScrollReveal<HTMLDivElement>();
  const { locale } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const openIndex = sculptures.findIndex((s) => s.id === openId);
  const openSculpture = openIndex >= 0 ? sculptures[openIndex] : null;

  const scrollTrack = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector<HTMLElement>("[data-slide]");
    const step = slide ? slide.offsetWidth + 24 : track.clientWidth;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section
      id="coleccion"
      className="relative bg-muva-ivory py-28 md:py-40"
      aria-label={t("collection3d.ariaSection", locale)}
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

        <div className="mt-14 flex items-center justify-end gap-3 md:mt-20">
          <button
            type="button"
            onClick={() => scrollTrack(-1)}
            aria-label={t("collection3d.anterior", locale)}
            className="flex h-11 w-11 items-center justify-center border border-muva-dark/30 text-muva-dark transition-all duration-300 hover:bg-muva-dark hover:text-muva-cream"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollTrack(1)}
            aria-label={t("collection3d.siguiente", locale)}
            className="flex h-11 w-11 items-center justify-center border border-muva-dark/30 text-muva-dark transition-all duration-300 hover:bg-muva-dark hover:text-muva-cream"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div
          ref={trackRef}
          className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8"
        >
          {sculptures.map((sculpture, i) => (
            <CarouselSlide
              key={sculpture.id}
              sculpture={sculpture}
              index={i}
              isOpen={openId === sculpture.id}
              onToggle={() =>
                setOpenId((v) => (v === sculpture.id ? null : sculpture.id))
              }
            />
          ))}
        </div>

        {openSculpture && (
          <FichaPanel
            key={openSculpture.id}
            sculpture={openSculpture}
            index={openIndex}
            onClose={() => setOpenId(null)}
          />
        )}
      </div>
    </section>
  );
}
