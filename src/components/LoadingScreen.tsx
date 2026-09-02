import { useEffect, useState } from "react";
import { museum } from "../data/museum";

export default function LoadingScreen() {
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const interval = window.setInterval(() => {
      frame += 1;
      setProgress(Math.min(frame * 12, 100));
    }, 70);

    const timeout = window.setTimeout(() => {
      setHidden(true);
      window.clearInterval(interval);
    }, 1100);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-muva-dark text-muva-cream transition-opacity duration-700"
      style={{ opacity: progress < 100 ? 1 : 0 }}
    >
      <div className="text-[10px] font-sans uppercase tracking-ultra-wide text-muva-sand/70">
        Museo Viedma · Paraguay
      </div>
      <img
        src="/images/muva-logo-footer.png"
        alt="MUVA – Museo Viedma"
        className="mt-8 h-24 w-auto md:h-32"
        width={800}
        height={319}
      />
      <div className="mt-12 h-px w-40 overflow-hidden bg-muva-stone/40">
        <div
          className="h-full bg-muva-sand transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 text-[10px] font-sans uppercase tracking-extra-wide text-muva-sand/50">
        {museum.tagline}
      </div>
    </div>
  );
}
