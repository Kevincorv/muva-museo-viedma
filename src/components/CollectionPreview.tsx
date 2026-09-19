import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { sculptures } from "../data/sculptures";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function CollectionPreview() {
  const titleReveal = useScrollReveal<HTMLDivElement>();
  const featured = sculptures.slice(0, 3);

  return (
    <section
      id="coleccion"
      className="relative bg-muva-ivory py-28 md:py-40"
      aria-label="Colección"
    >
      <div className="container-muva">
        <div
          ref={titleReveal.ref}
          className={`reveal-on-scroll ${titleReveal.isVisible ? "is-visible" : ""} flex flex-col items-start justify-between gap-10 md:flex-row md:items-end`}
        >
          <div className="max-w-2xl">
            <div className="eyebrow">Colección</div>
            <h2 className="mt-6 font-serif font-light text-muva-dark text-display-lg text-balance">
              Colección Viedma
            </h2>
            <p className="mt-8 font-serif text-xl italic text-muva-brown text-pretty">
              Una selección curada de la obra de Manuel Viedma, presentada como
              una exposición digital. Cada pieza dialoga con la historia, la
              espiritualidad y la naturaleza que la inspiraron.
            </p>
          </div>
          <div className="hidden text-right md:block">
            <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
              Piezas destacadas
            </div>
            <div className="mt-1 font-serif text-5xl text-muva-dark">
              {String(featured.length).padStart(2, "0")}
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 md:mt-24 md:gap-10">
          {featured.map((sculpture, i) => (
            <PreviewCard
              key={sculpture.id}
              sculpture={sculpture}
              index={i}
            />
          ))}
        </div>

        <div className="mt-16 flex justify-center md:mt-20">
          <Link
            to="/colección"
            className="group inline-flex items-center gap-3 border border-muva-dark px-8 py-4 font-sans text-[12px] uppercase tracking-extra-wide text-muva-dark transition-all duration-500 hover:bg-muva-dark hover:text-muva-cream"
          >
            Ver colección completa
            <ArrowRight
              size={16}
              className="transition-transform duration-500 group-hover:translate-x-1"
            />
          </Link>        </div>
      </div>
    </section>
  );
}

function PreviewCard({
  sculpture,
  index,
}: {
  sculpture: (typeof sculptures)[number];
  index: number;
}) {
  const reveal = useScrollReveal<HTMLDivElement>();

  return (
    <article
      ref={reveal.ref}
      className={`reveal-on-scroll ${reveal.isVisible ? "is-visible" : ""} group relative flex flex-col`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muva-sand">
        <img
          src={sculpture.thumbnail}
          alt={sculpture.title}
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
              "linear-gradient(150deg, #c9b89a 0%, #8a7560 50%, #3d2f22 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-muva-dark/60 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <div className="absolute left-4 top-4 bg-muva-ivory/95 px-3 py-1.5 font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
          {sculpture.inventoryNumber ?? "MUVA"}
        </div>
      </div>

      <div className="mt-6 flex flex-col">
        <h3 className="font-serif text-2xl text-muva-dark transition-colors duration-300 group-hover:text-muva-earth">
          {sculpture.title}
        </h3>
        <div className="mt-2 font-serif text-base italic text-muva-brown">
          {sculpture.artist}
          {sculpture.year && (
            <span className="not-italic text-muva-stone"> · {sculpture.year}</span>
          )}
        </div>
        {sculpture.material && (
          <div className="mt-3 font-sans text-[11px] uppercase tracking-extra-wide text-muva-stone">
            {sculpture.material}
            {sculpture.dimensions && <span> · {sculpture.dimensions}</span>}
          </div>
        )}
      </div>
    </article>
  );
}
