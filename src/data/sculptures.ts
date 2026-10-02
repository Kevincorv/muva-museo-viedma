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
    model: "/models/sculptures/sagrada familia 1.glb",
    getTitle: (locale) => t("sculpture.obra01.title", locale),
    getSubtitle: (locale) => t("sculpture.obra01.sub", locale),
    getDescription: (locale) => t("sculpture.obra01.desc", locale),
    getIconografia: (locale) => t("sculpture.obra01.icono", locale),
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
    model: "/models/sculptures/foto niño jesus.glb",
    getTitle: (locale) => t("sculpture.obra02.title", locale),
    getSubtitle: (locale) => t("sculpture.obra02.sub", locale),
    getDescription: (locale) => t("sculpture.obra02.desc", locale),
    getIconografia: (locale) => t("sculpture.obra02.icono", locale),
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
    model: "/models/sculptures/virgen_maria_de_pie_imagen_clasica_de_la_virgen.glb",
    getTitle: (locale) => t("sculpture.obra03.title", locale),
    getSubtitle: (locale) => t("sculpture.obra03.sub", locale),
    getDescription: (locale) => t("sculpture.obra03.desc", locale),
    getIconografia: (locale) => t("sculpture.obra03.icono", locale),
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
    model: "/models/sculptures/virgen_de_pie.glb",
    getTitle: (locale) => t("sculpture.obra04.title", locale),
    getSubtitle: (locale) => t("sculpture.obra04.sub", locale),
    getDescription: (locale) => t("sculpture.obra04.desc", locale),
    getIconografia: (locale) => t("sculpture.obra04.icono", locale),
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
    model: "/models/sculptures/Santo_de_pie_sosteniendo_un_libro_abierto.glb",
    getTitle: (locale) => t("sculpture.obra05.title", locale),
    getSubtitle: (locale) => t("sculpture.obra05.sub", locale),
    getDescription: (locale) => t("sculpture.obra05.desc", locale),
    getIconografia: (locale) => t("sculpture.obra05.icono", locale),
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
    model: "/models/sculptures/angel_de_rodillas.glb",
    getTitle: (locale) => t("sculpture.obra06.title", locale),
    getSubtitle: (locale) => t("sculpture.obra06.sub", locale),
    getDescription: (locale) => t("sculpture.obra06.desc", locale),
    getIconografia: (locale) => t("sculpture.obra06.icono", locale),
  },
  {
    id: "obra-07",
    titleKey: "sculpture.obra07.title",
    subtitleKey: "sculpture.obra07.sub",
    descriptionKey: "sculpture.obra07.desc",
    iconografiaKey: "sculpture.obra07.icono",
    thumbnail: "/images/sculptures/obra-07.webp",
    model: "",
    getTitle: (locale) => t("sculpture.obra07.title", locale),
    getSubtitle: (locale) => t("sculpture.obra07.sub", locale),
    getDescription: (locale) => t("sculpture.obra07.desc", locale),
    getIconografia: (locale) => t("sculpture.obra07.icono", locale),
  },
  {
    id: "obra-08",
    titleKey: "sculpture.obra08.group",
    descriptionKey: "sculpture.obra08.desc",
    thumbnail: "/images/sculptures/obra-08.webp",
    model: "/models/sculptures/prueba.glb",
    getTitle: (locale) => t("sculpture.obra08.group", locale),
    getDescription: (locale) => t("sculpture.obra08.desc", locale),
    blocks: [
      {
        titleKey: "sculpture.obra08.title",
        subtitleKey: "sculpture.obra08.sub",
        descriptionKey: "sculpture.obra08.desc",
        iconografiaKey: "sculpture.obra08.icono",
        getTitle: (locale) => t("sculpture.obra08.title", locale),
        getSubtitle: (locale) => t("sculpture.obra08.sub", locale),
        getDescription: (locale) => t("sculpture.obra08.desc", locale),
        getIconografia: (locale) => t("sculpture.obra08.icono", locale),
      },
      {
        titleKey: "sculpture.obra09.title",
        subtitleKey: "sculpture.obra09.sub",
        descriptionKey: "sculpture.obra09.desc",
        iconografiaKey: "sculpture.obra09.icono",
        getTitle: (locale) => t("sculpture.obra09.title", locale),
        getSubtitle: (locale) => t("sculpture.obra09.sub", locale),
        getDescription: (locale) => t("sculpture.obra09.desc", locale),
        getIconografia: (locale) => t("sculpture.obra09.icono", locale),
      },
    ],
  },
  {
    id: "obra-10",
    titleKey: "sculpture.obra10.title",
    subtitleKey: "sculpture.obra10.sub",
    descriptionKey: "sculpture.obra10.desc",
    iconografiaKey: "sculpture.obra10.icono",
    thumbnail: "/images/sculptures/obra-10.webp",
    model: "",
    getTitle: (locale) => t("sculpture.obra10.title", locale),
    getSubtitle: (locale) => t("sculpture.obra10.sub", locale),
    getDescription: (locale) => t("sculpture.obra10.desc", locale),
    getIconografia: (locale) => t("sculpture.obra10.icono", locale),
  },
  {
    id: "obra-11",
    titleKey: "sculpture.obra11.title",
    subtitleKey: "sculpture.obra11.sub",
    descriptionKey: "sculpture.obra11.desc",
    iconografiaKey: "sculpture.obra11.icono",
    thumbnail: "/images/sculptures/obra-11.webp",
    model: "/models/sculptures/Santo_sentado_con_una_mano_levantada.glb",
    getTitle: (locale) => t("sculpture.obra11.title", locale),
    getSubtitle: (locale) => t("sculpture.obra11.sub", locale),
    getDescription: (locale) => t("sculpture.obra11.desc", locale),
    getIconografia: (locale) => t("sculpture.obra11.icono", locale),
  },
  {
    id: "obra-12",
    titleKey: "sculpture.obra12.title",
    subtitleKey: "sculpture.obra12.sub",
    descriptionKey: "sculpture.obra12.desc",
    iconografiaKey: "sculpture.obra12.icono",
    thumbnail: "/images/sculptures/obra-12.webp",
    model: "/models/sculptures/Santo_de_pie_con_libro_abierto_con_mensaje.glb",
    getTitle: (locale) => t("sculpture.obra12.title", locale),
    getSubtitle: (locale) => t("sculpture.obra12.sub", locale),
    getDescription: (locale) => t("sculpture.obra12.desc", locale),
    getIconografia: (locale) => t("sculpture.obra12.icono", locale),
  },
  {
    id: "obra-13",
    titleKey: "sculpture.obra13.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra13.desc",
    thumbnail: "/images/sculptures/obra-13.webp",
    model: "",
    audio: PASIONARIA_AUDIO,
    getTitle: (locale) => t("sculpture.obra13.title", locale),
    getDescription: (locale) => t("sculpture.obra13.desc", locale),
    getAudio: (locale) => PASIONARIA_AUDIO[locale] ?? PASIONARIA_AUDIO.es,
  },
];
