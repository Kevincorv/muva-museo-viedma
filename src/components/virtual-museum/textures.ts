import * as THREE from "three";

/**
 * Texturas procedurales del museo: no descargan nada y se generan una sola
 * vez por montaje, así el entorno arranca sin pedir recursos externos.
 */

/** Metros que cubre una repetición de la textura de piso. */
export const FLOOR_TILE_METERS = 3;

/**
 * Mármol oscuro pulido estilo Prado: base grafito con vetas claras sutiles.
 * El `floorTone` de cada sala multiplica estos valores al renderizar.
 */
function fillMarbleFloor(ctx: CanvasRenderingContext2D, size: number) {
  // Base de mármol grafito oscuro.
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#1a1714");
  gradient.addColorStop(0.3, "#211d19");
  gradient.addColorStop(0.6, "#1e1a16");
  gradient.addColorStop(1, "#181512");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Manchas suaves de variación del mármol.
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 60 + Math.random() * 140;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const tone = Math.random() > 0.5 ? "42, 36, 30" : "28, 24, 20";
    g.addColorStop(0, `rgba(${tone}, 0.25)`);
    g.addColorStop(1, `rgba(${tone}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Vetas de mármol: líneas finas onduladas en tono claro.
  ctx.lineCap = "round";
  for (let v = 0; v < 12; v++) {
    const startX = Math.random() * size;
    const startY = Math.random() * size;
    const angle = Math.random() * Math.PI;
    const length = 120 + Math.random() * 300;
    const segments = 18;
    ctx.strokeStyle = `rgba(160, 145, 120, ${0.04 + Math.random() * 0.08})`;
    ctx.lineWidth = 0.4 + Math.random() * 1.2;
    ctx.beginPath();
    let cx = startX;
    let cy = startY;
    ctx.moveTo(cx, cy);
    for (let s = 0; s < segments; s++) {
      cx += (Math.cos(angle) * length) / segments + (Math.random() - 0.5) * 8;
      cy += (Math.sin(angle) * length) / segments + (Math.random() - 0.5) * 8;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Brillo especular sutil del pulido.
  for (let i = 0; i < 2200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle =
      Math.random() > 0.6
        ? "rgba(90, 80, 65, 0.06)"
        : "rgba(50, 44, 36, 0.04)";
    ctx.fillRect(x, y, 1.2, 1.2);
  }

  // Juntas de losas de mármol (formato grande).
  const jointColor = "rgba(12, 10, 8, 0.7)";
  ctx.fillStyle = jointColor;
  // Una junta horizontal y una vertical que dividen en 4 losas.
  ctx.fillRect(0, size / 2 - 1, size, 2);
  ctx.fillRect(size / 2 - 1, 0, 2, size);
}

export function createFloorTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) fillMarbleFloor(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Rugosidad del piso (canal gris): mármol pulido con brillo especular
 * alto (≈0.15-0.25) para lograr el efecto espejo del Prado.
 */
export function createFloorRoughnessTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Base oscura = muy reflectante (baja rugosidad).
    ctx.fillStyle = "rgb(38, 34, 30)";
    ctx.fillRect(0, 0, size, size);

    // Variación sutil del pulido.
    for (let i = 0; i < 30; i++) {
      const value = Math.round(30 + Math.random() * 25);
      ctx.fillStyle = `rgba(${value}, ${value}, ${value}, 0.4)`;
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 30 + Math.random() * 100;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${value}, ${value}, ${value}, 0.35)`);
      g.addColorStop(1, `rgba(${value}, ${value}, ${value}, 0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // Juntas de lasas: mates.
    ctx.fillStyle = "rgba(180, 180, 180, 0.85)";
    ctx.fillRect(0, size / 2 - 1, size, 2);
    ctx.fillRect(size / 2 - 1, 0, 2, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Relieve de yeso/muro: manchas suaves + grano fino. Se usa solo como
 * `bumpMap`, así el color de las paredes no cambia.
 */
export function createWallBumpTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 90; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 30 + Math.random() * 90;
      const lighter = Math.random() > 0.5;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(
        0,
        lighter ? "rgba(160, 160, 160, 0.16)" : "rgba(96, 96, 96, 0.16)"
      );
      gradient.addColorStop(1, "rgba(128, 128, 128, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const v = Math.random() > 0.5 ? 150 : 106;
      ctx.fillStyle = `rgba(${v}, ${v}, ${v}, 0.22)`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

/** Halo suave bajo los paneles de techo (mezcla aditiva, sin costo de luz). */
export function createHaloTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, "rgba(255, 246, 226, 0.75)");
    gradient.addColorStop(0.35, "rgba(255, 243, 220, 0.3)");
    gradient.addColorStop(0.7, "rgba(255, 240, 214, 0.08)");
    gradient.addColorStop(1, "rgba(255, 240, 214, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** Punto luminoso para las partículas de polvo en suspensión. */
export function createDustTexture(): THREE.CanvasTexture {
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, "rgba(255, 251, 240, 0.95)");
    gradient.addColorStop(0.45, "rgba(255, 248, 232, 0.4)");
    gradient.addColorStop(1, "rgba(255, 246, 228, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function drawPlaque(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  text: string,
  sub?: string
) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#f0e9d9";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(107, 79, 53, 0.55)";
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, w - 12, h - 12);

  ctx.fillStyle = "#1a1410";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const big = sub ? h * 0.4 : h * 0.46;
  try {
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
      `${Math.round(big * 0.06)}px`;
  } catch {
    /* navegadores sin letterSpacing */
  }
  ctx.font = `500 ${big}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillText(text.toUpperCase(), w / 2, sub ? h * 0.38 : h * 0.52, w - 60);

  if (sub) {
    try {
      (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
        "6px";
    } catch {
      /* noop */
    }
    ctx.fillStyle = "#6b4f35";
    ctx.font = `500 ${h * 0.16}px Inter, system-ui, sans-serif`;
    ctx.fillText(sub.toUpperCase(), w / 2, h * 0.74, w - 60);
  }
  try {
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
      "0px";
  } catch {
    /* noop */
  }
}

/**
 * Cartel de sala / logotipo. Se redibuja cuando terminan de cargar las
 * tipografías del sitio para no quedar con la fuente de reserva.
 */
export function createPlaqueTexture(
  text: string,
  sub?: string
): THREE.CanvasTexture {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) drawPlaque(ctx, w, h, text, sub);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (ctx && fonts?.ready) {
    void fonts.ready.then(() => {
      drawPlaque(ctx, w, h, text, sub);
      texture.needsUpdate = true;
    });
  }
  return texture;
}

/** Sombra de contacto suave bajo los pedestales (sustituye a las sombras reales). */
export function createShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.08,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, "rgba(26, 20, 16, 0.42)");
    gradient.addColorStop(0.55, "rgba(26, 20, 16, 0.2)");
    gradient.addColorStop(1, "rgba(26, 20, 16, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
