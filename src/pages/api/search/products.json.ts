import { searchProductPayload } from '../../../lib/site.js';
import { jsonResponse } from '../../../lib/responses.js';

export function GET() {
  return jsonResponse(searchProductPayload());
}
