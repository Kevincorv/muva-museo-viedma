import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import type { Locale } from "../i18n/translations";

const locales: { code: Locale; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  return (
    <div ref={ref} className="relative z-[60]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 border border-muva-cream/20 bg-muva-dark/60 px-3 py-2 font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream/60 hover:bg-muva-dark/90"
        aria-label="Seleccionar idioma"
      >
        <Globe size={13} />
        <span className="hidden sm:inline">{current.flag} {current.label}</span>
        <span className="sm:hidden">{current.flag}</span>
        <ChevronDown size={12} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 min-w-[140px] border border-muva-cream/20 bg-muva-dark/95 backdrop-blur-md shadow-lg">
          {locales.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-4 py-2.5 font-sans text-[11px] uppercase tracking-extra-wide transition-colors duration-200 ${
                l.code === locale
                  ? "text-muva-sand bg-muva-cream/10"
                  : "text-muva-cream/80 hover:bg-muva-cream/10 hover:text-muva-cream"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
