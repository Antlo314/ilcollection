# Incandescent Lily Collection — website

A premium, holistic redesign of the Incandescent Lily Collection (ILC) store, rebuilt from the
original Wix site at nebaministry.org/ilcollection. All 22 products, their copy, variants,
prices, imagery, and videos were migrated.

**Stack:** [Astro 7](https://astro.build) (static output) · GSAP 3.15 (ScrollTrigger, SplitText, Flip) ·
Lenis smooth scroll · self-hosted Cormorant Garamond + Jost.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static site -> dist/
npm run preview    # serve the production build
```

## Deploy to Vercel (via Git)

1. Push this folder to a new GitHub repo.
2. In Vercel: **Add New → Project → Import** the repo. Vercel detects Astro automatically
   (build `npm run build`, output `dist`). `vercel.json` adds clean URLs and media caching.
3. Once the domain is known, set `site: 'https://your-domain.com'` in `astro.config.mjs`
   so canonical and Open Graph URLs become absolute.

## Where things live

| Path | What |
| --- | --- |
| `src/data/products.json` | Every product: name, subtitle, price range, variants, copy, media, card crops |
| `src/data/site.ts` | Contact details, social links, collections, mission, FAQs, helpers |
| `src/pages/` | `index`, `shop/index`, `shop/[slug]` (one page per product), `our-story`, `contact`, `shipping-returns`, `404` |
| `src/components/` | Header, Footer, ProductCard, Marquee, Img |
| `src/styles/global.css` | Design tokens (palette, type scale), buttons, cards, accordions |
| `src/scripts/motion.ts` | All site-wide motion (see below) |
| `src/scripts/interactions.ts` | Rails, drag-scroll, animated accordions |
| `public/media/` | Optimized WebP imagery (`brand/`, `p/` product, `c/` 4:5 card crops) and re-encoded video |

To edit a product, change its entry in `products.json` (prices in `variants` are keyed by the
sorted option-value ids). Variant prices update live on the product page.

## Motion system

Motion is declared in markup with data attributes; `motion.ts` wires them up:

- `data-split` — headline lines rise out of a mask (SplitText)
- `data-reveal` — fade-up on scroll (batched)
- `data-clip` — arch/frame wipes open with an image zoom-settle
- `data-parallax="0.12"` — scrubbed parallax (wrap in `data-parallax-scope`)
- `data-lightup` — words brighten as they scroll through (mission statement)
- `data-hscroll` / `data-hscroll-track` — pinned horizontal scroll (Indulgences, desktop; swipe on mobile)
- `data-expand` — rounded window that opens to full bleed (texture film)
- `data-marquee` — endless marquee that leans into scroll velocity
- `data-magnetic`, `data-spin`, `data-hero` (entrance after the intro curtain)

Brand accents: the first-visit lily curtain, a warm “incandescent” light that follows the cursor
(desktop), breathing honey/lavender halos behind key imagery, and film grain.
Everything respects `prefers-reduced-motion`. Add `?nomotion` to any URL to see final states
instantly (handy for screenshots/QA).

## Open items before launch

- **Checkout.** “Purchase” currently opens the product on the existing Wix store, so orders keep
  working today. For native checkout, choose a commerce backend (e.g. Shopify Buy Button /
  Storefront API, Stripe Checkout via Vercel functions, or Snipcart) and wire the product page’s
  selected variant into it.
- **Contact form** composes an email to ilcollection@nebaministry.org in the visitor’s mail app.
  Swap in a form service (Formspree, Resend + a Vercel function) for direct submissions.
- **Privacy Policy / Terms** link to the existing pages on nebaministry.org.
- **Domain** — set `site` in `astro.config.mjs` (and optionally add `@astrojs/sitemap`).
