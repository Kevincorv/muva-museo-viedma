export interface MuseumSchedule {
  days: string;
  hours: string;
}

export interface MuseumContact {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  whatsappDisplay: string;
  email: string;
  address: string;
  city: string;
  country: string;
  mapsUrl: string;
  social: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export interface MuseumAccess {
  vehicles: { type: string; price: string }[];
  individual: { type: string; price: string; note?: string }[];
  groups: { type: string; price: string; note?: string }[];
}

export const museum = {
  name: "MUVA",
  fullName: "Museo Viedma",
  tagline: "Experiencia Guaraní – Jesuítica",
  mission:
    "Somos un espacio que busca, con una mirada abierta, reflexiva y contemporánea, hacer presente el legado de uno de los eventos más importantes en la historia de la humanidad: el encuentro guaraní – jesuítico, exhibido a la comunidad desde una perspectiva histórica, con un enfoque artístico, académico y espiritual.",
  description:
    "Investigamos, conservamos, interpretamos y exhibimos patrimonio cultural con foco en el legado guaraní–jesuita. Un museo que invita al silencio, a la contemplación y al encuentro profundo con la historia del Paraguay.",
  heroQuote: "Un espacio para encontrarnos con nuestra historia, nuestro arte y nuestro legado.",
  founded: 2026,
  location: "San Ignacio Guazú, Misiones, Paraguay",
  schedule: [
    { days: "Miércoles a Viernes", hours: "9:00 – 17:00 hs" },
    { days: "Sábados y Domingos", hours: "9:00 – 19:00 hs" },
    { days: "Lunes y Martes", hours: "Cerrado al público" },
  ] satisfies MuseumSchedule[],
  contact: {
    phone: "+595973423719",
    phoneDisplay: "+595 973 423 719",
    whatsapp: "595973423719",
    whatsappDisplay: "+595 973 423 719",
    email: "info@muva.com.py",
    address: "Ruta PY 01 Km 223",
    city: "San Ignacio Guazú, Misiones",
    country: "Paraguay",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=MUVA+San+Ignacio+Guaz%C3%BA+Paraguay",
    social: {
      facebook: "https://www.facebook.com/museoviedma",
      instagram: "https://instagram.com/museoviedma",
      linkedin: "#",
      youtube: "#",
    },
  } satisfies MuseumContact,
  access: {
    vehicles: [
      { type: "Motos", price: "5.000 Gs." },
      { type: "Vehículos en general", price: "10.000 Gs." },
      { type: "Minivan (hasta 12 personas)", price: "20.000 Gs." },
      { type: "Mini Bus (hasta 30 personas)", price: "30.000 Gs." },
      { type: "Bus Grande", price: "50.000 Gs." },
    ],
    individual: [
      {
        type: "Acceso al predio – recorrido exterior",
        price: "2.000 Gs. por persona",
        note: "Niños hasta 10 años: gratuito.",
      },
      {
        type: "Recorrido Murales Experiencia Guaraní – Jesuítica",
        price: "20.000 Gs. por persona",
        note: "Niños hasta 10 años: 10.000 Gs. por persona.",
      },
    ],
    groups: [
      {
        type: "Grupos de 10 personas en adelante",
        price: "20.000 Gs. por persona",
        note: "Con reserva previa.",
      },
      {
        type: "Grupos de niños hasta 10 años",
        price: "8.000 Gs. por persona",
        note: "Con reserva previa al (+595) 0973 – 423 719.",
      },
    ],
  } satisfies MuseumAccess,
  navLinks: [
    { label: "Inicio", href: "#inicio" },
    { label: "Museo", href: "#museo" },
    { label: "Historia", href: "#historia" },
    { label: "Colección", href: "#coleccion" },
    { label: "Entorno Virtual", href: "#entorno-virtual" },
    { label: "Exposiciones", href: "#exposiciones" },
  ],
};
