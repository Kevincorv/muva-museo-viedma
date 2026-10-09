import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  buildWallSegments,
  rooms,
  WALL_HEIGHT,
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
              return (
                <g key={room.id}>
                  <rect
                    x={toX(room.bounds.minX)}
                    y={toY(room.bounds.minZ)}
                    width={(room.bounds.maxX - room.bounds.minX) * SCALE}
                    height={(room.bounds.maxZ - room.bounds.minZ) * SCALE}
                    fill={active ? "#e6dcc4" : "#efe8d8"}
                  />
                  <text
                    x={toX((room.bounds.minX + room.bounds.maxX) / 2)}
                    y={toY((room.bounds.minZ + room.bounds.maxZ) / 2)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={active ? "#3d2f22" : "#8a7560"}
                    style={{
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontSize: active ? 11 : 10,
                      fontWeight: 500,
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
              />
            ))}

            <g
              transform={`translate(${toX(marker.x)} ${toY(marker.z)}) rotate(${heading})`}
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
