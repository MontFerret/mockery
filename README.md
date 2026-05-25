# Mockery

**Mockery: fake web scenarios for real Ferret tests.**

Mockery is a deterministic static website used as a safe playground for Ferret,
HTML drivers, docs examples, blog posts, and Lab scenarios.

It is organized around **scenarios**. A scenario is a controlled fake web
situation designed to test or demonstrate a specific scraping or browser
behavior: static extraction, product listings, pagination, forms, tables,
network activity, infinite scroll, delayed rendering, iframes, messy markup,
shadow DOM, and navigation interactions.

## Project layout

- `src/pages/` Astro routes and static JSON/SVG endpoints
- `src/layouts/` shared page shell
- `src/components/` reusable scenario and product UI
- `src/data/` deterministic fixtures to maintain
- `src/assets/` shared CSS and vanilla browser scripts
- `scripts/` deterministic fixture generation helpers
- `examples/ferret/` readable Ferret example scripts
- `tests/validate-dist.test.mjs` static output validation
- `dist/` generated static output

The project intentionally uses Astro conventions instead of a custom static
site generator. Most maintenance should be content changes in `src/data/` and
scenario page copy.

## Scenarios

Generated under `/scenarios/`:

- `/scenarios/ecommerce/`
- `/scenarios/dynamic-products/`
- `/scenarios/network/`
- `/scenarios/messy-markup/`
- `/scenarios/forms/`
- `/scenarios/tables/`
- `/scenarios/infinite-scroll/`
- `/scenarios/delayed-rendering/`
- `/scenarios/shadow-dom/`
- `/scenarios/iframes/`
- `/scenarios/navigation/`

## Local usage

```bash
npm install
npm run dev
```

Build and preview the generated static site:

```bash
npm run build
npm run preview
```

`preview` serves the generated `dist/` directory with Astro.

## Static deployment

Mockery output is fully static and can be deployed as-is from `dist/` to any
static host. Generated output includes a GitHub Pages `CNAME` file for
`mockery.montferret.dev`.

The default build targets the domain root:

```bash
npm run build
```

To build for a project subpath such as `https://www.montferret.dev/mockery/`:

```bash
MOCKERY_BASE_PATH=/mockery/ npm run build
```

Optional build settings:

- `MOCKERY_BASE_PATH` defaults to `/`
- `MOCKERY_SITE_URL` defaults to `https://mockery.montferret.dev`
- `MOCKERY_OUT_DIR` defaults to `dist`

## Validation

```bash
npm run validate
```

Validation builds both the root site and a `/mockery/` subpath variant, then
checks required pages, product detail pages, paginated category pages, static
API files, internal links, product selectors, scenario entries, generated SVG
escaping, and accidental external dependencies.

## Ferret examples

Example scripts are in `examples/ferret/` and the e-commerce scenario examples
are grouped under `examples/ferret/ecommerce/`. Dynamic product examples are
grouped under `examples/ferret/dynamic-products/`. The e-commerce catalog
contains 300 deterministic products, with 30 products in each category and
static pagination for both product listings and category pages. Examples use a
configurable base URL:

```fql
LET baseUrl = @baseUrl
LET doc = DOCUMENT(baseUrl + "/scenarios/ecommerce/products/")
```

## Lab static serving example

```bash
npm run build

lab run examples/ferret/ecommerce-products.fql \
  --serve ./dist@app \
  --param baseUrl=@lab.static.app
```

For the focused e-commerce examples:

```bash
lab run examples/ferret/ecommerce/products.fql \
  --serve ./dist@app \
  --param baseUrl=@lab.static.app

lab run examples/ferret/ecommerce/search.fql \
  --serve ./dist@app \
  --param baseUrl=@lab.static.app

lab run examples/ferret/dynamic-products/basic.fql \
  --serve ./dist@app \
  --param baseUrl=@lab.static.app

lab run examples/ferret/dynamic-products/infinite-scroll.fql \
  --serve ./dist@app \
  --param baseUrl=@lab.static.app
```

You can also point `baseUrl` to any ordinary static server URL, for example
the local URL printed by `npm run dev` or `npm run preview`.

## Static API output

The build generates deterministic static JSON under `dist/api`, including:

- `api/products/index.json`
- `api/products/page-1.json` through `api/products/page-13.json`
- `api/categories/index.json`
- `api/reviews/index.json`
- `api/reviews/<product-id>.json`
- `api/search/products.json`
- `api/dynamic-products/page-1.json` through `api/dynamic-products/page-3.json`
- `api/dynamic-products/featured.json`
- `api/dynamic-products/search.json`
- `api/dynamic-products/empty.json`
- `api/dynamic-products/error.json`
- `api/dynamic-products/slow-page-1.json`
- `api/dynamic-products/slow-page-2.json`
- `api/network/*.json`

No backend runtime, database, analytics, external assets, or external SaaS
services are required.
