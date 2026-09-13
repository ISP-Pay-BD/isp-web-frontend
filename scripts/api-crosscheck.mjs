// API cross-check: frontend http.* call sites vs backend route table.
// Usage: node scripts/api-crosscheck.mjs /tmp/backend_routes.txt
// Backend rows: "GET api/v1/reseller/areas/([0-9]+)/delete" (CodeIgniter regex routes)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const backendFile = process.argv[2] ?? '/tmp/backend_routes.txt';
const SRC = join(process.cwd(), 'src');

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(extname(p))) out.push(p);
  }
  return out;
}

const files = walk(SRC);
const calls = new Map(); // "METHOD path" -> first file

// Match http.get(`/v1/...` etc. — single line, template or quoted string first arg.
// Generic type args may nest: http.get<Record<string, unknown>>(...) — allow one nesting level.
const re = /\bhttp\.(get|post|put|patch|delete|upload)\s*(?:<(?:[^<>]|<[^<>]*>)*>)?\(\s*(['"`])(\/[^'"`\n]{2,})\2/g;

// Normalize a frontend path: ${...} -> :param, drop query part, collapse params.
function normalize(p) {
  let s = p.replace(/\$\{[^}]*\}/g, ':p');
  s = s.split('?')[0];
  s = s.replace(/:p[^/]*/g, ':p'); // cleanup string-concat remnants glued to :p
  s = s.replace(/\/:p/g, '/:id');
  return s;
}

// Module-level string constants: const AUTH_LOGIN = '/v1/auth/login';
// Resolved per-file so call sites using constants count as static literals.
const CONST_RE = /(?:const|let|var)\s+([A-Z][A-Z0-9_]*)\s*=\s*(['"`])(\/[^'"`\n]{2,})\2/g;

for (const f of files) {
  const text = readFileSync(f, 'utf8');
  const consts = new Map();
  let cm;
  while ((cm = CONST_RE.exec(text))) consts.set(cm[1], cm[3]);

  let m;
  while ((m = re.exec(text))) {
    const method = m[1] === 'upload' ? 'post' : m[1];
    let raw = m[3];
    // Resolve bare constant references used as the URL argument
    if (raw === m[3]) {
      // already a literal
    }
    const path = normalize(raw);
    if (!path.startsWith('/')) continue;
    const key = `${method.toUpperCase()} ${path}`;
    if (!calls.has(key)) calls.set(key, f.replace(process.cwd() + '/', ''));
  }

  // Constant-argument call sites: http.post(AUTH_LOGIN, ...)
  const reConst = /\bhttp\.(get|post|put|patch|delete|upload)\s*(?:<(?:[^<>]|<[^<>]*>)*>)?\(\s*([A-Z][A-Z0-9_]*)\s*[,)]/g;
  let km;
  while ((km = reConst.exec(text))) {
    const method = km[1] === 'upload' ? 'post' : km[1];
    const value = consts.get(km[2]);
    if (!value) continue;
    const path = normalize(value);
    if (!path.startsWith('/')) continue;
    const key = `${method.toUpperCase()} ${path}`;
    if (!calls.has(key)) calls.set(key, f.replace(process.cwd() + '/', ''));
  }
}

// --- Backend: segment-based pattern per route ---
// "GET api/v1/reseller/areas/([0-9]+)/delete" -> segments ["v1","reseller","areas",":param","delete"]
function backendSegments(route) {
  const p = route
    .replace(/^api/, '')
    // Replace known CodeIgniter param patterns BEFORE splitting — some contain '/'
    .replace(/\(\[\^\/\]\+\?\)/g, ':param') // ([^/]+?)
    .replace(/\(\[\^\/\]\+\)/g, ':param') // ([^/]+)
    .replace(/\(\[0-9\]\+\)\??/g, ':param') // ([0-9]+) / ([0-9]+?)
    .replace(/\(\.\*\)/g, ':param') // (.*)
    .replace(/\(:any\)/g, ':param')
    .replace(/\(:segment\)/g, ':param')
    .replace(/\(:num\)/g, ':param');
  return p
    .split('/')
    .filter(Boolean)
    .map((seg) => (/^\(.*\)$/.test(seg) ? ':param' : seg));
}

const backendRoutes = []; // { method, segs, raw }
for (const line of readFileSync(backendFile, 'utf8').split('\n')) {
  const l = line.trim();
  if (!l) continue;
  const mm = l.match(/^([A-Z|]+)\s+(api\/\S+)$/);
  if (!mm) continue;
  const segs = backendSegments(mm[2]);
  for (const mth of mm[1].split('|')) {
    if (!mth) continue;
    backendRoutes.push({ method: mth, segs, raw: mm[2] });
  }
}

// Match: frontend call "GET /v1/reseller/areas/:id" matches backend segs when every
// non-param segment equals and call has no extra static segments (backend may accept
// fewer params than the call provides, e.g. optional trailing params).
function callMatchesBackend(method, path, route) {
  if (route.method !== method) return false;
  const callSegs = path.split('/').filter(Boolean);
  let pi = 0;
  for (let i = 0; i < route.segs.length; i++) {
    const rs = route.segs[i];
    if (rs === ':param') {
      if (i === route.segs.length - 1) return pi < callSegs.length; // trailing param eats the rest
      const nextStatic = route.segs[i + 1];
      if (nextStatic === ':param') {
        // consecutive params: each consumes exactly one call segment
        if (pi >= callSegs.length) return false;
        pi++;
        continue;
      }
      // param run ends at next static segment
      let j = pi;
      while (j < callSegs.length && callSegs[j] !== nextStatic) j++;
      if (j === pi || j >= callSegs.length) return false;
      pi = j;
      continue;
    }
    if (callSegs[pi] !== rs) return false;
    pi++;
  }
  return pi === callSegs.length || route.segs[route.segs.length - 1] === ':param';
}

const unmatched = [];
for (const [key, file] of calls) {
  const [method, path] = key.split(' ');
  const ok = backendRoutes.some((r) => callMatchesBackend(method, path, r));
  if (!ok) unmatched.push(`${key}  (${file})`);
}

console.log(`Frontend distinct call sites: ${calls.size}`);
console.log(`Unmatched frontend calls: ${unmatched.length}`);
for (const u of unmatched.sort()) console.log('  UNMATCHED:', u);

// --- Backend leaves never matched by any frontend call (prefix-aware) ---
const usedPaths = [...calls.keys()].map((k) => k.split(' ')[1]);
const unconsumed = [];
for (const r of backendRoutes) {
  const staticPrefix = r.segs.slice(0, r.segs.findIndex((s) => s === ':param') === -1 ? r.segs.length : r.segs.findIndex((s) => s === ':param'));
  const prefixStr = '/' + staticPrefix.join('/');
  const consumed = usedPaths.some((p) => p.startsWith(prefixStr) || prefixStr.startsWith(p));
  if (!consumed) unconsumed.push(`${r.method} ${r.raw}`);
}
const uniqUnconsumed = [...new Set(unconsumed)];
console.log(`\nBackend routes not matched by any frontend call: ${uniqUnconsumed.length}`);
for (const u of uniqUnconsumed.sort()) console.log('  UNUSED:', u);
