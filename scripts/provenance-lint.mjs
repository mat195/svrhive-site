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
// Producer language is drift ONLY when attributed to LPT himself — not when it accurately
// describes a collaborator near his name (e.g. "Nick Nigh (producer and vocalist)"). Kept in
// sync with the publish-time gate (svrhive-parlor _shared/provenance.ts).
const PRODUCE = /produc\w*/i;
const NEGATED = /\b(not|never|no|isn'?t|aren'?t)\b|n'?t\b/i;
const OTHER_BEFORE = /[A-Z][a-z]+\s+[A-Z][a-z]+|feat\.?|\bfeaturing\b|\(/;
function attributedToLPT(text) {
  let i = 0;
  while ((i = text.indexOf(NAME, i)) !== -1) {
    const clause = text.slice(i + NAME.length).split(/[.!?\n;:]/)[0];
    const p = clause.search(PRODUCE);
    if (p !== -1) {
      const before = clause.slice(0, p);
      const afterWord = clause.slice(p).replace(PRODUCE, '');
      const belongsToOther = OTHER_BEFORE.test(before) || /^\s+[A-Z][a-z]/.test(afterWord);
      if (!NEGATED.test(before) && !belongsToOther) return true;
    }
    i += NAME.length;
  }
  return false;
}

for (const f of html) {
  const rel = f.slice(DIST.length);
  // Strip tags → check visible text, aligning with the markdown gate.
  const text = readFileSync(f, 'utf8').replace(/<[^>]+>/g, ' ');
  if (attributedToLPT(text)) drift.push(`${rel}: producer language attributed to "${NAME}" — identity drift`);
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
