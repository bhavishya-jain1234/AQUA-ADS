import { useEffect, useRef } from 'react';

const MOVE_RIPPLE_POOL = 36;
const CLICK_RIPPLE_POOL = 18;

const WaterCursor = () => {
  const moveRipplesRef = useRef<HTMLSpanElement[]>([]);
  const clickRipplesRef = useRef<HTMLSpanElement[]>([]);
  const moveIndexRef = useRef(0);
  const clickIndexRef = useRef(0);
  const lastMoveAtRef = useRef(0);

  useEffect(() => {
    const activateRipple = (el: HTMLSpanElement | undefined, x: number, y: number, scale = 1) => {
      if (!el) return;
      el.classList.remove('active');
      // Reflow to restart animation intentionally.
      // eslint-disable-next-line no-unused-expressions
      el.offsetWidth;
      el.style.setProperty('--ripple-x', `${x}px`);
      el.style.setProperty('--ripple-y', `${y}px`);
      el.style.setProperty('--ripple-scale', `${scale}`);
      el.classList.add('active');
    };

    const onPointerMove = (event: PointerEvent) => {
      const now = performance.now();
      if (now - lastMoveAtRef.current < 16) return;
      lastMoveAtRef.current = now;

      const el = moveRipplesRef.current[moveIndexRef.current % MOVE_RIPPLE_POOL];
      moveIndexRef.current += 1;
      activateRipple(el, event.clientX, event.clientY, 1);
    };

    const onPointerDown = (event: PointerEvent) => {
      for (let i = 0; i < 3; i += 1) {
        const el = clickRipplesRef.current[clickIndexRef.current % CLICK_RIPPLE_POOL];
        clickIndexRef.current += 1;
        activateRipple(el, event.clientX, event.clientY, 1 + i * 0.25);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  return (
    <div className="water-cursor-layer" aria-hidden="true">
      {Array.from({ length: MOVE_RIPPLE_POOL }).map((_, idx) => (
        <span
          key={`m-${idx}`}
          ref={(el) => {
            if (el) moveRipplesRef.current[idx] = el;
          }}
          className="cursor-ripple"
        />
      ))}
      {Array.from({ length: CLICK_RIPPLE_POOL }).map((_, idx) => (
        <span
          key={`c-${idx}`}
          ref={(el) => {
            if (el) clickRipplesRef.current[idx] = el;
          }}
          className="cursor-splash"
        />
      ))}
    </div>
  );
};

export default WaterCursor;
