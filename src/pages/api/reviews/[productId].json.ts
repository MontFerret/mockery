import { products, reviews } from '../../../lib/site.js';
import { jsonResponse } from '../../../lib/responses.js';

export function getStaticPaths() {
  return products.map((product) => ({
    params: { productId: product.id },
    props: { productId: product.id },
  }));
}

export function GET({ props }) {
  const entries = reviews[props.productId] ?? [];
  return jsonResponse({ productId: props.productId, items: entries });
}
