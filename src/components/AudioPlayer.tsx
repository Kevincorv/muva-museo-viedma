import { Headphones, Pause, Play, Loader2, RotateCcw } from "lucide-react";
import { useAudioPlayer, type AudioPlayerState } from "../hooks/useAudioPlayer";
import { useLanguage } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface AudioPlayerProps {
  src: string | undefined;
  compact?: boolean;
}

interface ProgressBarProps {
  state: AudioPlayerState;
  onSeek: (time: number) => void;
  tone: "light" | "dark";
}

function ProgressBar({ state, onSeek, tone }: ProgressBarProps) {
  const { locale } = useLanguage();
  const pct =
    state.duration > 0 ? Math.min(100, (state.currentTime / state.duration) * 100) : 0;

  return (
    <div className="relative h-1.5 w-full">
      <div
        className={`absolute inset-0 rounded-full ${
          tone === "dark" ? "bg-muva-sand/40" : "bg-muva-dark/15"
        }`}
      />
      <div
        className={`absolute inset-y-0 left-0 rounded-full ${
          tone === "dark" ? "bg-muva-cream" : "bg-muva-earth"
        }`}
        style={{ width: `${pct}%` }}
      />
      <input
        type="range"
        min={0}
        max={state.duration || 0}
        step={0.1}
        value={Math.min(state.currentTime, state.duration || 0)}
        onChange={(e) => onSeek(Number(e.target.value))}
        disabled={state.duration <= 0}
        aria-label={t("audio.seek", locale)}
        aria-valuetext={`${formatTime(state.currentTime)} / ${formatTime(state.duration)}`}
        className={`absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent disabled:cursor-default [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full ${
          tone === "dark"
            ? "[&::-webkit-slider-thumb]:bg-muva-cream"
            : "[&::-webkit-slider-thumb]:bg-muva-earth"
        }`}
      />
    </div>
  );
}

export default function AudioPlayer({ src, compact = false }: AudioPlayerProps) {
  const { locale } = useLanguage();
  const { state, toggle, seek, restart } = useAudioPlayer(
    src,
    compact ? "none" : "metadata",
  );

  if (!src || state.hasError) return null;

  const timeLabel = `${formatTime(state.currentTime)} / ${
    state.duration > 0 ? formatTime(state.duration) : "--:--"
  }`;

  if (compact) {
    return (
      <div className="flex w-full max-w-xs flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-sans text-[9px] uppercase tracking-extra-wide text-muva-cream/60">
            {t("audio.guide", locale)}
          </span>
          <span className="font-sans text-[9px] tabular-nums text-muva-cream/85">
            {timeLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            disabled={state.isLoading}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-muva-cream/30 bg-muva-dark/60 text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream/60 hover:bg-muva-dark/90 disabled:opacity-50"
            aria-label={state.isPlaying ? t("audio.pause", locale) : t("audio.play", locale)}
          >
            {state.isLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : state.isPlaying ? (
              <Pause size={12} />
            ) : (
              <Play size={12} className="ml-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={restart}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-muva-cream/30 bg-muva-dark/60 text-muva-cream backdrop-blur-sm transition-all duration-300 hover:border-muva-cream/60 hover:bg-muva-dark/90"
            aria-label={t("audio.restart", locale)}
          >
            <RotateCcw size={12} />
          </button>
          <div className="min-w-0 flex-1">
            <ProgressBar state={state} onSeek={seek} tone="dark" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-sm border border-muva-sand/30 bg-muva-ivory p-3">
      <button
        type="button"
        onClick={toggle}
        disabled={state.isLoading}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muva-dark text-muva-cream transition-all duration-300 hover:bg-muva-earth disabled:opacity-50"
        aria-label={state.isPlaying ? t("audio.pause", locale) : t("audio.play", locale)}
      >
        {state.isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : state.isPlaying ? (
          <Pause size={16} />
        ) : (
          <Play size={16} className="ml-0.5" />
        )}
      </button>

      <button
        type="button"
        onClick={restart}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-muva-sand/60 bg-muva-ivory text-muva-earth transition-all duration-300 hover:border-muva-earth hover:bg-muva-sand/30"
        aria-label={t("audio.restart", locale)}
      >
        <RotateCcw size={15} />
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-extra-wide text-muva-earth">
            <Headphones size={11} className="shrink-0" />
            {t("audio.guide", locale)}
          </span>
          <span className="font-sans text-[10px] tabular-nums text-muva-stone">
            {timeLabel}
          </span>
        </div>
        <ProgressBar state={state} onSeek={seek} tone="light" />
      </div>
    </div>
  );
}
