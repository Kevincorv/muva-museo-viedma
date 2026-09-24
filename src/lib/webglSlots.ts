import { useEffect, useState } from "react";
import { inlineCanvasLimit } from "./capabilities";

type Release = () => void;

let active = 0;
let limit = -1;
const waiting = new Set<() => void>();

function ensureLimit() {
  if (limit < 0) limit = inlineCanvasLimit();
}

function pump() {
  ensureLimit();
  while (active < limit && waiting.size > 0) {
    const it = waiting.values().next().value;
    if (it === undefined) break;
    waiting.delete(it);
    active += 1;
    it();
  }
}

/**
 * Reserva un "slot" de contexto WebGL. Solo se otorga si hay cupo
 * según las capacidades del dispositivo (0 en móviles).
 * La función devuelta libera el slot (idempotente) o lo cancela
 * si aún no había sido otorgado.
 */
export function acquireWebGLSlot(onGranted: (release: Release) => void): Release {
  ensureLimit();
  let released = false;
  let granted = false;

  const release: Release = () => {
    if (released) return;
    released = true;
    if (granted) {
      active = Math.max(0, active - 1);
      pump();
    } else {
      waiting.delete(entry);
    }
  };

  const entry = () => {
    if (released) return;
    granted = true;
    onGranted(release);
  };

  waiting.add(entry);
  pump();
  return release;
}

/** Hook: true cuando este componente posee un slot de WebGL activo. */
export function useWebGLSlot(enabled: boolean): boolean {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setGranted(false);
      return;
    }
    setGranted(false);
    const release = acquireWebGLSlot(() => setGranted(true));
    return () => {
      setGranted(false);
      release();
    };
  }, [enabled]);

  return granted;
}
