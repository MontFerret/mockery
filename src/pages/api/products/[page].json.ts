import { productPagePayload, productPages } from '../../../lib/site.js';
import { jsonResponse } from '../../../lib/responses.js';

export function getStaticPaths() {
  return productPages().map((_, index) => ({
    params: { page: `page-${index + 1}` },
    props: { page: index + 1 },
  }));
}

export function GET({ props }) {
  return jsonResponse(productPagePayload(props.page));
}
