import { useRef } from "react";
import { Hand } from "lucide-react";
import { inputState } from "./state";
import { useVmText } from "./texts";

const MAX_RADIUS = 44;

/**
 * Controles táctiles: joystick virtual para caminar (abajo a la izquierda)
 * y botón de interacción (abajo a la derecha). La mirada se controla
 * deslizando el dedo sobre cualquier otra zona del canvas.
 */
export default function MobileControls({
  interactable,
  onInteract,
}: {
  interactable: boolean;
  onInteract: () => void;
}) {
  const t = useVmText();
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);

  const apply = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);
    if (distance > MAX_RADIUS) {
      dx = (dx / distance) * MAX_RADIUS;
      dy = (dy / distance) * MAX_RADIUS;
    }
    inputState.joyX = dx / MAX_RADIUS;
    inputState.joyY = -dy / MAX_RADIUS;
    if (knobRef.current) {
      knobRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    }
  };

  const reset = () => {
    activePointer.current = null;
    inputState.joyX = 0;
    inputState.joyY = 0;
    if (knobRef.current) knobRef.current.style.transform = "translate3d(0, 0, 0)";
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-5 pb-7 md:p-7">
      <div
        ref={baseRef}
        className="pointer-events-auto relative h-32 w-32 touch-none rounded-full border border-muva-cream/30 bg-muva-dark/35 backdrop-blur-sm"
        role="application"
        aria-label={t("hud.joystick")}
        onPointerDown={(event) => {
          event.preventDefault();
          activePointer.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          apply(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (activePointer.current !== event.pointerId) return;
          apply(event.clientX, event.clientY);
        }}
        onPointerUp={reset}
        onPointerCancel={reset}
        onLostPointerCapture={reset}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-sans text-[9px] uppercase tracking-extra-wide text-muva-cream/50">
            {t("hud.joystick")}
          </span>
        </div>
        <div
          ref={knobRef}
          className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-muva-cream/50 bg-muva-cream/25 transition-transform duration-75"
        />
      </div>

      <button
        type="button"
        onClick={onInteract}
        disabled={!interactable}
        aria-label={t("hud.interact")}
        className={`pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300 ${
          interactable
            ? "border-muva-cream/70 bg-muva-cream/90 text-muva-dark active:scale-95"
            : "border-muva-cream/20 bg-muva-dark/30 text-muva-cream/40"
        }`}
      >
        <Hand size={24} strokeWidth={1.5} />
      </button>
    </div>
  );
}
