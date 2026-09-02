import { Clock, MapPin, MessageCircle, Navigation2, Phone } from "lucide-react";
import { museum } from "../data/museum";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function Visit() {
  const titleReveal = useScrollReveal<HTMLDivElement>();

  const scrollToContact = () => {
    document.querySelector("#contacto")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="visita"
      className="relative overflow-hidden bg-muva-dark py-28 text-muva-cream md:py-40"
      aria-label="Planifica tu visita"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="container-muva">
        <div
          ref={titleReveal.ref}
          className={`reveal-on-scroll ${titleReveal.isVisible ? "is-visible" : ""} max-w-3xl`}
        >
          <div className="eyebrow !text-muva-sand">Visita</div>
          <h2 className="mt-6 font-serif font-light text-muva-cream text-display-xl text-balance">
            Planifica tu visita
          </h2>
          <p className="mt-8 max-w-2xl font-serif text-xl italic text-muva-cream/80 text-pretty">
            Te esperamos en San Ignacio Guazú, en el corazón de Misiones,
            Paraguay. Viví una experiencia cultural única en uno de los
            escenarios más bellos del país.
          </p>
        </div>

        <div className="mt-20 grid gap-10 md:grid-cols-2 md:gap-12">
          {/* Schedule */}
          <div className="border border-muva-cream/15 bg-muva-dark/40 p-8 backdrop-blur-sm md:p-10">
            <div className="flex items-center gap-3 text-muva-sand">
              <Clock size={18} strokeWidth={1.5} />
              <span className="font-sans text-[10px] uppercase tracking-extra-wide">
                Horarios
              </span>
            </div>
            <h3 className="mt-6 font-serif text-2xl text-muva-cream md:text-3xl">
              Atención al público
            </h3>
            <dl className="mt-8 space-y-5">
              {museum.schedule.map((s) => (
                <div
                  key={s.days}
                  className="flex items-baseline justify-between gap-4 border-b border-muva-cream/10 pb-4"
                >
                  <dt className="text-muva-cream/80">{s.days}</dt>
                  <dd
                    className={`font-serif text-lg ${
                      s.hours.includes("Cerrado")
                        ? "text-muva-stone/70"
                        : "text-muva-cream"
                    }`}
                  >
                    {s.hours}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Access */}
          <div className="border border-muva-cream/15 bg-muva-dark/40 p-8 backdrop-blur-sm md:p-10">
            <div className="flex items-center gap-3 text-muva-sand">
              <MapPin size={18} strokeWidth={1.5} />
              <span className="font-sans text-[10px] uppercase tracking-extra-wide">
                Ubicación
              </span>
            </div>
            <h3 className="mt-6 font-serif text-2xl text-muva-cream md:text-3xl">
              Cómo llegar
            </h3>
            <p className="mt-6 text-muva-cream/70 text-pretty">
              {museum.contact.address}
              <br />
              {museum.contact.city}
              <br />
              {museum.contact.country}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={museum.contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 border border-muva-cream/40 px-5 py-3 font-sans text-[11px] uppercase tracking-extra-wide text-muva-cream transition-colors duration-300 hover:border-muva-cream hover:bg-muva-cream/10"
              >
                <Navigation2 size={14} />
                Cómo llegar
              </a>
              <a
                href={`https://wa.me/${museum.contact.whatsapp}?text=${encodeURIComponent(
                  "Hola MUVA, quisiera consultar sobre entradas y horarios."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 bg-muva-sand px-5 py-3 font-sans text-[11px] uppercase tracking-extra-wide text-muva-dark transition-colors duration-300 hover:bg-muva-cream"
              >
                <MessageCircle size={14} />
                Consultar por WhatsApp
              </a>
            </div>
          </div>

          {/* Tickets – vehicle access */}
          <div className="border border-muva-cream/15 bg-muva-dark/40 p-8 backdrop-blur-sm md:p-10">
            <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-sand">
              Acceso vehicular
            </div>
            <h3 className="mt-3 font-serif text-2xl text-muva-cream md:text-3xl">
              Estacionamiento
            </h3>
            <ul className="mt-8 space-y-3">
              {museum.access.vehicles.map((v) => (
                <li
                  key={v.type}
                  className="flex items-baseline justify-between gap-4 border-b border-muva-cream/10 pb-3 text-sm"
                >
                  <span className="text-muva-cream/80">{v.type}</span>
                  <span className="font-serif text-base text-muva-cream">{v.price}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tickets – individuals & groups */}
          <div className="border border-muva-cream/15 bg-muva-dark/40 p-8 backdrop-blur-sm md:p-10">
            <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-sand">
              Entradas
            </div>
            <h3 className="mt-3 font-serif text-2xl text-muva-cream md:text-3xl">
              Individuales y grupos
            </h3>

            <div className="mt-8 space-y-6">
              <div>
                <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-sand/80">
                  Individuales
                </div>
                <ul className="mt-3 space-y-3">
                  {museum.access.individual.map((t) => (
                    <li key={t.type} className="border-b border-muva-cream/10 pb-3 text-sm">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-muva-cream/80">{t.type}</span>
                        <span className="font-serif text-base text-muva-cream whitespace-nowrap">
                          {t.price}
                        </span>
                      </div>
                      {t.note && (
                        <div className="mt-1 text-xs text-muva-cream/50">{t.note}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-sand/80">
                  Grupales
                </div>
                <ul className="mt-3 space-y-3">
                  {museum.access.groups.map((t) => (
                    <li key={t.type} className="border-b border-muva-cream/10 pb-3 text-sm">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-muva-cream/80">{t.type}</span>
                        <span className="font-serif text-base text-muva-cream whitespace-nowrap">
                          {t.price}
                        </span>
                      </div>
                      {t.note && (
                        <div className="mt-1 text-xs text-muva-cream/50">{t.note}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={scrollToContact}
              className="mt-8 inline-flex items-center gap-2 border-b border-muva-sand/60 pb-2 font-sans text-[11px] uppercase tracking-extra-wide text-muva-cream/90 transition-colors duration-300 hover:border-muva-cream"
            >
              <Phone size={14} />
              Reservar visita guiada
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
