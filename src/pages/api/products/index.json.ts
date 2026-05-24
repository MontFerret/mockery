import { productPageSize, products, publicProducts } from '../../../lib/site.js';
import { jsonResponse } from '../../../lib/responses.js';

export function GET() {
  return jsonResponse({
    page: 1,
    pageSize: productPageSize,
    total: products.length,
    items: publicProducts(),
  });
}
