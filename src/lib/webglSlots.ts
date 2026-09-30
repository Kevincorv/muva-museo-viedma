import { useEffect, useState } from "react";
import { inlineCanvasLimit } from "./capabilities";

type Release = () => void;

let active = 0;
let limit = -1;
let timer: ReturnType<typeof setTimeout> | null = null;
const waiting = new Set<() => void>();

/** Pausa entre grants para no decodificar varios .glb pesados a la vez. */
const GRANT_INTERVAL_MS = 70;

function ensureLimit() {
  if (limit < 0) limit = inlineCanvasLimit();
}

function pump() {
  ensureLimit();
  if (active >= limit || waiting.size === 0) return;
  const it = waiting.values().next().value;
  if (it === undefined) return;
  waiting.delete(it);
  active += 1;
  it();
  if (waiting.size > 0) schedulePump();
}

function schedulePump() {
  if (timer !== null || typeof setTimeout === "undefined") return;
  timer = setTimeout(() => {
    timer = null;
    pump();
  }, GRANT_INTERVAL_MS);
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
