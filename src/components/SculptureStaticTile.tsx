import { Box, ExternalLink } from "lucide-react";
import type { Sculpture } from "../data/sculptures";
import { useLanguage } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";
import { openSculptureViewer } from "../lib/viewer";

export default function SculptureStaticTile({
  sculpture,
  compact = false,
  showCta = true,
  reason,
}: {
  sculpture: Sculpture;
  compact?: boolean;
  showCta?: boolean;
  reason?: "error" | "static";
}) {
  const { locale } = useLanguage();

  return (
    <div
      className={`relative w-full overflow-hidden bg-muva-dark ${
        compact ? "aspect-square" : "aspect-[4/5] md:aspect-[3/4]"
      }`}
    >
      <img
        src={sculpture.thumbnail}
        alt={sculpture.getTitle(locale)}
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(150deg, rgba(201,184,154,0.3) 0%, rgba(42,32,24,0.92) 100%)",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center">
        <Box
          size={26}
          className="text-muva-sand/80"
          strokeWidth={1.3}
          aria-hidden="true"
        />
        <p className="mt-3 font-serif text-lg text-muva-cream md:text-xl">
          {sculpture.getTitle(locale)}
        </p>
        {reason === "error" && (
          <p className="mt-2 font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream/60">
            {t("collection3d.noDisponible", locale)}
          </p>
        )}
        {showCta && (
          <button
            type="button"
            onClick={() => openSculptureViewer(sculpture.id)}
            className="mt-5 inline-flex items-center gap-2 border border-muva-cream/40 bg-muva-dark/50 px-5 py-2.5 font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream hover:bg-muva-cream hover:text-muva-dark"
          >
            <ExternalLink size={13} aria-hidden="true" />
            {t("collection3d.ver3d", locale)}
          </button>
        )}
      </div>
    </div>
  );
}
