import { useEffect, useRef, useState } from 'react';

/**
 * Count-up / tween a displayed number toward `target`.
 * 900ms ease-out on mount, 400ms on subsequent value changes (design.md §5).
 * Returns the current interpolated value. Honors prefers-reduced-motion.
 */
export function useCountUp(target: number, duration = 900): number {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const firstRef = useRef(true);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = firstRef.current ? 0 : fromRef.current;
    const dur = reduced ? 0 : firstRef.current ? duration : Math.min(duration, 400);
    firstRef.current = false;

    if (dur === 0 || from === target) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const v = from + (target - from) * eased;
      setDisplay(v);
      if (t < 1) raf = requestAnimationFrame(step);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return display;
}
