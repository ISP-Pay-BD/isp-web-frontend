import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * UI/UX ratchets (docs/uiux-update). Each rule was fixed across the portals once; these tests keep the bad
 * pattern from coming back. Marketing is out of scope: its mock-ups use deliberately small text.
 */
const root = process.cwd();

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return tsxFiles(full);
    return full.endsWith('.tsx') ? [full] : [];
  });
}

const PORTAL_DIRS = [
  'src/features/admin',
  'src/features/customer',
  'src/features/platform',
  'src/features/employee',
  'src/features/shared',
  'src/features/auth',
  'src/components/layout',
  'src/components/shared',
  'src/components/ui',
  'src/app',
];

const files = PORTAL_DIRS.flatMap((d) => tsxFiles(join(root, d))).map((f) => ({
  rel: relative(root, f),
  src: readFileSync(f, 'utf8'),
}));

const offenders = (test: (f: { rel: string; src: string }) => boolean) => files.filter(test).map((f) => f.rel);

describe('ui ratchets / text and markup', () => {
  it('has no text below 12px (text-[9px|10px|11px])', () => {
    expect(offenders((f) => /text-\[(9|10|11)px\]/.test(f.src))).toEqual([]);
  });

  it('never nests a <Button> inside a <Link> (use <Button render={<Link />}>)', () => {
    expect(offenders((f) => /<Link\b[^>]*>\s*<Button\b/.test(f.src))).toEqual([]);
  });

  it('navigates with links, not onClick={() => router.push(...)}', () => {
    expect(offenders((f) => /onClick=\{\(\) => router\.push\(/.test(f.src))).toEqual([]);
  });

  it('does not use transition-all', () => {
    expect(offenders((f) => /\btransition-all\b/.test(f.src))).toEqual([]);
  });
});

describe('ui ratchets / accessibility', () => {
  // dialog, sheet and sidebar trigger buttons carry an sr-only label inside instead
  const SR_ONLY = ['src/components/ui/dialog.tsx', 'src/components/ui/sheet.tsx', 'src/components/ui/sidebar.tsx'];

  it('labels every icon-only Button (aria-label or title)', () => {
    const bad: string[] = [];
    for (const f of files) {
      if (SR_ONLY.includes(f.rel)) continue;
      for (const m of f.src.matchAll(/<Button\b((?:[^>{]|\{(?:[^{}]|\{[^{}]*\})*\})*)>/g)) {
        if (/size="icon[^"]*"/.test(m[1]) && !/aria-label|title=/.test(m[1])) bad.push(`${f.rel}: ${m[0].slice(0, 80)}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('ui ratchets / consistent data display', () => {
  it('formats numbers and money with the shared formatters (no bare .toLocaleString())', () => {
    expect(offenders((f) => /\.toLocaleString\(\)/.test(f.src))).toEqual([]);
  });

  it('colours status badges through <Badge tone> or <StatusBadge>, not hand-picked classes', () => {
    expect(
      offenders((f) => /<Badge\b[^>]*\b(?:bg|text|border)-(?:emerald|rose|amber|red|green|sky|blue|yellow|orange)-\d/.test(f.src)),
    ).toEqual([]);
  });
});
