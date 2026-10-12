// @ts-check
import { defineConfig } from 'astro/config';

// Static output; Vercel serves dist/ directly with zero config.
export default defineConfig({
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
