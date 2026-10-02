let webglOk: boolean | null = null;

export function hasWebGL(): boolean {
  if (webglOk !== null) return webglOk;
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ||
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    webglOk = !!gl;
    if (gl) {
      const lose = gl.getExtension("WEBGL_lose_context");
      if (lose && typeof lose.loseContext === "function") lose.loseContext();
    }
  } catch {
    webglOk = false;
  }
  return webglOk;
}

export function isConstrainedDevice(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const ua = navigator.userAgent || "";
    if (/Android\s+[1-5]\.|MSIE\s|Opera Mini|IEMobile/i.test(ua)) return true;
    const coarse =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
    if (coarse) return true;
    if (window.innerWidth < 768) return true;
    const mem = deviceMemoryGB();
    if (mem !== null && mem < 4) return true;
    return false;
  } catch {
    return true;
  }
}

export function deviceMemoryGB(): number | null {
  try {
    const nav = navigator as Navigator & { deviceMemory?: number };
    return typeof nav.deviceMemory === "number" ? nav.deviceMemory : null;
  } catch {
    return null;
  }
}

/** Navegadores demasiado viejos para decodificar .glb pesados en línea. */
export function isLegacyDevice(): boolean {
  if (typeof navigator === "undefined") return true;
  try {
    const ua = navigator.userAgent || "";
    return /Android\s+[1-5]\.|MSIE\s|Opera Mini|IEMobile/i.test(ua);
  } catch {
    return true;
  }
}

/** No montar ningún canvas 3D inline (sin WebGL o navegador muy antiguo). */
export function shouldUseStatic3D(): boolean {
  if (!hasWebGL()) return true;
  return isLegacyDevice();
}

/**
 * Máximo de canvases 3D embebidos en la página (0 = solo modo estático).
 * En celulares va de a uno: solo la tarjeta más cercana monta su modelo,
 * el resto espera en modo imagen hasta liberar el slot.
 */
export function inlineCanvasLimit(): number {
  if (shouldUseStatic3D()) return 0;
  if (isConstrainedDevice()) return 1;
  const mem = deviceMemoryGB();
  if (mem === null || mem <= 4) return 3;
  return 8;
}

/** Conexión lenta o ahorro de datos: evitar descargas masivas automáticas. */
export function isSlowConnection(): boolean {
  try {
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (!conn) return false;
    if (conn.saveData) return true;
    const et = conn.effectiveType;
    return et === "slow-2g" || et === "2g" || et === "3g";
  } catch {
    return false;
  }
}
