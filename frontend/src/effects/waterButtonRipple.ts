import type { MouseEvent } from 'react';

export function spawnWaterRipple(event: MouseEvent<HTMLElement>) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height) * 1.35;

  ripple.className = 'btn-ripple';
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;

  button.appendChild(ripple);
  window.setTimeout(() => {
    ripple.remove();
  }, 520);
}
