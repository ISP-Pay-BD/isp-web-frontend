import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { getMessage, interpolate, messages } from '@/i18n';

/**
 * Portal screens call `t('area.screen.key', 'English fallback')`. English lives at the call site; the Bangla for
 * every literal key must exist in src/i18n/messages/bn/*.json, otherwise a Bangla user would silently see English.
 */
const root = process.cwd();

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(name) ? [full] : [];
  });
}

const SCOPES = [
  'src/features/customer',
  'src/features/employee',
  'src/features/admin',
  'src/features/platform',
  'src/features/shared',
  'src/features/auth',
  'src/components/layout',
  'src/components/shared',
];

const usages: { key: string; file: string }[] = [];
for (const scope of SCOPES) {
  for (const file of sourceFiles(join(root, scope))) {
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(/(?<![\w.$])t\(\s*(['"`])([A-Za-z0-9_.]+)\1/g)) {
      usages.push({ key: m[2], file: relative(root, file) });
    }
  }
}

describe('i18n / Bangla coverage', () => {
  it('finds translated keys in the portals', () => {
    expect(usages.length).toBeGreaterThan(0);
  });

  it('has a Bangla message for every literal t() key', () => {
    const missing = usages.filter((u) => getMessage('bn', u.key) === u.key).map((u) => `${u.file}: ${u.key}`);
    expect([...new Set(missing)]).toEqual([]);
  });

  it('keeps {placeholders} identical between the Bangla message and its English fallback', () => {
    const bad: string[] = [];
    for (const file of new Set(usages.map((u) => u.file))) {
      const src = readFileSync(join(root, file), 'utf8');
      for (const m of src.matchAll(/(?<![\w.$])t\(\s*(['"`])([A-Za-z0-9_.]+)\1\s*,\s*(['"`])((?:(?!\3).)*)\3/g)) {
        const bn = getMessage('bn', m[2]);
        if (bn === m[2]) continue;
        const names = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(',');
        if (names(bn) !== names(m[4])) bad.push(`${file}: ${m[2]}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('merges the per-area Bangla files without losing the base messages', () => {
    expect(getMessage('bn', 'common.save')).not.toBe('common.save');
    expect(messages.bn).toBeTypeOf('object');
  });

  it('fills {placeholders}', () => {
    expect(interpolate('{n} days left', { n: 3 })).toBe('3 days left');
    expect(interpolate('{n} days left')).toBe('{n} days left');
  });
});
