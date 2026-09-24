import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Locale } from "./translations";
import { t } from "./translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "es",
  setLocale: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem("muva-lang");
      if (saved === "es" || saved === "en" || saved === "pt") return saved;
    } catch {
      // localStorage bloqueado (modo privado, storage deshabilitado)
    }
    return "es";
  });

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("muva-lang", l);
    } catch {
      // sin storage disponible: el idioma solo vive en memoria
    }
    document.documentElement.lang = l;
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: (key: string) => t(key, locale) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
