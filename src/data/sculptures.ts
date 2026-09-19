import { t, type Locale } from "../i18n/translations";

export interface SculptureAudio {
  es?: string;
  en?: string;
  pt?: string;
}

export interface Sculpture {
  id: string;
  titleKey: string;
  artist: string;
  year?: string;
  material?: string;
  dimensions?: string;
  inventoryNumber?: string;
  descriptionKey: string;
  historicalContextKey?: string;
  thumbnail: string;
  model: string;
  audio?: SculptureAudio;
  getTitle: (locale: Locale) => string;
  getDescription: (locale: Locale) => string;
  getHistoricalContext?: (locale: Locale) => string;
  getAudio?: (locale: Locale) => string | undefined;
}

/**
 * Para agregar una nueva obra:
 *  1. Copiar el archivo .glb a /public/models/sculptures/
 *  2. Copiar el archivo .webp a /public/images/sculptures/
 *  3. Copiar el archivo .mp3 a /public/audio/sculptures/ (formato: obra-XX-idioma.mp3)
 *  4. Agregar un nuevo objeto a este arreglo con el campo audio.
 *  La galería, el visor y la audioguía se actualizan automáticamente.
 */
export const sculptures: Sculpture[] = [
  {
    id: "obra-01",
    titleKey: "sculpture.obra01.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra01.desc",
    thumbnail: "/images/sculptures/obra-01.webp",
    model: "/models/sculptures/prueba.glb",
    audio: {
      es: "/audio/sculptures/obra-01-es.mp3",
      en: "/audio/sculptures/obra-01-en.mp3",
      pt: "/audio/sculptures/obra-01-pt.mp3",
    },
    getTitle: (locale) => t("sculpture.obra01.title", locale),
    getDescription: (locale) => t("sculpture.obra01.desc", locale),
    getAudio: (locale) => {
      const a = sculptures[0].audio;
      return a?.[locale] ?? a?.es;
    },
  },
  {
    id: "obra-02",
    titleKey: "sculpture.obra02.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra02.desc",
    thumbnail: "/images/sculptures/obra-02.webp",
    model: "/models/sculptures/prueba.glb",
    audio: {
      es: "/audio/sculptures/obra-02-es.mp3",
      en: "/audio/sculptures/obra-02-en.mp3",
      pt: "/audio/sculptures/obra-02-pt.mp3",
    },
    getTitle: (locale) => t("sculpture.obra02.title", locale),
    getDescription: (locale) => t("sculpture.obra02.desc", locale),
    getAudio: (locale) => {
      const a = sculptures[1].audio;
      return a?.[locale] ?? a?.es;
    },
  },
  {
    id: "obra-03",
    titleKey: "sculpture.obra03.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra03.desc",
    thumbnail: "/images/sculptures/obra-03.webp",
    model: "/models/sculptures/prueba.glb",
    audio: {
      es: "/audio/sculptures/obra-03-es.mp3",
      en: "/audio/sculptures/obra-03-en.mp3",
      pt: "/audio/sculptures/obra-03-pt.mp3",
    },
    getTitle: (locale) => t("sculpture.obra03.title", locale),
    getDescription: (locale) => t("sculpture.obra03.desc", locale),
    getAudio: (locale) => {
      const a = sculptures[2].audio;
      return a?.[locale] ?? a?.es;
    },
  },
  {
    id: "obra-04",
    titleKey: "sculpture.obra04.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra04.desc",
    thumbnail: "/images/sculptures/obra-04.webp",
    model: "/models/sculptures/prueba.glb",
    audio: {
      es: "/audio/sculptures/obra-04-es.mp3",
      en: "/audio/sculptures/obra-04-en.mp3",
      pt: "/audio/sculptures/obra-04-pt.mp3",
    },
    getTitle: (locale) => t("sculpture.obra04.title", locale),
    getDescription: (locale) => t("sculpture.obra04.desc", locale),
    getAudio: (locale) => {
      const a = sculptures[3].audio;
      return a?.[locale] ?? a?.es;
    },
  },
  {
    id: "obra-05",
    titleKey: "sculpture.obra05.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra05.desc",
    historicalContextKey: "sculpture.obra05.ctx",
    thumbnail: "/images/sculptures/obra-05.webp",
    model: "/models/sculptures/prueba.glb",
    audio: {
      es: "/audio/sculptures/obra-05-es.mp3",
      en: "/audio/sculptures/obra-05-en.mp3",
      pt: "/audio/sculptures/obra-05-pt.mp3",
    },
    getTitle: (locale) => t("sculpture.obra05.title", locale),
    getDescription: (locale) => t("sculpture.obra05.desc", locale),
    getHistoricalContext: (locale) => t("sculpture.obra05.ctx", locale),
    getAudio: (locale) => {
      const a = sculptures[4].audio;
      return a?.[locale] ?? a?.es;
    },
  },
  {
    id: "obra-06",
    titleKey: "sculpture.obra06.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra06.desc",
    thumbnail: "/images/sculptures/obra-06.webp",
    model: "/models/sculptures/prueba.glb",
    audio: {
      es: "/audio/sculptures/obra-06-es.mp3",
      en: "/audio/sculptures/obra-06-en.mp3",
      pt: "/audio/sculptures/obra-06-pt.mp3",
    },
    getTitle: (locale) => t("sculpture.obra06.title", locale),
    getDescription: (locale) => t("sculpture.obra06.desc", locale),
    getAudio: (locale) => {
      const a = sculptures[5].audio;
      return a?.[locale] ?? a?.es;
    },
  },
  {
    id: "obra-07",
    titleKey: "sculpture.obra07.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra07.desc",
    thumbnail: "/images/sculptures/obra-07.webp",
    model: "/models/sculptures/prueba.glb",
    audio: {
      es: "/audio/sculptures/obra-07-es.mp3",
      en: "/audio/sculptures/obra-07-en.mp3",
      pt: "/audio/sculptures/obra-07-pt.mp3",
    },
    getTitle: (locale) => t("sculpture.obra07.title", locale),
    getDescription: (locale) => t("sculpture.obra07.desc", locale),
    getAudio: (locale) => {
      const a = sculptures[6].audio;
      return a?.[locale] ?? a?.es;
    },
  },
];
