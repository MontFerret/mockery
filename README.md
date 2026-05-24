# Mockery

**Mockery: fake web scenarios for real Ferret tests.**

Mockery is a deterministic static website used as a safe playground for Ferret, HTML drivers, docs examples, blog posts, and Lab scenarios.

It is organized around **scenarios** (not scenes). Each scenario models a common scraping/browser automation situation: static extraction, product listings, pagination, forms, tables, network activity, infinite scroll, delayed rendering, iframes, messy markup, shadow DOM, and navigation interactions.

## Project layout

- `src/data/` deterministic fixtures (`products`, `categories`, `reviews`, `orders`, `customers`)
- `src/assets/` shared CSS and JavaScript used by generated pages
- `src/scenarios/` source folders reserved per scenario
- `examples/ferret/` readable Ferret example scripts
- `scripts/build.mjs` static site generator
- `scripts/validate.mjs` output validation checks
- `dist/` generated static output (build artifact)

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
npm run build
npm run preview
```

`preview` serves the generated `dist/` static directory at `http://localhost:4173`.

For quick dev loop:

```bash
npm run dev
```

## Validation

```bash
npm run validate
```

Validation checks:

- build succeeds
- expected pages and static API JSON exist
- product detail pages exist for all products
- listing pages contain product cards
- scenario index links to all scenarios
- dynamic pages include required markers
- internal links resolve
- no accidental external runtime dependencies

## Static deployment

Mockery output is fully static and can be deployed as-is from `dist/` to any static host.

The generated pages use relative links so they work both at:

- domain root: `https://mockery.montferret.dev/`
- project subpath: `https://www.montferret.dev/mockery/`

## Ferret examples

Example scripts are in `examples/ferret/` and use configurable base URL:

```fql
LET baseUrl = @baseUrl
LET doc = DOCUMENT(baseUrl + "/scenarios/ecommerce/products/")
```

## Lab static serving example

```bash
lab run examples/ferret/ecommerce-products.fql \
  --serve ./dist@app \
  --param baseUrl=@lab.static.app
```

You can also point `@baseUrl` to any static server URL (for example `http://localhost:4173`).

## Static API output

The build generates deterministic static JSON under `dist/api`, including:

- `api/products/index.json`
- `api/products/page-1.json`
- `api/products/page-2.json`
- `api/products/page-3.json`
- `api/categories/index.json`
- `api/reviews/index.json`
- `api/reviews/<product-id>.json`
- `api/search/products.json`
- `api/network/*.json`

No backend runtime, database, analytics, or external SaaS services are required.
