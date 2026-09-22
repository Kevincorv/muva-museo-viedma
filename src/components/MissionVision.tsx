import { useScrollReveal } from "../hooks/useScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";

export default function MissionVision() {
  const reveal = useScrollReveal<HTMLDivElement>();
  const { locale } = useLanguage();

  return (
    <section
      id="mision-vision"
      className="relative overflow-hidden bg-muva-cream py-20 md:py-28"
      aria-label={t("missionVision.ariaSection", locale)}
    >
      <div className="container-muva">
        <div
          ref={reveal.ref}
          className={`reveal-on-scroll ${reveal.isVisible ? "is-visible" : ""}`}
        >
          <div className="grid gap-12 md:grid-cols-2 md:gap-16 lg:gap-24">
            {/* Misión */}
            <div>
              <div className="eyebrow">{t("missionVision.misionLabel", locale)}</div>
              <div className="divider-thin mt-4" />
              <p className="mt-6 font-serif text-xl md:text-2xl lg:text-3xl italic leading-relaxed text-muva-brown text-pretty">
                {t("missionVision.mision", locale)}
              </p>
            </div>

            {/* Visión */}
            <div>
              <div className="eyebrow">{t("missionVision.visionLabel", locale)}</div>
              <div className="divider-thin mt-4" />
              <p className="mt-6 font-serif text-xl md:text-2xl lg:text-3xl italic leading-relaxed text-muva-brown text-pretty">
                {t("missionVision.vision", locale)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
