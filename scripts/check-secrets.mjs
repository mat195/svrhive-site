// Foundation Rule 4: no service key or LLM key anywhere in the frontend/source.
// Scans source + built output for key-shaped patterns. Fails CI on any hit.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['src', 'public', 'dist'];
const SKIP_DIRS = new Set(['node_modules', '.git', '.astro']);
const SCAN_EXT = new Set(['.js', '.mjs', '.cjs', '.ts', '.astro', '.json', '.html', '.txt', '.css', '.map']);

const PATTERNS = [
  { name: 'Anthropic key', re: /sk-ant-[A-Za-z0-9_-]{10,}/ },
  { name: 'OpenAI key', re: /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/ },
  { name: 'Perplexity key', re: /pplx-[A-Za-z0-9]{20,}/ },
  { name: 'Supabase service_role literal', re: /service_role/ },
  { name: 'Supabase service JWT', re: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { name: 'sb_secret key', re: /sb_secret_[A-Za-z0-9]{10,}/ },
];

const hits = [];
function walk(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (SCAN_EXT.has(extname(p))) {
      const text = readFileSync(p, 'utf8');
      for (const { name, re } of PATTERNS) {
        if (re.test(text)) hits.push(`${p}: ${name}`);
      }
    }
  }
}

for (const r of ROOTS) walk(r);

if (hits.length) {
  console.error('✗ SECRET LEAK — key-shaped content found in frontend/source:');
  for (const h of hits) console.error('  ' + h);
  process.exit(1);
}
console.log('✓ check-secrets: no keys in src/public/dist.');
