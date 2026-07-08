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
  // Public /notes/ index and the old public /press/ page are gone (redirect home). The
  // press kit now lives unlisted at /kit/ (internal tool, noindex, not in nav/sitemap).
  redirects: { '/notes': '/', '/notes/': '/', '/press': '/', '/press/': '/' },
  // Sitemap keeps every individual corpus page; excludes the /notes/ stub and the private /kit/.
  integrations: [sitemap({ filter: (page) => page !== `${SITE}/notes/` && !page.startsWith(`${SITE}/kit`) })],
  build: { format: 'directory' },
});
