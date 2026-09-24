import { useEffect, useState, type RefObject } from "react";

export function useNearViewport<T extends HTMLElement>(
  ref: RefObject<T | null>,
  rootMargin = "100px",
  enabled = true
): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setNear(false);
      return;
    }
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }

    try {
      const io = new IntersectionObserver(
        ([entry]) => setNear(entry.isIntersecting),
        { rootMargin, threshold: 0 }
      );
      io.observe(el);
      return () => io.disconnect();
    } catch {
      setNear(true);
    }
  }, [ref, rootMargin, enabled]);

  return near;
}
