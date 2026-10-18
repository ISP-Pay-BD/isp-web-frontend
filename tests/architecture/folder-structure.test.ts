import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();

const requiredPaths = [
  'src/app',
  'src/features',
  'src/components/ui',
  'src/components/layout',
  'src/components/shared',
  'src/lib/api',
  'src/lib/permissions',
  'src/data/marketing',
  'src/stores',
  'src/config',
  'src/types',
  'tests/architecture',
  'tests/unit',
  'tests/setup',
  'docs',
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

describe('architecture / folder structure', () => {
  it('has all required top-level architecture folders', () => {
    for (const relativePath of requiredPaths) {
      expect(existsSync(join(root, relativePath)), `missing: ${relativePath}`).toBe(true);
    }
  });

  it('keeps tests outside src/app', () => {
    expect(existsSync(join(root, 'tests'))).toBe(true);
    expect(existsSync(join(root, 'src/app'))).toBe(true);
    expect(existsSync(join(root, 'tests/architecture'))).toBe(true);
  });
});

/**
 * Every portal screen reads the zapi backend. The only static content left is
 * the marketing site copy in src/data/marketing; the mock API layer and the
 * dummy datasets are gone and must not come back.
 */
describe('architecture / live data boundary', () => {
  const files = sourceFiles(join(root, 'src')).filter((f) => !relative(root, f).startsWith('src/data/'));

  it('has no mock API layer', () => {
    expect(existsSync(join(root, 'src/lib/mock-api'))).toBe(false);
  });

  it('never imports mock data or the mock client', () => {
    const offenders = files.filter((f) => /mock-api|mockFetch/.test(readFileSync(f, 'utf8')));
    expect(offenders.map((f) => relative(root, f))).toEqual([]);
  });

  it('imports static data only from the marketing site content', () => {
    const offenders = files.filter((f) => {
      const imports = readFileSync(f, 'utf8').match(/from ['"]@\/data\/[^'"]+['"]/g) ?? [];
      return imports.some((i) => !i.includes('@/data/marketing/'));
    });
    expect(offenders.map((f) => relative(root, f))).toEqual([]);
  });

  it('keeps marketing content out of the portals', () => {
    const portalFiles = files.filter((f) =>
      /^src\/(features\/(admin|customer|employee|platform)|lib\/api|stores)\//.test(relative(root, f)),
    );
    const offenders = portalFiles.filter((f) => /from ['"]@\/data\//.test(readFileSync(f, 'utf8')));
    expect(offenders.map((f) => relative(root, f))).toEqual([]);
  });
});
