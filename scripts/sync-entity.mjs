// Sync the machine-readable entity block from the svrhive entity master into
// src/data/entity.json. The entity master is the ONLY way facts change on the
// site. Runs on prebuild. If the source isn't reachable (e.g. a CI checkout
// without the submodule), the last-synced committed entity.json is kept.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'src', 'data', 'entity.json');

const CANDIDATES = [
  process.env.ENTITY_MASTER_PATH,
  resolve(__dirname, '..', 'vendor', 'svrhive', 'docs', 'LUCIUS_ENTITY_MASTER.md'),
  resolve(__dirname, '..', 'svrhive', 'docs', 'LUCIUS_ENTITY_MASTER.md'),
  resolve(__dirname, '..', '..', 'svrhive', 'docs', 'LUCIUS_ENTITY_MASTER.md'),
].filter(Boolean);

function findSource() {
  for (const p of CANDIDATES) if (p && existsSync(p)) return p;
  return null;
}

function extractBlock(md) {
  // The first ```json fence that follows the machine-readable heading.
  const idx = md.indexOf('## Machine-readable entity');
  const scope = idx === -1 ? md : md.slice(idx);
  const m = scope.match(/```json\s*([\s\S]*?)```/);
  if (!m) throw new Error('No ```json entity block found in entity master.');
  return JSON.parse(m[1]);
}

const src = findSource();
if (!src) {
  if (existsSync(OUT)) {
    console.warn('[sync-entity] Source entity master not found; keeping committed src/data/entity.json.');
    process.exit(0);
  }
  console.error('[sync-entity] Source entity master not found and no committed entity.json. Cannot build.');
  process.exit(1);
}

const data = extractBlock(readFileSync(src, 'utf8'));

// Privacy guard at the public boundary — the master may hold internal-only fields
// that must NEVER reach the PUBLIC site repo:
//  • beat provenance (producer credits) — §11, metadata not positioning
//  • real-name policy — Mat's legal name is for music-database legal-name fields ONLY
//    (submission kits), never public copy or public source.
for (const r of data.releases ?? []) delete r.producers;
delete data.realNamePolicy;

// Positioning boundary (Mat 2026-07-09): LPT's featured-artist appearances — tracks where he
// is NOT the primary artist (e.g. Nick Nigh's "Love You/Leave You") — are internal record
// only. They are NOT surfaced publicly (no release page, not in the discography or sameAs)
// until Mat decides a specific one is big enough to promote, by setting `"promote": true` on
// that release in the entity master. Everything else featured stays out of the public site.
data.releases = (data.releases ?? []).filter((r) => (r.role ?? 'primary') !== 'featured' || r.promote === true);

writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
console.log(`[sync-entity] Synced entity.json from ${src} (${data.releases?.length ?? 0} releases, ${data.links?.length ?? 0} links).`);
