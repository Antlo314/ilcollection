/* XML sitemap with image entries (helps product photography surface in Google Images). */
import type { APIRoute } from 'astro';
import { products } from '../data/site';
import { abs } from '../data/seo';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const today = new Date().toISOString().slice(0, 10);

type Entry = { path: string; priority: string; changefreq: string; images?: { src: string; title: string }[] };

const pages: Entry[] = [
  { path: '/', priority: '1.0', changefreq: 'weekly', images: [{ src: '/og.jpg', title: 'Incandescent Lily Collection' }] },
  { path: '/shop', priority: '0.9', changefreq: 'weekly', images: [{ src: '/og-shop.jpg', title: 'The Incandescent Lily Collection' }] },
  ...products.map((p) => ({
    path: `/shop/${p.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    images: p.media.filter((m) => m.type === 'image').map((m) => ({ src: (m as { src: string }).src, title: p.name })),
  })),
  { path: '/our-story', priority: '0.6', changefreq: 'monthly', images: [{ src: '/og-story.jpg', title: 'Our Story' }] },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' },
  { path: '/shipping-returns', priority: '0.3', changefreq: 'yearly' },
];

export const GET: APIRoute = () => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages
  .map(
    (e) => `  <url>
    <loc>${esc(abs(e.path))}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>${(e.images ?? [])
      .map((i) => `
    <image:image><image:loc>${esc(abs(i.src))}</image:loc><image:title>${esc(i.title)}</image:title></image:image>`)
      .join('')}
  </url>`,
  )
  .join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
