/** Illustrative 10-step ramp (50→900) from a hex color for theme preview. */
export function generateColorRamp(hex: string): string[] {
  const steps = [0.92, 0.8, 0.65, 0.5, 0.35, 0, -0.15, -0.3, -0.45, -0.6];
  return steps.map((factor) => {
    let num = parseInt(hex.replace('#', ''), 16);
    if (Number.isNaN(num)) num = 0xf75803;
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    if (factor > 0) {
      r = Math.round(r + (255 - r) * factor);
      g = Math.round(g + (255 - g) * factor);
      b = Math.round(b + (255 - b) * factor);
    } else {
      r = Math.round(r * (1 + factor));
      g = Math.round(g * (1 + factor));
      b = Math.round(b * (1 + factor));
    }
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  });
}
