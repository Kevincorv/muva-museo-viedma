export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: "Noticia" | "Agenda" | "Educación" | "Cultura";
  image: string;
  href: string;
}

export const news: NewsItem[] = [
  {
    id: "n-01",
    title: "Un artista que inspira y trasciende fronteras",
    excerpt:
      "Manuel Viedma es, sin dudas, un artista que inspira y trasciende fronteras. Su sólida convicción lo llevó a idear proyectos y fundar instituciones que representan un verdadero aporte académico, artístico y cultural para el Paraguay y la región.",
    date: "Agosto 2026",
    category: "Cultura",
    image: "/images/news/viedma-legado.webp",
    href: "#",
  },
  {
    id: "n-02",
    title: "Fundación Viedma Paoli, un legado con mirada hacia el futuro",
    excerpt:
      "La Fundación Viedma Paoli trabaja en la revalorización y difusión del legado guaraní – jesuítico a partir de la obra de Manuel de Jesús Viedma. Una interpretación contemporánea que promueve propuestas culturales, educativas y artísticas.",
    date: "Julio 2026",
    category: "Noticia",
    image: "/images/news/fundacion.webp",
    href: "#",
  },
  {
    id: "n-03",
    title: "La Flor de la Pasionaria o Mburukuja",
    excerpt:
      "El MUVA ofrece a sus visitantes un recorrido por este espacio cultural sin precedentes en Paraguay, para preservar, difundir y resignificar el legado histórico, espiritual y artístico del encuentro entre los pueblos guaraníes y las misiones jesuíticas.",
    date: "Julio 2026",
    category: "Agenda",
    image: "/images/news/pasionaria.webp",
    href: "#",
  },
  {
    id: "n-04",
    title: "Programa educativo 2026: visitas guiadas y talleres",
    excerpt:
      "Durante todo el año, el museo ofrece un programa de visitas guiadas, talleres y experiencias pedagógicas para escuelas, universidades y familias. Una invitación a recorrer la historia del Paraguay a través del arte.",
    date: "Junio 2026",
    category: "Educación",
    image: "/images/news/educativo.webp",
    href: "#",
  },
];
