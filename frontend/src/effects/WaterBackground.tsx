import { useEffect, useRef } from 'react';

const DEEP_OCEAN = '#001F5B';
const OCEAN_BLUE = '#0055CC';
const CYAN = 'rgba(0, 200, 255, 0.4)';

const WaterBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const targetFrameMs = isMobile ? 33 : 16;
    // Global slow-down factor (lower = calmer waves).
    const speedScale = isMobile ? 0.65 : 0.55;
    const waveLayers = isMobile
      ? [
          { color: DEEP_OCEAN, speed: 0.018 * speedScale, amplitude: 52, frequency: 0.009, offset: 0 },
          { color: OCEAN_BLUE, speed: 0.034 * speedScale, amplitude: 34, frequency: 0.013, offset: 250 },
        ]
      : [
          { color: DEEP_OCEAN, speed: 0.024 * speedScale, amplitude: 64, frequency: 0.0085, offset: 0 },
          { color: OCEAN_BLUE, speed: 0.042 * speedScale, amplitude: 42, frequency: 0.012, offset: 260 },
          { color: CYAN, speed: 0.065 * speedScale, amplitude: 22, frequency: 0.019, offset: 520 },
        ];

    const bubbleCount = isMobile ? 8 : 14;
    const subtleBubbles = Array.from({ length: bubbleCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 2.8 + 1.1,
      speed: Math.random() * 0.00045 + 0.0002,
      driftSeed: Math.random() * Math.PI * 2,
    }));

    let width = 0;
    let height = 0;
    let time = 0;
    let rafId = 0;
    let lastTs = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const drawWave = (layer: { color: string; speed: number; amplitude: number; frequency: number; offset: number }, phase: number) => {
      const baseY = height * 0.64 + Math.sin(phase * 0.055) * 8 + layer.offset * 0.02;
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 6) {
        const y =
          baseY +
          Math.sin(x * layer.frequency + phase * layer.speed) * layer.amplitude +
          Math.sin(x * (layer.frequency * 0.45) + phase * (layer.speed * 0.7)) * (layer.amplitude * 0.22);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = layer.color;
      ctx.fill();
    };

    const drawSubtleBubbles = () => {
      ctx.fillStyle = 'rgba(224, 247, 255, 0.22)';
      subtleBubbles.forEach((bubble) => {
        bubble.y -= bubble.speed;
        if (bubble.y < -0.03) {
          bubble.y = 1.05;
          bubble.x = Math.random();
        }
        const x = bubble.x * width + Math.sin(time * 0.0007 + bubble.driftSeed) * 9;
        const y = bubble.y * height;
        ctx.beginPath();
        ctx.arc(x, y, bubble.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const render = (ts: number) => {
      if (ts - lastTs < targetFrameMs) {
        rafId = window.requestAnimationFrame(render);
        return;
      }
      lastTs = ts;
      time += (isMobile ? 0.04 : 0.05) * speedScale;

      ctx.clearRect(0, 0, width, height);
      waveLayers.forEach((layer, idx) => drawWave(layer, time + idx * 50));
      drawSubtleBubbles();
      rafId = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="water-bg-canvas" aria-hidden="true" />;
};

export default WaterBackground;
