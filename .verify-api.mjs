// One-off verifier: every frontend http.*() call site must resolve to a real backend route.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const backend = new Set(
  readFileSync('.be_norm.txt', 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.toLowerCase()),
);

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(p) && !p.includes('lib/mock-api')) files.push(p);
  }
})('src');

const norm = (s) =>
  s
    .replace(/\$\{[^}]*\}/g, ':p')
    .replace(/^\/api\//, '')
    .replace(/^\//, '')
    .split('?')[0]
    .replace(/\/+$/, '')
    .toLowerCase();

// Match: http.get<...>('path')  /  http.post<...>(`path`)  /  apiClient.*
const RE = /http\.(get|post|put|patch|delete|upload)\s*(?:<[^>]*>)?\s*\(\s*[`'"]([^`'"]+)/g;

let total = 0;
const misses = [];
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  let m;
  while ((m = RE.exec(src))) {
    total++;
    const method = m[1].toUpperCase();
    const path = norm(m[2]);
    const hit = [...backend].some((b) => b === `${method.toLowerCase()} api/${path}`);
    if (!hit) misses.push(`${method} ${m[2]}  (${f})`);
  }
}

console.log(`call sites scanned: ${total}`);
console.log(`unmatched: ${misses.length}`);
for (const x of misses) console.log('  MISS', x);
