import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { museum } from "../data/museum";
import { useScrolled } from "../hooks/useScrollReveal";

export default function Navbar() {
  const scrolled = useScrolled(40);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleNavClick = (href: string) => {
    setOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 bg-muva-ivory/95 backdrop-blur-md ${
          scrolled
            ? "border-b border-muva-sand/40 shadow-[0_1px_30px_rgba(26,20,16,0.06)]"
            : "border-b border-transparent"
        }`}
      >
        <div className="container-muva flex h-20 items-center justify-between gap-6 md:h-24 md:gap-8">
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("#inicio");
            }}
            className="group flex shrink-0 items-center gap-3 -ml-6 lg:-ml-10"
            aria-label="Ir al inicio – MUVA"
          >
            <img
              src="/images/muva-logo.png"
              alt="MUVA – Museo Viedma"
              className="h-14 w-auto transition-opacity duration-500 md:h-16 lg:h-20"
              width={500}
              height={199}
            />
          </a>

          <nav className="hidden items-center gap-7 lg:flex xl:gap-8" aria-label="Navegación principal">
            {museum.navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="relative whitespace-nowrap font-sans text-[11px] uppercase tracking-extra-wide text-muva-dark/80 transition-colors duration-300 hover:text-muva-earth xl:text-[12px]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <a
              href="#visita"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("#visita");
              }}
              className="hidden items-center gap-2 whitespace-nowrap border border-muva-dark px-4 py-2.5 font-sans text-[10px] uppercase tracking-extra-wide text-muva-dark transition-all duration-500 hover:bg-muva-dark hover:text-muva-cream lg:inline-flex xl:px-5 xl:text-[11px]"
            >
              Visitar MUVA
            </a>
            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="text-muva-dark lg:hidden"
            >
              {open ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-muva-dark/95 backdrop-blur-sm transition-opacity duration-500 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-sm bg-muva-ivory transition-transform duration-500 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-20 items-center justify-between border-b border-muva-sand/30 px-6">
            <span className="font-serif text-2xl tracking-[0.3em] text-muva-dark">MUVA</span>
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
              className="text-muva-dark"
            >
              <X size={26} />
            </button>
          </div>
          <nav className="flex flex-col px-8 py-10" aria-label="Navegación móvil">
            {museum.navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className={`border-b border-muva-sand/30 py-5 font-serif text-3xl text-muva-dark transition-all duration-700 ${
                  open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${i * 60 + 150}ms` : "0ms" }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#visita"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("#visita");
              }}
              className="btn-primary mt-10 w-full"
            >
              Visitar MUVA
            </a>
          </nav>
        </div>
      </div>
    </>
  );
}
