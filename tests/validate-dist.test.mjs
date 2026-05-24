import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const products = JSON.parse(await fs.readFile(path.join(rootDir, 'src/data/products.json'), 'utf8'));
const categories = JSON.parse(await fs.readFile(path.join(rootDir, 'src/data/categories.json'), 'utf8'));
const reviews = JSON.parse(await fs.readFile(path.join(rootDir, 'src/data/reviews.json'), 'utf8'));
const expectedBrands = [
  'Northwind',
  'Contoso',
  'Fabrikam',
  'Blue Yonder',
  'Tailspin',
  'Adventure Works',
  'Litware',
  'Alpine Goods',
  'Pixel Forge',
  'Cedar & Co.',
];
const scenarioSlugs = [
  'ecommerce',
  'dynamic-products',
  'network',
  'messy-markup',
  'forms',
  'tables',
  'infinite-scroll',
  'delayed-rendering',
  'shadow-dom',
  'iframes',
  'navigation',
];
const productPageSize = 24;
const categoryPageSize = 24;
const expectedProductPageCount = Math.ceil(products.length / productPageSize);

const requiredFiles = [
  'index.html',
  'scenarios/index.html',
  'scenarios/ecommerce/index.html',
  'scenarios/ecommerce/products/index.html',
  ...Array.from({ length: expectedProductPageCount - 1 }, (_, index) => `scenarios/ecommerce/products/page/${index + 2}/index.html`),
  'scenarios/ecommerce/categories/index.html',
  'scenarios/ecommerce/search/index.html',
  'scenarios/dynamic-products/index.html',
  'scenarios/network/index.html',
  'scenarios/messy-markup/index.html',
  'scenarios/forms/index.html',
  'scenarios/tables/index.html',
  'scenarios/tables/orders/index.html',
  'scenarios/tables/inventory/index.html',
  'scenarios/tables/missing-cells/index.html',
  'scenarios/infinite-scroll/index.html',
  'scenarios/delayed-rendering/index.html',
  'scenarios/shadow-dom/index.html',
  'scenarios/iframes/index.html',
  'scenarios/iframes/frame-a/index.html',
  'scenarios/iframes/frame-b/index.html',
  'scenarios/navigation/index.html',
  'scenarios/navigation/step-1/index.html',
  'scenarios/navigation/step-2/index.html',
  'scenarios/navigation/done/index.html',
  'api/products/index.json',
  ...Array.from({ length: expectedProductPageCount }, (_, index) => `api/products/page-${index + 1}.json`),
  'api/categories/index.json',
  'api/reviews/index.json',
  'api/search/products.json',
  'api/network/products.json',
  'api/network/reviews.json',
  'api/network/recommendations.json',
  'api/network/error.json',
  'api/network/slow-1.json',
  'api/network/slow-2.json',
  'api/network/slow-3.json',
  'feeds/products.json',
  'robots.txt',
  'sitemap.xml',
];

const ecommerceExampleFiles = [
  'examples/ferret/ecommerce/products.fql',
  'examples/ferret/ecommerce/pagination.fql',
  'examples/ferret/ecommerce/product-details.fql',
  'examples/ferret/ecommerce/categories.fql',
  'examples/ferret/ecommerce/reviews.fql',
  'examples/ferret/ecommerce/search.fql',
];

const productSlug = (product) => product.slug || product.id;
const productPageFile = (product) => path.join('scenarios/ecommerce/products', productSlug(product), 'index.html');
const countMatches = (value, pattern) => [...value.matchAll(pattern)].length;
const categoryCount = (categoryId) => products.filter((product) => product.category === categoryId).length;

const build = (outDir, basePath = '/') => {
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: rootDir,
    env: {
      ...process.env,
      MOCKERY_OUT_DIR: outDir,
      MOCKERY_BASE_PATH: basePath,
    },
    stdio: 'inherit',
  });

  assert.equal(result.status, 0, `build failed for ${basePath}`);
};

const validateSourceFixtures = async () => {
  assert.equal(products.length, 300, 'e-commerce product fixture count');
  assert.equal(categories.length, 10, 'e-commerce category fixture count');

  const ids = new Set();
  const slugs = new Set();
  for (const product of products) {
    assert.equal(typeof product.id, 'string');
    assert.equal(typeof product.slug, 'string');
    assert.equal(typeof product.sku, 'string');
    assert.equal(typeof product.title, 'string');
    assert.equal(typeof product.brand, 'string');
    assert.equal(typeof product.category, 'string');
    assert.equal(typeof product.price, 'number');
    assert.equal(product.currency, 'USD');
    assert.equal(typeof product.inStock, 'boolean');
    assert.ok(Number.isInteger(product.stockCount));
    assert.ok(Array.isArray(product.tags));
    assert.equal(typeof product.specs, 'object');
    assert.equal(product.image, `assets/images/products/${product.slug}.svg`);
    assert.ok(!ids.has(product.id), `duplicate product id ${product.id}`);
    assert.ok(!slugs.has(product.slug), `duplicate product slug ${product.slug}`);
    ids.add(product.id);
    slugs.add(product.slug);
  }

  assert.deepEqual([...new Set(products.map((product) => product.brand))].sort(), [...expectedBrands].sort());
  assert.deepEqual(categories.map((category) => [category.id, categoryCount(category.id)]), categories.map((category) => [category.id, 30]));
  assert.ok(products.some((product) => product.rating === null), 'expected products with null ratings');
  assert.ok(products.some((product) => product.oldPrice === null), 'expected products with null oldPrice');
  assert.ok(products.some((product) => !product.inStock), 'expected out-of-stock products');
  assert.ok(products.some((product) => product.stockCount === 0), 'expected zero stock products');
  assert.ok(products.some((product) => product.title.length > 60), 'expected long product titles');
  assert.ok(products.some((product) => /[+:&]/.test(product.title)), 'expected special-character product titles');
  assert.ok(products.some((product) => product.tags.length === 0), 'expected products with no tags');
  assert.ok(products.some((product) => product.tags.length >= 6), 'expected products with many tags');

  for (const category of categories) {
    assert.equal(typeof category.description, 'string');
    assert.ok(category.description.length > 20, `category ${category.id} should have a useful description`);
  }

  assert.ok(Object.keys(reviews).length > 0, 'expected reviewed products');
  assert.ok(Object.keys(reviews).length < products.length, 'expected some products without detailed reviews');
  for (const [productId, entries] of Object.entries(reviews)) {
    assert.ok(ids.has(productId), `review product ${productId} must exist`);
    assert.ok(entries.length > 0, `review product ${productId} should have entries`);
    for (const review of entries) {
      assert.equal(review.productId, productId);
      assert.match(review.id, new RegExp(`^review-${productId}-\\d{3}$`));
      assert.match(review.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(Number.isInteger(review.stars) && review.stars >= 1 && review.stars <= 5);
      assert.equal(typeof review.author, 'string');
      assert.equal(typeof review.body, 'string');
    }
  }

  for (const rel of ecommerceExampleFiles) {
    await exists(path.join(rootDir, rel));
  }
};

const exists = async (filePath) => {
  await fs.access(filePath);
};

const walk = async (dir, ext, acc = []) => {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, ext, acc);
    } else if (!ext || entry.name.endsWith(ext)) {
      acc.push(full);
    }
  }

  return acc;
};

const normalizeBase = (basePath) => {
  if (!basePath || basePath === '/') {
    return '/';
  }

  return `/${basePath.replace(/^\/+|\/+$/g, '')}/`;
};

const assertInternalRef = async (outDir, htmlFile, ref, basePath) => {
  if (
    !ref ||
    ref.startsWith('#') ||
    ref.startsWith('mailto:') ||
    ref.startsWith('tel:') ||
    ref.startsWith('data:')
  ) {
    return;
  }

  if (/^https?:\/\//.test(ref)) {
    const allowed = ['https://mockery.montferret.dev/'];
    assert.ok(allowed.some((prefix) => ref.startsWith(prefix)), `external dependency in ${path.relative(outDir, htmlFile)}: ${ref}`);
    return;
  }

  const clean = decodeURIComponent(ref.split('#')[0].split('?')[0]);
  const base = normalizeBase(basePath);
  let target;

  if (clean.startsWith('/')) {
    if (base !== '/') {
      assert.ok(clean.startsWith(base), `root link missing base ${base} in ${path.relative(outDir, htmlFile)}: ${ref}`);
      target = path.join(outDir, clean.slice(base.length));
    } else {
      target = path.join(outDir, clean.slice(1));
    }
  } else {
    target = path.resolve(path.dirname(htmlFile), clean);
  }

  const candidates = [target, path.join(target, 'index.html')];
  const ok = await Promise.any(candidates.map((candidate) => exists(candidate).then(() => true))).catch(() => false);
  assert.ok(ok, `broken internal link in ${path.relative(outDir, htmlFile)}: ${ref}`);
};

const assertNoExternalAssetRefs = (html, file) => {
  const rel = path.relative(rootDir, file);
  assert.doesNotMatch(html, /<img\b[^>]*\bsrc="https?:\/\//i, `external image in ${rel}`);
  assert.doesNotMatch(html, /<script\b[^>]*\bsrc="https?:\/\//i, `external script in ${rel}`);
  assert.doesNotMatch(html, /<link\b[^>]*\brel="stylesheet"[^>]*\bhref="https?:\/\//i, `external stylesheet in ${rel}`);
};

const validateOutput = async (outDir, basePath) => {
  for (const rel of requiredFiles) {
    await exists(path.join(outDir, rel));
  }

  for (const product of products) {
    await exists(path.join(outDir, productPageFile(product)));
    await exists(path.join(outDir, 'api/reviews', `${product.id}.json`));
    await exists(path.join(outDir, 'assets/images/products', `${productSlug(product)}.svg`));
  }

  for (const category of categories) {
    await exists(path.join(outDir, 'scenarios/ecommerce/categories', category.id, 'index.html'));
    await exists(path.join(outDir, 'scenarios/ecommerce/categories', category.id, 'page/2/index.html'));
  }

  const listHtml = await fs.readFile(path.join(outDir, 'scenarios/ecommerce/products/index.html'), 'utf8');
  assert.match(listHtml, /data-testid="product-card"/);
  assert.equal(countMatches(listHtml, /data-testid="product-card"/g), 24, 'page 1 should render 24 product cards');
  assert.match(listHtml, /data-product-sku="MCK-LAP-001"/);
  assert.match(listHtml, /data-brand="Northwind"/);
  assert.match(listHtml, /data-in-stock="true"/);
  assert.match(listHtml, /data-testid="product-image"/);
  assert.match(listHtml, /data-testid="product-old-price"/);
  assert.match(listHtml, /No reviews yet/);

  for (const page of Array.from({ length: expectedProductPageCount - 1 }, (_, index) => index + 2)) {
    const pageHtml = await fs.readFile(path.join(outDir, `scenarios/ecommerce/products/page/${page}/index.html`), 'utf8');
    const expectedItems = products.slice((page - 1) * productPageSize, page * productPageSize).length;
    assert.equal(countMatches(pageHtml, /data-testid="product-card"/g), expectedItems, `page ${page} should render ${expectedItems} product cards`);
    assert.match(pageHtml, /data-testid="pagination"/);
    assert.match(pageHtml, /data-testid="page-previous"/);
    assert.match(pageHtml, /data-testid="page-next"/);
  }

  const scenariosHtml = await fs.readFile(path.join(outDir, 'scenarios/index.html'), 'utf8');
  for (const slug of scenarioSlugs) {
    assert.match(scenariosHtml, new RegExp(`data-scenario="${slug}"`), `missing scenario ${slug}`);
  }

  const dynamicHtml = await fs.readFile(path.join(outDir, 'scenarios/dynamic-products/index.html'), 'utf8');
  assert.match(dynamicHtml, /data-testid="dynamic-products"/);
  assert.match(dynamicHtml, /data-testid="load-more-products"/);

  const landingHtml = await fs.readFile(path.join(outDir, 'scenarios/ecommerce/index.html'), 'utf8');
  assert.match(landingHtml, /fictional static e-commerce scenario/i);
  assert.match(landingHtml, /data-testid="featured-category"/);
  assert.match(landingHtml, /data-testid="product-card"/);

  const categoryIndexHtml = await fs.readFile(path.join(outDir, 'scenarios/ecommerce/categories/index.html'), 'utf8');
  assert.equal(countMatches(categoryIndexHtml, /data-testid="category-card"/g), categories.length);
  for (const category of categories) {
    const categoryHtml = await fs.readFile(path.join(outDir, 'scenarios/ecommerce/categories', category.id, 'index.html'), 'utf8');
    const categoryPage2Html = await fs.readFile(path.join(outDir, 'scenarios/ecommerce/categories', category.id, 'page/2/index.html'), 'utf8');
    const totalCategoryProducts = categoryCount(category.id);
    const page2Products = Math.max(0, totalCategoryProducts - categoryPageSize);
    assert.match(categoryHtml, new RegExp(`data-testid="category-header"[^>]*data-category="${category.id}"`));
    assert.match(categoryHtml, new RegExp(`${totalCategoryProducts} products`));
    assert.equal(countMatches(categoryHtml, /data-testid="product-card"/g), categoryPageSize);
    assert.match(categoryHtml, /data-testid="pagination"/);
    assert.match(categoryHtml, /data-testid="page-next"/);
    assert.match(categoryPage2Html, new RegExp(`data-testid="category-header"[^>]*data-category="${category.id}"`));
    assert.match(categoryPage2Html, new RegExp(`${totalCategoryProducts} products`));
    assert.equal(countMatches(categoryPage2Html, /data-testid="product-card"/g), page2Products);
    assert.match(categoryPage2Html, /data-testid="pagination"/);
    assert.match(categoryPage2Html, /data-testid="page-previous"/);
  }

  const detailHtml = await fs.readFile(path.join(outDir, productPageFile(products[0])), 'utf8');
  for (const selector of [
    'data-testid="breadcrumbs"',
    'data-testid="product-detail"',
    'data-product-sku="MCK-LAP-001"',
    'data-category="laptops"',
    'data-testid="product-title"',
    'data-testid="product-brand"',
    'data-testid="product-sku"',
    'data-testid="product-image"',
    'data-testid="product-price"',
    'data-testid="product-description"',
    'data-testid="product-specs"',
    'data-testid="product-tags"',
    'data-testid="reviews"',
    'data-testid="related-products"',
  ]) {
    assert.match(detailHtml, new RegExp(selector), `missing ${selector} in product detail`);
  }
  assert.match(detailHtml, /type="application\/ld\+json"/);
  assert.match(detailHtml, /data-testid="review"/);
  assert.match(detailHtml, /data-testid="review-date"/);

  const noReviewProduct = products.find((product) => !reviews[product.id]);
  const noReviewHtml = await fs.readFile(path.join(outDir, productPageFile(noReviewProduct)), 'utf8');
  assert.match(noReviewHtml, /data-testid="reviews-empty"/);

  const noTagsProduct = products.find((product) => product.tags.length === 0);
  const noTagsHtml = await fs.readFile(path.join(outDir, productPageFile(noTagsProduct)), 'utf8');
  assert.match(noTagsHtml, /data-testid="product-tags-empty"/);

  const searchHtml = await fs.readFile(path.join(outDir, 'scenarios/ecommerce/search/index.html'), 'utf8');
  for (const control of [
    'data-testid="product-search-form"',
    'data-testid="search-query"',
    'data-testid="search-category"',
    'data-testid="search-brand"',
    'data-testid="search-min-price"',
    'data-testid="search-max-price"',
    'data-testid="search-in-stock"',
    'data-testid="search-sort"',
    'data-testid="search-status"',
    'data-testid="search-results"',
  ]) {
    assert.match(searchHtml, new RegExp(control), `missing ${control} on search page`);
  }

  const expectedPrefix = normalizeBase(basePath) === '/' ? '/' : normalizeBase(basePath);
  const apiIndex = JSON.parse(await fs.readFile(path.join(outDir, 'api/products/index.json'), 'utf8'));

  for (const page of Array.from({ length: expectedProductPageCount }, (_, index) => index + 1)) {
    const apiPage = JSON.parse(await fs.readFile(path.join(outDir, `api/products/page-${page}.json`), 'utf8'));
    const expectedItems = products.slice((page - 1) * productPageSize, page * productPageSize).length;
    assert.equal(apiPage.page, page);
    assert.equal(apiPage.pageSize, productPageSize);
    assert.equal(apiPage.total, products.length);
    assert.equal(apiPage.items.length, expectedItems);
    assert.ok(apiPage.items[0].url.startsWith(`${expectedPrefix}scenarios/ecommerce/products/`));
    assert.ok(apiPage.items[0].image.startsWith(`${expectedPrefix}assets/images/products/`));
    for (const field of ['id', 'slug', 'sku', 'title', 'brand', 'category', 'price', 'oldPrice', 'currency', 'rating', 'reviewCount', 'inStock', 'stockCount', 'description', 'tags', 'specs', 'url', 'image']) {
      assert.ok(Object.hasOwn(apiPage.items[0], field), `product API item missing ${field}`);
    }
  }

  assert.deepEqual(apiIndex, JSON.parse(await fs.readFile(path.join(outDir, 'api/products/page-1.json'), 'utf8')));

  const categoriesApi = JSON.parse(await fs.readFile(path.join(outDir, 'api/categories/index.json'), 'utf8'));
  assert.equal(categoriesApi.items.length, categories.length);
  for (const item of categoriesApi.items) {
    assert.equal(item.count, categoryCount(item.id));
    assert.ok(item.url.startsWith(`${expectedPrefix}scenarios/ecommerce/categories/`));
    assert.equal(typeof item.description, 'string');
  }

  const searchApi = JSON.parse(await fs.readFile(path.join(outDir, 'api/search/products.json'), 'utf8'));
  assert.equal(searchApi.total, products.length);
  assert.equal(searchApi.items.length, products.length);
  for (const field of ['id', 'slug', 'sku', 'title', 'brand', 'category', 'price', 'oldPrice', 'currency', 'rating', 'reviewCount', 'inStock', 'stockCount', 'description', 'tags', 'specs', 'url', 'image']) {
    assert.ok(Object.hasOwn(searchApi.items[0], field), `search API item missing ${field}`);
  }

  const reviewsIndex = JSON.parse(await fs.readFile(path.join(outDir, 'api/reviews/index.json'), 'utf8'));
  assert.equal(reviewsIndex.total, products.length);
  assert.equal(reviewsIndex.items.length, products.length);
  for (const product of products) {
    const reviewPage = JSON.parse(await fs.readFile(path.join(outDir, 'api/reviews', `${product.id}.json`), 'utf8'));
    assert.equal(reviewPage.productId, product.id);
    assert.ok(Array.isArray(reviewPage.items));
    assert.equal(reviewPage.items.length, reviews[product.id]?.length ?? 0);
  }

  const networkError = JSON.parse(await fs.readFile(path.join(outDir, 'api/network/error.json'), 'utf8'));
  assert.deepEqual(networkError, {
    ok: false,
    error: 'Simulated upstream failure',
    code: 'MOCK_UPSTREAM_FAILURE',
  });

  const specialSvg = await fs.readFile(path.join(outDir, 'assets/images/products/book-data-pipelines-and-scraping-special-edition.svg'), 'utf8');
  assert.match(specialSvg, /&amp; Scraping/);
  assert.doesNotMatch(specialSvg, / & Scraping/);

  const htmlFiles = await walk(outDir, '.html');
  for (const file of htmlFiles) {
    const html = await fs.readFile(file, 'utf8');
    assertNoExternalAssetRefs(html, file);
    const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
    for (const ref of refs) {
      await assertInternalRef(outDir, file, ref, basePath);
    }
  }

  const jsFiles = await walk(outDir, '.js');
  const apiRefs = new Set();
  for (const file of jsFiles) {
    const js = await fs.readFile(file, 'utf8');
    for (const match of js.matchAll(/api\/[A-Za-z0-9/_-]+\.json/g)) {
      apiRefs.add(match[0]);
    }
  }

  for (const ref of apiRefs) {
    await exists(path.join(outDir, ref));
  }
};

test('Mockery static output validates at root and subpath', async () => {
  await validateSourceFixtures();

  const rootOutDir = path.join(rootDir, 'dist');
  const subpathOutDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mockery-subpath-'));

  build(rootOutDir, '/');
  await validateOutput(rootOutDir, '/');

  build(subpathOutDir, '/mockery/');
  await validateOutput(subpathOutDir, '/mockery/');
});
