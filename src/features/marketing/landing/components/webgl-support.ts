/**
 * Whether to load a three.js scene here: a desktop with a fine pointer, motion allowed, 4+ cores and
 * WebGL2. Lives apart from the scene code so checking it never pulls three.js into the page bundle.
 */
let cached: boolean | undefined;

/** Cached for the page's life: the check creates a WebGL context, so it must not run every render. */
export function canRender3d(): boolean {
  cached ??= detect();
  return cached;
}

function detect(): boolean {
  if (!window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if ((navigator.hardwareConcurrency ?? 4) < 4) return false;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
}
