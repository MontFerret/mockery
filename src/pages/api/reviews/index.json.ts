import { products, reviews } from '../../../lib/site.js';
import { jsonResponse } from '../../../lib/responses.js';

export function GET() {
  const items = products.map((product) => ({
    productId: product.id,
    items: reviews[product.id] ?? [],
  }));

  return jsonResponse({ total: items.length, items });
}
