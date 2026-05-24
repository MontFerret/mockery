import { textResponse } from '../../../lib/responses.js';

const fragment = `<article data-fragment-id="mixed-fragment">
  <h2>Static HTML Fragment</h2>
  <p>This trusted Mockery fragment was loaded with fetch().</p>
</article>`;

export function GET() {
  return textResponse(fragment, 'text/html; charset=utf-8');
}
