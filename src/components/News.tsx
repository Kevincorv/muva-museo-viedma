import { ArrowUpRight } from "lucide-react";
import { news } from "../data/news";
import type { NewsItem } from "../data/news";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function News() {
  const titleReveal = useScrollReveal<HTMLDivElement>();

  return (
    <section className="relative bg-muva-cream py-28 md:py-40" aria-label="Noticias y agenda">
      <div className="container-muva">
        <div
          ref={titleReveal.ref}
          className={`reveal-on-scroll ${titleReveal.isVisible ? "is-visible" : ""} flex flex-col items-start justify-between gap-8 md:flex-row md:items-end`}
        >
          <div className="max-w-2xl">
            <div className="eyebrow">Actualidad</div>
            <h2 className="mt-6 font-serif font-light text-muva-dark text-display-lg text-balance">
              Noticias y agenda
            </h2>
          </div>
          <a
            href="#"
            className="group inline-flex items-center gap-2 font-sans text-[12px] uppercase tracking-extra-wide text-muva-dark transition-colors duration-300 hover:text-muva-earth"
          >
            Ver agenda completa
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>

        <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {news.slice(0, 3).map((item, i) => (
            <NewsCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const reveal = useScrollReveal<HTMLDivElement>();
  return (
    <article
      ref={reveal.ref}
      className={`reveal-on-scroll ${reveal.isVisible ? "is-visible" : ""} group flex flex-col`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <a href={item.href} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muva-beige">
          <img
            src={item.image}
            alt={item.title}
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
                "linear-gradient(135deg, #e8dcc4 0%, #c9b89a 50%, #6b4f35 100%)",
            }}
          />
        </div>
        <div className="mt-6 flex items-center gap-3 font-sans text-[10px] uppercase tracking-extra-wide">
          <span className="text-muva-earth">{item.category}</span>
          <span className="h-1 w-1 rounded-full bg-muva-stone" />
          <span className="text-muva-stone">{item.date}</span>
        </div>
        <h3 className="mt-3 font-serif text-2xl font-light text-muva-dark transition-colors duration-300 group-hover:text-muva-earth md:text-3xl">
          {item.title}
        </h3>
        <p className="mt-3 text-muva-brown text-pretty">{item.excerpt}</p>
        <div className="mt-5 inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-extra-wide text-muva-dark">
          Leer más
          <ArrowUpRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </a>
    </article>
  );
}
