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
  redirects: {
    '/notes': '/', '/notes/': '/', '/press': '/', '/press/': '/',
    // Canonicalized 2026-07-08: the study-playlist page has one canonical slug
    // (list-10-…); the older duplicate slug redirects to it.
    '/notes/10-underground-rappers-for-a-study-playlist': '/notes/list-10-underground-rappers-for-a-study-playlist/',
    '/notes/10-underground-rappers-for-a-study-playlist/': '/notes/list-10-underground-rappers-for-a-study-playlist/',
    // Removed 2026-07-09: LPT's featured-artist appearances (not the primary artist) are no
    // longer surfaced (Mat's positioning call). Old release-page URLs redirect to the artist.
    '/lucius-p-thundercat/releases/love-you-leave-you/': '/lucius-p-thundercat/',
    '/lucius-p-thundercat/releases/forbidden-fruit/': '/lucius-p-thundercat/',
    '/lucius-p-thundercat/releases/boy-genius/': '/lucius-p-thundercat/',
    '/lucius-p-thundercat/releases/subconscious/': '/lucius-p-thundercat/',
  },
  // Sitemap keeps every individual corpus page; excludes the /notes/ stub and the private /kit/.
  integrations: [sitemap({ filter: (page) => page !== `${SITE}/notes/` && !page.startsWith(`${SITE}/kit`) && page !== `${SITE}/notes/10-underground-rappers-for-a-study-playlist/` })],
  build: { format: 'directory' },
});
