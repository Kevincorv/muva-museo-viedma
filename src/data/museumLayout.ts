/**
 * Plano arquitectónico del Entorno Virtual del MUVA.
 *
 * El museo se define como un conjunto de salas rectangulares que no se
 * superponen. De cada borde de cada sala se genera automáticamente un muro:
 *
 *   · Borde "norte" = z = minZ   · Borde "sur"  = z = maxZ
 *   · Borde "oeste" = x = minX   · Borde "este" = x = maxX
 *
 * Reglas:
 *  · Si un borde no se declara, se genera un muro macizo sin vanos.
 *  · `wall: false` se usa en el lado secundario de un muro compartido
 *    (así un muro entre dos salas se genera UNA sola vez).
 *  · `openings` son vanos de puerta en unidades absolutas sobre el eje del
 *    borde (x para norte/sur, z para este/oeste). El vano se genera a altura
 *    completa de paso con dintel por encima de DOOR_HEIGHT.
 *
 * Para agregar una sala: agregar el rectángulo, marcar los bordes que toca
 * otra sala como `wall: false` y abrir el vano en UNO de los dos lados.
 */

export const WALL_HEIGHT = 3.6;
export const DOOR_HEIGHT = 2.6;
export const WALL_THICKNESS = 0.3;
/** Ancho mínimo de una puerta/circulación. */
export const DOOR_WIDTH = 2.6;

export interface RoomBounds {
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
}

export interface EdgeSpec {
  /** `false` ⇒ no generar muro (otra sala vecina ya lo genera). */
  wall?: boolean;
  /** Vanos absolutos sobre el eje del borde: [inicio, fin]. */
  openings?: [number, number][];
}

export interface MuseumRoom {
  id: string;
  /** Clave de texto localizado (ver virtual-museum/texts.ts). */
  nameKey: string;
  bounds: RoomBounds;
  /** Tono del piso (multiplica la textura). */
  floorTone: string;
  edges?: Partial<Record<"north" | "south" | "west" | "east", EdgeSpec>>;
}

export const rooms: MuseumRoom[] = [
  {
    id: "entrada",
    nameKey: "room.entrada",
    bounds: { minX: -4, minZ: 6, maxX: 4, maxZ: 14 },
    floorTone: "#e7dfcd",
    edges: {
      north: { openings: [[-1.3, 1.3]] },
      south: {},
      west: {},
      east: {},
    },
  },
  {
    id: "galeria",
    nameKey: "room.galeria",
    bounds: { minX: -4, minZ: -4, maxX: 4, maxZ: 6 },
    floorTone: "#e4dbc8",
    edges: {
      north: { openings: [[-1.3, 1.3]] },
      south: { wall: false },
      west: { openings: [[1.2, 3.8]] },
      east: { openings: [[1.2, 3.8]] },
    },
  },
  {
    id: "sala-1",
    nameKey: "room.sala1",
    bounds: { minX: -13, minZ: -4, maxX: -4, maxZ: 6 },
    floorTone: "#ece5d5",
    edges: {
      north: { openings: [[-9.6, -7]] },
      east: { wall: false },
    },
  },
  {
    id: "sala-2",
    nameKey: "room.sala2",
    bounds: { minX: 4, minZ: -4, maxX: 13, maxZ: 6 },
    floorTone: "#ece5d5",
    edges: {
      north: { openings: [[7, 9.6]] },
      west: { wall: false },
    },
  },
  {
    id: "sala-3",
    nameKey: "room.sala3",
    bounds: { minX: -13, minZ: -16, maxX: -4, maxZ: -4 },
    floorTone: "#eae2d1",
    edges: {
      south: { wall: false },
      east: { openings: [[-10.6, -8]] },
    },
  },
  {
    id: "sala-4",
    nameKey: "room.sala4",
    bounds: { minX: 4, minZ: -16, maxX: 13, maxZ: -4 },
    floorTone: "#eae2d1",
    edges: {
      south: { wall: false },
      west: { openings: [[-10.6, -8]] },
    },
  },
  {
    id: "sala-principal",
    nameKey: "room.principal",
    bounds: { minX: -4, minZ: -16, maxX: 4, maxZ: -4 },
    floorTone: "#e2d8c3",
    edges: {
      north: {},
      south: { wall: false },
      west: { wall: false },
      east: { wall: false },
    },
  },
];

/** Límite físico del edificio (el jugador nunca puede salir de acá). */
export const museumBounds: RoomBounds = {
  minX: -13 + WALL_THICKNESS,
  maxX: 13 - WALL_THICKNESS,
  minZ: -16 + WALL_THICKNESS,
  maxZ: 14 - WALL_THICKNESS,
};

export const playerSpawn = {
  position: [0, 1.65, 12.4] as [number, number, number],
  /** Radianes: 0 ⇒ mirando hacia -z (hondo del museo). */
  yaw: 0,
  pitch: -0.03,
};

export interface WallSegment {
  position: [number, number, number];
  size: [number, number, number];
}

export interface SignSpec {
  id: string;
  /** Clave i18n del rótulo (alternativa a `literal`). */
  textKey?: string;
  /** Texto literal alternativo (p. ej. el logotipo de la entrada). */
  literal?: string;
  sub?: string;
  position: [number, number, number];
  rotationY: number;
  width: number;
  height: number;
}

function withOpenings(
  start: number,
  end: number,
  openings?: [number, number][]
): { solid: [number, number][]; doors: [number, number][] } {
  const doors: [number, number][] = [];
  if (!openings?.length) {
    return { solid: end > start ? [[start, end]] : [], doors };
  }
  const clamped = openings
    .map(([a, b]) => [Math.max(start, a), Math.min(end, b)] as [number, number])
    .filter(([a, b]) => b - a > 0.05)
    .sort((p, q) => p[0] - q[0]);

  const solid: [number, number][] = [];
  let cursor = start;
  for (const [a, b] of clamped) {
    if (a > cursor + 0.05) solid.push([cursor, a]);
    doors.push([a, b]);
    cursor = Math.max(cursor, b);
  }
  if (end > cursor + 0.05) solid.push([cursor, end]);
  return { solid, doors };
}

/** Genera todos los muros (macizos + dinteles de puerta) del museo. */
export function buildWallSegments(): WallSegment[] {
  const segments: WallSegment[] = [];
  const H = WALL_HEIGHT;
  const T = WALL_THICKNESS;
  const lintelH = H - DOOR_HEIGHT;

  for (const room of rooms) {
    const { minX, minZ, maxX, maxZ } = room.bounds;
    const edges = room.edges ?? {};

    const sides: {
      spec?: EdgeSpec;
      axis: "x" | "z";
      line: number;
      from: number;
      to: number;
      fixed: "z" | "x";
    }[] = [
      { spec: edges.north, axis: "x", line: minZ, from: minX, to: maxX, fixed: "z" },
      { spec: edges.south, axis: "x", line: maxZ, from: minX, to: maxX, fixed: "z" },
      { spec: edges.west, axis: "z", line: minX, from: minZ, to: maxZ, fixed: "x" },
      { spec: edges.east, axis: "z", line: maxX, from: minZ, to: maxZ, fixed: "x" },
    ];

    for (const side of sides) {
      if (side.spec?.wall === false) continue;
      const { solid, doors } = withOpenings(side.from, side.to, side.spec?.openings);

      for (const [a, b] of solid) {
        const mid = (a + b) / 2;
        const len = b - a;
        segments.push(
          side.axis === "x"
            ? { position: [mid, H / 2, side.line], size: [len, H, T] }
            : { position: [side.line, H / 2, mid], size: [T, H, len] }
        );
      }

      for (const [a, b] of doors) {
        const mid = (a + b) / 2;
        const len = b - a;
        const y = DOOR_HEIGHT + lintelH / 2;
        segments.push(
          side.axis === "x"
            ? { position: [mid, y, side.line], size: [len, lintelH, T] }
            : { position: [side.line, y, mid], size: [T, lintelH, len] }
        );
      }
    }
  }

  return segments;
}

/** Cajas 2D (XZ) usadas por la colisión del jugador. */
export interface CollisionBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export function buildCollisionBoxes(): CollisionBox[] {
  const boxes: CollisionBox[] = [];
  const half = WALL_THICKNESS / 2 + 0.001;

  for (const s of buildWallSegments()) {
    // Solo los tramos macizos (los dinteles quedan por encima de la cabeza).
    if (s.position[1] > WALL_HEIGHT / 2 + 0.01) continue;
    const [px, , pz] = s.position;
    const [w, , d] = s.size;
    boxes.push({
      minX: px - w / 2 - half,
      maxX: px + w / 2 + half,
      minZ: pz - d / 2 - half,
      maxZ: pz + d / 2 + half,
    });
  }
  return boxes;
}

/** Marco de puerta: recorre cada vano generado por `buildWallSegments`. */
export interface DoorFrame {
  /** Centro del vano en coordenadas de MUNDO [x, z]. */
  center: [number, number];
  /** `x` ⇒ el vano corre a lo largo de X (muro paralelo a X). */
  axis: "x" | "z";
  /** Coordenada fija del muro (solo informativa). */
  line: number;
  width: number;
}

export function buildDoorFrames(): DoorFrame[] {
  const frames: DoorFrame[] = [];

  for (const room of rooms) {
    const { minX, minZ, maxX, maxZ } = room.bounds;
    const edges = room.edges ?? {};

    const sides: {
      spec?: EdgeSpec;
      axis: "x" | "z";
      line: number;
      from: number;
      to: number;
    }[] = [
      { spec: edges.north, axis: "x", line: minZ, from: minX, to: maxX },
      { spec: edges.south, axis: "x", line: maxZ, from: minX, to: maxX },
      { spec: edges.west, axis: "z", line: minX, from: minZ, to: maxZ },
      { spec: edges.east, axis: "z", line: maxX, from: minZ, to: maxZ },
    ];

    for (const side of sides) {
      if (side.spec?.wall === false) continue;
      const { doors } = withOpenings(side.from, side.to, side.spec?.openings);
      for (const [a, b] of doors) {
        const mid = (a + b) / 2;
        frames.push({
          center: side.axis === "x" ? [mid, side.line] : [side.line, mid],
          axis: side.axis,
          line: side.line,
          width: b - a,
        });
      }
    }
  }

  return frames;
}

export interface ColumnSpec {
  position: [number, number];
  radius: number;
}

/**
 * Columnas de la galería: en las esquinas, lejos de las puertas y del eje
 * de circulación (spawn → sala principal).
 */
export const columns: ColumnSpec[] = [
  { position: [-3.1, -3.1], radius: 0.28 },
  { position: [3.1, -3.1], radius: 0.28 },
  { position: [-3.1, 5.1], radius: 0.28 },
  { position: [3.1, 5.1], radius: 0.28 },
];

/** Semi-lado de la cerca cuadrada que protege cada obra. */
export const STANCHION_HALF = 0.88;
/** Media-grosor (m) de la valla: postes + cinta. */
export const STANCHION_THICKNESS = 0.07;

export interface BenchSpec {
  /** Centro en XZ. */
  position: [number, number];
  rotationY: number;
  length: number;
  depth: number;
}

/**
 * Bancos de sala: apoyados contra un muro libre (nunca delante de una
 * puerta ni delante de una cerca de obra) y con el largo perpendicular a
 * la línea de visión de la obra.
 */
export const benches: BenchSpec[] = [
  { position: [3.3, 7.34], rotationY: Math.PI / 2, length: 1.6, depth: 0.5 },
  { position: [-3.3, -1.4], rotationY: Math.PI / 2, length: 1.6, depth: 0.5 },
  { position: [2.5, -4.45], rotationY: 0, length: 1.6, depth: 0.5 },
  { position: [-2.5, -4.45], rotationY: 0, length: 1.6, depth: 0.5 },
];

/**
 * Cajas 2D (XZ) de columnas, bancos y cercas de obra, para la colisión del
 * jugador. La cerca cierra por completo el acceso: la obra queda protegida
 * dentro y el visitante queda afuera.
 */
export function buildPropColliders(
  sculptures: readonly { position: readonly [number, number, number] }[] = []
): CollisionBox[] {
  const boxes: CollisionBox[] = [];

  for (const column of columns) {
    const r = column.radius + 0.02;
    boxes.push({
      minX: column.position[0] - r,
      maxX: column.position[0] + r,
      minZ: column.position[1] - r,
      maxZ: column.position[1] + r,
    });
  }

  for (const bench of benches) {
    const halfLong = bench.length / 2 + 0.04;
    const halfShort = bench.depth / 2 + 0.04;
    const rotated = Math.abs(Math.sin(bench.rotationY)) > 0.5;
    const halfX = rotated ? halfShort : halfLong;
    const halfZ = rotated ? halfLong : halfShort;
    boxes.push({
      minX: bench.position[0] - halfX,
      maxX: bench.position[0] + halfX,
      minZ: bench.position[1] - halfZ,
      maxZ: bench.position[1] + halfZ,
    });
  }

  const h = STANCHION_HALF;
  const t = STANCHION_THICKNESS;
  for (const sculpture of sculptures) {
    const cx = sculpture.position[0];
    const cz = sculpture.position[2];
    // Cuatro tramos que cierran el perímetro completo.
    boxes.push({
      minX: cx - h - t,
      maxX: cx + h + t,
      minZ: cz - h - t,
      maxZ: cz - h + t,
    });
    boxes.push({
      minX: cx - h - t,
      maxX: cx + h + t,
      minZ: cz + h - t,
      maxZ: cz + h + t,
    });
    boxes.push({
      minX: cx - h - t,
      maxX: cx - h + t,
      minZ: cz - h + t,
      maxZ: cz + h - t,
    });
    boxes.push({
      minX: cx + h - t,
      maxX: cx + h + t,
      minZ: cz - h + t,
      maxZ: cz + h - t,
    });
  }

  return boxes;
}

export function roomAt(x: number, z: number): MuseumRoom | undefined {
  return rooms.find(
    (r) =>
      x >= r.bounds.minX &&
      x <= r.bounds.maxX &&
      z >= r.bounds.minZ &&
      z <= r.bounds.maxZ
  );
}

export function roomById(id: string): MuseumRoom | undefined {
  return rooms.find((r) => r.id === id);
}

/**
 * Señalización: carteles con el nombre de cada sala sobre las puertas.
 * `rotationY` hace que el cartel mire hacia la sala desde la que se llega.
 */
export const signs: SignSpec[] = [
  {
    id: "sign-galeria",
    textKey: "room.galeria",
    position: [0, 2.98, 6.2],
    rotationY: 0,
    width: 1.7,
    height: 0.42,
  },
  {
    id: "sign-sala-1",
    textKey: "room.sala1",
    position: [-3.79, 2.98, 2.5],
    rotationY: Math.PI / 2,
    width: 1.5,
    height: 0.42,
  },
  {
    id: "sign-sala-2",
    textKey: "room.sala2",
    position: [3.79, 2.98, 2.5],
    rotationY: -Math.PI / 2,
    width: 1.5,
    height: 0.42,
  },
  {
    id: "sign-principal",
    textKey: "room.principal",
    position: [0, 2.98, -3.79],
    rotationY: 0,
    width: 2.1,
    height: 0.42,
  },
  {
    id: "sign-sala-3",
    textKey: "room.sala3",
    position: [-8.3, 2.98, -3.79],
    rotationY: 0,
    width: 1.5,
    height: 0.42,
  },
  {
    id: "sign-sala-4",
    textKey: "room.sala4",
    position: [8.3, 2.98, -3.79],
    rotationY: 0,
    width: 1.5,
    height: 0.42,
  },
  {
    id: "sign-sala-3-b",
    textKey: "room.sala3",
    position: [-3.79, 2.98, -9.3],
    rotationY: Math.PI / 2,
    width: 1.5,
    height: 0.42,
  },
  {
    id: "sign-sala-4-b",
    textKey: "room.sala4",
    position: [3.79, 2.98, -9.3],
    rotationY: -Math.PI / 2,
    width: 1.5,
    height: 0.42,
  },
  {
    id: "sign-entrada",
    literal: "MUVA",
    sub: "Museo Viedma",
    position: [0, 3.12, 13.78],
    rotationY: Math.PI,
    width: 2.6,
    height: 0.62,
  },
];

/** Puerta cerrada del vestíbulo (referencia visual del acceso principal). */
export const entranceDoor = {
  position: [0, 1.3, 13.8] as [number, number, number],
  width: 2.4,
  height: 2.6,
};

/**
 * Paneles de luz de techo (emisivos, sin costo de iluminación dinámica).
 * Se generan a partir del centro de cada sala.
 */
export function buildCeilingPanels(): {
  position: [number, number, number];
  size: [number, number];
}[] {
  const panels: {
    position: [number, number, number];
    size: [number, number];
  }[] = [];

  for (const room of rooms) {
    const { minX, minZ, maxX, maxZ } = room.bounds;
    const w = maxX - minX;
    const d = maxZ - minZ;
    const cx = (minX + maxX) / 2;
    const cz = (minZ + maxZ) / 2;
    const along = d >= w ? "z" : "x";
    const long = Math.max(w, d);

    if (long >= 14) {
      const offset = long * 0.24;
      panels.push({
        position:
          along === "z"
            ? [cx, WALL_HEIGHT - 0.04, cz - offset]
            : [cx - offset, WALL_HEIGHT - 0.04, cz],
        size: [2.4, 1.1],
      });
      panels.push({
        position:
          along === "z"
            ? [cx, WALL_HEIGHT - 0.04, cz + offset]
            : [cx + offset, WALL_HEIGHT - 0.04, cz],
        size: [2.4, 1.1],
      });
    } else {
      panels.push({
        position: [cx, WALL_HEIGHT - 0.04, cz],
        size: [2.4, 1.1],
      });
    }
  }

  return panels;
}

/**
 * Luces puntuales reales: se limitan a los espacios principales para no
 * saturar el shader. En dispositivos modestos solo queda la primera.
 */
export const pointLights: {
  position: [number, number, number];
  intensity: number;
  distance: number;
}[] = [
  { position: [0, 3.1, 11], intensity: 9, distance: 13 },
  { position: [0, 3.1, 1], intensity: 9, distance: 13 },
  { position: [-8.5, 3.1, 1], intensity: 7.5, distance: 13 },
  { position: [8.5, 3.1, 1], intensity: 7.5, distance: 13 },
  { position: [0, 3.1, -10], intensity: 9, distance: 14 },
];
