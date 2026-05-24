import { textResponse } from '../lib/responses.js';

export function GET() {
  return textResponse('User-agent: *\nAllow: /\n', 'text/plain; charset=utf-8');
}
