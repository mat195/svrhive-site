// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://silkvelvetrecords.com';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  // The /notes/ INDEX is intentionally not a browsable page — a running list of corpus
  // titles reads as content-mill scale. Individual /notes/<slug>/ pages stay fully live,
  // indexable, and in the sitemap (crawlers/AI can still find + cite them); only the
  // collective listing is hidden. /notes/ redirects to the homepage.
  redirects: { '/notes': '/', '/notes/': '/' },
  // Sitemap stays complete for every individual corpus page; exclude only the /notes/
  // redirect stub itself (machine-facing file, not a human-browsable index).
  integrations: [sitemap({ filter: (page) => page !== `${SITE}/notes/` })],
  build: { format: 'directory' },
});
