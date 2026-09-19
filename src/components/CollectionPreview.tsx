import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { sculptures } from "../data/sculptures";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";
import { SculptureCanvas, ThumbnailFallback } from "./Collection3D";

export default function CollectionPreview() {
  const titleReveal = useScrollReveal<HTMLDivElement>();
  const featured = sculptures.slice(0, 3);
  const { locale } = useLanguage();

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
            <div className="eyebrow">{t("collection.eyebrow", locale)}</div>
            <h2 className="mt-6 font-serif font-light text-muva-dark text-display-lg text-balance">
              {t("collection.heading", locale)}
            </h2>
            <p className="mt-8 font-serif text-xl italic text-muva-brown text-pretty">
              {t("collection.description", locale)}
            </p>
          </div>
          <div className="hidden text-right md:block">
            <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
              {t("collection.destacadas", locale)}
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
            {t("collection.verCompleta", locale)}
            <ArrowRight
              size={16}
              className="transition-transform duration-500 group-hover:translate-x-1"
            />
          </Link>
        </div>
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
  const [modelError, setModelError] = useState(false);
  const { locale } = useLanguage();

  return (
    <article
      ref={reveal.ref}
      className={`reveal-on-scroll ${reveal.isVisible ? "is-visible" : ""} group relative flex flex-col`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="relative overflow-hidden">
        {!modelError ? (
          <SculptureCanvas
            modelUrl={sculpture.model}
            onError={() => setModelError(true)}
            compact
          />
        ) : (
          <ThumbnailFallback sculpture={sculpture} compact />
        )}
        <div className="absolute left-4 top-4 z-10 bg-muva-ivory/95 px-3 py-1.5 font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
          {sculpture.inventoryNumber ?? "MUVA"}
        </div>
      </div>

      <div className="mt-6 flex flex-col">
        <h3 className="font-serif text-2xl text-muva-dark transition-colors duration-300 group-hover:text-muva-earth">
          {sculpture.getTitle(locale)}
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
