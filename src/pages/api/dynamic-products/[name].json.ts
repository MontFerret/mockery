import { dynamicProductApiPayload } from '../../../lib/site.js';
import { jsonResponse } from '../../../lib/responses.js';

const names = [
  'page-1',
  'page-2',
  'page-3',
  'featured',
  'search',
  'empty',
  'error',
  'slow-page-1',
  'slow-page-2',
];

export function getStaticPaths() {
  return names.map((name) => ({
    params: { name },
    props: { name },
  }));
}

export function GET({ props }) {
  return jsonResponse(dynamicProductApiPayload(props.name));
}
