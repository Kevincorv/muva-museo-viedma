import * as THREE from "three";

/**
 * Texturas procedurales del museo: no descargan nada y se generan una sola
 * vez por montaje, así el entorno arranca sin pedir recursos externos.
 */

/** Metros que cubre una repetición de la textura de piso. */
export const FLOOR_TILE_METERS = 2;

/**
 * Paleta de madera cálida de galería (tonos naranja-marrón, sin verdes).
 * El `floorTone` de cada sala multiplica estos valores al renderizar.
 */
const WOOD_TONES = [
  [158, 114, 74],
  [148, 106, 68],
  [166, 124, 82],
  [140, 100, 64],
  [161, 119, 78],
  [153, 111, 72],
] as const;

/**
 * Tablones de madera con juntas escalonadas, veta y brillo de barniz sutil.
 * La textura se repite cada 2 m (FLOOR_TILE_METERS); las filas abarcan el
 * ancho completo para que el patrón no muestre cortes verticales al repetir.
 */
function fillWoodFloor(ctx: CanvasRenderingContext2D, size: number) {
  const rows = 10;
  const rowH = size / rows;

  for (let r = 0; r < rows; r++) {
    const y0 = r * rowH;
    const tone = WOOD_TONES[Math.floor(Math.random() * WOOD_TONES.length)];
    const jitter = Math.round((Math.random() - 0.5) * 14);
    ctx.fillStyle = `rgb(${tone[0] + jitter}, ${tone[1] + jitter}, ${
      tone[2] + jitter
    })`;
    ctx.fillRect(0, y0, size, rowH);

    // Veta: trazos largos y ondulados a lo largo del tablón.
    for (let i = 0; i < 24; i++) {
      const gy = y0 + 2 + Math.random() * (rowH - 4);
      const gx = Math.random() * size;
      const len = 50 + Math.random() * 190;
      const dark = Math.random() > 0.35;
      ctx.strokeStyle = dark
        ? `rgba(58, 34, 16, ${0.05 + Math.random() * 0.1})`
        : `rgba(234, 192, 134, ${0.05 + Math.random() * 0.07})`;
      ctx.lineWidth = 0.7 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.bezierCurveTo(
        gx + len * 0.3,
        gy + (Math.random() - 0.5) * 3,
        gx + len * 0.7,
        gy + (Math.random() - 0.5) * 3,
        Math.min(gx + len, size),
        gy
      );
      ctx.stroke();
    }

    // Juntas verticales entre tablones (escalonadas por fila).
    const joints = 2 + Math.floor(Math.random() * 2);
    let previous = -1;
    for (let j = 0; j < joints; j++) {
      const jx = Math.round(
        (j + 0.7 + Math.random() * 0.6) * (size / (joints + 1))
      );
      if (jx <= previous + 48 || jx >= size - 8) continue;
      previous = jx;
      ctx.fillStyle = "rgba(46, 27, 13, 0.62)";
      ctx.fillRect(jx, y0, 2, rowH);
      ctx.fillStyle = "rgba(236, 196, 142, 0.1)";
      ctx.fillRect(jx + 2, y0, 1, rowH);
    }

    // Junta horizontal entre filas + leve bisel iluminado.
    ctx.fillStyle = "rgba(44, 26, 12, 0.68)";
    ctx.fillRect(0, y0, size, 2);
    ctx.fillStyle = "rgba(238, 200, 148, 0.12)";
    ctx.fillRect(0, y0 + 2, size, 1);
  }

  // Grano fino del acabado barnizado.
  for (let i = 0; i < 4800; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle =
      Math.random() > 0.5
        ? "rgba(70, 42, 20, 0.05)"
        : "rgba(255, 226, 178, 0.05)";
    ctx.fillRect(x, y, 1.4, 1.4);
  }
}

export function createFloorTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) fillWoodFloor(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Rugosidad del piso (canal gris) alineada a los tablones: el centro de cada
 * tablón tiene brillo sutil (≈0.45, reflejo cálido pero nunca espejo) y las
 * juntas quedan mates.
 */
export function createFloorRoughnessTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const rows = 10;
    const rowH = size / rows;

    for (let r = 0; r < rows; r++) {
      const y0 = r * rowH;
      const base = Math.round(106 + Math.random() * 20);
      ctx.fillStyle = `rgb(${base}, ${base}, ${base})`;
      ctx.fillRect(0, y0, size, rowH);

      // Variación de barniz por tablón.
      for (let i = 0; i < 5; i++) {
        const value = Math.round(base + (Math.random() - 0.5) * 16);
        ctx.fillStyle = `rgba(${value}, ${value}, ${value}, 0.5)`;
        ctx.fillRect(
          Math.random() * size,
          y0 + Math.random() * rowH,
          60 + Math.random() * 140,
          4 + Math.random() * 8
        );
      }

      // Juntas verticales: mates.
      const joints = 2 + Math.floor(Math.random() * 2);
      let previous = -1;
      for (let j = 0; j < joints; j++) {
        const jx = Math.round(
          (j + 0.7 + Math.random() * 0.6) * (size / (joints + 1))
        );
        if (jx <= previous + 48 || jx >= size - 8) continue;
        previous = jx;
        ctx.fillStyle = "rgba(240, 240, 240, 0.95)";
        ctx.fillRect(jx, y0, 2, rowH);
      }

      // Junta horizontal: mate.
      ctx.fillStyle = "rgba(240, 240, 240, 0.95)";
      ctx.fillRect(0, y0, size, 2);
    }
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
