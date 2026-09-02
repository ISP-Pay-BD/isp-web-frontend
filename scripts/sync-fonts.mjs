/**
 * Copy font woff2 files from @fontsource packages → public/fonts/{family}/
 * Run after pnpm install: pnpm fonts:sync
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const nm = join(root, 'node_modules');
const fonts = join(root, 'public', 'fonts');

const copies: Array<{ src: string; dest: string }> = [
  {
    src: '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
    dest: 'inter/inter-latin.woff2',
  },
  {
    src: '@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2',
    dest: 'plus-jakarta-sans/plus-jakarta-sans-latin.woff2',
  },
  ...([400, 500, 600, 700] as const).flatMap((w) => [
    {
      src: `@fontsource/noto-sans-bengali/files/noto-sans-bengali-bengali-${w}-normal.woff2`,
      dest: `noto-sans-bengali/noto-sans-bengali-bengali-${w}.woff2`,
    },
    {
      src: `@fontsource/noto-sans-bengali/files/noto-sans-bengali-latin-${w}-normal.woff2`,
      dest: `noto-sans-bengali/noto-sans-bengali-latin-${w}.woff2`,
    },
  ]),
  ...([400, 500] as const).map((w) => ({
    src: `@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-${w}-normal.woff2`,
    dest: `ibm-plex-mono/ibm-plex-mono-latin-${w}.woff2`,
  })),
];

let copied = 0;
for (const { src, dest } of copies) {
  const from = join(nm, src.replace('@fontsource-variable/', '@fontsource-variable/').replace('@fontsource/', '@fontsource/'));
  const resolved = join(nm, ...src.split('/'));
  const to = join(fonts, dest);
  if (!existsSync(resolved)) {
    console.warn(`⚠ skip (missing): ${src}`);
    continue;
  }
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(resolved, to);
  copied++;
  console.log(`✓ ${dest}`);
}

console.log(`\nDone — ${copied} font files in public/fonts/`);
