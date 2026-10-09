import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Link, useNavigate } from "react-router-dom";
import {
  CircleHelp,
  LogOut,
  Map as MapIcon,
  MapPin,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  museumSculptures,
  museumSculptureById,
  museumTitle,
} from "../../data/sculptures";
import { playerSpawn, roomAt, roomById } from "../../data/museumLayout";
import { useLanguage } from "../../i18n/LanguageContext";
import ControlsHelp from "./ControlsHelp";
import FirstPersonControls from "./FirstPersonControls";
import LoadingScreen from "./LoadingScreen";
import MuseumEnvironment from "./MuseumEnvironment";
import MuseumErrorBoundary from "./MuseumErrorBoundary";
import MuseumMap from "./MuseumMap";
import MobileControls from "./MobileControls";
import SculptureInfoPanel from "./SculptureInfoPanel";
import SculptureObject from "./SculptureObject";
import SculptureViewer360 from "./SculptureViewer360";
import WelcomeScreen from "./WelcomeScreen";
import { HudIconButton, useDeviceFlags } from "./hud";
import { useVmText } from "./texts";

/** Distancia a la que una obra empieza a descargarse de memoria. */
const LOAD_DISTANCE = 24;
const UNLOAD_DISTANCE = 42;
const EYE_HEIGHT = 1.65;
const READY_TIMEOUT = 12000;
const PANEL_CLOSE_MS = 340;

type Phase = "loading" | "welcome" | "visiting";

/** Obras cuyo .glb debe estar montado según la distancia al visitante. */
function computeLoaded(
  x: number,
  z: number,
  previous: Set<string> | null
): Set<string> {
  const next = new Set<string>();
  for (const sculpture of museumSculptures) {
    if (!sculpture.model) continue;
    const distance = Math.hypot(
      sculpture.position[0] - x,
      sculpture.position[2] - z
    );
    const wasLoaded = previous?.has(sculpture.id) ?? false;
    if (wasLoaded ? distance < UNLOAD_DISTANCE : distance < LOAD_DISTANCE) {
      next.add(sculpture.id);
    }
  }
  return next;
}

const INITIAL_LOADED = Array.from(
  computeLoaded(playerSpawn.position[0], playerSpawn.position[2], null)
);

/**
 * Hilo fuera de React dentro del canvas: actualiza la sala actual y calcula
 * qué obras cargar/descargar (streaming). Muestrea ~3 veces por segundo.
 */
function MuseumRuntime({
  onRoom,
  onLoaded,
}: {
  onRoom: (roomId: string) => void;
  onLoaded: (ids: string[]) => void;
}) {
  const accumulator = useRef(0);
  const roomRef = useRef<string | null>(null);
  const loadedRef = useRef<Set<string> | null>(null);

  useFrame((_state, delta) => {
    accumulator.current += Math.min(delta, 0.5);
    if (accumulator.current < 0.35) return;
    accumulator.current = 0;

    const { x, z } = _state.camera.position;
    const room = roomAt(x, z);
    if (room && room.id !== roomRef.current) {
      roomRef.current = room.id;
      onRoom(room.id);
    }

    const next = computeLoaded(x, z, loadedRef.current);
    const previous = loadedRef.current;
    const changed =
      !previous ||
      previous.size !== next.size ||
      Array.from(next).some((id) => !previous.has(id));
    if (changed) {
      loadedRef.current = next;
      onLoaded(Array.from(next));
    }
  });

  return null;
}

function ErrorScreen({
  canRetry,
  onRetry,
}: {
  canRetry: boolean;
  onRetry: () => void;
}) {
  const t = useVmText();
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-muva-dark p-5">
      <div className="w-full max-w-md bg-muva-cream px-7 py-9 text-center shadow-2xl md:px-10">
        <div className="eyebrow justify-center">MUVA</div>
        <h1 className="mt-5 font-serif text-3xl font-light text-muva-dark">
          {t("error.title")}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muva-brown">
          {t("error.desc")}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {canRetry && (
            <button type="button" onClick={onRetry} className="btn-primary">
              {t("error.retry")}
            </button>
          )}
          <Link to="/" className="btn-secondary">
            {t("error.exit")}
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Recorrido 3D en primera persona: canvas único, HUD, ficha lateral,
 * vista 360°, mapa y controles táctiles.
 */
export default function VirtualMuseum() {
  const t = useVmText();
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const { isTouch, lightMode, slowConnection, unsupported } = useDeviceFlags();

  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [ready, setReady] = useState(false);
  const [errored, setErrored] = useState(false);
  const [locked, setLocked] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelClosing, setPanelClosing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [show360, setShow360] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(
    roomAt(playerSpawn.position[0], playerSpawn.position[2])?.id ?? "entrada"
  );
  const [loadedIds, setLoadedIds] = useState<string[]>(INITIAL_LOADED);

  const fatal = errored || unsupported;
  const loadedSet = useMemo(() => new Set(loadedIds), [loadedIds]);
  const selected = selectedId ? museumSculptureById(selectedId) : undefined;
  const hovered = hoveredId ? museumSculptureById(hoveredId) : undefined;
  const currentRoom = roomById(currentRoomId);
  const roomName = currentRoom ? t(currentRoom.nameKey) : "";
  const modalOpen = show360 || showMap || showHelp || selectedId !== null;
  const controlsEnabled = phase === "visiting" && !fatal && !modalOpen;

  const handleRoom = useCallback((roomId: string) => {
    setCurrentRoomId(roomId);
  }, []);

  const handleLoaded = useCallback((ids: string[]) => {
    setLoadedIds((previous) =>
      previous.length === ids.length && ids.every((id) => previous.includes(id))
        ? previous
        : ids
    );
  }, []);

  const handleHover = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  const closePanel = useCallback(() => {
    if (closeTimer.current !== null) return;
    setPanelClosing(true);
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setSelectedId(null);
      setPanelClosing(false);
    }, PANEL_CLOSE_MS);
  }, []);

  const handleSelect = useCallback((id: string) => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setPanelClosing(false);
    setSelectedId(id);
  }, []);

  const start = useCallback(() => {
    setPhase("visiting");
    if (isTouch) return;
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    try {
      const result = canvas.requestPointerLock() as unknown as
        | Promise<void>
        | undefined;
      if (result && typeof result.catch === "function") {
        result.catch(() => {});
      }
    } catch {
      /* el navegador puede rechazar el pointer lock */
    }
  }, [isTouch]);

  const retry = useCallback(() => {
    setErrored(false);
    setReady(false);
    setPhase("loading");
    setAttempt((value) => value + 1);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;
    try {
      if (!document.fullscreenElement) {
        const result = element.requestFullscreen?.() as unknown as
          | Promise<void>
          | undefined;
        if (result && typeof result.catch === "function") {
          result.catch(() => {});
        }
      } else {
        const result = document.exitFullscreen?.() as unknown as
          | Promise<void>
          | undefined;
        if (result && typeof result.catch === "function") {
          result.catch(() => {});
        }
      }
    } catch {
      /* algunos navegadores bloquean la pantalla completa */
    }
  }, []);

  // La pantalla de bienvenida aparece cuando el canvas ya está listo.
  useEffect(() => {
    if (!ready || fatal) return;
    const timer = window.setTimeout(() => {
      setPhase((current) => (current === "loading" ? "welcome" : current));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [ready, fatal]);

  // Red de seguridad si el canvas nunca termina de crear el contexto WebGL.
  useEffect(() => {
    if (ready || fatal) return;
    const timer = window.setTimeout(() => setErrored(true), READY_TIMEOUT);
    return () => window.clearTimeout(timer);
  }, [ready, fatal, attempt]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // ESC cierra la capa abierta; F alterna pantalla completa.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Escape") {
        if (show360) setShow360(false);
        else if (showMap) setShowMap(false);
        else if (showHelp) setShowHelp(false);
        else if (selectedId) closePanel();
        return;
      }
      if (
        (event.key === "f" || event.key === "F") &&
        !show360 &&
        !showMap &&
        !showHelp
      ) {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [show360, showMap, showHelp, selectedId, closePanel, toggleFullscreen]);

  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[100dvh] w-full select-none overflow-hidden bg-muva-dark text-muva-cream antialiased"
    >
      {!fatal && (
        <MuseumErrorBoundary key={attempt} onError={() => setErrored(true)}>
          <Canvas
            shadows="soft"
            dpr={lightMode ? [1, 1.35] : [1, 1.8]}
            frameloop={show360 ? "never" : "always"}
            camera={{
              position: [
                playerSpawn.position[0],
                EYE_HEIGHT,
                playerSpawn.position[2],
              ],
              fov: isTouch ? 70 : 62,
              near: 0.05,
              far: 140,
            }}
            gl={{
              antialias: !lightMode,
              powerPreference: "high-performance",
              stencil: false,
              alpha: false,
            }}
            onCreated={({ gl }) => {
              gl.toneMappingExposure = 1.08;
              gl.domElement.addEventListener(
                "webglcontextlost",
                (event) => {
                  event.preventDefault();
                  setErrored(true);
                },
                { once: true }
              );
              setReady(true);
            }}
          >
            <MuseumErrorBoundary onError={() => setErrored(true)}>
              <color attach="background" args={["#ddd0b4"]} />
              <fog attach="fog" args={["#ddd0b4", 28, 75]} />
              <MuseumEnvironment
                refreshKey={loadedSet.size}
                focus={
                  selected
                    ? [
                        selected.position[0],
                        selected.position[1] + 1.5,
                        selected.position[2],
                      ]
                    : null
                }
              />
              {museumSculptures.map((sculpture) => (
                <SculptureObject
                  key={sculpture.id}
                  sculpture={sculpture}
                  loaded={loadedSet.has(sculpture.id)}
                  hovered={hoveredId === sculpture.id}
                />
              ))}
              <MuseumRuntime onRoom={handleRoom} onLoaded={handleLoaded} />
              <FirstPersonControls
                enabled={controlsEnabled}
                isTouch={isTouch}
                onHover={handleHover}
                onSelect={handleSelect}
                onLockChange={setLocked}
              />
            </MuseumErrorBoundary>
          </Canvas>
        </MuseumErrorBoundary>
      )}

      {/* HUD */}
      {phase === "visiting" && !fatal && (
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="absolute left-4 top-4 flex flex-col items-start gap-2 md:left-6 md:top-6">
            <div className="font-serif text-xl leading-none tracking-[0.35em] text-muva-cream md:text-2xl">
              MUVA
            </div>
            <div className="font-sans text-[9px] uppercase tracking-extra-wide text-muva-sand">
              {t("hud.brand")}
            </div>
            <div className="mt-1 inline-flex items-center gap-2 border border-muva-cream/25 bg-muva-dark/55 px-2.5 py-1.5 backdrop-blur-sm">
              <MapPin size={11} className="text-muva-sand" />
              <span className="font-sans text-[9px] uppercase tracking-extra-wide text-muva-cream">
                {roomName}
              </span>
            </div>
          </div>

          <div className="absolute right-4 top-4 flex gap-2 md:right-6 md:top-6">
            <HudIconButton
              label={t("hud.map")}
              active={showMap}
              onClick={() => setShowMap((value) => !value)}
            >
              <MapIcon size={17} />
            </HudIconButton>
            <HudIconButton
              label={t("hud.help")}
              active={showHelp}
              onClick={() => setShowHelp((value) => !value)}
            >
              <CircleHelp size={17} />
            </HudIconButton>
            <HudIconButton
              label={isFullscreen ? t("hud.exitFullscreen") : t("hud.fullscreen")}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </HudIconButton>
            <HudIconButton label={t("hud.exit")} onClick={() => navigate("/")}>
              <LogOut size={17} />
            </HudIconButton>
          </div>

          {/* Punto de mira */}
          {!modalOpen && (
            <div
              className={`absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-muva-dark/40 transition-all duration-200 ${
                hoveredId
                  ? "scale-[1.9] bg-muva-earth"
                  : "bg-muva-cream/85"
              }`}
            />
          )}

          {/* Rótulo de la obra apuntada */}
          {hovered && !modalOpen && (
            <div className="absolute left-1/2 top-1/2 w-max max-w-[70vw] -translate-x-1/2 translate-y-8 border border-muva-cream/25 bg-muva-dark/75 px-4 py-2.5 text-center backdrop-blur-sm">
              <div className="font-sans text-[9px] uppercase tracking-extra-wide text-muva-sand">
                {t("hover.title")}
              </div>
              <div className="mt-1 font-serif text-lg leading-tight text-muva-cream">
                {museumTitle(hovered, locale)}
              </div>
              <div className="mt-1 font-sans text-[9px] uppercase tracking-extra-wide text-muva-cream/70">
                {t("hover.open")}
              </div>
            </div>
          )}

          {/* Pista de interacción (solo escritorio, aún sin bloquear el puntero) */}
          {!isTouch && !modalOpen && !locked && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-32">
              <span className="border border-muva-cream/25 bg-muva-dark/65 px-4 py-2 font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream/85 backdrop-blur-sm">
                {t("hud.lockHint")}
              </span>
            </div>
          )}

          {!isTouch && !modalOpen && (
            <div className="absolute bottom-6 left-6 hidden md:block">
              <span className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream/60">
                {t("hud.keyboard")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Controles táctiles */}
      {phase === "visiting" && !fatal && isTouch && !modalOpen && (
        <MobileControls
          interactable={Boolean(hoveredId)}
          onInteract={() => {
            if (hoveredId) handleSelect(hoveredId);
          }}
        />
      )}

      {phase === "loading" && !fatal && <LoadingScreen />}

      {phase === "welcome" && !fatal && (
        <WelcomeScreen
          isTouch={isTouch}
          slowConnection={slowConnection}
          onStart={start}
        />
      )}

      {fatal && (
        <ErrorScreen canRetry={!unsupported} onRetry={retry} />
      )}

      {selected && (
        <SculptureInfoPanel
          sculpture={selected}
          closing={panelClosing}
          onClose={closePanel}
          onView360={() => setShow360(true)}
        />
      )}

      {showMap && (
        <MuseumMap
          currentRoomId={currentRoomId}
          onClose={() => setShowMap(false)}
        />
      )}

      {showHelp && (
        <ControlsHelp isTouch={isTouch} onClose={() => setShowHelp(false)} />
      )}

      {show360 && selected && (
        <SculptureViewer360
          sculpture={selected}
          onClose={() => setShow360(false)}
        />
      )}
    </div>
  );
}
