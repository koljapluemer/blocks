/**
 * Deterministic per-goal color: hash the goal title to a hue, hold saturation
 * and lightness fixed so every block reads as the same muted palette on white.
 */

const SATURATION = 62;
const LIGHTNESS = 55;

/** FNV-1a 32-bit. Stable across runs and platforms, no dependencies. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function blockHue(goal: string): number {
  return hashString(goal) % 360;
}

export function blockColor(goal: string): string {
  return `hsl(${blockHue(goal)}, ${SATURATION}%, ${LIGHTNESS}%)`;
}
