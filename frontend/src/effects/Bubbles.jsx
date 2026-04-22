import { useMemo } from 'react';

const Bubbles = () => {
  const bubbles = useMemo(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const count = isMobile ? 15 : 30;
    return Array.from({ length: count }, (_, idx) => {
      const size = Math.random() * 14 + 6;
      const opacity = Math.random() * 0.25 + 0.1;
      const duration = Math.random() * 16 + 14;
      const delay = Math.random() * -24;
      const drift = Math.random() * 36 + 12;
      return {
        id: idx,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          opacity,
          left: `${Math.random() * 100}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          ['--bubble-drift']: `${drift}px`,
          ['--bubble-opacity']: `${opacity}`,
        },
      };
    });
  }, []);

  return (
    <div className="bubble-layer" aria-hidden="true">
      {bubbles.map((bubble) => (
        <span key={bubble.id} className="bubble-particle" style={bubble.style} />
      ))}
    </div>
  );
};

export default Bubbles;
