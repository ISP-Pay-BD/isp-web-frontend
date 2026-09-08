const fs = require('fs');
const path = require('path');

const dir = 'src/features/admin/isp-ops/pages';
let files = 0;
let replacements = 0;

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('Page.tsx'))) {
  const p = path.join(dir, f);
  let s = fs.readFileSync(p, 'utf8');
  if (!s.includes('OpsSummaryStrip')) continue;
  const next = s.replace(/value: \{([^{}]+)\}/g, 'value: $1');
  if (next !== s) {
    fs.writeFileSync(p, next);
    files += 1;
    replacements += (s.match(/value: \{([^{}]+)\}/g) || []).length;
  }
}

console.log({ files, replacements });
