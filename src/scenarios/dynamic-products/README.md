# Dynamic Products Scenario

Dynamic Products models a client-side rendered product listing page. The
initial HTML contains controls, status elements, and empty containers, while
product cards are fetched from static JSON files and rendered in the browser.

This is for Ferret demos and tests that need CDP/browser extraction,
`WAIT_ELEMENT`, delayed DOM rendering, load-more pagination, network activity,
and DOM mutation after user interaction.

## Pages

- `/scenarios/dynamic-products/`
- `/scenarios/dynamic-products/basic/`
- `/scenarios/dynamic-products/load-more/`
- `/scenarios/dynamic-products/infinite-scroll/`
- `/scenarios/dynamic-products/filtering/`
- `/scenarios/dynamic-products/error-state/`
- `/scenarios/dynamic-products/empty-state/`
- `/scenarios/dynamic-products/delayed/`
- `/scenarios/dynamic-products/replace-vs-append/`

## Static API Files

- `/api/dynamic-products/page-1.json`
- `/api/dynamic-products/page-2.json`
- `/api/dynamic-products/page-3.json`
- `/api/dynamic-products/featured.json`
- `/api/dynamic-products/search.json`
- `/api/dynamic-products/empty.json`
- `/api/dynamic-products/error.json`
- `/api/dynamic-products/slow-page-1.json`
- `/api/dynamic-products/slow-page-2.json`

All files are static successful HTTP responses. The error case is represented
by a deterministic payload with `ok: false`.

## State And Selectors

The scenario root is `#dynamic-products-scenario` with:

- `data-testid="dynamic-products-scenario"`
- `data-scenario="dynamic-products"`
- `data-case`
- `data-state`
- `data-page`
- `data-loaded-count`
- `data-total-count`

Load-more pages may use `data-state="loading-more"`. The delayed page also
uses `data-state="rendering"`. The replace-vs-append page exposes
`data-update-mode="initial"`, `append`, or `replace`.

Rendered product cards use `data-testid="dynamic-product-card"` and expose:

- `data-product-id`
- `data-product-sku`
- `data-category`
- `data-brand`
- `data-price`
- `data-in-stock`

Shared selectors:

- `[data-testid="dynamic-products-status"]`
- `[data-testid="dynamic-products-grid"]`
- `[data-testid="dynamic-products-log"]`
- `[data-testid="dynamic-products-log-entry"]`

Case-specific selectors:

- `[data-testid="load-more-products"]`
- `[data-testid="dynamic-products-scroll-sentinel"]`
- `[data-testid="dynamic-products-filter-form"]`
- `[data-testid="dynamic-search-query"]`
- `[data-testid="dynamic-category"]`
- `[data-testid="dynamic-brand"]`
- `[data-testid="dynamic-sort"]`
- `[data-testid="dynamic-in-stock"]`
- `[data-testid="dynamic-filter-status"]`
- `[data-testid="dynamic-products-error"]`
- `[data-testid="dynamic-products-empty"]`
- `[data-testid="dynamic-delay-marker"]`
- `[data-testid="append-page"]`
- `[data-testid="replace-page"]`

## Expected Behavior

- Basic: `idle -> loading -> loaded`, page 1, 12 rendered cards.
- Load more: page 1 renders on load, page 2 and page 3 append after clicks,
  then the button becomes disabled and `data-state="complete"`.
- Infinite scroll: page 1 renders on load, page 2 and page 3 append when the
  scroll sentinel enters view, then the sentinel has `data-complete="true"`.
- Filtering: search data loads once, then form input replaces the rendered
  list without page reload.
- Error state: `ok: false` JSON renders a stable error panel and no product
  cards.
- Empty state: successful empty JSON renders a stable empty panel and no
  product cards.
- Delayed: waits 500ms before fetch and 1000ms before rendering.
- Replace vs append: append shows 24 cards, replace shows 12 cards from page 2.

## Usage

```bash
npm run build
npm run preview
```

Lab static serving:

```bash
lab run examples/ferret/dynamic-products/basic.fql \
  --serve ./dist@app \
  --param baseUrl=@lab.static.app
```

Other examples are in `examples/ferret/dynamic-products/`.
