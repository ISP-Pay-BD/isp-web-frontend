import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const requiredPaths = [
  'src/app',
  'src/features',
  'src/components/ui',
  'src/components/layout',
  'src/components/shared',
  'src/lib/mock-api',
  'src/lib/permissions',
  'src/data',
  'src/data/users',
  'src/data/marketing',
  'src/data/customer',
  'src/data/admin',
  'src/data/platform',
  'src/stores',
  'src/config',
  'src/types',
  'tests/architecture',
  'tests/unit',
  'tests/setup',
  'docs',
];

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

describe('architecture / mock-api boundary', () => {
  it('mock-api client exists as single data access entry', () => {
    expect(existsSync(join(root, 'src/lib/mock-api/client.ts'))).toBe(true);
  });

  it('demo users data exists for offline auth', () => {
    expect(existsSync(join(root, 'src/data/users/users.data.ts'))).toBe(true);
  });

  it('central data index exists', () => {
    expect(existsSync(join(root, 'src/data/index.ts'))).toBe(true);
  });
});
