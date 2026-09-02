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
  'src/mocks/users',
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

  it('demo users mock exists for offline auth', () => {
    expect(existsSync(join(root, 'src/mocks/users/demo-users.mock.ts'))).toBe(true);
  });
});
