import { products, publicProduct } from '../../lib/site.js';
import { jsonResponse } from '../../lib/responses.js';

export function GET() {
  return jsonResponse({
    generatedAt: '2026-05-24T00:00:00.000Z',
    total: products.length,
    items: products.map((product) => {
      const item = publicProduct(product);
      return {
        id: item.id,
        title: item.title,
        price: item.price,
        category: item.category,
        url: item.url,
      };
    }),
  });
}
