export interface Sculpture {
  id: string;
  title: string;
  artist: string;
  year?: string;
  material?: string;
  dimensions?: string;
  inventoryNumber?: string;
  description: string;
  historicalContext?: string;
  thumbnail: string;
  model: string;
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
    title: "La Pasionaria y San Ignacio",
    artist: "Manuel Viedma",
    description:
      "Obra que fusiona la simbología de la Pasionaria o Mburukuja con la espiritualidad de San Ignacio, representando el encuentro entre la naturaleza misionera y la fe jesuítica.",
    thumbnail: "/images/sculptures/obra-01.webp",
    model: "/models/sculptures/obra-01.glb",
  },
  {
    id: "obra-02",
    title: "San Miguel Arcángel",
    artist: "Manuel Viedma",
    description:
      "Representación del arcángel San Miguel como protector y guía espiritual, figure central de la tradición católica en las reducciones jesuíticas.",
    thumbnail: "/images/sculptures/obra-02.webp",
    model: "/models/sculptures/prueba.glb",
  },
  {
    id: "obra-03",
    title: "Sagrada Familia",
    artist: "Manuel Viedma",
    description:
      "Grupo escultórico que representa a la Sagrada Familia como modelo de vida comunitaria y espiritual, reflejando los valores transmitidos por los misioneros jesuíticas a las comunidades guaraníes.",
    thumbnail: "/images/sculptures/obra-03.webp",
    model: "/models/sculptures/obra-03.glb",
  },
  {
    id: "obra-04",
    title: "Raza Mestiza",
    artist: "Manuel Viedma",
    description:
      "Obra que celebra la fusión de culturas entre los pueblos originarios guaraníes y los colonizadores europeos, simbolizando el nacimiento de una nueva identidad cultural en la región.",
    thumbnail: "/images/sculptures/obra-04.webp",
    model: "/models/sculptures/obra-04.glb",
  },
  {
    id: "obra-05",
    title: "Rincón Franciscano",
    artist: "Manuel Viedma",
    description:
      "Grupo escultórico compuesto por diversas figuras que representan la labor franciscana en la evangelización guaraní. Incluye la réplica de «Tupasy María» (Virgen María del templo de Santa María de Fe), San Francisco de Asís, Santo Domingo de Guzmán, Santo Padre Pío, Fray Luis de Bolaños y Fray Juan Bernardo. Tres niños completan la escena: uno sostiene la imagen de Jesucristo, otro toca el tambor y el último escribe oraciones. El grupo es enmarcado por un gran rosario con remate en el Cristo crucificado, rodeando un pozo antiguo de más de 400 años con brocal de piedra jesuítico.",
    historicalContext:
      "Este grupo escultórico rinde homenaje a la labor de los frailes franciscanos en la región de Caazapá, Villarrica y otras zonas de Paraguay, destacando su contribución a la evangelización y la cultura local.",
    thumbnail: "/images/sculptures/obra-05.webp",
    model: "/models/sculptures/obra-05.glb",
  },
  {
    id: "obra-06",
    title: "Los Orantes",
    artist: "Manuel Viedma",
    description:
      "Junto al primer lago, un grupo escultórico representa a la Virgen del Rosario rodeada por indígenas guaraníes de diversas edades y roles sociales, todos en actitud orante. La escena evoca la costumbre guaraní de rezar el Santo Rosario al atardecer, dirigidos por un sacerdote jesuita, como expresión de gratitud por la vida. Los orantes no solo recuerdan una tradición, sino que también interceden por aquellos que aún viven, buscando la recuperación y el reconocimiento del sacrificio que la comunidad guaraní realizó en la región de Paraquaria. La escena conjuga una práctica religiosa ancestral con un acto de memoria y reivindicación del legado guaraní.",
    thumbnail: "/images/sculptures/obra-06.webp",
    model: "/models/sculptures/obra-06.glb",
  },
  {
    id: "obra-07",
    title: "Cristo Resucitado",
    artist: "Manuel Viedma",
    description:
      "Escultura que representa a Cristo resucitado como símbolo de esperanza y renovación, figure central de la fe católica transmitida a las comunidades guaraníes durante las reducciones jesuíticas.",
    thumbnail: "/images/sculptures/obra-07.webp",
    model: "/models/sculptures/obra-07.glb",
  },
];
