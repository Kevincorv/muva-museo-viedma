import { t, type Locale } from "../i18n/translations";

export interface MuseumSchedule {
  daysKey: string;
  hours?: string;
  hoursKey?: string;
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
  vehicles: { typeKey: string; price: string }[];
  individual: { typeKey: string; price: string; noteKey?: string }[];
  groups: { typeKey: string; price: string; noteKey?: string }[];
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
    { daysKey: "schedule.wedFri", hours: "9:00 – 17:00 hs" },
    { daysKey: "schedule.satSun", hours: "9:00 – 19:00 hs" },
    { daysKey: "schedule.monTue", hoursKey: "schedule.closed" },
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
      { typeKey: "access.motos", price: "5.000 Gs." },
      { typeKey: "access.vehiculos", price: "10.000 Gs." },
      { typeKey: "access.minivan", price: "20.000 Gs." },
      { typeKey: "access.minibus", price: "30.000 Gs." },
      { typeKey: "access.busGrande", price: "50.000 Gs." },
    ],
    individual: [
      {
        typeKey: "access.accesoExterior",
        price: "2.000 Gs. por persona",
        noteKey: "access.ninosFree",
      },
      {
        typeKey: "access.accesoMurales",
        price: "20.000 Gs. por persona",
        noteKey: "access.ninosReduced",
      },
    ],
    groups: [
      {
        typeKey: "access.gruposGrandes",
        price: "20.000 Gs. por persona",
        noteKey: "access.reservaPrevia",
      },
      {
        typeKey: "access.gruposNinos",
        price: "8.000 Gs. por persona",
        noteKey: "access.reservaNinos",
      },
    ],
  } satisfies MuseumAccess,
  navLinks: [
    { labelKey: "nav.inicio", href: "#inicio" },
    { labelKey: "nav.museo", href: "#museo" },
    { labelKey: "nav.historia", href: "#historia" },
    { labelKey: "nav.coleccion", href: "#coleccion" },
  ],
  getScheduleDay: (s: MuseumSchedule, locale: Locale) => t(s.daysKey, locale),
  getScheduleHours: (s: MuseumSchedule & { hoursKey?: string }, locale: Locale) =>
    s.hoursKey ? t(s.hoursKey, locale) : s.hours,
  getVehicleType: (v: { typeKey: string }, locale: Locale) => t(v.typeKey, locale),
  getAccessType: (v: { typeKey: string }, locale: Locale) => t(v.typeKey, locale),
  getAccessNote: (v: { noteKey?: string }, locale: Locale) =>
    v.noteKey ? t(v.noteKey, locale) : undefined,
  getFullName: (locale: Locale) => t("museum.fullName", locale),
  getTagline: (locale: Locale) => t("museum.tagline", locale),
  getMission: (locale: Locale) => t("museum.mission", locale),
};
