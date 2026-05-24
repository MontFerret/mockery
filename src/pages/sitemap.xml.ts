import { absoluteUrl, categories, categoryPath, productPath, products, scenarioPath, scenarios } from '../lib/site.js';
import { textResponse } from '../lib/responses.js';

const urls = [
  '/',
  '/scenarios/',
  ...scenarios.map((scenario) => scenarioPath(scenario.slug)),
  '/scenarios/ecommerce/products/',
  '/scenarios/ecommerce/products/page/2/',
  '/scenarios/ecommerce/products/page/3/',
  '/scenarios/ecommerce/categories/',
  ...categories.map(categoryPath),
  ...products.map(productPath),
];

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map((url) => `<url><loc>${absoluteUrl(url)}</loc></url>`).join('') +
    `</urlset>`;

  return textResponse(body, 'application/xml; charset=utf-8');
}
