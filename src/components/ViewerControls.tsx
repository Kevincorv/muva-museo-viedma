import {
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";

interface ViewerControlsProps {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  onClose: () => void;
}

export default function ViewerControls({
  onReset,
  onZoomIn,
  onZoomOut,
  onFullscreen,
  isFullscreen,
  onClose,
}: ViewerControlsProps) {
  const buttonClass =
    "flex h-11 w-11 items-center justify-center border border-muva-cream/20 bg-muva-dark/60 text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream/60 hover:bg-muva-dark/90";

  return (
    <>
      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-5 md:p-7">
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto group flex items-center gap-2 border border-muva-cream/20 bg-muva-dark/60 px-4 py-2.5 font-sans text-[11px] uppercase tracking-extra-wide text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream hover:bg-muva-cream hover:text-muva-dark"
          aria-label="Volver al inicio"
        >
          <X size={14} />
          <span className="hidden sm:inline">Volver</span>
        </button>

        <button
          type="button"
          onClick={onFullscreen}
          className={`pointer-events-auto ${buttonClass}`}
          aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      {/* Bottom right control cluster */}
      <div className="pointer-events-none absolute bottom-6 right-5 z-20 flex flex-col gap-2 md:bottom-8 md:right-8">
        <button
          type="button"
          onClick={onZoomIn}
          className={`pointer-events-auto ${buttonClass}`}
          aria-label="Acercar"
        >
          <ZoomIn size={18} />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className={`pointer-events-auto ${buttonClass}`}
          aria-label="Alejar"
        >
          <ZoomOut size={18} />
        </button>
        <button
          type="button"
          onClick={onReset}
          className={`pointer-events-auto ${buttonClass}`}
          aria-label="Restablecer vista"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Help text */}
      <div className="pointer-events-none absolute bottom-6 left-5 z-20 hidden font-sans text-[10px] uppercase tracking-extra-wide text-muva-cream/50 md:bottom-8 md:left-8 md:block">
        Arrastrar · Rotar · Scroll · Zoom
      </div>
    </>
  );
}
