import { ArrowRight, Box, ChevronDown } from "lucide-react";
import { museum } from "../data/museum";

export default function Hero() {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-muva-dark"
      aria-label="MUVA – Museo Viedma"
    >
      {/* Background image with subtle pattern fallback */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/hero/muva-hero.webp"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover animate-slow-zoom"
          loading="eager"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(26,20,16,0.55) 0%, rgba(26,20,16,0.85) 60%, rgba(26,20,16,0.95) 100%)",
          }}
        />
        {/* Decorative gradient fallback */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(135deg, #1a1410 0%, #2a1f15 35%, #3d2f22 70%, #1a1410 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* Decorative vertical lines */}
      <div className="absolute inset-y-0 left-6 hidden w-px bg-muva-cream/10 md:left-16 md:block" />
      <div className="absolute inset-y-0 right-6 hidden w-px bg-muva-cream/10 md:right-16 md:block" />

      {/* Top corner badge */}
      <div className="container-muva absolute inset-x-0 top-24 z-10 flex justify-between md:top-28">
        <div className="hidden text-muva-cream/60 md:block">
          <div className="text-[10px] font-sans uppercase tracking-extra-wide">
            San Ignacio Guazú
          </div>
          <div className="mt-1 text-[10px] font-sans uppercase tracking-extra-wide text-muva-cream/40">
            Misiones · Paraguay
          </div>
        </div>
        <div className="text-right text-muva-cream/60">
          <div className="text-[10px] font-sans uppercase tracking-extra-wide">
            Museo · {new Date().getFullYear()}
          </div>
          <div className="mt-1 text-[10px] font-sans uppercase tracking-extra-wide text-muva-cream/40">
            {museum.tagline}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container-muva relative z-10 pb-24 pt-40 md:pb-32 md:pt-48">
        <div className="max-w-5xl">
          <div className="flex items-center gap-3 text-muva-sand/80 animate-fade-down opacity-0" style={{ animationDelay: "100ms" }}>
            <span className="h-px w-12 bg-muva-sand/60" />
            <span className="font-sans text-[11px] uppercase tracking-extra-wide">
              {museum.tagline}
            </span>
          </div>

          <h1
            className="mt-8 font-serif font-light text-muva-cream text-display-2xl text-balance animate-fade-up opacity-0"
            style={{ animationDelay: "200ms" }}
          >
            MUVA
          </h1>

          <div
            className="mt-2 font-serif text-2xl font-light text-muva-cream/85 md:text-4xl lg:text-5xl animate-fade-up opacity-0"
            style={{ animationDelay: "350ms" }}
          >
            Museo Viedma
          </div>

          <p
            className="mt-10 max-w-2xl font-serif text-xl italic text-muva-cream/80 md:text-2xl lg:text-3xl text-pretty animate-fade-up opacity-0"
            style={{ animationDelay: "500ms" }}
          >
            &ldquo;Un espacio para encontrarnos con nuestra historia, nuestro arte y nuestro legado.&rdquo;
          </p>

          <div
            className="mt-12 flex flex-col gap-4 sm:flex-row animate-fade-up opacity-0"
            style={{ animationDelay: "700ms" }}
          >
            <button
              type="button"
              onClick={() => scrollTo("#museo")}
              className="group inline-flex items-center justify-center gap-3 bg-muva-cream px-8 py-4 font-sans text-[12px] uppercase tracking-extra-wide text-muva-dark transition-all duration-500 hover:bg-muva-sand"
            >
              Conocer el museo
              <ArrowRight
                size={16}
                className="transition-transform duration-500 group-hover:translate-x-1"
              />
            </button>
            <button
              type="button"
              onClick={() => scrollTo("#entorno-virtual")}
              className="group inline-flex items-center justify-center gap-3 border border-muva-cream/40 px-8 py-4 font-sans text-[12px] uppercase tracking-extra-wide text-muva-cream transition-all duration-500 hover:border-muva-cream hover:bg-muva-cream/10"
            >
              <Box size={16} />
              Explorar entorno virtual
            </button>
          </div>
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="relative z-10 border-t border-muva-cream/10 bg-muva-dark/40 backdrop-blur-sm">
        <div className="container-muva flex flex-col items-start justify-between gap-6 py-6 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-x-12 gap-y-3 text-muva-cream/70">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-muva-sand" />
              <span className="font-sans text-[11px] uppercase tracking-extra-wide">
                Abierto al público
              </span>
            </div>
            <div className="font-sans text-[11px] uppercase tracking-extra-wide">
              Mié a Vie · 9 a 17 hs
            </div>
            <div className="font-sans text-[11px] uppercase tracking-extra-wide">
              Sáb y Dom · 9 a 19 hs
            </div>
          </div>
          <button
            type="button"
            onClick={() => scrollTo("#historia")}
            className="group flex items-center gap-2 font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream/60 transition-colors duration-300 hover:text-muva-cream"
            aria-label="Descender a la siguiente sección"
          >
            Descubrir
            <ChevronDown
              size={14}
              className="transition-transform duration-500 group-hover:translate-y-1"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
