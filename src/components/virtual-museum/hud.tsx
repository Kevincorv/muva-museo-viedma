import { useMemo, type ReactNode } from "react";
import {
  isConstrainedDevice,
  isSlowConnection,
  shouldUseStatic3D,
} from "../../lib/capabilities";

/** Botón de icono del HUD (mapa, ayuda, pantalla completa, salir). */
export function HudIconButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`pointer-events-auto flex h-10 w-10 items-center justify-center border backdrop-blur-sm transition-all duration-300 ${
        active
          ? "border-muva-cream/70 bg-muva-cream text-muva-dark"
          : "border-muva-cream/25 bg-muva-dark/55 text-muva-cream hover:border-muva-cream/70 hover:bg-muva-dark/85"
      }`}
    >
      {children}
    </button>
  );
}

/** Capacidades del dispositivo: táctil, modo liviano y conexión lenta. */
export function useDeviceFlags() {
  return useMemo(() => {
    const touch =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
    return {
      isTouch: touch,
      lightMode: touch || isConstrainedDevice(),
      slowConnection: isSlowConnection(),
      unsupported: shouldUseStatic3D(),
    };
  }, []);
}
