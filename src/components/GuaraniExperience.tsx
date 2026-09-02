import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function GuaraniExperience() {
  const titleReveal = useScrollReveal<HTMLDivElement>();
  const galleryReveal = useScrollReveal<HTMLDivElement>();

  return (
    <section
      id="experiencia"
      className="relative overflow-hidden bg-muva-dark py-28 text-muva-cream md:py-40"
      aria-label="Experiencia Guaraní – Jesuítica"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="container-muva">
        <div
          ref={titleReveal.ref}
          className={`reveal-on-scroll ${titleReveal.isVisible ? "is-visible" : ""} grid gap-12 md:grid-cols-12`}
        >
          <div className="md:col-span-5">
            <div className="eyebrow !text-muva-sand">Experiencia</div>
            <h2 className="mt-6 font-serif font-light text-muva-cream text-display-lg text-balance">
              Una historia que sigue viva
            </h2>
            <div className="mt-8 h-px w-24 bg-muva-sand/60" />
          </div>

          <div className="md:col-span-7 md:pl-8">
            <p className="font-serif text-2xl leading-relaxed text-muva-cream/90 text-pretty md:text-3xl">
              El museo propone una mirada artística, histórica y contemporánea
              sobre el encuentro guaraní–jesuítico: un cruce de mundos que
              transformó la espiritualidad, el arte y la vida cotidiana de
              nuestra tierra.
            </p>
            <p className="mt-8 max-w-xl text-muva-cream/70 text-pretty">
              Recorré los murales, los jardines y las salas que dan vida a este
              legado. Cada espacio ha sido pensado como una pausa, un
              encuentro, una contemplación.
            </p>
            <a
              href="#visita"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#visita")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group mt-10 inline-flex items-center gap-3 border-b border-muva-sand/60 pb-2 font-sans text-[12px] uppercase tracking-extra-wide text-muva-cream transition-colors duration-300 hover:border-muva-cream"
            >
              Descubrir la experiencia
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>

        <div
          ref={galleryReveal.ref}
          className={`reveal-on-scroll ${galleryReveal.isVisible ? "is-visible" : ""} mt-20 grid gap-4 md:mt-28 md:grid-cols-12 md:gap-6`}
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-muva-brown md:col-span-4 md:aspect-[3/5]">
            <img
              src="/images/experience/mural.webp"
              alt="Mural guaraní – jesuítico del recorrido interior"
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "linear-gradient(160deg, #3d2f22 0%, #6b4f35 60%, #8a7560 100%)",
              }}
            />
            <div className="absolute bottom-4 left-4 font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream/80">
              Murales · Recorrido interior
            </div>
          </div>

          <div className="grid gap-4 md:col-span-8 md:grid-cols-2 md:gap-6">
            <div className="relative aspect-[4/3] overflow-hidden bg-muva-brown md:aspect-auto md:h-full">
              <img
                src="/images/experience/jardin.webp"
                alt="Jardines del museo"
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div
                className="absolute inset-0 -z-10"
                style={{
                  background:
                    "linear-gradient(135deg, #4a5d3a 0%, #6b7048 60%, #8a7560 100%)",
                }}
              />
              <div className="absolute bottom-4 left-4 font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream/80">
                Jardines · Naturaleza
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden bg-muva-brown md:aspect-auto md:h-full">
              <img
                src="/images/experience/escultura.webp"
                alt="Escultura del recorrido"
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div
                className="absolute inset-0 -z-10"
                style={{
                  background:
                  "linear-gradient(135deg, #1a1410 0%, #3d2f22 60%, #6b4f35 100%)",
                }}
              />
              <div className="absolute bottom-4 left-4 font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream/80">
                Esculturas · Obra de Viedma
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden bg-muva-brown md:col-span-2 md:aspect-[16/6]">
              <img
                src="/images/experience/arquitectura.webp"
                alt="Arquitectura del museo"
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div
                className="absolute inset-0 -z-10"
                style={{
                  background:
                    "linear-gradient(135deg, #8a7560 0%, #c9b89a 60%, #e8dcc4 100%)",
                }}
              />
              <div className="absolute bottom-4 left-4 font-sans text-[10px] uppercase tracking-extra-wide text-muva-dark/80">
                Arquitectura · Espacios
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
