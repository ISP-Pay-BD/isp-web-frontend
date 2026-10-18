import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Shared pieces of the landing's three.js scene. */

/** Any CSS colour (tokens may be hex, rgb or color-mix) to a three.js colour, via a 1px canvas. */
export function cssToColor(css: string): THREE.Color {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx || !css) return new THREE.Color(0.91, 0.35, 0.1);
  ctx.canvas.width = 1;
  ctx.canvas.height = 1;
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
}

/** A soft studio environment for reflections on metal and glass. */
export function createEnvironment(renderer: THREE.WebGLRenderer): {
  envMap: THREE.Texture;
  dispose: () => void;
} {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envMap = pmrem.fromScene(room, 0.04).texture;
  return {
    envMap,
    dispose() {
      envMap.dispose();
      room.dispose();
      pmrem.dispose();
    },
  };
}

/** A round glow for light pulses: a warm white core fading through the brand colour. */
export function createGlowTexture(color: THREE.Color): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Colours are stored linear; the canvas wants sRGB.
    const srgb = { r: 0, g: 0, b: 0 };
    color.getRGB(srgb, THREE.SRGBColorSpace);
    const [r, g, b] = [srgb.r, srgb.g, srgb.b].map((c) => Math.round(c * 255));
    const glow = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    glow.addColorStop(0, 'rgba(255, 246, 232, 1)');
    glow.addColorStop(0.18, `rgba(${r}, ${g}, ${b}, 0.85)`);
    glow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.18)`);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
