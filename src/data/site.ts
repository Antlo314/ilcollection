import products from './products.json';
import media from './media.json';

export type Product = (typeof products)[number];
export type Media = { src: string; srcset: string; width: number; height: number; alpha?: boolean };

export { products, media };

export const site = {
  name: 'Incandescent Lily Collection',
  short: 'IL Collection',
  tagline: 'Black-owned, plant-based body care',
  description:
    'Luxurious, plant-based wellness and body care crafted with pure ingredients and divine intention. Black-owned and handmade in small batches.',
  email: 'ilcollection@nebaministry.org',
  phone: '(470) 562-2852',
  phoneHref: 'tel:+14705622852',
  hours: 'Monday – Friday, 9:00am – 7:00pm EST',
  cartUrl: 'https://www.nebaministry.org/cart-page',
  ministryUrl: 'https://www.nebaministry.org/',
  social: {
    instagram: 'https://www.instagram.com/ilcollection__',
    facebook: 'https://www.facebook.com/profile.php?id=100092239986536',
    tiktok: 'https://www.tiktok.com/@ilcollection__',
  },
  handle: '@ilcollection__',
};

export const collections = [
  { key: 'all', label: 'All' },
  { key: 'skin', label: 'Skin' },
  { key: 'hair', label: 'Hair' },
  { key: 'body', label: 'Body' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'home', label: 'Home & Aroma' },
  { key: 'rituals', label: 'Rituals & Sets' },
  { key: 'devotional', label: 'Devotionals' },
] as const;

export const values = ['100% Plant-Based', 'Zero Waste', 'Vegan', 'Recyclable', 'Fair Trade', 'Cruelty-Free', 'Black-Owned', 'Small Batch'];

export const standard = [
  '100% plant-based',
  'Animal cruelty-free',
  'Free of parabens, phthalates & sulfates',
  'Free of added synthetic fragrances',
  'Free of dyes',
];

export const mission =
  'We are transforming the beauty industry by creating wellness and body care rooted in purity, purpose, and divine intention. Our collection consists of luxurious wellness and body care products crafted with pure ingredients derived from the plants given to us by God. We believe that true beauty and healing is experienced through the way we nurture our spirit, mind and body.';

export const faqs = [
  {
    q: 'What makes ILC products different from other hair and skin care brands?',
    a: 'At ILC, we use 100% plant-based ingredients—no synthetics, fillers, or harsh chemicals. Every formula is carefully crafted to nourish, heal, and protect using nature’s finest botanicals, ensuring your skin and hair receive what they truly need to thrive.',
  },
  {
    q: 'Can plant-based products really help with dryness, breakage, or hyperpigmentation?',
    a: 'Absolutely. Nature has always provided powerful solutions. Our oils, butters, and herbal infusions are rich in essential nutrients, antioxidants, and healing properties that help restore moisture, reduce inflammation, fade dark spots, and strengthen hair from the root.',
  },
  {
    q: 'Are ILC products suitable for all skin and hair types?',
    a: 'Yes! Our formulas are intentionally designed to be gentle yet effective for a wide range of textures, tones, and types. Whether you have sensitive skin, coily hair, or combination concerns, our plant-based blends adapt beautifully to your body’s natural rhythms.',
  },
  {
    q: 'What kind of results can I expect with regular use?',
    a: 'With consistent use, many of our customers experience softer skin, clearer complexions, reduced irritation, stronger hair, and improved scalp health. Because our ingredients work with your body—never against it—results are not only visible but long-lasting.',
  },
  {
    q: 'Do you use any preservatives or synthetic fragrances?',
    a: 'Never. We believe in pure, clean beauty. Our products are free of parabens, sulfates, synthetic fragrances, and anything that disrupts your wellness. We use natural preservatives and thoughtfully crafted blends of essential oils and botanical extracts.',
  },
];

export const money = (n: number) => `$${n.toFixed(2)}`;
export const priceLabel = (p: Product) =>
  p.priceMin === p.priceMax ? money(p.priceMin) : `From ${money(p.priceMin)}`;
export const bySlug = (slug: string) => products.find((p) => p.slug === slug)!;
export const firstImage = (p: Product) => p.media.find((m) => m.type === 'image') as unknown as Media;
export const images = (p: Product) => p.media.filter((m) => m.type === 'image') as unknown as Media[];
