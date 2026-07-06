// Validate JSON-LD on every built page. Fails CI (exit 1) on any invalid or
// missing structured data. Also asserts the artist page sameAs matches the
// entity link graph exactly (acceptance criterion).
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const entity = JSON.parse(readFileSync(resolve(__dirname, '..', 'src', 'data', 'entity.json'), 'utf8'));

if (!existsSync(DIST)) {
  console.error('✗ dist/ not found — run build first.');
  process.exit(1);
}

const htmlFiles = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (extname(p) === '.html') htmlFiles.push(p);
  }
})(DIST);

const errors = [];
const LD_RE = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

/** Collect all @type strings from a graph doc. */
function typesOf(doc) {
  const nodes = Array.isArray(doc['@graph']) ? doc['@graph'] : [doc];
  return nodes.map((n) => n['@type']).filter(Boolean);
}

let artistChecked = false;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const rel = file.slice(DIST.length);
  const blocks = [...html.matchAll(LD_RE)].map((m) => m[1]);

  if (blocks.length === 0) {
    errors.push(`${rel}: no JSON-LD block`);
    continue;
  }

  const allTypes = [];
  for (const raw of blocks) {
    let doc;
    try {
      doc = JSON.parse(raw);
    } catch (e) {
      errors.push(`${rel}: JSON-LD parse error — ${e.message}`);
      continue;
    }
    if (doc['@context'] !== 'https://schema.org') {
      errors.push(`${rel}: @context is not https://schema.org`);
    }
    const nodes = Array.isArray(doc['@graph']) ? doc['@graph'] : [doc];
    for (const n of nodes) {
      if (!n['@type']) errors.push(`${rel}: a node is missing @type`);
    }
    allTypes.push(...typesOf(doc));
  }

  // Page-specific required types.
  const need = (t) => {
    if (!allTypes.includes(t)) errors.push(`${rel}: missing required @type ${t}`);
  };
  need('BreadcrumbList');
  if (rel === '/index.html') {
    need('WebSite');
    need('MusicGroup');
  }
  if (rel.includes('/lucius-p-thundercat/releases/')) {
    if (!allTypes.some((t) => t === 'MusicRecording' || t === 'MusicAlbum')) {
      errors.push(`${rel}: missing MusicRecording/MusicAlbum`);
    }
  }

  // Artist page: sameAs must equal the entity link graph exactly.
  if (rel === '/lucius-p-thundercat/index.html') {
    artistChecked = true;
    const doc = JSON.parse(blocks.find((b) => b.includes('musicgroup')) ?? blocks[0]);
    const nodes = Array.isArray(doc['@graph']) ? doc['@graph'] : [doc];
    const mg = nodes.find((n) => n['@type'] === 'MusicGroup' && String(n['@id']).includes('#musicgroup'));
    const sameAs = (mg && mg.sameAs) || [];
    const expected = entity.links.map((l) => l.url);
    const a = [...sameAs].sort().join('|');
    const b = [...expected].sort().join('|');
    if (a !== b) {
      errors.push(`/lucius-p-thundercat/: sameAs (${sameAs.length}) != entity links (${expected.length})`);
    }
  }
}

if (!artistChecked) errors.push('artist page /lucius-p-thundercat/index.html not found');

if (errors.length) {
  console.error(`✗ validate-schema: ${errors.length} problem(s):`);
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}
console.log(`✓ validate-schema: ${htmlFiles.length} pages, JSON-LD valid, sameAs matches entity link graph.`);
