// @ts-check
import { defineConfig } from 'astro/config';

// Canonical origin for absolute URLs (canonical tags, Open Graph, sitemap, JSON-LD).
// SITE_URL wins if set; otherwise Vercel's production domain (which becomes your custom
// domain automatically once one is attached), falling back to the vercel.app address.
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://ilcollection.vercel.app');

// Static output; Vercel serves dist/ directly with zero config.
export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
