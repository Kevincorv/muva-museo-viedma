import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Collection3D from "../components/Collection3D";
import Footer from "../components/Footer";
import { museum } from "../data/museum";

export default function ColeccionPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative bg-muva-ivory text-muva-dark antialiased">
      {/* Header */}
      <header className="relative z-50 bg-muva-ivory/95 backdrop-blur-md border-b border-muva-sand/40">
        <div className="container-muva flex h-20 items-center justify-between gap-6 md:h-24 md:gap-8">
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-3 -ml-6 lg:-ml-10"
            aria-label="Volver al inicio – MUVA"
          >
            <img
              src="/images/muva-logo.png"
              alt="MUVA – Museo Viedma"
              className="h-10 w-auto transition-opacity duration-500 md:h-12 lg:h-14"
              width={500}
              height={199}
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-7 xl:gap-8" aria-label="Navegación">
            <Link
              to="/"
              className="relative whitespace-nowrap font-sans text-[11px] uppercase tracking-extra-wide text-muva-dark/80 transition-colors duration-300 hover:text-muva-earth xl:text-[12px]"
            >
              Inicio
            </Link>
            <span className="relative whitespace-nowrap font-sans text-[11px] uppercase tracking-extra-wide text-muva-earth xl:text-[12px]">
              Colección
            </span>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/"
              className="hidden items-center gap-2 whitespace-nowrap border border-muva-dark px-4 py-2.5 font-sans text-[10px] uppercase tracking-extra-wide text-muva-dark transition-all duration-500 hover:bg-muva-dark hover:text-muva-cream lg:inline-flex xl:px-5 xl:text-[11px]"
            >
              <ArrowLeft size={14} />
              Volver al museo
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Collection3D />
      </main>

      <Footer
        contact={museum.contact}
        fullName={museum.fullName}
        tagline={museum.tagline}
        year={new Date().getFullYear()}
      />
    </div>
  );
}
