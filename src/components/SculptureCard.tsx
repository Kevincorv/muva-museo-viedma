import { ArrowUpRight } from "lucide-react";
import type { Sculpture } from "../data/sculptures";

interface SculptureCardProps {
  sculpture: Sculpture;
  index: number;
  onOpen: (id: string) => void;
}

export default function SculptureCard({ sculpture, index, onOpen }: SculptureCardProps) {
  return (
    <article
      className="group relative flex flex-col"
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

        <div className="absolute right-4 top-4 bg-muva-dark/80 px-3 py-1.5 font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream backdrop-blur-sm">
          3D disponible
        </div>

        <button
          type="button"
          onClick={() => onOpen(sculpture.id)}
          className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 bg-muva-cream/95 px-5 py-3 font-sans text-[11px] uppercase tracking-extra-wide text-muva-dark opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:opacity-100 hover:bg-muva-cream"
          aria-label={`Explorar ${sculpture.title} en 3D`}
        >
          Explorar en 3D
          <ArrowUpRight size={14} />
        </button>
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
