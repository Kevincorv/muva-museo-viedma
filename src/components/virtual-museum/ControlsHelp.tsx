import { useEffect } from "react";
import { useVmText } from "./texts";

function Row({ text }: { text: string }) {
  const parts = text.split("—");
  const chip = (parts[0] ?? "").trim();
  const label = parts.slice(1).join("—").trim();

  return (
    <li className="flex items-center justify-between gap-4 border-b border-muva-sand/40 py-2.5 last:border-b-0">
      <span className="text-sm text-muva-brown">{label || chip}</span>
      {label && (
        <kbd className="shrink-0 rounded-sm border border-muva-dark/20 bg-muva-white px-2 py-1 font-sans text-[10px] uppercase tracking-wider text-muva-dark">
          {chip}
        </kbd>
      )}
    </li>
  );
}

/** Lista reutilizable de controles (bienvenida y modal de ayuda). */
export function ControlsList({ isTouch }: { isTouch: boolean }) {
  const t = useVmText();
  const items = isTouch
    ? [t("welcome.touchMove"), t("welcome.touchLook"), t("welcome.touchTap")]
    : [
        t("welcome.wasd"),
        t("welcome.mouse"),
        t("welcome.click"),
        t("welcome.esc"),
        t("welcome.f"),
      ];

  return (
    <ul className="w-full">
      {items.map((item) => (
        <Row key={item} text={item} />
      ))}
    </ul>
  );
}

export default function ControlsHelp({
  isTouch,
  onClose,
}: {
  isTouch: boolean;
  onClose: () => void;
}) {
  const t = useVmText();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-muva-dark/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t("help.title")}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-muva-cream p-6 shadow-2xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
              MUVA
            </div>
            <h2 className="mt-1 font-serif text-2xl text-muva-dark md:text-3xl">
              {t("help.title")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("panel.close")}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-muva-dark/15 font-serif text-lg text-muva-dark transition-colors duration-300 hover:border-muva-dark hover:bg-muva-dark hover:text-muva-cream"
          >
            ×
          </button>
        </div>

        <div className="mt-6">
          <ControlsList isTouch={isTouch} />
        </div>

        <div className="mt-7 flex justify-center">
          <button type="button" onClick={onClose} className="btn-primary w-full sm:w-auto">
            {t("panel.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
