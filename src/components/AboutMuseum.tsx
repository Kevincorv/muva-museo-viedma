import { useScrollReveal } from "../hooks/useScrollReveal";
import { museum } from "../data/museum";

export default function AboutMuseum() {
  const textReveal = useScrollReveal<HTMLDivElement>();
  const imgReveal = useScrollReveal<HTMLDivElement>();

  return (
    <section
      id="museo"
      className="relative overflow-hidden bg-muva-ivory py-28 md:py-40"
      aria-label="El Museo"
    >
      <div className="container-muva">
        <div className="grid gap-16 md:gap-24 lg:grid-cols-12">
          {/* Image column */}
          <div
            ref={imgReveal.ref}
            className={`reveal-on-scroll ${imgReveal.isVisible ? "is-visible" : ""} relative lg:col-span-5`}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-muva-beige">
              <img
                src="/images/museum/interior.webp"
                alt="Interior del MUVA – Museo Viedma"
                className="h-full w-full object-cover"
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
                    "linear-gradient(160deg, #e8dcc4 0%, #c9b89a 50%, #8a7560 100%)",
                }}
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden h-24 w-24 border border-muva-earth/40 md:block" />
            <div className="absolute -left-6 -top-6 hidden h-24 w-24 border border-muva-earth/40 md:block" />

            <div className="absolute -bottom-10 left-0 hidden bg-muva-dark px-6 py-4 text-muva-cream md:block">
              <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-sand/70">
                Fundación
              </div>
              <div className="mt-1 font-serif text-2xl">{museum.founded}</div>
            </div>
          </div>

          {/* Text column */}
          <div
            ref={textReveal.ref}
            className={`reveal-on-scroll ${textReveal.isVisible ? "is-visible" : ""} lg:col-span-7 lg:pl-8`}
            style={{ transitionDelay: "150ms" }}
          >
            <div className="eyebrow">El Museo</div>
            <h2 className="mt-6 font-serif font-light text-muva-dark text-display-lg text-balance">
              Un espacio para el encuentro
            </h2>
            <div className="mt-10 space-y-6 text-base leading-relaxed text-muva-brown md:text-lg">
              <p className="first-letter:font-serif first-letter:text-5xl first-letter:font-light first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-muva-earth first-letter:leading-none">
                {museum.mission}
              </p>
              <p>
                Investigamos, conservamos, interpretamos y exhibimos patrimonio
                cultural con foco en el legado guaraní–jesuita. Un museo que
                invita al silencio, a la contemplación y al encuentro profundo
                con la historia del Paraguay.
              </p>
              <p>
                Les invitamos a recorrer nuestras salas con programación de
                exposiciones permanentes — la obra legado del artista Manuel
                Viedma — y temporales. La biblioteca, auditorio, tienda y café,
                así como el recorrido por los jardines, han sido diseñados
                especialmente para que cada visitante viva una experiencia
                única y transformadora.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap gap-x-12 gap-y-6 border-t border-muva-sand/40 pt-10">
              <div>
                <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
                  Investigación
                </div>
                <div className="mt-2 font-serif text-2xl text-muva-dark">Patrimonio</div>
              </div>
              <div>
                <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
                  Conservación
                </div>
                <div className="mt-2 font-serif text-2xl text-muva-dark">Memoria</div>
              </div>
              <div>
                <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
                  Exhibición
                </div>
                <div className="mt-2 font-serif text-2xl text-muva-dark">Encuentro</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
