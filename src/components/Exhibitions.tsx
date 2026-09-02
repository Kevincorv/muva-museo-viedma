import { ArrowUpRight } from "lucide-react";
import { exhibitions } from "../data/exhibitions";
import type { Exhibition } from "../data/exhibitions";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function Exhibitions() {
  const titleReveal = useScrollReveal<HTMLDivElement>();
  const permanent = exhibitions.filter((e) => e.type === "permanent");
  const temporary = exhibitions.filter((e) => e.type === "temporary");

  return (
    <section
      id="exposiciones"
      className="relative bg-muva-ivory py-28 md:py-40"
      aria-label="Exposiciones"
    >
      <div className="container-muva">
        <div
          ref={titleReveal.ref}
          className={`reveal-on-scroll ${titleReveal.isVisible ? "is-visible" : ""} max-w-3xl`}
        >
          <div className="eyebrow">Exposiciones</div>
          <h2 className="mt-6 font-serif font-light text-muva-dark text-display-lg text-balance">
            Salas que dialogan con el tiempo
          </h2>
          <p className="mt-8 font-serif text-xl italic text-muva-brown text-pretty">
            Una programación que combina la obra legado de Manuel Viedma con
            muestras temporales dedicadas a la espiritualidad, la memoria y el
            arte contemporáneo del Paraguay.
          </p>
        </div>

        {/* Permanent */}
        <div className="mt-20">
          <div className="mb-10 flex items-end justify-between border-b border-muva-sand/40 pb-4">
            <h3 className="font-serif text-2xl text-muva-dark md:text-3xl">
              Exposición permanente
            </h3>
            <span className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
              {String(permanent.length).padStart(2, "0")} Salas
            </span>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            {permanent.map((ex, i) => (
              <ExhibitionCard key={ex.id} exhibition={ex} index={i} />
            ))}
          </div>
        </div>

        {/* Temporary */}
        <div className="mt-24">
          <div className="mb-10 flex items-end justify-between border-b border-muva-sand/40 pb-4">
            <h3 className="font-serif text-2xl text-muva-dark md:text-3xl">
              Muestras temporales
            </h3>
            <span className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
              {String(temporary.length).padStart(2, "0")} En cartelera
            </span>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            {temporary.map((ex, i) => (
              <ExhibitionCard key={ex.id} exhibition={ex} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExhibitionCard({ exhibition, index }: { exhibition: Exhibition; index: number }) {
  const reveal = useScrollReveal<HTMLDivElement>();
  return (
    <article
      ref={reveal.ref}
      className={`reveal-on-scroll ${reveal.isVisible ? "is-visible" : ""} group flex flex-col`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-muva-beige">
        <img
          src={exhibition.image}
          alt={exhibition.title}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(135deg, #e8dcc4 0%, #8a7560 60%, #3d2f22 100%)",
          }}
        />
        <div className="absolute left-4 top-4 bg-muva-ivory/95 px-3 py-1.5 font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth backdrop-blur-sm">
          {exhibition.type === "permanent" ? "Permanente" : "Temporal"}
        </div>
      </div>
      <div className="mt-6 flex flex-col">
        {exhibition.subtitle && (
          <div className="font-sans text-[11px] uppercase tracking-extra-wide text-muva-earth">
            {exhibition.subtitle}
          </div>
        )}
        <h4 className="mt-3 font-serif text-3xl font-light text-muva-dark md:text-4xl">
          {exhibition.title}
        </h4>
        <p className="mt-4 text-muva-brown text-pretty">{exhibition.description}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-muva-sand/40 pt-4 text-sm text-muva-stone">
          {exhibition.location && <span>{exhibition.location}</span>}
          {exhibition.startDate && exhibition.endDate && (
            <span>
              {exhibition.startDate} – {exhibition.endDate}
            </span>
          )}
        </div>
        {exhibition.cta && (
          <a
            href={exhibition.href ?? "#"}
            className="group/btn mt-6 inline-flex items-center gap-2 self-start font-sans text-[12px] uppercase tracking-extra-wide text-muva-dark transition-colors duration-300 hover:text-muva-earth"
          >
            {exhibition.cta}
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
            />
          </a>
        )}
      </div>
    </article>
  );
}
