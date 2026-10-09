import { useEffect } from "react";
import VirtualMuseum from "../components/virtual-museum/VirtualMuseum";
import { vmText } from "../components/virtual-museum/texts";
import { museum } from "../data/museum";
import { useLanguage } from "../i18n/LanguageContext";

/**
 * Página del Entorno Virtual: ocupa toda la pantalla, sin navbar ni footer,
 * para que el recorrido en primera persona use el viewport completo.
 */
export default function VirtualMuseumPage() {
  const { locale } = useLanguage();

  useEffect(() => {
    const previousTitle = document.title;
    const previousOverflow = document.body.style.overflow;
    const previousScroll = window.scrollY;

    document.title = `${vmText("hud.brand", locale)} | ${museum.getFullName(
      locale
    )}`;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    return () => {
      document.title = previousTitle;
      document.body.style.overflow = previousOverflow;
      window.scrollTo(0, previousScroll);
    };
  }, [locale]);

  return <VirtualMuseum />;
}
