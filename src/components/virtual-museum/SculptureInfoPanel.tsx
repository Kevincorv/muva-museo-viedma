import { useEffect, useMemo, useState } from "react";
import { Box, ImageIcon, Info, Languages, X } from "lucide-react";
import {
  museumArtist,
  museumAudio,
  museumDescription,
  museumDimensions,
  museumHistoricalContext,
  museumIconografia,
  museumInventory,
  museumMaterial,
  museumSubtitle,
  museumThumbnail,
  museumTitle,
  type MuseumSculpture,
} from "../../data/sculptures";
import { useLanguage } from "../../i18n/LanguageContext";
import { roomById } from "../../data/museumLayout";
import AudioPlayer from "../AudioPlayer";
import { useVmText } from "./texts";

function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function MetaRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="border-t border-muva-sand/40 py-3">
      <dt className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-muva-dark">{value}</dd>
    </div>
  );
}

/**
 * Ficha lateral de la obra seleccionada.
 * En móvil entra como hoja inferior; en escritorio como panel lateral,
 * para no tapar por completo el recorrido.
 */
export default function SculptureInfoPanel({
  sculpture,
  closing,
  onClose,
  onView360,
}: {
  sculpture: MuseumSculpture;
  closing: boolean;
  onClose: () => void;
  onView360: () => void;
}) {
  const { locale } = useLanguage();
  const t = useVmText();
  const [shown, setShown] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const title = museumTitle(sculpture, locale);
  const artist = museumArtist(sculpture);
  const room = roomById(sculpture.room);
  const roomName = room ? t(room.nameKey) : undefined;
  const subtitle = museumSubtitle(sculpture, locale);
  const thumbnail = museumThumbnail(sculpture);
  const audio = museumAudio(sculpture, locale);
  const description = museumDescription(sculpture, locale);
  const iconografia = museumIconografia(sculpture, locale);
  const context = museumHistoricalContext(sculpture, locale);

  const descriptionParagraphs = useMemo(
    () => (description ? toParagraphs(description) : []),
    [description]
  );
  const iconografiaParagraphs = useMemo(
    () => (iconografia ? toParagraphs(iconografia) : []),
    [iconografia]
  );

  const visible = shown && !closing;

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label={`${t("panel.ariaLabel")} – ${title}`}
      className={`pointer-events-auto absolute inset-x-0 bottom-0 z-40 flex max-h-[76vh] flex-col bg-muva-cream shadow-[0_-12px_40px_rgba(26,20,16,0.25)] transition-transform duration-[380ms] ease-out md:inset-y-0 md:left-auto md:right-0 md:top-0 md:h-full md:max-h-none md:w-[min(92vw,440px)] md:shadow-[-12px_0_40px_rgba(26,20,16,0.25)] ${
        visible
          ? "translate-y-0 md:translate-x-0"
          : "translate-y-full md:translate-y-0 md:translate-x-full"
      }`}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-muva-sand/50 px-5 py-4 md:px-7">
        <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
          {t("panel.work")}
          {roomName && <> · {roomName}</>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("panel.close")}
          className="flex h-9 w-9 items-center justify-center border border-muva-dark/15 text-muva-dark transition-colors duration-300 hover:border-muva-dark hover:bg-muva-dark hover:text-muva-cream"
        >
          <X size={16} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-5 md:px-7">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muva-beige">
          {thumbnail && !imageError ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-muva-sand via-muva-stone to-muva-brown">
              <ImageIcon size={30} strokeWidth={1.2} className="text-muva-cream" />
              <span className="px-6 text-center font-serif text-lg text-muva-cream">
                {title}
              </span>
              <span className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream/70">
                {t("panel.noImage")}
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-muva-dark/10" />
        </div>

        <div className="mt-6">
          <h2 className="font-serif text-3xl font-light leading-tight text-muva-dark">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 font-serif text-lg italic text-muva-brown">
              {subtitle}
            </p>
          )}
          {(artist || sculpture.year) && (
            <p className="mt-1 font-sans text-[11px] uppercase tracking-extra-wide text-muva-stone">
              {[artist, sculpture.year].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        <dl className="mt-6">
          <MetaRow label={t("panel.material")} value={museumMaterial(sculpture, locale)} />
          <MetaRow label={t("panel.dimensions")} value={museumDimensions(sculpture, locale)} />
          <MetaRow label={t("panel.inventory")} value={museumInventory(sculpture)} />
          <MetaRow label={t("panel.year")} value={sculpture.year} />
        </dl>

        {descriptionParagraphs.length > 0 && (
          <section className="mt-6">
            <h3 className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
              {t("panel.description")}
            </h3>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muva-brown">
              {descriptionParagraphs.map((paragraph, index) => (
                <p key={index} className="text-pretty">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        )}

        {iconografiaParagraphs.length > 0 && (
          <section className="mt-6">
            <h3 className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
              <Info size={12} />
              {t("panel.iconografia")}
            </h3>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muva-brown">
              {iconografiaParagraphs.map((paragraph, index) => (
                <p key={index} className="text-pretty">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        )}

        {context && (
          <section className="mt-6">
            <h3 className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
              <Languages size={12} />
              {t("panel.context")}
            </h3>
            <p className="mt-3 text-sm italic leading-relaxed text-pretty text-muva-stone">
              {context}
            </p>
          </section>
        )}

        {audio && (
          <section className="mt-6">
            <h3 className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
              {t("panel.audio")}
            </h3>
            <div className="mt-3">
              <AudioPlayer src={audio} />
            </div>
          </section>
        )}
      </div>

      <div className="shrink-0 grid grid-cols-2 gap-3 border-t border-muva-sand/50 bg-muva-cream px-5 py-4 md:px-7">
        <button
          type="button"
          onClick={onView360}
          className="inline-flex items-center justify-center gap-2 border border-muva-dark/30 px-4 py-3 font-sans text-[11px] uppercase tracking-extra-wide text-muva-dark transition-all duration-300 hover:border-muva-dark hover:bg-muva-dark hover:text-muva-cream"
        >
          <Box size={14} />
          {t("panel.view360")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 bg-muva-dark px-4 py-3 font-sans text-[11px] uppercase tracking-extra-wide text-muva-cream transition-all duration-300 hover:bg-muva-brown"
        >
          {t("panel.close")}
        </button>
      </div>
    </aside>
  );
}
