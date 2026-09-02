import { ArrowUpRight } from "lucide-react";
import { sculptures } from "../data/sculptures";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function Collection() {
  const titleReveal = useScrollReveal<HTMLDivElement>();
  const featured = sculptures.slice(0, 4);

  const openViewer = (id: string) => {
    window.dispatchEvent(new CustomEvent("muva:open-sculpture", { detail: { id } }));
  };

  return (
    <section
      id="coleccion"
      className="relative bg-muva-ivory py-28 md:py-40"
      aria-label="Colección Viedma Paoli"
    >
      <div className="container-muva">
        <div
          ref={titleReveal.ref}
          className={`reveal-on-scroll ${titleReveal.isVisible ? "is-visible" : ""} flex flex-col items-start justify-between gap-10 md:flex-row md:items-end`}
        >
          <div className="max-w-2xl">
            <div className="eyebrow">Colección</div>
            <h2 className="mt-6 font-serif font-light text-muva-dark text-display-lg text-balance">
              Colección Viedma Paoli
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

        <div className="mt-20 space-y-24 md:space-y-32">
          {featured.map((sculpture, i) => (
            <CollectionRow
              key={sculpture.id}
              sculpture={sculpture}
              index={i}
              onOpen={openViewer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CollectionRow({
  sculpture,
  index,
  onOpen,
}: {
  sculpture: (typeof sculptures)[number];
  index: number;
  onOpen: (id: string) => void;
}) {
  const reveal = useScrollReveal<HTMLDivElement>();
  const reverse = index % 2 === 1;

  return (
    <article
      ref={reveal.ref}
      className={`reveal-on-scroll ${reveal.isVisible ? "is-visible" : ""} grid gap-10 md:grid-cols-12 md:gap-16 ${
        reverse ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div className="md:col-span-7">
        <div className="group relative aspect-[4/5] overflow-hidden bg-muva-beige md:aspect-[5/4]">
          <img
            src={sculpture.thumbnail}
            alt={sculpture.title}
            className="h-full w-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement;
              t.style.display = "none";
            }}
          />
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(135deg, #e8dcc4 0%, #c9b89a 50%, #6b4f35 100%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-muva-dark/40 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

          <div className="absolute right-4 top-4 bg-muva-ivory/95 px-3 py-1.5 font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
            {sculpture.inventoryNumber}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center md:col-span-5">
        <div className="font-sans text-[11px] uppercase tracking-extra-wide text-muva-earth">
          Pieza · {String(index + 1).padStart(2, "0")}
        </div>
        <h3 className="mt-4 font-serif text-4xl font-light text-muva-dark md:text-5xl">
          {sculpture.title}
        </h3>
        <div className="mt-3 font-serif text-lg italic text-muva-brown">
          {sculpture.artist}
          {sculpture.year && <span className="not-italic text-muva-stone"> · {sculpture.year}</span>}
        </div>
        <p className="mt-6 text-muva-brown text-pretty">{sculpture.description}</p>

        <dl className="mt-8 grid grid-cols-2 gap-y-3 border-t border-muva-sand/50 pt-6 text-sm">
          {sculpture.material && (
            <>
              <dt className="font-sans text-[11px] uppercase tracking-extra-wide text-muva-earth">
                Material
              </dt>
              <dd className="text-muva-dark">{sculpture.material}</dd>
            </>
          )}
          {sculpture.dimensions && (
            <>
              <dt className="font-sans text-[11px] uppercase tracking-extra-wide text-muva-earth">
                Dimensiones
              </dt>
              <dd className="text-muva-dark">{sculpture.dimensions}</dd>
            </>
          )}
        </dl>

        <button
          type="button"
          onClick={() => onOpen(sculpture.id)}
          className="group mt-10 inline-flex items-center gap-3 self-start font-sans text-[12px] uppercase tracking-extra-wide text-muva-dark transition-colors duration-300 hover:text-muva-earth"
        >
          Explorar en 3D
          <ArrowUpRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
      </div>
    </article>
  );
}
