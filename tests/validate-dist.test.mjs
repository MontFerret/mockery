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

const requiredFiles = [
  'index.html',
  'scenarios/index.html',
  'scenarios/ecommerce/index.html',
  'scenarios/ecommerce/products/index.html',
  'scenarios/ecommerce/products/page/2/index.html',
  'scenarios/ecommerce/products/page/3/index.html',
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
  'api/products/page-1.json',
  'api/products/page-2.json',
  'api/products/page-3.json',
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

const validateOutput = async (outDir, basePath) => {
  for (const rel of requiredFiles) {
    await exists(path.join(outDir, rel));
  }

  for (const product of products) {
    await exists(path.join(outDir, 'scenarios/ecommerce/products', product.id, 'index.html'));
    await exists(path.join(outDir, 'api/reviews', `${product.id}.json`));
    await exists(path.join(outDir, 'assets/images/products', `${product.id}.svg`));
  }

  for (const category of categories) {
    await exists(path.join(outDir, 'scenarios/ecommerce/categories', category.id, 'index.html'));
  }

  const listHtml = await fs.readFile(path.join(outDir, 'scenarios/ecommerce/products/index.html'), 'utf8');
  assert.match(listHtml, /data-testid="product-card"/);

  const scenariosHtml = await fs.readFile(path.join(outDir, 'scenarios/index.html'), 'utf8');
  for (const slug of scenarioSlugs) {
    assert.match(scenariosHtml, new RegExp(`data-scenario="${slug}"`), `missing scenario ${slug}`);
  }

  const dynamicHtml = await fs.readFile(path.join(outDir, 'scenarios/dynamic-products/index.html'), 'utf8');
  assert.match(dynamicHtml, /data-testid="dynamic-products"/);
  assert.match(dynamicHtml, /data-testid="load-more-products"/);

  const apiPage = JSON.parse(await fs.readFile(path.join(outDir, 'api/products/page-1.json'), 'utf8'));
  const expectedPrefix = normalizeBase(basePath) === '/' ? '/' : normalizeBase(basePath);
  assert.equal(apiPage.page, 1);
  assert.equal(apiPage.pageSize, 24);
  assert.equal(apiPage.total, products.length);
  assert.ok(apiPage.items[0].url.startsWith(`${expectedPrefix}scenarios/ecommerce/products/`));
  assert.ok(apiPage.items[0].image.startsWith(`${expectedPrefix}assets/images/products/`));

  const networkError = JSON.parse(await fs.readFile(path.join(outDir, 'api/network/error.json'), 'utf8'));
  assert.deepEqual(networkError, {
    ok: false,
    error: 'Simulated upstream failure',
    code: 'MOCK_UPSTREAM_FAILURE',
  });

  const specialSvg = await fs.readFile(path.join(outDir, 'assets/images/products/books-book-2-special-edition.svg'), 'utf8');
  assert.match(specialSvg, /&amp; Scraping/);
  assert.doesNotMatch(specialSvg, / & Scraping/);

  const htmlFiles = await walk(outDir, '.html');
  for (const file of htmlFiles) {
    const html = await fs.readFile(file, 'utf8');
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
  const rootOutDir = path.join(rootDir, 'dist');
  const subpathOutDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mockery-subpath-'));

  build(rootOutDir, '/');
  await validateOutput(rootOutDir, '/');

  build(subpathOutDir, '/mockery/');
  await validateOutput(subpathOutDir, '/mockery/');
});
