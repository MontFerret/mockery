import { products, publicProduct, reviews } from '../../../lib/site.js';
import { jsonResponse } from '../../../lib/responses.js';

const payloads = {
  products: () => ({ ok: true, items: products.slice(0, 5).map((product) => publicProduct(product)) }),
  reviews: () => ({ ok: true, reviews: Object.values(reviews).flat().slice(0, 5) }),
  recommendations: () => ({
    ok: true,
    recommendations: products.slice(5, 10).map((product) => {
      const item = publicProduct(product);
      return { id: item.id, title: item.title, url: item.url };
    }),
  }),
  error: () => ({ ok: false, error: 'Simulated upstream failure', code: 'MOCK_UPSTREAM_FAILURE' }),
  'slow-1': () => ({ ok: true, step: 1 }),
  'slow-2': () => ({ ok: true, step: 2 }),
  'slow-3': () => ({ ok: true, step: 3 }),
};

export function getStaticPaths() {
  return Object.keys(payloads).map((name) => ({
    params: { name },
    props: { name },
  }));
}

export function GET({ props }) {
  return jsonResponse(payloads[props.name]());
}
