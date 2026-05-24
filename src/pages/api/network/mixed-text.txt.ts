import { textResponse } from '../../../lib/responses.js';

export function GET() {
  return textResponse(
    'Plain text loaded from the deterministic mixed-content network scenario.',
    'text/plain; charset=utf-8',
  );
}
