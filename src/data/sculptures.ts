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
    title: "La Pasionaria",
    artist: "Manuel Viedma",
    year: "1998",
    material: "Bronce patinado",
    dimensions: "180 × 90 × 70 cm",
    inventoryNumber: "MVP-001",
    description:
      "La Flor de la Pasionaria o Mburukuja es una de las piezas más emblemáticas del legado artístico de Manuel Viedma. La escultura interpreta, con un lenguaje contemporáneo, la espiritualidad guaraní y la simbología de las misiones jesuíticas, fusionando naturaleza, fe y memoria.",
    historicalContext:
      "La obra forma parte de la colección permanente y dialoga con la tradición iconográfica de las reducciones jesuíticas en Paraguay.",
    thumbnail: "/images/sculptures/obra-01.webp",
    model: "/models/sculptures/obra-01.glb",
  },
  {
    id: "obra-02",
    title: "Guaraní en Oración",
    artist: "Manuel Viedma",
    year: "2005",
    material: "Madera tallada y bronce",
    dimensions: "210 × 80 × 60 cm",
    inventoryNumber: "MVP-002",
    description:
      "Figura humana en posición de recogimiento, que evoca el momento previo a la oración. La pieza traduce en volumen el silencio, la introspección y la profundidad espiritual del encuentro entre dos mundos.",
    historicalContext:
      "Inspirada en los testimonios visuales de las comunidades guaraníes que habitaron las misiones jesuíticas durante los siglos XVII y XVIII.",
    thumbnail: "/images/sculptures/obra-02.webp",
    model: "/models/sculptures/obra-02.glb",
  },
  {
    id: "obra-03",
    title: "El Ángel Misionero",
    artist: "Manuel Viedma",
    year: "2012",
    material: "Bronce",
    dimensions: "195 × 110 × 90 cm",
    inventoryNumber: "MVP-003",
    description:
      "Una de las piezas más monumentales de la colección. Representa el espíritu de las reducciones, el cuidado del otro y la transmisión cultural. Sus texturas y pliegues invitan a un recorrido visual detenido.",
    historicalContext:
      "La escultura se ubica en el patio central del museo como punto de contemplación del recorrido guaraní–jesuítico.",
    thumbnail: "/images/sculptures/obra-03.webp",
    model: "/models/sculptures/obra-03.glb",
  },
  {
    id: "obra-04",
    title: "Memoria de la Tierra",
    artist: "Manuel Viedma",
    year: "2018",
    material: "Piedra y bronce",
    dimensions: "150 × 100 × 100 cm",
    inventoryNumber: "MVP-004",
    description:
      "La obra celebra la conexión profunda entre el pueblo guaraní y la tierra que habitó. Una pieza de gran presencia, trabajada a partir de materiales que evocan la permanencia y el arraigo.",
    historicalContext:
      "Realizada en el marco del programa artístico de la Fundación Viedma Paoli.",
    thumbnail: "/images/sculptures/obra-04.webp",
    model: "/models/sculptures/obra-04.glb",
  },
  {
    id: "obra-05",
    title: "Cantor de la Selva",
    artist: "Manuel Viedma",
    year: "2020",
    material: "Madera de cedro",
    dimensions: "175 × 70 × 65 cm",
    inventoryNumber: "MVP-005",
    description:
      "Figura esbelta de expresión contemplativa, inspirada en los cantos litúrgicos de las misiones. La obra traduce el ritmo de la música barroca misional a la forma escultórica.",
    historicalContext:
      "Forma parte de la muestra permanente y dialoga con los murales del recorrido Experiencia Guaraní – Jesuítica.",
    thumbnail: "/images/sculptures/obra-05.webp",
    model: "/models/sculptures/obra-05.glb",
  },
  {
    id: "obra-06",
    title: "Madre del Monte",
    artist: "Manuel Viedma",
    year: "2022",
    material: "Bronce y pátinas naturales",
    dimensions: "200 × 120 × 95 cm",
    inventoryNumber: "MVP-006",
    description:
      "Una figura femenina que emerge del monte como protectora del conocimiento ancestral. Su presencia sintetiza la espiritualidad, la fertilidad y la memoria viva del Paraguay profundo.",
    historicalContext:
      "Creada como pieza central de la exposición «Mujeres del Encuentro» en el MUVA.",
    thumbnail: "/images/sculptures/obra-06.webp",
    model: "/models/sculptures/obra-06.glb",
  },
];
