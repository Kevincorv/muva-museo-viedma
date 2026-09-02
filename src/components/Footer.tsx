import { Facebook, Instagram, Linkedin, type LucideIcon } from "lucide-react";
import type { MuseumContact } from "../data/museum";

interface FooterProps {
  contact: MuseumContact;
  fullName: string;
  tagline: string;
  year: number;
}

const socialIcons: Record<string, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  // youtube: Youtube, // Comentado temporalmente – se puede reactivar luego
};

export default function Footer({ contact, fullName, tagline, year }: FooterProps) {
  const footerLinks = [
    {
      title: "Museo",
      links: [
        { label: "El Museo", href: "#museo" },
        { label: "Historia", href: "#historia" },
        { label: "Colección", href: "#coleccion" },
        { label: "Exposiciones", href: "#exposiciones" },
      ],
    },
    {
      title: "Experiencia",
      links: [
        { label: "Guaraní – Jesuítica", href: "#experiencia" },
        { label: "Entorno Virtual 3D", href: "#entorno-virtual" },
        { label: "Noticias y agenda", href: "#" },
      ],
    },
    {
      title: "Visita",
      links: [
        { label: "Horarios y entradas", href: "#visita" },
        { label: "Contacto", href: "#contacto" },
        { label: "Cómo llegar", href: contact.mapsUrl, external: true },
      ],
    },
  ];

  return (
    <footer className="relative bg-muva-dark text-muva-cream">
      <div className="container-muva py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <img
              src="/images/muva-logo-footer.png"
              alt="MUVA – Museo Viedma"
              className="h-16 w-auto md:h-20"
              width={800}
              height={319}
            />
            <div className="mt-4 font-sans text-[11px] uppercase tracking-extra-wide text-muva-sand/80">
              {tagline}
            </div>
            <p className="mt-8 max-w-sm text-muva-cream/60 text-pretty">
              Un espacio para el encuentro con nuestra historia, nuestro arte
              y nuestro legado. Paraguay · Guaraní – Jesuítico.
            </p>

            <div className="mt-10 flex items-center gap-3">
              {Object.entries(contact.social).map(([key, url]) => {
                if (!url) return null;
                const Icon = socialIcons[key];
                if (!Icon) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`MUVA en ${key}`}
                    className="flex h-10 w-10 items-center justify-center border border-muva-cream/20 text-muva-cream/80 transition-colors duration-300 hover:border-muva-cream hover:bg-muva-cream hover:text-muva-dark"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid gap-10 md:col-span-7 md:grid-cols-3 md:gap-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-sand/70">
                  {section.title}
                </div>
                <ul className="mt-5 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={"external" in link ? "_blank" : undefined}
                        rel={"external" in link ? "noopener noreferrer" : undefined}
                        onClick={(e) => {
                          if (!("external" in link)) {
                            e.preventDefault();
                            document
                              .querySelector(link.href)
                              ?.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                        className="font-serif text-lg text-muva-cream/85 transition-colors duration-300 hover:text-muva-sand"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-6 border-t border-muva-cream/10 pt-8 md:grid-cols-3">
          <div className="text-sm text-muva-cream/60">
            {contact.address}, {contact.city}
            <br />
            {contact.country}
          </div>
          <div className="text-sm text-muva-cream/60">
            <a
              href={`mailto:${contact.email}`}
              className="transition-colors duration-300 hover:text-muva-sand"
            >
              {contact.email}
            </a>
            <br />
            {contact.phoneDisplay}
          </div>
          <div className="text-sm text-muva-cream/60 md:text-right">
            © {year} MUVA – {fullName}
            <br />
            <span className="text-muva-cream/40">Todos los derechos reservados</span>
          </div>
        </div>
      </div>

      <div className="border-t border-muva-cream/10 bg-black/30">
        <div className="container-muva flex flex-col items-center justify-between gap-2 py-5 text-[10px] uppercase tracking-extra-wide text-muva-cream/40 md:flex-row">
          <span>{tagline}</span>
          <span>Experiencia cultural · San Ignacio Guazú, Paraguay</span>
        </div>
      </div>
    </footer>
  );
}
