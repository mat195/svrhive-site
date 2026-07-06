// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://silkvelvetrecords.com';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  // Fully static, zero client JS for content. No integrations that inject runtime JS.
  integrations: [sitemap()],
  build: { format: 'directory' },
});
