import { t, type Locale } from "../i18n/translations";

export interface SculptureAudio {
  es?: string;
  en?: string;
  pt?: string;
}

export interface SculptureModelItem {
  url: string;
  labelKey?: string;
}

/** Bloque secundario de una ficha combinada (varios nombres en una tarjeta). */
export interface SculptureBlock {
  titleKey: string;
  subtitleKey?: string;
  descriptionKey: string;
  iconografiaKey?: string;
  getTitle: (locale: Locale) => string;
  getSubtitle?: (locale: Locale) => string;
  getDescription: (locale: Locale) => string;
  getIconografia?: (locale: Locale) => string;
}

export interface Sculpture {
  id: string;
  titleKey: string;
  subtitleKey?: string;
  artist?: string;
  year?: string;
  material?: string;
  materialKey?: string;
  dimensions?: string;
  dimensionsKey?: string;
  inventoryNumber?: string;
  descriptionKey: string;
  iconografiaKey?: string;
  historicalContextKey?: string;
  thumbnail: string;
  model: string;
  models?: SculptureModelItem[];
  audio?: SculptureAudio;
  getTitle: (locale: Locale) => string;
  getSubtitle?: (locale: Locale) => string;
  getDescription: (locale: Locale) => string;
  getIconografia?: (locale: Locale) => string;
  getHistoricalContext?: (locale: Locale) => string;
  getAudio?: (locale: Locale) => string | undefined;
  blocks?: SculptureBlock[];
}

/**
 * Para agregar una nueva obra:
 *  1. Copiar el archivo .glb a /public/models/sculptures/
 *  2. Copiar el archivo .webp a /public/images/sculptures/
 *  3. Copiar el archivo .mp3 a /public/audio/sculptures/ (formato: obra-XX-idioma.mp3)
 *  4. Agregar un nuevo objeto a este arreglo con el campo audio.
 *  La galería, el visor y la audioguía se actualizan automáticamente.
 *
 * Mientras un modelo .glb no esté cargado, dejar `model: ""` y la ficha se
 * muestra en modo imagen con la leyenda "Modelo 3D próximamente".
 * `material` / `dimensions` se mantienen en español para el visor; las
 * tarjetas usan `materialKey` / `dimensionsKey` para traducir.
 */
export const PASIONARIA_AUDIO: SculptureAudio = {
  es: "/audio/sculptures/obra-13-es.mp3",
  en: "/audio/sculptures/obra-13-en.mp3",
  pt: "/audio/sculptures/obra-13-pt.mp3",
};

const audioFor = (obra: string): SculptureAudio => ({
  es: `/audio/sculptures/${obra}-es.mp3`,
  en: `/audio/sculptures/${obra}-en.mp3`,
  pt: `/audio/sculptures/${obra}-pt.mp3`,
});

const OBRA01_AUDIO = audioFor("obra-01");
const OBRA02_AUDIO = audioFor("obra-02");
const OBRA03_AUDIO = audioFor("obra-03");
const OBRA04_AUDIO = audioFor("obra-04");
const OBRA05_AUDIO = audioFor("obra-05");
const OBRA06_AUDIO = audioFor("obra-06");
const OBRA07_AUDIO = audioFor("obra-07");
const OBRA08_AUDIO = audioFor("obra-08");
const OBRA10_AUDIO = audioFor("obra-10");
const OBRA11_AUDIO = audioFor("obra-11");
const OBRA12_AUDIO = audioFor("obra-12");
const OBRA14_AUDIO = audioFor("obra-14");
const OBRA15_AUDIO = audioFor("obra-15");
const OBRA16_AUDIO = audioFor("obra-16");
const OBRA17_AUDIO = audioFor("obra-17");
const OBRA18_AUDIO = audioFor("obra-18");
const OBRA19_AUDIO = audioFor("obra-19");
const OBRA20_AUDIO = audioFor("obra-20");

export const sculptures: Sculpture[] = [
  {
    id: "obra-01",
    titleKey: "sculpture.obra01.title",
    subtitleKey: "sculpture.obra01.sub",
    descriptionKey: "sculpture.obra01.desc",
    iconografiaKey: "sculpture.obra01.icono",
    material: "Escultura en piedra tallada",
    materialKey: "sculpture.material.piedraTallada",
    thumbnail: "/images/sculptures/obra-01.webp",
    model: "/models/sculptures/obra-01-sagrada-familia.glb",
    audio: OBRA01_AUDIO,
    getTitle: (locale) => t("sculpture.obra01.title", locale),
    getSubtitle: (locale) => t("sculpture.obra01.sub", locale),
    getDescription: (locale) => t("sculpture.obra01.desc", locale),
    getIconografia: (locale) => t("sculpture.obra01.icono", locale),
    getAudio: (locale) => OBRA01_AUDIO[locale] ?? OBRA01_AUDIO.es,
  },
  {
    id: "obra-02",
    titleKey: "sculpture.obra02.title",
    subtitleKey: "sculpture.obra02.sub",
    descriptionKey: "sculpture.obra02.desc",
    iconografiaKey: "sculpture.obra02.icono",
    material: "Escultura en piedra modelada y policromada",
    materialKey: "sculpture.material.piedraPolicromada",
    thumbnail: "/images/sculptures/obra-02.webp",
    model: "/models/sculptures/obra-02-nino-jesus.glb",
    audio: OBRA02_AUDIO,
    getTitle: (locale) => t("sculpture.obra02.title", locale),
    getSubtitle: (locale) => t("sculpture.obra02.sub", locale),
    getDescription: (locale) => t("sculpture.obra02.desc", locale),
    getIconografia: (locale) => t("sculpture.obra02.icono", locale),
    getAudio: (locale) => OBRA02_AUDIO[locale] ?? OBRA02_AUDIO.es,
  },
  {
    id: "obra-03",
    titleKey: "sculpture.obra03.title",
    subtitleKey: "sculpture.obra03.sub",
    descriptionKey: "sculpture.obra03.desc",
    iconografiaKey: "sculpture.obra03.icono",
    material: "Piedra tallada",
    materialKey: "sculpture.material.piedraTalladaCorta",
    dimensions: "11 metros de altura",
    dimensionsKey: "sculpture.dimensions.altura11",
    thumbnail: "/images/sculptures/obra-03.webp",
    model: "/models/sculptures/obra-03-virgen-maria.glb",
    audio: OBRA03_AUDIO,
    getTitle: (locale) => t("sculpture.obra03.title", locale),
    getSubtitle: (locale) => t("sculpture.obra03.sub", locale),
    getDescription: (locale) => t("sculpture.obra03.desc", locale),
    getIconografia: (locale) => t("sculpture.obra03.icono", locale),
    getAudio: (locale) => OBRA03_AUDIO[locale] ?? OBRA03_AUDIO.es,
  },
  {
    id: "obra-04",
    titleKey: "sculpture.obra04.title",
    subtitleKey: "sculpture.obra04.sub",
    descriptionKey: "sculpture.obra04.desc",
    iconografiaKey: "sculpture.obra04.icono",
    material: "Escultura en piedra tallada",
    materialKey: "sculpture.material.piedraTallada",
    thumbnail: "/images/sculptures/obra-04.webp",
    model: "/models/sculptures/SANTA ANA.glb",
    audio: OBRA04_AUDIO,
    getTitle: (locale) => t("sculpture.obra04.title", locale),
    getSubtitle: (locale) => t("sculpture.obra04.sub", locale),
    getDescription: (locale) => t("sculpture.obra04.desc", locale),
    getIconografia: (locale) => t("sculpture.obra04.icono", locale),
    getAudio: (locale) => OBRA04_AUDIO[locale] ?? OBRA04_AUDIO.es,
  },
  {
    id: "obra-05",
    titleKey: "sculpture.obra05.title",
    subtitleKey: "sculpture.obra05.sub",
    descriptionKey: "sculpture.obra05.desc",
    iconografiaKey: "sculpture.obra05.icono",
    material: "Escultura en piedra tallada",
    materialKey: "sculpture.material.piedraTallada",
    thumbnail: "/images/sculptures/obra-05.webp",
    model: "/models/sculptures/obra-05-san-joaquin.glb",
    audio: OBRA05_AUDIO,
    getTitle: (locale) => t("sculpture.obra05.title", locale),
    getSubtitle: (locale) => t("sculpture.obra05.sub", locale),
    getDescription: (locale) => t("sculpture.obra05.desc", locale),
    getIconografia: (locale) => t("sculpture.obra05.icono", locale),
    getAudio: (locale) => OBRA05_AUDIO[locale] ?? OBRA05_AUDIO.es,
  },
  {
    id: "obra-06",
    titleKey: "sculpture.obra06.title",
    subtitleKey: "sculpture.obra06.sub",
    descriptionKey: "sculpture.obra06.desc",
    iconografiaKey: "sculpture.obra06.icono",
    material: "Escultura en piedra tallada",
    materialKey: "sculpture.material.piedraTallada",
    thumbnail: "/images/sculptures/obra-06.webp",
    model: "/models/sculptures/obra-06-san-miguel-arcangel_nuevo.glb",
    audio: OBRA06_AUDIO,
    getTitle: (locale) => t("sculpture.obra06.title", locale),
    getSubtitle: (locale) => t("sculpture.obra06.sub", locale),
    getDescription: (locale) => t("sculpture.obra06.desc", locale),
    getIconografia: (locale) => t("sculpture.obra06.icono", locale),
    getAudio: (locale) => OBRA06_AUDIO[locale] ?? OBRA06_AUDIO.es,
  },
  {
    id: "obra-07",
    titleKey: "sculpture.obra07.title",
    subtitleKey: "sculpture.obra07.sub",
    descriptionKey: "sculpture.obra07.desc",
    iconografiaKey: "sculpture.obra07.icono",
    thumbnail: "/images/sculptures/obra-07.webp",
    model: "/models/sculptures/obra-07-fray-juan-bernardo.glb",
    audio: OBRA07_AUDIO,
    getTitle: (locale) => t("sculpture.obra07.title", locale),
    getSubtitle: (locale) => t("sculpture.obra07.sub", locale),
    getDescription: (locale) => t("sculpture.obra07.desc", locale),
    getIconografia: (locale) => t("sculpture.obra07.icono", locale),
    getAudio: (locale) => OBRA07_AUDIO[locale] ?? OBRA07_AUDIO.es,
  },
  {
    id: "obra-08",
    titleKey: "sculpture.obra08.group",
    subtitleKey: "sculpture.obra08.sub",
    descriptionKey: "sculpture.obra08.desc",
    iconografiaKey: "sculpture.obra08.icono",
    thumbnail: "/images/sculptures/obra-08.webp",
    model: "/models/sculptures/obra-08-francisco-y-domingo.glb",
    audio: OBRA08_AUDIO,
    getTitle: (locale) => t("sculpture.obra08.group", locale),
    getSubtitle: (locale) => t("sculpture.obra08.sub", locale),
    getDescription: (locale) => t("sculpture.obra08.desc", locale),
    getIconografia: (locale) => t("sculpture.obra08.icono", locale),
    getAudio: (locale) => OBRA08_AUDIO[locale] ?? OBRA08_AUDIO.es,
  },
  {
    id: "obra-10",
    titleKey: "sculpture.obra10.title",
    subtitleKey: "sculpture.obra10.sub",
    descriptionKey: "sculpture.obra10.desc",
    iconografiaKey: "sculpture.obra10.icono",
    thumbnail: "/images/sculptures/obra-10.webp",
    model: "/models/sculptures/obra-10-tupasy-maria.glb",
    audio: OBRA10_AUDIO,
    getTitle: (locale) => t("sculpture.obra10.title", locale),
    getSubtitle: (locale) => t("sculpture.obra10.sub", locale),
    getDescription: (locale) => t("sculpture.obra10.desc", locale),
    getIconografia: (locale) => t("sculpture.obra10.icono", locale),
    getAudio: (locale) => OBRA10_AUDIO[locale] ?? OBRA10_AUDIO.es,
  },
  {
    id: "obra-11",
    titleKey: "sculpture.obra11.title",
    subtitleKey: "sculpture.obra11.sub",
    descriptionKey: "sculpture.obra11.desc",
    iconografiaKey: "sculpture.obra11.icono",
    thumbnail: "/images/sculptures/obra-11.webp",
    model: "/models/sculptures/obra-11-padre-pio.glb",
    audio: OBRA11_AUDIO,
    getTitle: (locale) => t("sculpture.obra11.title", locale),
    getSubtitle: (locale) => t("sculpture.obra11.sub", locale),
    getDescription: (locale) => t("sculpture.obra11.desc", locale),
    getIconografia: (locale) => t("sculpture.obra11.icono", locale),
    getAudio: (locale) => OBRA11_AUDIO[locale] ?? OBRA11_AUDIO.es,
  },
  {
    id: "obra-12",
    titleKey: "sculpture.obra12.title",
    subtitleKey: "sculpture.obra12.sub",
    descriptionKey: "sculpture.obra12.desc",
    iconografiaKey: "sculpture.obra12.icono",
    thumbnail: "/images/sculptures/obra-12.webp",
    model: "/models/sculptures/obra-12-fray-luis-de-bolanos.glb",
    audio: OBRA12_AUDIO,
    getTitle: (locale) => t("sculpture.obra12.title", locale),
    getSubtitle: (locale) => t("sculpture.obra12.sub", locale),
    getDescription: (locale) => t("sculpture.obra12.desc", locale),
    getIconografia: (locale) => t("sculpture.obra12.icono", locale),
    getAudio: (locale) => OBRA12_AUDIO[locale] ?? OBRA12_AUDIO.es,
  },
  {
    id: "obra-13",
    titleKey: "sculpture.obra13.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra13.desc",
    thumbnail: "/images/sculptures/obra-13.webp",
    model: "/models/sculptures/La Pasionaria y San Ignacio.glb",
    audio: PASIONARIA_AUDIO,
    getTitle: (locale) => t("sculpture.obra13.title", locale),
    getDescription: (locale) => t("sculpture.obra13.desc", locale),
    getAudio: (locale) => PASIONARIA_AUDIO[locale] ?? PASIONARIA_AUDIO.es,
  },
  {
    id: "obra-14",
    titleKey: "sculpture.obra14.title",
    subtitleKey: "sculpture.obra14.sub",
    descriptionKey: "sculpture.obra14.desc",
    iconografiaKey: "sculpture.obra14.icono",
    thumbnail: "/images/sculptures/obra-14.webp",
    model: "/models/sculptures/obra-14-nativa-arrodillada.glb",
    audio: OBRA14_AUDIO,
    getTitle: (locale) => t("sculpture.obra14.title", locale),
    getSubtitle: (locale) => t("sculpture.obra14.sub", locale),
    getDescription: (locale) => t("sculpture.obra14.desc", locale),
    getIconografia: (locale) => t("sculpture.obra14.icono", locale),
    getAudio: (locale) => OBRA14_AUDIO[locale] ?? OBRA14_AUDIO.es,
  },
  {
    id: "obra-15",
    titleKey: "sculpture.obra15.title",
    subtitleKey: "sculpture.obra15.sub",
    descriptionKey: "sculpture.obra15.desc",
    iconografiaKey: "sculpture.obra15.icono",
    thumbnail: "/images/sculptures/obra-15.webp",
    model: "",
    audio: OBRA15_AUDIO,
    getTitle: (locale) => t("sculpture.obra15.title", locale),
    getSubtitle: (locale) => t("sculpture.obra15.sub", locale),
    getDescription: (locale) => t("sculpture.obra15.desc", locale),
    getIconografia: (locale) => t("sculpture.obra15.icono", locale),
    getAudio: (locale) => OBRA15_AUDIO[locale] ?? OBRA15_AUDIO.es,
  },
  {
    id: "obra-16",
    titleKey: "sculpture.obra16.title",
    subtitleKey: "sculpture.obra16.sub",
    descriptionKey: "sculpture.obra16.desc",
    iconografiaKey: "sculpture.obra16.icono",
    material: "Escultura en piedra tallada",
    materialKey: "sculpture.material.piedraTallada",
    thumbnail: "/images/sculptures/obra-16.webp",
    model: "",
    audio: OBRA16_AUDIO,
    getTitle: (locale) => t("sculpture.obra16.title", locale),
    getSubtitle: (locale) => t("sculpture.obra16.sub", locale),
    getDescription: (locale) => t("sculpture.obra16.desc", locale),
    getIconografia: (locale) => t("sculpture.obra16.icono", locale),
    getAudio: (locale) => OBRA16_AUDIO[locale] ?? OBRA16_AUDIO.es,
  },
  {
    id: "obra-17",
    titleKey: "sculpture.obra17.title",
    subtitleKey: "sculpture.obra17.sub",
    descriptionKey: "sculpture.obra17.desc",
    iconografiaKey: "sculpture.obra17.icono",
    material: "Escultura en piedra tallada",
    materialKey: "sculpture.material.piedraTallada",
    thumbnail: "/images/sculptures/obra-17.webp",
    model: "",
    audio: OBRA17_AUDIO,
    getTitle: (locale) => t("sculpture.obra17.title", locale),
    getSubtitle: (locale) => t("sculpture.obra17.sub", locale),
    getDescription: (locale) => t("sculpture.obra17.desc", locale),
    getIconografia: (locale) => t("sculpture.obra17.icono", locale),
    getAudio: (locale) => OBRA17_AUDIO[locale] ?? OBRA17_AUDIO.es,
  },
  {
    id: "obra-18",
    titleKey: "sculpture.obra18.title",
    subtitleKey: "sculpture.obra18.sub",
    descriptionKey: "sculpture.obra18.desc",
    iconografiaKey: "sculpture.obra18.icono",
    material: "Escultura en piedra tallada",
    materialKey: "sculpture.material.piedraTallada",
    thumbnail: "/images/sculptures/obra-18.webp",
    model: "",
    audio: OBRA18_AUDIO,
    getTitle: (locale) => t("sculpture.obra18.title", locale),
    getSubtitle: (locale) => t("sculpture.obra18.sub", locale),
    getDescription: (locale) => t("sculpture.obra18.desc", locale),
    getIconografia: (locale) => t("sculpture.obra18.icono", locale),
    getAudio: (locale) => OBRA18_AUDIO[locale] ?? OBRA18_AUDIO.es,
  },
  {
    id: "obra-19",
    titleKey: "sculpture.obra19.title",
    subtitleKey: "sculpture.obra19.sub",
    descriptionKey: "sculpture.obra19.desc",
    iconografiaKey: "sculpture.obra19.icono",
    material: "Escultura en piedra tallada",
    materialKey: "sculpture.material.piedraTallada",
    thumbnail: "/images/sculptures/obra-19.webp",
    model: "",
    audio: OBRA19_AUDIO,
    getTitle: (locale) => t("sculpture.obra19.title", locale),
    getSubtitle: (locale) => t("sculpture.obra19.sub", locale),
    getDescription: (locale) => t("sculpture.obra19.desc", locale),
    getIconografia: (locale) => t("sculpture.obra19.icono", locale),
    getAudio: (locale) => OBRA19_AUDIO[locale] ?? OBRA19_AUDIO.es,
  },
  {
    id: "obra-20",
    titleKey: "sculpture.obra20.title",
    subtitleKey: "sculpture.obra20.sub",
    descriptionKey: "sculpture.obra20.desc",
    iconografiaKey: "sculpture.obra20.icono",
    thumbnail: "/images/sculptures/obra-20.webp",
    model: "",
    audio: OBRA20_AUDIO,
    getTitle: (locale) => t("sculpture.obra20.title", locale),
    getSubtitle: (locale) => t("sculpture.obra20.sub", locale),
    getDescription: (locale) => t("sculpture.obra20.desc", locale),
    getIconografia: (locale) => t("sculpture.obra20.icono", locale),
    getAudio: (locale) => OBRA20_AUDIO[locale] ?? OBRA20_AUDIO.es,
  },
];

/* ---------------------------------------------------------------------------
 * ENTORNO VIRTUAL (museo 3D) — ver README-entorno-virtual.md
 *
 * Para colocar una obra dentro del recorrido 3D:
 *   1. Copiar el .glb a /public/models/sculptures/  (o /public/models/museum/sculptures/)
 *   2. Copiar la miniatura a /public/images/sculptures/
 *   3. Agregar un objeto a `museumSculptures` con model / position / room.
 *
 * Si `ref` apunta a una obra de `sculptures`, el título, la descripción, la
 * iconografía, el material y el audio se reutilizan ya traducidos (es/en/pt);
 * si no, se usan los textos literales del propio objeto.
 * ------------------------------------------------------------------------- */

export interface MuseumSculpture {
  /** Id único dentro del entorno virtual. */
  id: string;
  /** Opcional: obra de `sculptures` cuya ficha traducida se reutiliza. */
  ref?: string;
  /** Ficha manual (obras sin entrada en la colección). */
  title?: string;
  subtitle?: string;
  artist?: string;
  year?: string;
  material?: string;
  dimensions?: string;
  inventoryNumber?: string;
  description?: string;
  historicalContext?: string;
  /** Ruta de la imagen; si falta se toma la de `ref`. */
  thumbnail?: string;
  /** Ruta del .glb (vacío ⇒ se muestra una placa con la ficha). */
  model: string;
  /** Posición base sobre el piso: [x, y, z] (y = altura del piso). */
  position: [number, number, number];
  /** Rotación en radianes sobre el eje Y (para orientar la pieza). */
  rotation?: [number, number, number];
  /** Altura final deseada en metros (el .glb se ajusta solo). */
  height?: number;
  /** Multiplicador sobre el ajuste automático. */
  scale?: number;
  /** Id de la sala (ver museumLayout.ts). */
  room: string;
  /** Pedestal bajo la pieza (por defecto true). */
  pedestal?: boolean;
  /** Radio de colisión en metros (por defecto 0.6). */
  collisionRadius?: number;
}

const sculptureById = new Map(sculptures.map((s) => [s.id, s]));

export function museumSource(s: MuseumSculpture) {
  return s.ref ? sculptureById.get(s.ref) : undefined;
}

export function museumTitle(s: MuseumSculpture, locale: Locale): string {
  return museumSource(s)?.getTitle(locale) ?? s.title ?? s.id;
}

export function museumSubtitle(
  s: MuseumSculpture,
  locale: Locale
): string | undefined {
  return museumSource(s)?.getSubtitle?.(locale) ?? s.subtitle;
}

export function museumArtist(s: MuseumSculpture): string | undefined {
  return s.artist ?? museumSource(s)?.artist;
}

export function museumDescription(
  s: MuseumSculpture,
  locale: Locale
): string {
  return museumSource(s)?.getDescription(locale) ?? s.description ?? "";
}

export function museumIconografia(
  s: MuseumSculpture,
  locale: Locale
): string | undefined {
  return museumSource(s)?.getIconografia?.(locale);
}

export function museumHistoricalContext(
  s: MuseumSculpture,
  locale: Locale
): string | undefined {
  return museumSource(s)?.getHistoricalContext?.(locale) ??
    s.historicalContext;
}

export function museumMaterial(
  s: MuseumSculpture,
  locale: Locale
): string | undefined {
  const src = museumSource(s);
  if (s.material) return s.material;
  if (src?.materialKey) return t(src.materialKey, locale);
  return src?.material;
}

export function museumDimensions(
  s: MuseumSculpture,
  locale: Locale
): string | undefined {
  const src = museumSource(s);
  if (s.dimensions) return s.dimensions;
  if (src?.dimensionsKey) return t(src.dimensionsKey, locale);
  return src?.dimensions;
}

export function museumThumbnail(s: MuseumSculpture): string | undefined {
  return s.thumbnail ?? museumSource(s)?.thumbnail;
}

export function museumAudio(
  s: MuseumSculpture,
  locale: Locale
): string | undefined {
  return museumSource(s)?.getAudio?.(locale);
}

export function museumInventory(s: MuseumSculpture): string | undefined {
  return s.inventoryNumber ?? museumSource(s)?.inventoryNumber;
}

export function museumSculptureById(id: string): MuseumSculpture | undefined {
  return museumSculptures.find((s) => s.id === id);
}

/**
 * Colocación de las obras dentro del plano de `museumLayout.ts`.
 * `position` es el punto de apoyo sobre el piso; el modelo se escala solo
 * para que mida `height` metros (por defecto 1,15 m) sobre el pedestal.
 *
 * Los `inventoryNumber` de esta lista son de ejemplo: reemplazarlos por los
 * números reales del museo cuando estén disponibles.
 */
export const museumSculptures: MuseumSculpture[] = [
  {
    id: "ev-obra-01",
    ref: "obra-01",
    inventoryNumber: "MUVA-001",
    model: "/models/sculptures/obra-01-sagrada-familia.glb",
    position: [-2.8, 0, 9.4],
    rotation: [0, 0.6, 0],
    height: 1.15,
    room: "entrada",
  },
  {
    id: "ev-obra-05",
    ref: "obra-05",
    inventoryNumber: "MUVA-002",
    model: "/models/sculptures/obra-05-san-joaquin.glb",
    position: [2.8, 0, 9.4],
    rotation: [0, -0.6, 0],
    height: 1.15,
    room: "entrada",
  },
  {
    id: "ev-obra-07",
    ref: "obra-07",
    inventoryNumber: "MUVA-003",
    model: "/models/sculptures/obra-07-fray-juan-bernardo.glb",
    position: [-11.4, 0, 2.6],
    rotation: [0, 1.35, 0],
    height: 1.2,
    room: "sala-1",
  },
  {
    id: "ev-obra-11",
    ref: "obra-11",
    inventoryNumber: "MUVA-004",
    model: "/models/sculptures/obra-11-padre-pio.glb",
    position: [-6.6, 0, -1.6],
    rotation: [0, -0.7, 0],
    height: 1.15,
    room: "sala-1",
  },
  {
    id: "ev-obra-12",
    ref: "obra-12",
    inventoryNumber: "MUVA-005",
    model: "/models/sculptures/obra-12-fray-luis-de-bolanos.glb",
    position: [11.4, 0, 2.6],
    rotation: [0, -1.35, 0],
    height: 1.2,
    room: "sala-2",
  },
  {
    id: "ev-obra-08",
    ref: "obra-08",
    inventoryNumber: "MUVA-006",
    model: "/models/sculptures/obra-08-francisco-y-domingo.glb",
    position: [6.6, 0, -1.6],
    rotation: [0, 0.7, 0],
    height: 1.15,
    room: "sala-2",
  },
  {
    id: "ev-obra-14",
    ref: "obra-14",
    inventoryNumber: "MUVA-007",
    model: "/models/sculptures/obra-14-nativa-arrodillada.glb",
    position: [-11.2, 0, -6],
    rotation: [0, 1.2, 0],
    height: 1.1,
    room: "sala-3",
  },
  {
    id: "ev-obra-10",
    ref: "obra-10",
    inventoryNumber: "MUVA-008",
    model: "/models/sculptures/obra-10-tupasy-maria.glb",
    position: [-6.4, 0, -12.6],
    rotation: [0, -0.6, 0],
    height: 1.15,
    room: "sala-3",
  },
  {
    id: "ev-obra-03",
    ref: "obra-03",
    inventoryNumber: "MUVA-009",
    model: "/models/sculptures/obra-03-virgen-maria.glb",
    position: [0, 0, -13.2],
    rotation: [0, 0, 0],
    height: 1.5,
    room: "sala-principal",
  },
  {
    id: "ev-obra-02",
    ref: "obra-02",
    inventoryNumber: "MUVA-010",
    model: "/models/sculptures/obra-02-nino-jesus.glb",
    position: [9, 0, -11],
    rotation: [0, -0.65, 0],
    height: 1.1,
    room: "sala-4",
  },
];
