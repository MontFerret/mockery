# Network Activity Scenario

Network Activity models deterministic browser-side `fetch()` behavior using
static Mockery files. It is intended for Ferret demos and tests that need CDP
network observation, request waits, DOM updates after responses, polling,
request filtering, network idle markers, and user-triggered network activity.

All responses are static successful HTTP responses. Error and delay behavior is
represented by application payloads and client-side JavaScript, not server-only
HTTP status codes or server delays.

## Pages

- `/scenarios/network/`
- `/scenarios/network/single-request/`
- `/scenarios/network/sequential-requests/`
- `/scenarios/network/parallel-requests/`
- `/scenarios/network/delayed-requests/`
- `/scenarios/network/polling/`
- `/scenarios/network/simulated-error/`
- `/scenarios/network/request-filtering/`
- `/scenarios/network/network-idle/`
- `/scenarios/network/user-triggered/`
- `/scenarios/network/mixed-content/`

## Static API Files

- `/api/network/products.json`
- `/api/network/reviews.json`
- `/api/network/recommendations.json`
- `/api/network/categories.json`
- `/api/network/inventory.json`
- `/api/network/pricing.json`
- `/api/network/profile.json`
- `/api/network/settings.json`
- `/api/network/simulated-error.json`
- `/api/network/poll-1.json`
- `/api/network/poll-2.json`
- `/api/network/poll-3.json`
- `/api/network/slow-1.json`
- `/api/network/slow-2.json`
- `/api/network/slow-3.json`
- `/api/network/filter-products.json`
- `/api/network/filter-reviews.json`
- `/api/network/filter-analytics.json`
- `/api/network/mixed-products.json`
- `/api/network/mixed-text.txt`
- `/api/network/mixed-fragment.html`

## Request Sequences

- Single request: `products`
- Sequential requests: `categories`, `products`, `pricing`, `inventory`, `reviews`
- Parallel requests: `products`, `reviews`, `recommendations`, `pricing`, `inventory`
- Delayed requests: wait 300ms then `slow-1`, wait 500ms then `slow-2`, wait 700ms then `slow-3`
- Polling: `poll-1`, `poll-2`, `poll-3` with a 400ms interval between polls
- Simulated error: `simulated-error`
- Request filtering: `filter-products`, `filter-reviews`, `filter-analytics`
- Network idle: `products`, wait 250ms, `reviews`, wait 250ms, `recommendations`
- User triggered: no scenario API requests until a button is clicked
- Mixed content: `mixed-products.json`, `mixed-text.txt`, `mixed-fragment.html`

## State And Selectors

Every sub-scenario page exposes:

- `[data-testid="network-scenario"]`
- `[data-testid="network-status"]`
- `[data-testid="network-log"]`
- `[data-testid="network-log-entry"]`

The root container exposes:

- `data-scenario="network"`
- `data-case`
- `data-state`
- `data-request-count`
- `data-response-count`
- `data-error-count`
- `data-complete`

Expected final states:

- Single request: `data-state="complete"`, requests `1`, responses `1`, errors `0`
- Sequential requests: `data-state="complete"`, requests `5`, responses `5`, errors `0`
- Parallel requests: `data-state="complete"`, requests `5`, responses `5`, errors `0`
- Delayed requests: `data-state="complete"`, requests `3`, responses `3`, errors `0`
- Polling: `data-state="complete"`, requests `3`, responses `3`, errors `0`, `data-poll-step="3"`, `data-poll-complete="true"`
- Simulated error: `data-state="complete"`, requests `1`, responses `1`, errors `1`, `data-last-error-code="MOCK_UPSTREAM_FAILURE"`
- Request filtering: `data-state="complete"`, requests `3`, responses `3`, errors `0`
- Network idle: `data-state="idle-observed"`, requests `3`, responses `3`, errors `0`
- User triggered after Fetch all: `data-state="complete"`, requests `3`, responses `3`, errors `0`
- Mixed content: `data-state="complete"`, requests `3`, responses `3`, errors `0`

Result cards use `[data-testid="network-result-card"]` with stable
`data-resource` and `data-request-id` attributes. The simulated error panel uses
`[data-testid="network-error"]`. Network idle uses
`[data-testid="network-idle-marker"]`.

## Usage

```bash
npm run build
npm run preview
```

Lab static serving:

```bash
lab run examples/ferret/network/single-request.fql \
  --serve ./dist@app \
  --param baseUrl=@lab.static.app
```

Other Ferret examples are in `examples/ferret/network/`.
