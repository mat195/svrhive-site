# svrhive-site — silkvelvetrecords.com

The machine-layer home for **Silk Velvet Records** and **Lucius P. Thundercat**.
Schema-native, statically rendered with **Astro**, **zero client JS** required to
read any content. Deployed to GitHub Pages.

## Principles

- **One fact source.** Every fact on the site comes from the machine-readable
  JSON block in `docs/LUCIUS_ENTITY_MASTER.md` in the **svrhive** repo. Nothing is
  hand-typed into a page. Unknown fields are **omitted, never placeheld**.
- **Canonical name from one constant.** `Lucius P. Thundercat` renders from
  `CANONICAL_NAME` (`src/lib/entity.ts`) everywhere — never abbreviated.
- **Provenance.** A fact reaches the site only if it satisfies the entity
  master's Provenance rule. The 100-word bio is held (`bio100: null`) until Mat
  approves a clean version, so no unapproved copy ships.
- **No tracking, no cookies, no forms.** System fonts only → no third-party
  requests → no cookie banner needed.

## How facts flow (the only way to change the site)

```
docs/LUCIUS_ENTITY_MASTER.md (svrhive repo)   ← edit the ```json block here
        │  npm run sync   (scripts/sync-entity.mjs extracts the block)
        ▼
src/data/entity.json (committed snapshot)      ← what CI builds from
        │  astro build
        ▼
dist/ (static HTML + JSON-LD)                  ← deployed to Pages
```

To update facts:
1. Edit the JSON block in `docs/LUCIUS_ENTITY_MASTER.md` (in the sibling `svrhive` repo).
2. In this repo: `npm run sync` (reads `../svrhive/...`, or `ENTITY_MASTER_PATH`).
3. Commit the changed `src/data/entity.json` and push. CI rebuilds and redeploys.

_(CI builds from the committed `entity.json` snapshot — it does not reach into the
private `svrhive` repo. `npm run sync` is the bridge; run it before committing.)_

## Commands

```bash
npm install
npm run sync            # refresh entity.json from the entity master
npm run dev             # local dev server
npm run build           # prebuild sync + astro build → dist/
npm run validate:schema # fail on invalid JSON-LD / sameAs drift (runs in CI)
npm run check:secrets   # fail if any key-shaped string is in src/public/dist
npm run preview         # serve the built dist/
```

## Pages (v1)

| Path | Schema |
|------|--------|
| `/` | Organization (MusicGroup label) + WebSite + MusicGroup (artist) + BreadcrumbList |
| `/lucius-p-thundercat/` | MusicGroup with full `sameAs` link graph + BreadcrumbList |
| `/lucius-p-thundercat/releases/<slug>/` | MusicRecording/MusicAlbum, `byArtist` + label linked |
| `/contact/` | Organization + BreadcrumbList (email only, no forms) |
| `/notes/` | Empty collection scaffold (Corpus Foundry publishes here later) |

Also generated: `robots.txt` (answer-engine crawlers welcomed), `sitemap-index.xml`,
`llms.txt`.

## CI gates (all must pass to deploy)

- **Build** — Astro static build.
- **validate:schema** — every page has valid JSON-LD; artist-page `sameAs` equals
  the entity link graph exactly; required types present per page.
- **check:secrets** — no service/LLM key anywhere in `src`/`public`/`dist`.
- **Lighthouse** (`lighthouse.yml`) — performance / SEO / accessibility ≥ 0.95.

## Spot-check protocol (zero un-sourced facts)

For any fact visible on the site:
1. Open `docs/LUCIUS_ENTITY_MASTER.md` → the machine-readable JSON block.
2. Confirm the exact value is present there (name, link URL, release title, date).
3. Confirm that value traces to the Provenance rule (Mat, a URL, or a Mat file).

Fast checks:
- **Links:** every `sameAs` URL on the artist page must be a row in the entity
  master's §5 link graph (CI enforces exact-match).
- **Releases:** every release page corresponds to a §6 discography entry.
- **Bio:** the artist page shows the approved bio only if `bio100` is non-null;
  otherwise a descriptor assembled purely from locked canonical fields.

## DNS records (Mat pastes at the registrar)

Custom domain is set in `public/CNAME` = `silkvelvetrecords.com`.

**Apex `silkvelvetrecords.com` → GitHub Pages (A + AAAA):**

| Type | Host | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |

**`www` → Pages:**

| Type | Host | Value |
|------|------|-------|
| CNAME | www | mat195.github.io. |

**Reserved for Phase C (the Parlor) — do not use yet:**

| Type | Host | Value |
|------|------|-------|
| CNAME | hive | mat195.github.io. |

After DNS propagates, enable **Enforce HTTPS** in the repo's Pages settings.

## Autopilot / outreach flags

- `OUTREACH_ENABLED` = **false** (Silk never posts/sends). Enforced by design.
- `AUTOPILOT_ALLOWLIST` (repo Actions **variable**, default empty) — may later name
  machine-facing endpoints (IndexNow, Search Console) the post-deploy step may
  ping. Empty = `scripts/post-deploy-ping.mjs` is a no-op. No human-facing sends.

## Stack

Astro 5 (static), `@astrojs/sitemap`. Node 20+. No runtime JS shipped.
