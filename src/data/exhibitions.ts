export interface Exhibition {
  id: string;
  title: string;
  subtitle?: string;
  type: "permanent" | "temporary";
  description: string;
  image: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  cta?: string;
  href?: string;
}

export const exhibitions: Exhibition[] = [
  {
    id: "permanente-viedma",
    title: "Muestra Permanente",
    subtitle: "La obra legado de Manuel Viedma",
    type: "permanent",
    description:
      "Un recorrido por más de cuatro décadas de obra de Manuel Viedma, presentada en diálogo con los murales que narran el encuentro guaraní–jesuítico. Esculturas, relieves y piezas de gran formato dan vida a una de las colecciones más singulares del Paraguay contemporáneo.",
    image: "/images/exhibitions/permanente.webp",
    location: "Salas principales – Planta baja",
    cta: "Recorrer la muestra",
    href: "#coleccion",
  },
  {
    id: "murales-guarani-jesuitica",
    title: "Murales · Experiencia Guaraní – Jesuítica",
    subtitle: "El recorrido interior",
    type: "permanent",
    description:
      "Un programa de murales de gran formato que recorre, capítulo a capítulo, el encuentro entre los pueblos guaraníes y las misiones jesuíticas. Una experiencia visual, sonora y contemplativa que transforma la visita en un viaje interior.",
    image: "/images/exhibitions/murales.webp",
    location: "Recorrido interior – Primer piso",
    cta: "Descubrir la experiencia",
    href: "#experiencia",
  },
  {
    id: "temporal-pasionaria",
    title: "La Flor de la Pasionaria o Mburukuja",
    type: "temporary",
    description:
      "Muestra temporal que profundiza en una de las piezas más emblemáticas del museo, explorando la simbología de la pasionaria, su vínculo con la espiritualidad guaraní y su resignificación contemporánea a partir del trabajo de Manuel Viedma.",
    image: "/images/exhibitions/pasionaria.webp",
    startDate: "Marzo 2026",
    endDate: "Agosto 2026",
    location: "Sala Temporal – Ala norte",
    cta: "Conocer la muestra",
    href: "#",
  },
  {
    id: "temporal-mujeres",
    title: "Mujeres del Encuentro",
    type: "temporary",
    description:
      "Una exposición que reúne obra de artistas contemporáneos en torno al rol de la mujer en el encuentro guaraní–jesuítico. Madres, maestras, tejedoras, cantoras: figuras esenciales que el arte contemporáneo rescata y honra.",
    image: "/images/exhibitions/mujeres.webp",
    startDate: "Septiembre 2026",
    endDate: "Diciembre 2026",
    location: "Sala Temporal – Ala sur",
    cta: "Próximamente",
    href: "#",
  },
];
