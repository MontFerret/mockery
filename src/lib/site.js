import categoriesData from '../data/categories.json';
import customersData from '../data/customers.json';
import ordersData from '../data/orders.json';
import productsData from '../data/products.json';
import reviewsData from '../data/reviews.json';

export const siteName = 'Mockery';
export const tagline = 'Mockery: fake web scenarios for real Ferret tests.';
export const siteDescription = 'A safe playground of deterministic web scenarios for Ferret.';
export const productPageSize = 24;

export const scenarios = [
  {
    slug: 'ecommerce',
    title: 'E-commerce',
    description: 'Product listings, detail pages, categories, pagination, and reviews.',
    demonstrates: 'static extraction, product cards, pagination, categories, reviews, structured data',
    examples: ['ecommerce/products.fql', 'ecommerce/pagination.fql', 'ecommerce/product-details.fql'],
  },
  {
    slug: 'dynamic-products',
    title: 'Dynamic Products',
    description: 'Client-side rendering from static JSON with load-more behavior.',
    demonstrates: 'fetch(), loading states, DOM mutation, WAIT_ELEMENT',
    examples: ['dynamic-products.fql'],
  },
  {
    slug: 'network',
    title: 'Network Activity',
    description: 'Buttons that trigger predictable fetch patterns and statuses.',
    demonstrates: 'request, response, request finished, request failed, and idle network events',
    examples: ['network-events.fql'],
  },
  {
    slug: 'messy-markup',
    title: 'Messy Markup',
    description: 'Intentional HTML inconsistencies for robust scraping examples.',
    demonstrates: 'fallback selectors, optional access, filtering, normalization',
    examples: ['messy-markup.fql'],
  },
  {
    slug: 'forms',
    title: 'Forms',
    description: 'Interactive form controls with client-side result rendering.',
    demonstrates: 'typing, checking, selecting, submit interception, event dispatch',
    examples: ['forms-dispatch.fql'],
  },
  {
    slug: 'tables',
    title: 'Tables',
    description: 'Clean and messy table extraction examples.',
    demonstrates: 'tables, nested links, missing cells, totals, client-side sorting',
    examples: ['tables-orders.fql'],
  },
  {
    slug: 'infinite-scroll',
    title: 'Infinite Scroll',
    description: 'Scroll-triggered loading of static JSON batches.',
    demonstrates: 'lazy loading, scroll events, incremental DOM insertion',
    examples: ['infinite-scroll.fql'],
  },
  {
    slug: 'delayed-rendering',
    title: 'Delayed Rendering',
    description: 'Controlled delayed DOM updates for wait and polling examples.',
    demonstrates: 'short delays, long delays, user-triggered content, state changes',
    examples: [],
  },
  {
    slug: 'shadow-dom',
    title: 'Shadow DOM',
    description: 'Open shadow DOM components for browser-driver tests.',
    demonstrates: 'custom elements, open shadow roots, component internals',
    examples: [],
  },
  {
    slug: 'iframes',
    title: 'Iframes',
    description: 'Same-origin iframes with product, table, and delayed content.',
    demonstrates: 'frame traversal and frame document loading',
    examples: [],
  },
  {
    slug: 'navigation',
    title: 'Navigation',
    description: 'Multi-step flow with links, location changes, hash and query.',
    demonstrates: 'links, buttons, hash changes, query parameters, page transitions',
    examples: [],
  },
];

export const products = productsData;
export const categories = categoriesData;
export const customers = customersData;
export const orders = ordersData;
export const reviews = reviewsData;

export const normalizeBasePath = (value = process.env.MOCKERY_BASE_PATH || '/') => {
  if (!value || value === '/') {
    return '/';
  }

  return `/${value.replace(/^\/+|\/+$/g, '')}/`;
};

export const basePath = normalizeBasePath();
export const siteUrl = (process.env.MOCKERY_SITE_URL || 'https://mockery.montferret.dev').replace(/\/+$/, '');

export const withBase = (pathname) => {
  if (/^[a-z][a-z0-9+.-]*:/i.test(pathname)) {
    return pathname;
  }

  const clean = pathname.replace(/^\/+/, '');
  return basePath === '/' ? `/${clean}` : `${basePath}${clean}`;
};

export const absoluteUrl = (pathname) => `${siteUrl}${withBase(pathname)}`;
export const scenarioPath = (slug) => `/scenarios/${slug}/`;
export const productSlug = (product) => product.slug || product.id;
export const productPath = (product) => `/scenarios/ecommerce/products/${productSlug(product)}/`;
export const productImagePath = (product) => `/assets/images/products/${productSlug(product)}.svg`;
export const categoryPath = (category) => `/scenarios/ecommerce/categories/${category.id || category}/`;
export const categoryProductCount = (category) => products.filter((product) => product.category === (category.id || category)).length;

export const publicCategory = (category) => ({
  ...category,
  count: categoryProductCount(category),
  url: withBase(categoryPath(category)),
});

export const publicProduct = (product) => ({
  ...product,
  slug: productSlug(product),
  url: withBase(productPath(product)),
  image: withBase(productImagePath(product)),
});

export const publicProducts = () => products.map(publicProduct);
export const publicCategories = () => categories.map(publicCategory);
export const productPages = () => {
  const pages = [];

  for (let i = 0; i < products.length; i += productPageSize) {
    pages.push(products.slice(i, i + productPageSize));
  }

  return pages;
};

export const productPagePayload = (page) => {
  const items = productPages()[page - 1] || [];

  return {
    page,
    pageSize: productPageSize,
    total: products.length,
    items: items.map(publicProduct),
  };
};

export const searchProductPayload = () => ({
  total: products.length,
  items: publicProducts(),
});

export const formatMoney = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);

export const displayDate = (value) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));

export const jsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

export const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
