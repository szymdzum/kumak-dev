/**
 * Hero torus seen edge-on: each loop around the tube projects to an
 * axis-aligned ellipse whose width shrinks as the loop turns away from the
 * viewer. Loops sit in evenly spaced slots across the front half; a
 * fractional slot lets the client script spin the torus.
 */
export const loopCount = 28;
export const tubeRadius = 44;
export const centerY = 110;

const majorRadius = 115;
const centerX = 250;
const tilt = Math.PI / 14;
const step = Math.PI / loopCount;

export interface TorusLoop {
  cx: string;
  rx: string;
  strokeWidth: string;
  opacity: string;
}

/** Geometry for a loop at `slot` in [0, loopCount). */
export function torusLoop(slot: number): TorusLoop {
  const phi = -Math.PI / 2 + slot * step;
  const depth = Math.sin(phi + tilt);
  const emphasis = Math.abs(Math.cos(phi));
  // Fade loops entering and leaving the front half so the spin wraps seamlessly.
  const edgeFade = Math.min(1, Math.min(slot, loopCount - slot) / 1.5);
  return {
    cx: (centerX - majorRadius * depth).toFixed(2),
    rx: (tubeRadius * Math.abs(depth)).toFixed(2),
    strokeWidth: (0.4 + emphasis * 0.55).toFixed(3),
    opacity: ((0.25 + emphasis * 0.6) * edgeFade).toFixed(3),
  };
}
