import { Headphones, Pause, Play, Loader2 } from "lucide-react";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useLanguage } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface AudioPlayerProps {
  src: string | undefined;
  compact?: boolean;
}

export default function AudioPlayer({ src, compact = false }: AudioPlayerProps) {
  const { locale } = useLanguage();
  const { state, toggle, seek } = useAudioPlayer(src);

  if (!src || state.hasError) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={state.isLoading}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-muva-cream/30 bg-muva-dark/60 text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream/60 hover:bg-muva-dark/90 disabled:opacity-50"
          aria-label={state.isPlaying ? t("audio.pause", locale) : t("audio.play", locale)}
        >
          {state.isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : state.isPlaying ? (
            <Pause size={14} />
          ) : (
            <Play size={14} className="ml-0.5" />
          )}
        </button>
        <span className="font-sans text-[9px] uppercase tracking-extra-wide text-muva-cream/60">
          {t("audio.guide", locale)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-sm border border-muva-sand/30 bg-muva-ivory p-4">
      <button
        type="button"
        onClick={toggle}
        disabled={state.isLoading}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muva-dark text-muva-cream transition-all duration-300 hover:bg-muva-earth disabled:opacity-50"
        aria-label={state.isPlaying ? t("audio.pause", locale) : t("audio.play", locale)}
      >
        {state.isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : state.isPlaying ? (
          <Pause size={18} />
        ) : (
          <Play size={18} className="ml-0.5" />
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Headphones size={12} className="shrink-0 text-muva-earth" />
          <span className="font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
            {t("audio.guide", locale)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-sans text-[10px] tabular-nums text-muva-stone">
            {formatTime(state.currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={state.duration || 0}
            step={0.1}
            value={state.currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-muva-sand/40 accent-muva-earth [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-muva-earth"
            aria-label={t("audio.seek", locale)}
          />
          <span className="font-sans text-[10px] tabular-nums text-muva-stone">
            {formatTime(state.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
