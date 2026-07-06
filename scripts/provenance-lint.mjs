// Provenance linter — turns identity doctrine into physics. Fails the build if
// any rendered page describes Lucius P. Thundercat with producer language, or if
// the artist page loses its rapper/vocalist identity. Runs in CI after build.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const entity = JSON.parse(readFileSync(resolve(__dirname, '..', 'src', 'data', 'entity.json'), 'utf8'));
const NAME = entity.canonicalName; // "Lucius P. Thundercat"

if (!existsSync(DIST)) { console.error('✗ dist/ not found — build first.'); process.exit(1); }

const html = [];
(function walk(d) { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else if (extname(p) === '.html') html.push(p); } })(DIST);

const drift = [];
const PRODUCE = /produc(e|es|er|ers|ing|tion)/i;
const ALLOW = /(not|never|n't)\s+produc/i; // e.g. "does not produce" (shouldn't be public, but don't false-flag)

for (const f of html) {
  const rel = f.slice(DIST.length);
  const text = readFileSync(f, 'utf8');
  // Producer language in the vicinity of the canonical name = identity drift.
  let i = 0;
  while ((i = text.indexOf(NAME, i)) !== -1) {
    const win = text.slice(Math.max(0, i - 60), i + 200);
    if (PRODUCE.test(win) && !ALLOW.test(win)) {
      drift.push(`${rel}: producer language near "${NAME}" — identity drift`);
      break;
    }
    i += NAME.length;
  }
  // The blanket red-flag phrase must never appear on our own site.
  if (/hip[- ]hop producer/i.test(text)) drift.push(`${rel}: contains the phrase "hip-hop producer"`);
}

// Positive check: the artist page must still assert the rapper/vocalist identity.
const artist = html.find((f) => f.endsWith('/lucius-p-thundercat/index.html'));
if (!artist) drift.push('artist page missing');
else if (!/rapper and vocalist/i.test(readFileSync(artist, 'utf8'))) {
  drift.push('artist page no longer asserts "rapper and vocalist"');
}

if (drift.length) {
  console.error(`✗ provenance-lint: ${drift.length} identity-drift issue(s):`);
  for (const d of [...new Set(drift)]) console.error('  ' + d);
  process.exit(1);
}
console.log(`✓ provenance-lint: ${html.length} pages, no producer-identity drift; artist identity intact.`);
