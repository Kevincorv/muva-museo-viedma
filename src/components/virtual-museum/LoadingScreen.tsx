import { Loader2 } from "lucide-react";
import { useVmText } from "./texts";

/** Pantalla de carga mientras el canvas 3D prepara la escena. */
export default function LoadingScreen() {
  const t = useVmText();

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-muva-dark px-6 text-center">
      <div className="font-serif text-4xl tracking-[0.45em] text-muva-cream md:text-5xl">
        MUVA
      </div>
      <div className="mt-4 font-sans text-[10px] uppercase tracking-extra-wide text-muva-sand">
        {t("hud.brand")}
      </div>

      <Loader2
        size={26}
        strokeWidth={1.2}
        className="mt-12 animate-spin text-muva-sand"
      />

      <p className="mt-8 font-sans text-[11px] uppercase tracking-extra-wide text-muva-cream/70">
        {t("loading.title")}
      </p>
      <p className="mt-2 max-w-xs text-sm text-muva-cream/45">
        {t("loading.hint")}
      </p>
    </div>
  );
}
