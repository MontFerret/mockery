import { products, publicProduct } from '../../../lib/site.js';
import { jsonResponse } from '../../../lib/responses.js';

export function GET() {
  return jsonResponse({
    query: 'all',
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
