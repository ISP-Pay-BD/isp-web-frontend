import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The landing's illustration set: small isometric ISP scenes drawn from code, so every one shares the
 * same projection, light direction and palette. Faces are coloured by the `.il-*` classes in
 * globals.css, mixed from the landing tokens. All are decorative (`aria-hidden`); the text beside
 * them carries the meaning.
 */

type P3 = [number, number, number];

const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;

/** World (x right-down, y left-down, z up) to screen, with the scene centred in a 120×120 box. */
function iso([x, y, z]: P3): [number, number] {
  return [60 + (x - y) * COS, 62 + (x + y) * SIN - z];
}

function points(...p: P3[]): string {
  return p
    .map((q) =>
      iso(q)
        .map((n) => n.toFixed(2))
        .join(','),
    )
    .join(' ');
}

function at(p: P3): string {
  return iso(p)
    .map((n) => n.toFixed(2))
    .join(',');
}

type Tone = 'brand' | 'ink' | 'paper' | 'silver' | 'accent';

const FACES: Record<Tone, [string, string, string]> = {
  brand: ['il-brand-top', 'il-brand-left', 'il-brand-right'],
  ink: ['il-ink-top', 'il-ink-left', 'il-ink-right'],
  paper: ['il-paper-top', 'il-paper-left', 'il-paper-right'],
  silver: ['il-silver-top', 'il-silver-left', 'il-silver-right'],
  accent: ['il-accent', 'il-accent-left', 'il-accent-right'],
};

/** A cuboid: its top and the two faces that turn toward the viewer. */
function Box({
  at: [x, y, z],
  size: [w, d, h],
  tone = 'brand',
}: {
  at: P3;
  size: P3;
  tone?: Tone;
}) {
  const [top, left, right] = FACES[tone];
  return (
    <g className="il-edge">
      <polygon
        className={left}
        points={points([x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h])}
      />
      <polygon
        className={right}
        points={points([x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h])}
      />
      <polygon
        className={top}
        points={points([x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h])}
      />
    </g>
  );
}

/** A flat quad lying on a top surface (z): screens, labels, plates. */
function Flat({
  at: [x, y, z],
  size: [w, d],
  className,
}: {
  at: P3;
  size: [number, number];
  className: string;
}) {
  return (
    <polygon
      className={className}
      points={points([x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z])}
    />
  );
}

/** A quad on the plane x = const (the right-facing side): a screen standing up. */
function Wall({
  at: [x, y, z],
  size: [d, h],
  className,
}: {
  at: P3;
  size: [number, number];
  className: string;
}) {
  return (
    <polygon
      className={className}
      points={points([x, y, z], [x, y + d, z], [x, y + d, z + h], [x, y, z + h])}
    />
  );
}

/** A quad on the plane y = const (the left-facing front): ports, LEDs, doors. */
function Front({
  at: [x, y, z],
  size: [w, h],
  className,
}: {
  at: P3;
  size: [number, number];
  className: string;
}) {
  return (
    <polygon
      className={className}
      points={points([x, y, z], [x + w, y, z], [x + w, y, z + h], [x, y, z + h])}
    />
  );
}

/** An upright cylinder (a coin when short, a stack when tall). A ground circle projects to an ellipse. */
function Cylinder({
  at: [x, y, z],
  r,
  h,
  tone = 'silver',
}: {
  at: P3;
  r: number;
  h: number;
  tone?: Tone;
}) {
  const [top, left] = FACES[tone];
  const rx = r * Math.SQRT2 * COS;
  const ry = r * Math.SQRT2 * SIN;
  const [cx, cyBottom] = iso([x, y, z]);
  const cyTop = cyBottom - h;
  return (
    <g className="il-edge">
      <path
        className={left}
        d={`M${cx - rx},${cyTop} L${cx - rx},${cyBottom} A${rx},${ry} 0 0 0 ${cx + rx},${cyBottom} L${cx + rx},${cyTop} Z`}
      />
      <ellipse className={top} cx={cx} cy={cyTop} rx={rx} ry={ry} />
    </g>
  );
}

/** A small house: walls, a pitched roof (ridge along x) and a lit door. */
function House({ at: [x, y, z], size: [w, d, h] }: { at: P3; size: P3 }) {
  const r = 7;
  const mid = y + d / 2;
  return (
    <g>
      <Box at={[x, y, z]} size={[w, d, h]} tone="paper" />
      <g className="il-edge">
        <polygon
          className="il-brand-top"
          points={points(
            [x, y, z + h],
            [x + w, y, z + h],
            [x + w, mid, z + h + r],
            [x, mid, z + h + r],
          )}
        />
        <polygon
          className="il-brand-right"
          points={points([x + w, y, z + h], [x + w, y + d, z + h], [x + w, mid, z + h + r])}
        />
        <polygon
          className="il-brand-left"
          points={points(
            [x, y + d, z + h],
            [x + w, y + d, z + h],
            [x + w, mid, z + h + r],
            [x, mid, z + h + r],
          )}
        />
      </g>
      <Front at={[x + w / 2 - 2, y + d + 0.1, z]} size={[4, 6.5]} className="il-accent" />
    </g>
  );
}

/** The soft contact shadow every object sits on. */
function Shadow({ at: p, rx, ry }: { at: P3; rx: number; ry: number }) {
  const [cx, cy] = iso(p);
  return <ellipse className="il-shadow" cx={cx} cy={cy} rx={rx} ry={ry} />;
}

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={cn('size-24 shrink-0', className)}>
      {children}
    </svg>
  );
}

type IlProps = { className?: string };

/* ── The set ──────────────────────────────────────────────────────────────────────────── */

/** MikroTik router: a wide box, five ports with LEDs on the front, two antennas. `lit` turns the LEDs green. */
export function RouterIllustration({ className, lit = false }: IlProps & { lit?: boolean }) {
  return (
    <Frame className={className}>
      <Shadow at={[0, 0, 0]} rx={46} ry={18} />
      <Box at={[-28, -12, 12]} size={[2.5, 2.5, 22]} tone="silver" />
      <Box at={[25, -12, 12]} size={[2.5, 2.5, 22]} tone="silver" />
      <Box at={[-30, -14, 0]} size={[60, 28, 12]} tone="ink" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <Front at={[-25 + i * 10, 14.1, 2.5]} size={[7, 5]} className="il-screen" />
          <Front
            at={[-23.5 + i * 10, 14.15, 8.6]}
            size={[3, 1.6]}
            className={lit ? 'il-ok' : i === 0 ? 'il-accent' : 'il-soft-strong'}
          />
        </g>
      ))}
      <Flat at={[-24, -8, 12.1]} size={[14, 6]} className="il-accent" />
    </Frame>
  );
}

/** OLT / server rack: three stacked units with status LEDs. */
export function ServerIllustration({ className }: IlProps) {
  return (
    <Frame className={className}>
      <Shadow at={[0, 0, 0]} rx={36} ry={16} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Box at={[-20, -16, i * 13]} size={[40, 32, 11]} tone="ink" />
          {[0, 1, 2, 3].map((j) => (
            <Front
              key={j}
              at={[-15 + j * 6, 16.1, i * 13 + 4.5]}
              size={[3.5, 2]}
              className={i === 2 && j === 0 ? 'il-accent' : 'il-ok'}
            />
          ))}
          <Front at={[6, 16.1, i * 13 + 3]} size={[10, 5]} className="il-screen" />
        </g>
      ))}
    </Frame>
  );
}

/** Mobile payment: a phone standing up, a confirmed-payment badge signalling into it. */
export function PhonePayIllustration({ className }: IlProps) {
  return (
    <Frame className={className}>
      <Shadow at={[0, 0, 0]} rx={34} ry={15} />
      <Box at={[-4, -18, 0]} size={[8, 36, 60]} tone="ink" />
      <Wall at={[4.1, -15, 6]} size={[30, 48]} className="il-screen" />
      <Wall at={[4.2, -10, 40]} size={[20, 6]} className="il-accent" />
      <Wall at={[4.2, -10, 30]} size={[20, 3]} className="il-soft-strong" />
      <Wall at={[4.2, -10, 24]} size={[14, 3]} className="il-soft-strong" />
      <path
        className="il-line-accent"
        d={`M${at([30, 26, 28])} Q${at([22, 30, 14])} ${at([10, 18, 18])}`}
      />
      <Cylinder at={[24, 20, 34]} r={9} h={3} tone="accent" />
      <polyline
        className="il-tick"
        points={`${at([19, 20, 37.5])} ${at([23, 24, 37.5])} ${at([30, 16, 37.5])}`}
      />
    </Frame>
  );
}

/** Billing matched: an invoice with line items and a check stamp. */
export function InvoiceIllustration({ className }: IlProps) {
  return (
    <Frame className={className}>
      <Shadow at={[0, 0, 0]} rx={40} ry={17} />
      <Box at={[-22, -30, 0]} size={[44, 60, 3]} tone="paper" />
      <Flat at={[-17, -25, 3.1]} size={[20, 6]} className="il-accent" />
      {[-14, -7, 0, 7].map((y, i) => (
        <g key={y}>
          <Flat at={[-17, y, 3.1]} size={[i === 3 ? 16 : 24, 3]} className="il-soft-strong" />
          <Flat at={[11, y, 3.1]} size={[6, 3]} className="il-soft-strong" />
        </g>
      ))}
      <Cylinder at={[10, 18, 3]} r={9} h={3} tone="accent" />
      <polyline
        className="il-tick"
        points={`${at([5, 18, 6.5])} ${at([9, 22, 6.5])} ${at([16, 14, 6.5])}`}
      />
    </Frame>
  );
}

/** Subscribers: three homes joined by a fiber line. */
export function HomesIllustration({ className }: IlProps) {
  return (
    <Frame className={className}>
      <Shadow at={[0, 0, 0]} rx={46} ry={19} />
      <path
        className="il-line-accent"
        d={`M${at([-24, 0, 0])} L${at([2, -10, 0])} L${at([20, 16, 0])}`}
      />
      <House at={[-2, -26, 0]} size={[16, 16, 12]} />
      <House at={[-34, -6, 0]} size={[16, 16, 12]} />
      <House at={[12, 8, 0]} size={[16, 16, 12]} />
    </Frame>
  );
}

/** ISPs on the platform: a mast with signal arcs, linked to three POP nodes. */
export function NetworkIllustration({ className }: IlProps) {
  const [cx, cy] = iso([0, 0, 40]);
  return (
    <Frame className={className}>
      <Shadow at={[0, 0, 0]} rx={44} ry={18} />
      {(
        [
          [-28, 8],
          [20, -24],
          [22, 20],
        ] as const
      ).map(([x, y]) => (
        <path
          key={`${x}${y}`}
          className="il-line-accent"
          d={`M${at([x, y, 5])} L${at([0, 0, 30])}`}
        />
      ))}
      <Cylinder at={[-28, 8, 0]} r={6} h={5} tone="brand" />
      <Cylinder at={[20, -24, 0]} r={6} h={5} tone="brand" />
      <Cylinder at={[22, 20, 0]} r={6} h={5} tone="brand" />
      <Box at={[-6, -6, 0]} size={[12, 12, 6]} tone="paper" />
      <Box at={[-1.5, -1.5, 6]} size={[3, 3, 34]} tone="silver" />
      <Cylinder at={[0, 0, 40]} r={3.5} h={2} tone="accent" />
      <path
        className="il-line-accent"
        d={`M${cx - 10},${cy - 8} q-5,8 0,16 M${cx + 10},${cy - 8} q5,8 0,16`}
      />
    </Frame>
  );
}

/** Matched and safe: a shield with a tick on a plinth. */
export function ShieldIllustration({ className }: IlProps) {
  const [cx, cy] = iso([0, 0, 40]);
  const shield = (s: number, dx = 0, dy = 0) =>
    `M${cx + dx},${cy + dy - 24 * s} L${cx + dx + 20 * s},${cy + dy - 16 * s} L${cx + dx + 18 * s},${cy + dy + 6 * s} Q${cx + dx + 14 * s},${cy + dy + 18 * s} ${cx + dx},${cy + dy + 26 * s} Q${cx + dx - 14 * s},${cy + dy + 18 * s} ${cx + dx - 18 * s},${cy + dy + 6 * s} L${cx + dx - 20 * s},${cy + dy - 16 * s} Z`;
  return (
    <Frame className={className}>
      <Shadow at={[0, 0, 0]} rx={34} ry={15} />
      <Box at={[-18, -18, 0]} size={[36, 36, 8]} tone="paper" />
      <path className="il-brand-right il-edge" d={shield(1, 4, 3)} />
      <path className="il-brand-top il-edge" d={shield(1)} />
      <path
        className="il-tick"
        d={`M${cx - 8},${cy + 1} L${cx - 2},${cy + 7} L${cx + 10},${cy - 6}`}
      />
    </Frame>
  );
}

/** Scoped permissions: a padlock. */
export function LockIllustration({ className }: IlProps) {
  return (
    <Frame className={className}>
      <Shadow at={[0, 0, 0]} rx={32} ry={14} />
      <path
        className="il-arc"
        d={`M${at([-9, 0, 22])} C${at([-9, 0, 44])} ${at([9, 0, 44])} ${at([9, 0, 22])}`}
      />
      <Box at={[-16, -10, 0]} size={[32, 20, 24]} tone="brand" />
      <Front at={[-2, 10.1, 7]} size={[4, 9]} className="il-screen" />
    </Frame>
  );
}
