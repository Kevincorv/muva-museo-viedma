import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { museum } from "../data/museum";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function Contact() {
  const titleReveal = useScrollReveal<HTMLDivElement>();

  return (
    <section
      id="contacto"
      className="relative bg-muva-beige py-28 md:py-40"
      aria-label="Contacto"
    >
      <div className="container-muva">
        <div
          ref={titleReveal.ref}
          className={`reveal-on-scroll ${titleReveal.isVisible ? "is-visible" : ""} grid gap-16 md:grid-cols-2`}
        >
          <div>
            <div className="eyebrow">Contacto</div>
            <h2 className="mt-6 font-serif font-light text-muva-dark text-display-lg text-balance">
              Estamos para acompañarte
            </h2>
            <p className="mt-8 max-w-md text-muva-brown text-pretty">
              Escribinos para consultas sobre visitas, reservas, exposiciones,
              educación o prensa. Te responderemos a la brevedad.
            </p>

            <ul className="mt-12 space-y-6">
              <li className="flex items-start gap-4">
                <Phone size={20} className="mt-0.5 text-muva-earth" strokeWidth={1.5} />
                <div>
                  <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
                    Teléfono
                  </div>
                  <a
                    href={`tel:${museum.contact.phone}`}
                    className="mt-1 font-serif text-xl text-muva-dark transition-colors duration-300 hover:text-muva-earth"
                  >
                    {museum.contact.phoneDisplay}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <MessageCircle size={20} className="mt-0.5 text-muva-earth" strokeWidth={1.5} />
                <div>
                  <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
                    WhatsApp
                  </div>
                  <a
                    href={`https://wa.me/${museum.contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 font-serif text-xl text-muva-dark transition-colors duration-300 hover:text-muva-earth"
                  >
                    {museum.contact.whatsappDisplay}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Mail size={20} className="mt-0.5 text-muva-earth" strokeWidth={1.5} />
                <div>
                  <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
                    Email
                  </div>
                  <a
                    href={`mailto:${museum.contact.email}`}
                    className="mt-1 font-serif text-xl text-muva-dark transition-colors duration-300 hover:text-muva-earth"
                  >
                    {museum.contact.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <MapPin size={20} className="mt-0.5 text-muva-earth" strokeWidth={1.5} />
                <div>
                  <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
                    Dirección
                  </div>
                  <p className="mt-1 font-serif text-xl text-muva-dark">
                    {museum.contact.address}
                    <br />
                    {museum.contact.city}
                    <br />
                    {museum.contact.country}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Map / visual */}
          <div className="relative aspect-[4/5] overflow-hidden border border-muva-sand/40 bg-muva-cream md:aspect-auto md:min-h-[600px]">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #e8dcc4 0%, #c9b89a 50%, #8a7560 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }}
            />
            {/* Schematic map */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-2/3 w-2/3">
                <div className="absolute left-1/2 top-0 h-1/3 w-1/2 -translate-x-1/2 border border-muva-brown/30" />
                <div className="absolute left-0 top-1/2 h-1/2 w-1/3 border border-muva-brown/30" />
                <div className="absolute right-0 top-1/2 h-1/2 w-1/3 border border-muva-brown/30" />
                <div className="absolute left-1/2 top-1/2 h-px w-1/2 -translate-x-1/2 bg-muva-brown/30" />
                <div className="absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 -translate-y-1/2 bg-muva-brown/30" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muva-earth ring-4 ring-muva-earth/30" />
                    <div className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap bg-muva-dark px-3 py-1.5 font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream">
                      MUVA · San Ignacio
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <a
              href={museum.contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-6 right-6 inline-flex items-center gap-2 bg-muva-dark px-5 py-3 font-sans text-[11px] uppercase tracking-extra-wide text-muva-cream transition-colors duration-300 hover:bg-muva-brown"
            >
              Abrir en Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
