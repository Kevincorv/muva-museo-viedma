import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  buildCollisionBoxes,
  buildDoorFrames,
  buildPropColliders,
  buildWallSegments,
  museumBounds,
  rooms,
  WALL_HEIGHT,
  type MuseumRoom,
} from "../../data/museumLayout";
import { museumSculptures } from "../../data/sculptures";
import { playerState } from "./state";
import { useVmText } from "./texts";

const SCALE = 10;
const OFFSET_X = 13.5;
const OFFSET_Z = 16.5;
const VIEW_W = 270;
const VIEW_H = 310;

const toX = (x: number) => (x + OFFSET_X) * SCALE;
const toY = (z: number) => (z + OFFSET_Z) * SCALE;

const walls = buildWallSegments().filter(
  (segment) => segment.position[1] < WALL_HEIGHT / 2
);

/** Mismos valores que FirstPersonControls. */
const PLAYER_RADIUS = 0.34;

const solidBoxes = [
  ...buildCollisionBoxes(),
  ...buildPropColliders(museumSculptures),
];

const sculptureColliders = museumSculptures.map((s) => ({
  x: s.position[0],
  z: s.position[2],
  r: s.collisionRadius ?? 0.6,
}));

const doorFrames = buildDoorFrames();

/** ¿Puede pararse el jugador en (x, z)? (mismas reglas que FirstPersonControls) */
function isFree(x: number, z: number): boolean {
  if (
    x < museumBounds.minX ||
    x > museumBounds.maxX ||
    z < museumBounds.minZ ||
    z > museumBounds.maxZ
  ) {
    return false;
  }
  for (const box of solidBoxes) {
    if (
      x > box.minX - PLAYER_RADIUS &&
      x < box.maxX + PLAYER_RADIUS &&
      z > box.minZ - PLAYER_RADIUS &&
      z < box.maxZ + PLAYER_RADIUS
    ) {
      return false;
    }
  }
  for (const s of sculptureColliders) {
    const dx = x - s.x;
    const dz = z - s.z;
    const radius = s.r + PLAYER_RADIUS;
    if (dx * dx + dz * dz < radius * radius) return false;
  }
  return true;
}

/** Vanos de puerta que tocan la sala, con la dirección hacia su interior. */
function doorsForRoom(room: MuseumRoom) {
  const { minX, minZ, maxX, maxZ } = room.bounds;
  const eps = 0.01;
  const result: { x: number; z: number; nx: number; nz: number }[] = [];
  for (const frame of doorFrames) {
    const [dx, dz] = frame.center;
    if (
      Math.abs(dz - minZ) < eps &&
      dx >= minX - eps &&
      dx <= maxX + eps
    ) {
      result.push({ x: dx, z: dz, nx: 0, nz: 1 });
    } else if (
      Math.abs(dz - maxZ) < eps &&
      dx >= minX - eps &&
      dx <= maxX + eps
    ) {
      result.push({ x: dx, z: dz, nx: 0, nz: -1 });
    } else if (
      Math.abs(dx - minX) < eps &&
      dz >= minZ - eps &&
      dz <= maxZ + eps
    ) {
      result.push({ x: dx, z: dz, nx: 1, nz: 0 });
    } else if (
      Math.abs(dx - maxX) < eps &&
      dz >= minZ - eps &&
      dz <= maxZ + eps
    ) {
      result.push({ x: dx, z: dz, nx: -1, nz: 0 });
    }
  }
  return result;
}

/**
 * Punto libre para aparecer en la sala: entra por una puerta hacia el
 * interior; si no hay sitio, cae en una malla radial alrededor del centro.
 */
function findSpawn(room: MuseumRoom) {
  const { minX, minZ, maxX, maxZ } = room.bounds;
  const inside = (x: number, z: number) =>
    x > minX + 0.4 &&
    x < maxX - 0.4 &&
    z > minZ + 0.4 &&
    z < maxZ - 0.4;

  for (const door of doorsForRoom(room)) {
    for (const dist of [1.2, 1.8, 2.4, 3.0, 3.6]) {
      for (const lat of [0, 0.7, -0.7, 1.4, -1.4]) {
        const x = door.x + door.nx * dist + (door.nx === 0 ? lat : 0);
        const z = door.z + door.nz * dist + (door.nz === 0 ? lat : 0);
        if (inside(x, z) && isFree(x, z)) return { x, z };
      }
    }
  }

  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  for (const dist of [0, 1, 2, 3, 4, 5]) {
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const x = cx + Math.cos(angle) * dist;
      const z = cz + Math.sin(angle) * dist;
      if (inside(x, z) && isFree(x, z)) return { x, z };
    }
  }
  return null;
}

/** Plano cenital del museo con la posiciÃ³n del visitante en tiempo real. */
export default function MuseumMap({
  currentRoomId,
  onClose,
}: {
  currentRoomId: string;
  onClose: () => void;
}) {
  const t = useVmText();
  const [marker, setMarker] = useState({
    x: playerState.position.x,
    z: playerState.position.z,
    yaw: playerState.yaw,
  });
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  /** Lleva al visitante a la entrada de la sala, mirando hacia su interior. */
  const goToRoom = (room: MuseumRoom) => {
    const spawn = findSpawn(room);
    if (!spawn) return;
    const { minX, minZ, maxX, maxZ } = room.bounds;
    const cx = (minX + maxX) / 2;
    const cz = (minZ + maxZ) / 2;
    playerState.position.x = spawn.x;
    playerState.position.z = spawn.z;
    playerState.yaw = Math.atan2(-(cx - spawn.x), -(cz - spawn.z));
    playerState.pitch = 0;
    playerState.moving = false;
    onClose();
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMarker({
        x: playerState.position.x,
        z: playerState.position.z,
        yaw: playerState.yaw,
      });
    }, 120);
    return () => window.clearInterval(interval);
  }, []);

  const heading = (-marker.yaw * 180) / Math.PI;

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-muva-dark/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t("map.title")}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-full w-full max-w-md flex-col bg-muva-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-muva-sand/50 px-5 py-4">
          <div>
            <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
              MUVA
            </div>
            <h2 className="font-serif text-2xl text-muva-dark">
              {t("map.title")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("map.close")}
            className="flex h-9 w-9 items-center justify-center border border-muva-dark/15 text-muva-dark transition-colors duration-300 hover:border-muva-dark hover:bg-muva-dark hover:text-muva-cream"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="mx-auto block h-auto w-full max-w-[320px]"
            role="img"
            aria-label={t("map.title")}
          >
            <rect
              x={0}
              y={0}
              width={VIEW_W}
              height={VIEW_H}
              fill="#f7f1e4"
              stroke="#c9b89a"
              strokeWidth={2}
            />

            {rooms.map((room) => {
              const active = room.id === currentRoomId;
              const hovered = room.id === hoveredRoom;
              return (
                <g
                  key={room.id}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={t(room.nameKey)}
                  onMouseEnter={() => setHoveredRoom(room.id)}
                  onMouseLeave={() =>
                    setHoveredRoom((current) =>
                      current === room.id ? null : current
                    )
                  }
                  onClick={() => goToRoom(room)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      goToRoom(room);
                    }
                  }}
                >
                  <title>{t(room.nameKey)}</title>
                  <rect
                    x={toX(room.bounds.minX)}
                    y={toY(room.bounds.minZ)}
                    width={(room.bounds.maxX - room.bounds.minX) * SCALE}
                    height={(room.bounds.maxZ - room.bounds.minZ) * SCALE}
                    fill={
                      active
                        ? "#e6dcc4"
                        : hovered
                          ? "#ded2b6"
                          : "#efe8d8"
                    }
                    stroke={hovered && !active ? "#8a7560" : "none"}
                    strokeWidth={hovered && !active ? 1 : 0}
                  />
                  <text
                    x={toX((room.bounds.minX + room.bounds.maxX) / 2)}
                    y={toY((room.bounds.minZ + room.bounds.maxZ) / 2)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={active ? "#3d2f22" : hovered ? "#5c4a38" : "#8a7560"}
                    style={{
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontSize: active ? 11 : 10,
                      fontWeight: 500,
                      pointerEvents: "none",
                    }}
                  >
                    {t(room.nameKey)}
                  </text>
                </g>
              );
            })}

            {walls.map((segment, index) => (
              <rect
                key={`wall-${index}`}
                x={toX(segment.position[0] - segment.size[0] / 2)}
                y={toY(segment.position[2] - segment.size[2] / 2)}
                width={segment.size[0] * SCALE}
                height={segment.size[2] * SCALE}
                fill="#3d2f22"
                style={{ pointerEvents: "none" }}
              />
            ))}

            {museumSculptures.map((sculpture) => (
              <circle
                key={sculpture.id}
                cx={toX(sculpture.position[0])}
                cy={toY(sculpture.position[2])}
                r={3.4}
                fill="#6b4f35"
                opacity={0.75}
                style={{ pointerEvents: "none" }}
              />
            ))}

            <g
              transform={`translate(${toX(marker.x)} ${toY(marker.z)}) rotate(${heading})`}
              style={{ pointerEvents: "none" }}
            >
              <circle r={6} fill="#1a1410" stroke="#faf6ee" strokeWidth={2} />
              <path d="M 0 -13 L 4.5 -5 L -4.5 -5 Z" fill="#1a1410" />
            </g>
          </svg>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-sans text-[10px] uppercase tracking-extra-wide text-muva-stone">
            <span className="flex items-center gap-2">
              <svg width="12" height="12" aria-hidden="true">
                <circle cx="6" cy="6" r="5" fill="#1a1410" />
              </svg>
              {t("map.you")}
            </span>
            <span className="flex items-center gap-2">
              <svg width="12" height="12" aria-hidden="true">
                <circle cx="6" cy="6" r="4" fill="#6b4f35" />
              </svg>
              {t("map.works")}
            </span>
          </div>

          <p className="mt-4 text-center text-sm text-muva-brown">
            {t("map.hint")}
          </p>
        </div>
      </div>
    </div>
  );
}
