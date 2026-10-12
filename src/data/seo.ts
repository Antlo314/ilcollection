/* Structured data (schema.org JSON-LD) builders. Everything uses absolute URLs off `site`. */
import { site, faqs, type Product } from './site';

const ORIGIN = (import.meta.env.SITE as string).replace(/\/$/, '');
export const abs = (path: string) => (path.startsWith('http') ? path : `${ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`);

const ORG_ID = `${ORIGIN}/#organization`;
const SITE_ID = `${ORIGIN}/#website`;

export const keywords = [
  'Black-owned skincare', 'plant-based body care', 'natural skincare', 'vegan body care', 'manuka honey skincare',
  'eczema care', 'hyperpigmentation', 'natural hair growth oil', 'loc care', 'beard oil', 'herbal tea', 'soy candle',
  'non-toxic sanitary pads', 'Incandescent Lily Collection', 'IL Collection',
];

/** Brand + storefront, referenced by every other node. */
export const organization = {
  '@type': ['Organization', 'OnlineStore'],
  '@id': ORG_ID,
  name: site.name,
  alternateName: ['IL Collection', 'ILC', 'Incandescent Lily'],
  url: `${ORIGIN}/`,
  logo: { '@type': 'ImageObject', url: abs('/icon-512.png'), width: 512, height: 512 },
  image: abs('/og.jpg'),
  description: site.description,
  slogan: 'Tender care, rooted in purity.',
  email: site.email,
  telephone: '+1-470-562-2852',
  sameAs: [site.social.instagram, site.social.facebook, site.social.tiktok, site.ministryUrl],
  parentOrganization: { '@type': 'Organization', name: 'NEBA Ministry & Mentorship', url: site.ministryUrl },
  areaServed: [{ '@type': 'Country', name: 'United States' }, { '@type': 'Place', name: 'U.S. Virgin Islands' }],
  knowsAbout: ['Plant-based skincare', 'Natural hair care', 'Herbal wellness', 'Aromatherapy'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    telephone: '+1-470-562-2852',
    email: site.email,
    areaServed: 'US',
    availableLanguage: 'English',
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00', closes: '19:00',
    },
  },
  hasMerchantReturnPolicy: { '@id': `${ORIGIN}/shipping-returns#returns` },
};

export const website = {
  '@type': 'WebSite',
  '@id': SITE_ID,
  url: `${ORIGIN}/`,
  name: site.name,
  alternateName: 'IL Collection',
  description: site.description,
  inLanguage: 'en-US',
  publisher: { '@id': ORG_ID },
};

/** Sales are final (handmade, personal-care items); damaged/incorrect orders are replaced. */
export const returnPolicy = {
  '@type': 'MerchantReturnPolicy',
  '@id': `${ORIGIN}/shipping-returns#returns`,
  applicableCountry: 'US',
  returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
  url: abs('/shipping-returns'),
};

const shippingDetails = {
  '@type': 'OfferShippingDetails',
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 7, unitCode: 'DAY' },
  },
};

export const graph = (...nodes: unknown[]) => ({ '@context': 'https://schema.org', '@graph': [organization, website, returnPolicy, ...nodes] });

export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
});

export const webPage = (o: { path: string; name: string; description: string; type?: string; image?: string }) => ({
  '@type': o.type ?? 'WebPage',
  '@id': `${abs(o.path)}#webpage`,
  url: abs(o.path),
  name: o.name,
  description: o.description,
  isPartOf: { '@id': SITE_ID },
  about: { '@id': ORG_ID },
  inLanguage: 'en-US',
  ...(o.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: abs(o.image) } } : {}),
});

const plain = (p: Product) =>
  p.description.map((d) => ('text' in d && d.text ? d.text : ((d as { items?: string[] }).items ?? []).join('. '))).join(' ').replace(/\s+/g, ' ').trim();

const categoryName: Record<string, string> = {
  skin: 'Skin Care', hair: 'Hair Care', body: 'Body Care', wellness: 'Wellness', home: 'Home Fragrance',
  indulgences: 'Gift Sets', devotional: 'Devotional Books',
};

export const productNode = (p: Product) => {
  const path = `/shop/${p.slug}`;
  const images = p.media.filter((m) => m.type === 'image').map((m) => abs((m as { src: string }).src));
  const single = p.priceMin === p.priceMax;
  const isBook = p.tags.includes('devotional');
  return {
    '@type': isBook ? ['Product', 'Book'] : 'Product',
    '@id': `${abs(path)}#product`,
    name: p.name,
    description: plain(p).slice(0, 5000),
    url: abs(path),
    image: images,
    brand: { '@type': 'Brand', name: isBook ? 'NEBA Ministry & Mentorship' : site.name },
    manufacturer: { '@id': ORG_ID },
    category: categoryName[p.tags[0]] ?? 'Body Care',
    ...(isBook ? { author: { '@type': 'Person', name: 'Melanie JC' } } : {}),
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Formulation', value: isBook ? 'Devotional' : '100% plant-based' },
      { '@type': 'PropertyValue', name: 'Made', value: 'Handmade in small batches' },
    ],
    offers: {
      '@type': single ? 'Offer' : 'AggregateOffer',
      priceCurrency: 'USD',
      ...(single ? { price: p.priceMin.toFixed(2) } : { lowPrice: p.priceMin.toFixed(2), highPrice: p.priceMax.toFixed(2), offerCount: p.variants.length }),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: abs(path),
      seller: { '@id': ORG_ID },
      shippingDetails,
      hasMerchantReturnPolicy: { '@id': `${ORIGIN}/shipping-returns#returns` },
    },
  };
};

export const itemList = (products: Product[], name: string) => ({
  '@type': 'ItemList',
  name,
  numberOfItems: products.length,
  itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/shop/${p.slug}`), name: p.name })),
});

export const faqPage = (path: string) => ({
  '@type': 'FAQPage',
  '@id': `${abs(path)}#faq`,
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export { categoryName };
