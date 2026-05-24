import { absoluteUrl, categories, categoryPagePath, categoryPages, productPageSize, productPath, products, scenarioPath, scenarios } from '../lib/site.js';
import { textResponse } from '../lib/responses.js';

const productPageCount = Math.ceil(products.length / productPageSize);
const dynamicProductCasePaths = [
  '/scenarios/dynamic-products/basic/',
  '/scenarios/dynamic-products/load-more/',
  '/scenarios/dynamic-products/filtering/',
  '/scenarios/dynamic-products/error-state/',
  '/scenarios/dynamic-products/empty-state/',
  '/scenarios/dynamic-products/delayed/',
  '/scenarios/dynamic-products/replace-vs-append/',
];

const urls = [
  '/',
  '/scenarios/',
  ...scenarios.map((scenario) => scenarioPath(scenario.slug)),
  ...dynamicProductCasePaths,
  '/scenarios/ecommerce/products/',
  ...Array.from({ length: productPageCount - 1 }, (_, index) => `/scenarios/ecommerce/products/page/${index + 2}/`),
  '/scenarios/ecommerce/categories/',
  '/scenarios/ecommerce/search/',
  ...categories.flatMap((category) => categoryPages(category).map((_, index) => categoryPagePath(category, index + 1))),
  ...products.map(productPath),
];

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map((url) => `<url><loc>${absoluteUrl(url)}</loc></url>`).join('') +
    `</urlset>`;

  return textResponse(body, 'application/xml; charset=utf-8');
}
