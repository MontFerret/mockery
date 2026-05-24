import { reviews } from '../../../lib/site.js';
import { jsonResponse } from '../../../lib/responses.js';

export function GET() {
  return jsonResponse({ total: Object.keys(reviews).length, items: reviews });
}
