import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { ControlsList } from "./ControlsHelp";
import { useVmText } from "./texts";

/**
 * Pantalla de bienvenida. Se muestra una vez, antes de empezar a caminar:
 * explica la experiencia y resume los controles del dispositivo.
 */
export default function WelcomeScreen({
  isTouch,
  slowConnection,
  onStart,
}: {
  isTouch: boolean;
  slowConnection: boolean;
  onStart: () => void;
}) {
  const t = useVmText();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`absolute inset-0 z-30 flex items-center justify-center bg-muva-dark/85 p-4 backdrop-blur-sm transition-opacity duration-500 ${
        shown ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={t("welcome.title")}
    >
      <div className="max-h-full w-full max-w-xl overflow-y-auto bg-muva-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-muva-sand/50 bg-muva-ivory px-6 py-4">
          <img
            src="/images/muva-logo.png"
            alt="MUVA"
            className="h-9 w-auto md:h-11"
          />
          <span className="font-serif text-xl tracking-[0.3em] text-muva-dark">
            MUVA
          </span>
        </div>

        <div className="px-6 py-7 md:px-9 md:py-9">
          <div className="eyebrow">{t("hud.brand")}</div>
          <h1 className="mt-5 font-serif text-3xl font-light leading-tight text-muva-dark md:text-4xl">
            {t("welcome.title")}
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muva-brown md:text-lg">
            {t("welcome.text")}
          </p>

          <div className="mt-7 border-t border-muva-sand/50 pt-5">
            <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
              {t("welcome.controls")}
            </div>
            <div className="mt-2">
              <ControlsList isTouch={isTouch} />
            </div>
          </div>

          {slowConnection && (
            <p className="mt-5 border-l-2 border-muva-sand pl-4 text-sm italic text-muva-stone">
              {t("welcome.slow")}
            </p>
          )}

          <button
            type="button"
            onClick={onStart}
            className="btn-primary mt-8 w-full"
          >
            <Play size={15} />
            {t("welcome.start")}
          </button>

          <div className="mt-5 flex justify-center">
            <Link
              to="/"
              className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-stone underline-offset-4 transition-colors duration-300 hover:text-muva-dark hover:underline"
            >
              {t("welcome.exit")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
