/**
 * Cuadros de la colección MUVA colocados sobre los muros del entorno virtual.
 *
 * Colocación:
 *  · `position` es el centro del lienzo en coordenadas de mundo. La distancia
 *    al muro es fija (0.16 m ⇒ 1 cm de separación real para el marco).
 *  · `rotationY` orienta el cuadro hacia el interior de la sala:
 *      0 ⇒ muro norte (mira a +z)      PI ⇒ muro sur (mira a -z)
 *      PI/2 ⇒ muro oeste (mira a +x)   -PI/2 ⇒ muro este (mira a -x)
 *  · `aspect` = ancho / alto de la imagen (por defecto 0,75 = 960×1280).
 *
 * Para agregar un cuadro: copiar la imagen a /public/images/paintings/ y
 * agregar un objeto con la posición calculada sobre el muro libre elegido
 * (evitando puertas, carteles, columnas y cercas de escultura).
 */

export interface PaintingSpec {
  id: string;
  /** Ruta de la imagen en /public. */
  src: string;
  /** Centro del lienzo en coordenadas de mundo. */
  position: [number, number, number];
  /** Rotación sobre Y (ver tabla de orientación arriba). */
  rotationY: number;
  /** Alto del lienzo en metros (por defecto PAINTING_HEIGHT). */
  height?: number;
  /** Relación ancho/alto de la imagen (por defecto 0.75). */
  aspect?: number;
}

/** Alto estándar de los lienzos (marco incluido mide +0,18 m). */
export const PAINTING_HEIGHT = 1.6;
/** Altura del centro de los lienzos (borde inferior ≈ 1,06 m). */
export const PAINTING_CENTER_Y = 1.95;
/** Distancia del centro del lienzo al plano del muro. */
export const PAINTING_WALL_OFFSET = 0.16;

export const paintings: PaintingSpec[] = [
  // ── Entrada ──────────────────────────────────────────────────────────
  { id: "cuadro-01", src: "/images/paintings/painting-01.jpg", position: [-2.65, PAINTING_CENTER_Y, 6.16], rotationY: 0 },
  { id: "cuadro-02", src: "/images/paintings/painting-02.jpg", position: [2.65, PAINTING_CENTER_Y, 6.16], rotationY: 0 },
  { id: "cuadro-03", src: "/images/paintings/painting-03.jpg", position: [-3.84, PAINTING_CENTER_Y, 11.5], rotationY: Math.PI / 2 },

  // ── Galería (sobre los bancos) ───────────────────────────────────────
  { id: "cuadro-04", src: "/images/paintings/painting-04.jpg", position: [-3.84, PAINTING_CENTER_Y, -1.4], rotationY: Math.PI / 2 },
  { id: "cuadro-05", src: "/images/paintings/painting-05.jpg", position: [3.84, PAINTING_CENTER_Y, -1.4], rotationY: -Math.PI / 2 },

  // ── Sala 1 ───────────────────────────────────────────────────────────
  { id: "cuadro-06", src: "/images/paintings/painting-06.jpg", position: [-12.84, PAINTING_CENTER_Y, 4.8], rotationY: Math.PI / 2 },
  { id: "cuadro-07", src: "/images/paintings/painting-07.jpg", position: [-12.84, PAINTING_CENTER_Y, -1.5], rotationY: Math.PI / 2 },
  { id: "cuadro-08", src: "/images/paintings/painting-08.jpg", position: [-11.3, PAINTING_CENTER_Y, -3.84], rotationY: 0 },
  { id: "cuadro-09", src: "/images/paintings/painting-09.jpg", position: [-6, PAINTING_CENTER_Y, 5.84], rotationY: Math.PI },

  // ── Sala 2 ───────────────────────────────────────────────────────────
  { id: "cuadro-10", src: "/images/paintings/painting-10.jpg", position: [12.84, PAINTING_CENTER_Y, 4.8], rotationY: -Math.PI / 2 },
  { id: "cuadro-11", src: "/images/paintings/painting-11.jpg", position: [12.84, PAINTING_CENTER_Y, -1.5], rotationY: -Math.PI / 2 },
  { id: "cuadro-12", src: "/images/paintings/painting-12.jpg", position: [5.3, PAINTING_CENTER_Y, -3.84], rotationY: 0 },
  { id: "cuadro-13", src: "/images/paintings/painting-13.jpg", position: [8, PAINTING_CENTER_Y, 5.84], rotationY: Math.PI },

  // ── Sala 3 ───────────────────────────────────────────────────────────
  { id: "cuadro-14", src: "/images/paintings/painting-14.jpg", position: [-11, PAINTING_CENTER_Y, -15.84], rotationY: 0 },
  { id: "cuadro-15", src: "/images/paintings/painting-15.jpg", position: [-12.84, PAINTING_CENTER_Y, -9.5], rotationY: Math.PI / 2 },
  { id: "cuadro-16", src: "/images/paintings/painting-16.jpg", position: [-4.16, PAINTING_CENTER_Y, -13], rotationY: -Math.PI / 2, aspect: 0.786 },

  // ── Sala 4 ───────────────────────────────────────────────────────────
  { id: "cuadro-17", src: "/images/paintings/painting-17.jpg", position: [6, PAINTING_CENTER_Y, -15.84], rotationY: 0, aspect: 0.819 },
  { id: "cuadro-18", src: "/images/paintings/painting-18.jpg", position: [11, PAINTING_CENTER_Y, -15.84], rotationY: 0 },
  { id: "cuadro-19", src: "/images/paintings/painting-19.jpg", position: [12.84, PAINTING_CENTER_Y, -6], rotationY: -Math.PI / 2 },

  // ── Sala principal (sobre los bancos) ────────────────────────────────
  { id: "cuadro-20", src: "/images/paintings/painting-20.jpg", position: [2.5, PAINTING_CENTER_Y, -4.16], rotationY: Math.PI },
  { id: "cuadro-21", src: "/images/paintings/painting-21.jpg", position: [-2.5, PAINTING_CENTER_Y, -4.16], rotationY: Math.PI, aspect: 0.783 },
];
