import { t, type Locale } from "../i18n/translations";

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
  getTitle: (locale: Locale) => string;
  getDescription: (locale: Locale) => string;
  getHistoricalContext?: (locale: Locale) => string;
}

/**
 * Para agregar una nueva obra:
 *  1. Copiar el archivo .glb a /public/models/sculptures/
 *  2. Copiar el archivo .webp a /public/images/sculptures/
 *  3. Agregar un nuevo objeto a este arreglo.
 *  La galería y el visor se actualizan automáticamente.
 */
export const sculptures: Sculpture[] = [
  {
    id: "obra-01",
    titleKey: "sculpture.obra01.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra01.desc",
    thumbnail: "/images/sculptures/obra-01.webp",
    model: "/models/sculptures/prueba.glb",
    getTitle: (locale) => t("sculpture.obra01.title", locale),
    getDescription: (locale) => t("sculpture.obra01.desc", locale),
  },
  {
    id: "obra-02",
    titleKey: "sculpture.obra02.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra02.desc",
    thumbnail: "/images/sculptures/obra-02.webp",
    model: "/models/sculptures/prueba.glb",
    getTitle: (locale) => t("sculpture.obra02.title", locale),
    getDescription: (locale) => t("sculpture.obra02.desc", locale),
  },
  {
    id: "obra-03",
    titleKey: "sculpture.obra03.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra03.desc",
    thumbnail: "/images/sculptures/obra-03.webp",
    model: "/models/sculptures/prueba.glb",
    getTitle: (locale) => t("sculpture.obra03.title", locale),
    getDescription: (locale) => t("sculpture.obra03.desc", locale),
  },
  {
    id: "obra-04",
    titleKey: "sculpture.obra04.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra04.desc",
    thumbnail: "/images/sculptures/obra-04.webp",
    model: "/models/sculptures/prueba.glb",
    getTitle: (locale) => t("sculpture.obra04.title", locale),
    getDescription: (locale) => t("sculpture.obra04.desc", locale),
  },
  {
    id: "obra-05",
    titleKey: "sculpture.obra05.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra05.desc",
    historicalContextKey: "sculpture.obra05.ctx",
    thumbnail: "/images/sculptures/obra-05.webp",
    model: "/models/sculptures/prueba.glb",
    getTitle: (locale) => t("sculpture.obra05.title", locale),
    getDescription: (locale) => t("sculpture.obra05.desc", locale),
    getHistoricalContext: (locale) => t("sculpture.obra05.ctx", locale),
  },
  {
    id: "obra-06",
    titleKey: "sculpture.obra06.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra06.desc",
    thumbnail: "/images/sculptures/obra-06.webp",
    model: "/models/sculptures/prueba.glb",
    getTitle: (locale) => t("sculpture.obra06.title", locale),
    getDescription: (locale) => t("sculpture.obra06.desc", locale),
  },
  {
    id: "obra-07",
    titleKey: "sculpture.obra07.title",
    artist: "Manuel Viedma",
    descriptionKey: "sculpture.obra07.desc",
    thumbnail: "/images/sculptures/obra-07.webp",
    model: "/models/sculptures/prueba.glb",
    getTitle: (locale) => t("sculpture.obra07.title", locale),
    getDescription: (locale) => t("sculpture.obra07.desc", locale),
  },
];
