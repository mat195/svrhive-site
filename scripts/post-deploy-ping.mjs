// Foundation Rule 5 — AUTOPILOT_ALLOWLIST gate.
// Post-deploy, Silk MAY ping machine-facing endpoints (IndexNow, Search Console
// ping) — but ONLY those explicitly named in AUTOPILOT_ALLOWLIST. Default empty
// => this is a no-op. Silk never posts to human-facing services. Read-only to
// the outside world otherwise (OUTREACH_ENABLED stays false).

const allow = (process.env.AUTOPILOT_ALLOWLIST ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (allow.length === 0) {
  console.log('[post-deploy] AUTOPILOT_ALLOWLIST empty — no endpoints pinged (by design).');
  process.exit(0);
}

// Known machine-facing endpoints we may support once allowlisted. Nothing here
// runs unless its key is present in the allowlist.
const KNOWN = {
  indexnow: async () => {
    console.log('[post-deploy] indexnow allowlisted — TODO: implement IndexNow submit (Brief: Corpus Foundry).');
  },
  'search-console': async () => {
    console.log('[post-deploy] search-console allowlisted — TODO: implement sitemap ping (Brief: Corpus Foundry).');
  },
};

for (const key of allow) {
  const fn = KNOWN[key];
  if (!fn) {
    console.warn(`[post-deploy] allowlisted "${key}" is not a known endpoint — skipping.`);
    continue;
  }
  await fn();
}
