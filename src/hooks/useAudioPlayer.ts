import { useRef, useState, useEffect, useCallback } from "react";

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  hasError: boolean;
}

export function useAudioPlayer(src: string | undefined) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    hasError: false,
  });

  useEffect(() => {
    if (!src) return;
    const audio = new Audio();
    audio.preload = "none";
    audio.src = src;
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      setState((s) => ({ ...s, duration: audio.duration, isLoading: false }));
    };
    const onTimeUpdate = () => {
      setState((s) => ({ ...s, currentTime: audio.currentTime }));
    };
    const onEnded = () => {
      setState((s) => ({ ...s, isPlaying: false, currentTime: 0 }));
      audio.currentTime = 0;
    };
    const onWaiting = () => {
      setState((s) => ({ ...s, isLoading: true }));
    };
    const onCanPlay = () => {
      setState((s) => ({ ...s, isLoading: false }));
    };
    const onError = () => {
      setState((s) => ({
        ...s,
        isLoading: false,
        isPlaying: false,
        hasError: true,
      }));
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, [src]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setState((s) => ({ ...s, isLoading: true, hasError: false }));
    audio.play().then(() => {
      setState((s) => ({ ...s, isPlaying: true, isLoading: false }));
    }).catch(() => {
      setState((s) => ({ ...s, isLoading: false, hasError: true }));
    });
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setState((s) => ({ ...s, currentTime: time }));
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setState((s) => ({ ...s, isPlaying: false, currentTime: 0 }));
  }, []);

  return { state, play, pause, toggle, seek, stop };
}
