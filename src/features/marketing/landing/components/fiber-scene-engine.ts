import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { createEnvironment, createGlowTexture, cssToColor } from './scene-kit';

/**
 * The landing's 3D layer, built from what an ISP actually runs: glossy routers with lit port LEDs and
 * antennas, Wi-Fi signals whose arcs pulse outward, iridescent glass fiber rings, and fiber strands
 * carrying light pulses (traffic and payments) toward the product. Everything leans toward the
 * pointer and spreads as the block scrolls away (`getScroll`, 0 to 1). Loaded on demand by `FiberScene`.
 */

export type FiberSceneVariant = 'hero' | 'cta';

export interface FiberSceneEngine {
  start: () => void;
  stop: () => void;
  dispose: () => void;
}

/** [x, y, z, scale]: x and y are fractions of the visible half-width / half-height, so any aspect fits. */
type Spot = [number, number, number, number];
type Point = [number, number, number];

interface Layout {
  routers: Spot[];
  signals: Spot[];
  rings: Spot[];
  strands: Point[][];
}

const LAYOUTS: Record<FiberSceneVariant, Layout> = {
  // Objects keep to the gutters beside the centred headline; strands run down into the product stage.
  hero: {
    routers: [
      [-0.86, 0.48, 0, 0.85],
      [0.78, -0.32, 0.5, 0.9],
      [-0.98, 0.04, -1.8, 0.75],
      [0.97, 0.12, -2, 0.75],
    ],
    signals: [
      [-0.74, -0.42, 0.6, 0.9],
      [0.85, 0.56, -0.4, 0.85],
    ],
    rings: [
      [-0.64, 0.86, -2.4, 1.1],
      [0.68, 0.92, -2.8, 1],
      [0.94, -0.74, -1.4, 1.2],
    ],
    strands: [
      [
        [-1.25, 0.8, -1],
        [-0.92, 0.1, 0],
        [-0.52, -0.66, 0.2],
        [-0.14, -1.3, 0],
      ],
      [
        [1.25, 0.66, -1],
        [0.94, 0, 0],
        [0.5, -0.72, 0.2],
        [0.12, -1.3, 0],
      ],
      [
        [-1.3, -0.18, -2.2],
        [-0.84, -0.58, -1.2],
        [-0.32, -0.98, -0.6],
        [0.02, -1.35, -0.6],
      ],
      [
        [1.3, -0.3, -2.4],
        [0.8, -0.7, -1.4],
        [0.36, -1.05, -0.8],
        [0.04, -1.35, -0.8],
      ],
    ],
  },
  // The closing block: devices at the sides, strands converging under the call to action.
  cta: {
    routers: [
      [-0.84, 0.42, 0, 0.85],
      [0.72, -0.44, 0.4, 0.9],
    ],
    signals: [
      [-0.7, -0.5, 0.5, 0.9],
      [0.82, 0.48, -0.4, 0.85],
    ],
    rings: [
      [-0.96, -0.02, -2.2, 1.1],
      [0.96, 0.06, -2.4, 1.1],
    ],
    strands: [
      [
        [-1.25, 0.9, -1],
        [-0.86, 0.2, -0.4],
        [-0.4, -0.5, 0],
        [0, -1.2, 0],
      ],
      [
        [1.25, 0.86, -1],
        [0.88, 0.16, -0.4],
        [0.42, -0.52, 0],
        [0, -1.2, 0],
      ],
    ],
  },
};

const PULSES_PER_STRAND = 3;
const STRAND_SAMPLES = 96;
const SIGNAL_ARCS = 3;

type Kind = 'router' | 'signal' | 'ring';

interface Floater {
  object: THREE.Object3D;
  kind: Kind;
  spot: Spot;
  base: THREE.Vector3;
  spin: THREE.Vector2;
  phase: number;
}

interface Strand {
  points: Point[];
  curve: THREE.CatmullRomCurve3;
  line: THREE.Line;
  pulses: THREE.Sprite[];
  speed: number;
  offset: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function createFiberSceneEngine({
  canvas,
  variant,
  getScroll,
}: {
  canvas: HTMLCanvasElement;
  variant: FiberSceneVariant;
  getScroll: () => number;
}): FiberSceneEngine {
  const layout = LAYOUTS[variant];
  const brand = cssToColor(getComputedStyle(canvas).getPropertyValue('--landing-cta').trim());

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const environment = createEnvironment(renderer);
  scene.environment = environment.envMap;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 12);
  const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
  const view = { w: halfHeight, h: halfHeight };

  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(4, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(brand, 2);
  rim.position.set(-5, -2, -3);
  scene.add(rim);

  const group = new THREE.Group();
  scene.add(group);

  // Everything created here is disposed together.
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const keep = <T extends THREE.BufferGeometry | THREE.Material>(item: T): T => {
    if (item instanceof THREE.BufferGeometry) geometries.push(item);
    else materials.push(item);
    return item;
  };

  // Router: a glossy dark body, five ports with LEDs on the front, a brand stripe, two antennas.
  const bodyGeometry = keep(new RoundedBoxGeometry(1.5, 0.3, 0.95, 4, 0.07));
  const portGeometry = keep(new THREE.BoxGeometry(0.13, 0.09, 0.02));
  const ledGeometry = keep(new THREE.BoxGeometry(0.07, 0.035, 0.02));
  const stripeGeometry = keep(new THREE.BoxGeometry(0.42, 0.006, 0.1));
  const antennaGeometry = keep(new THREE.CylinderGeometry(0.028, 0.034, 0.95, 16));
  const bodyMaterial = keep(
    new THREE.MeshPhysicalMaterial({
      color: 0x1a1e26,
      metalness: 0.55,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
    }),
  );
  const portMaterial = keep(new THREE.MeshStandardMaterial({ color: 0x0b0d11, roughness: 0.8 }));
  const antennaMaterial = keep(
    new THREE.MeshStandardMaterial({ color: 0x272c35, metalness: 0.3, roughness: 0.55 }),
  );
  const ledOnline = keep(new THREE.MeshBasicMaterial({ color: 0x34d399, toneMapped: false }));
  const ledBrand = keep(new THREE.MeshBasicMaterial({ color: brand, toneMapped: false }));

  function createRouter(): THREE.Group {
    const router = new THREE.Group();
    router.add(new THREE.Mesh(bodyGeometry, bodyMaterial));
    for (let i = 0; i < 5; i++) {
      const x = -0.5 + i * 0.22;
      const port = new THREE.Mesh(portGeometry, portMaterial);
      port.position.set(x, -0.035, 0.48);
      const led = new THREE.Mesh(ledGeometry, i === 0 ? ledBrand : ledOnline);
      led.position.set(x, 0.075, 0.48);
      router.add(port, led);
    }
    const stripe = new THREE.Mesh(stripeGeometry, ledBrand);
    stripe.position.set(-0.4, 0.151, 0.15);
    router.add(stripe);
    [-1, 1].forEach((side) => {
      const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
      antenna.position.set(side * 0.62, 0.62, -0.36);
      antenna.rotation.z = -side * 0.12;
      router.add(antenna);
    });
    return router;
  }

  // Wi-Fi signal: three arcs over a dot; the arcs brighten in a wave travelling outward.
  const arcMaterials = Array.from({ length: SIGNAL_ARCS }, () =>
    keep(
      new THREE.MeshStandardMaterial({
        color: brand,
        emissive: brand,
        emissiveIntensity: 0.6,
        metalness: 0.2,
        roughness: 0.4,
      }),
    ),
  );
  const arcGeometries = Array.from({ length: SIGNAL_ARCS }, (_, i) =>
    keep(new THREE.TorusGeometry(0.32 + i * 0.26, 0.045, 12, 48, Math.PI / 2)),
  );
  const dotGeometry = keep(new THREE.SphereGeometry(0.085, 24, 16));

  function createSignal(): THREE.Group {
    const signal = new THREE.Group();
    const inner = new THREE.Group();
    inner.position.y = -0.35;
    arcGeometries.forEach((geometry, i) => {
      const arc = new THREE.Mesh(geometry, arcMaterials[i]);
      arc.rotation.z = Math.PI / 4; // the quarter arc spans 45°–135°, opening upward
      inner.add(arc);
    });
    inner.add(new THREE.Mesh(dotGeometry, arcMaterials[0]));
    signal.add(inner);
    return signal;
  }

  // Glass fiber ring: translucent, with thin-film iridescence that shifts colour as it turns.
  const ringGeometry = keep(new THREE.TorusGeometry(0.62, 0.15, 32, 96));
  const ringMaterial = keep(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.15,
      roughness: 0.12,
      transparent: true,
      opacity: 0.6,
      iridescence: 1,
      iridescenceIOR: 1.6,
      iridescenceThicknessRange: [260, 720],
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    }),
  );

  const floaters: Floater[] = [];
  const addFloater = (object: THREE.Object3D, kind: Kind, spot: Spot) => {
    const index = floaters.length;
    object.scale.setScalar(0.0001);
    group.add(object);
    floaters.push({
      object,
      kind,
      spot,
      base: new THREE.Vector3(),
      spin: new THREE.Vector2(
        0.15 + (index % 3) * 0.08,
        (index % 2 ? 1 : -1) * (0.25 + (index % 4) * 0.07),
      ),
      phase: index * 1.37,
    });
  };
  layout.routers.forEach((spot) => addFloater(createRouter(), 'router', spot));
  layout.signals.forEach((spot) => addFloater(createSignal(), 'signal', spot));
  layout.rings.forEach((spot) =>
    addFloater(new THREE.Mesh(ringGeometry, ringMaterial), 'ring', spot),
  );

  // Fiber strands, each carrying a few light pulses toward the product.
  const lineMaterial = keep(
    new THREE.LineBasicMaterial({
      color: brand,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const glowTexture = createGlowTexture(brand);
  const pulseMaterial = keep(
    new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const strands: Strand[] = layout.strands.map((points, index) => {
    const line = new THREE.Line(new THREE.BufferGeometry(), lineMaterial);
    group.add(line);
    const pulses = Array.from({ length: PULSES_PER_STRAND }, () => {
      const sprite = new THREE.Sprite(pulseMaterial);
      sprite.scale.setScalar(0.0001);
      group.add(sprite);
      return sprite;
    });
    return {
      points,
      curve: new THREE.CatmullRomCurve3(points.map(() => new THREE.Vector3())),
      line,
      pulses,
      speed: 0.09 + (index % 3) * 0.025,
      offset: index * 0.21,
    };
  });

  /** Places everything for the current aspect ratio. */
  function layoutScene() {
    floaters.forEach((f) => f.base.set(f.spot[0] * view.w, f.spot[1] * view.h, f.spot[2]));
    strands.forEach((strand) => {
      strand.points.forEach(([x, y, z], i) =>
        strand.curve.points[i].set(x * view.w, y * view.h, z),
      );
      strand.curve.updateArcLengths();
      strand.line.geometry.dispose();
      strand.line.geometry = new THREE.BufferGeometry().setFromPoints(
        strand.curve.getSpacedPoints(STRAND_SAMPLES),
      );
    });
  }

  const pointer = { x: 0, y: 0 };
  const onPointerMove = (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  function resize() {
    const parent = canvas.parentElement;
    if (!parent || parent.clientWidth === 0 || parent.clientHeight === 0) return;
    renderer.setSize(parent.clientWidth, parent.clientHeight, false);
    camera.aspect = parent.clientWidth / parent.clientHeight;
    camera.updateProjectionMatrix();
    view.w = halfHeight * camera.aspect;
    layoutScene();
  }
  const resizeObserver = new ResizeObserver(resize);
  if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
  resize();

  const clock = new THREE.Clock();
  let frame = 0;
  let running = false;
  let scroll = getScroll();

  function renderFrame() {
    if (!running) return;
    const time = clock.getElapsedTime();
    scroll += (getScroll() - scroll) * 0.08;

    floaters.forEach((floater, index) => {
      const { object, kind, spot, base, spin, phase } = floater;
      // Each pops in on its own beat, then bobs; the set rises and spreads on scroll.
      const eased = 1 - Math.pow(1 - clamp01((time - 0.35 - index * 0.09) / 0.9), 3);
      object.scale.setScalar(Math.max(0.0001, eased * spot[3] * (1 + scroll * 0.15)));
      object.position.set(
        base.x * (1 + scroll * 0.18),
        base.y + Math.sin(time * 0.7 + phase) * 0.2 + scroll * 2.2,
        base.z,
      );
      if (kind === 'router') {
        // Turned toward the centre, showing its lit front, with a slow sway.
        const towardCentre = -Math.sign(base.x || 1) * 0.45;
        object.rotation.set(
          0.42 + Math.sin(time * 0.5 + phase) * 0.06,
          towardCentre + Math.sin(time * 0.35 + phase) * 0.35,
          Math.sin(time * 0.3 + phase) * 0.05,
        );
      } else if (kind === 'signal') {
        object.rotation.set(
          0,
          Math.sin(time * 0.5 + phase) * 0.35,
          Math.sin(time * 0.4 + phase) * 0.08,
        );
      } else {
        object.rotation.set(
          0.35 + Math.sin(time * spin.x + phase) * 0.5,
          time * spin.y + phase,
          Math.sin(time * 0.3 + phase) * 0.15,
        );
      }
    });

    // Wi-Fi arcs brighten in a wave from the inside out.
    arcMaterials.forEach((material, i) => {
      material.emissiveIntensity = 0.35 + 0.9 * Math.max(0, Math.sin(time * 2.4 - i * 0.9));
    });

    // Strands fade in after the devices, then pulses travel along them, swelling mid-way.
    const reveal = clamp01((time - 0.6) / 1.2);
    lineMaterial.opacity = 0.3 * reveal;
    strands.forEach((strand) => {
      strand.pulses.forEach((sprite, i) => {
        const u = (time * strand.speed + strand.offset + i / PULSES_PER_STRAND) % 1;
        strand.curve.getPointAt(u, sprite.position);
        sprite.scale.setScalar(Math.max(0.0001, 0.6 * Math.sin(Math.PI * u) * reveal));
      });
    });

    group.rotation.y += (pointer.x * 0.2 - group.rotation.y) * 0.05;
    group.rotation.x += (pointer.y * 0.1 - group.rotation.x) * 0.05;

    renderer.render(scene, camera);
    frame = requestAnimationFrame(renderFrame);
  }

  return {
    start() {
      if (running) return;
      running = true;
      clock.start();
      frame = requestAnimationFrame(renderFrame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frame);
    },
    dispose() {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      resizeObserver.disconnect();
      strands.forEach((strand) => strand.line.geometry.dispose());
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      glowTexture.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
