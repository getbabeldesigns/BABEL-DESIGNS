import { useEffect, useRef, useState } from "react";

const CustomCursor = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mediaQueries = [
      "(min-width: 1024px)",
      "(hover: hover)",
      "(pointer: fine)",
      "(prefers-reduced-motion: no-preference)",
    ].map((query) => window.matchMedia(query));

    const syncEnabled = () => {
      setIsEnabled(mediaQueries.every((query) => query.matches));
    };

    syncEnabled();
    mediaQueries.forEach((query) => query.addEventListener("change", syncEnabled));

    return () => {
      mediaQueries.forEach((query) => query.removeEventListener("change", syncEnabled));
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    let lastInteractive: HTMLElement | null = null;
    let raf = 0;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pointer = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    const ringEase = prefersReducedMotion ? 1 : 0.18;

    const setDot = (x: number, y: number) => {
      if (!dotRef.current) return;
      dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const setRing = (x: number, y: number) => {
      if (!ringRef.current) return;
      ringRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const applyHoverState = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;
      const interactive = element?.closest("a, button, [data-cursor]") ?? null;

      if (!ringRef.current || !labelRef.current) return;
      if (interactive === lastInteractive) return;

      if (interactive) {
        ringRef.current.dataset.state = "active";
        const label =
          interactive.getAttribute("data-cursor") ||
          interactive.getAttribute("aria-label") ||
          "Open";
        labelRef.current.textContent = label;
      } else {
        ringRef.current.dataset.state = "idle";
        labelRef.current.textContent = "";
      }

      lastInteractive = interactive;
    };

    const tick = () => {
      // Lerp the ring toward pointer position (dot stays 1:1)
      ring.x += (pointer.x - ring.x) * ringEase;
      ring.y += (pointer.y - ring.y) * ringEase;
      setRing(ring.x, ring.y);
      raf = window.requestAnimationFrame(tick);
    };

    const moveCursor = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      setDot(pointer.x, pointer.y);
      applyHoverState(event.target);
    };

    const clearHoverState = () => {
      applyHoverState(null);
    };

    // Ensure we start hidden offscreen until first move.
    setDot(pointer.x, pointer.y);
    setRing(ring.x, ring.y);

    raf = window.requestAnimationFrame(tick);
    window.addEventListener("pointermove", moveCursor, { passive: true });
    window.addEventListener("pointerleave", clearHoverState);
    window.addEventListener("blur", clearHoverState);

    return () => {
      window.removeEventListener("pointermove", moveCursor);
      window.removeEventListener("pointerleave", clearHoverState);
      window.removeEventListener("blur", clearHoverState);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-[120]">
      <div ref={dotRef} className="custom-cursor-dot" />
      <div ref={ringRef} className="custom-cursor-ring" data-state="idle">
        <span ref={labelRef} className="custom-cursor-label" />
      </div>
    </div>
  );
};

export default CustomCursor;
