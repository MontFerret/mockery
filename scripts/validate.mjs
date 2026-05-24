import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const runBuild = spawnSync(process.execPath, ['scripts/build.mjs'], { cwd: rootDir, stdio: 'inherit' });
if (runBuild.status !== 0) {
  process.exit(runBuild.status ?? 1);
}

const mustExist = [
  'index.html',
  'scenarios/index.html',
  'scenarios/ecommerce/index.html',
  'scenarios/ecommerce/products/index.html',
  'scenarios/ecommerce/products/page/2/index.html',
  'scenarios/dynamic-products/index.html',
  'scenarios/network/index.html',
  'scenarios/messy-markup/index.html',
  'scenarios/forms/index.html',
  'scenarios/tables/orders/index.html',
  'scenarios/infinite-scroll/index.html',
  'scenarios/delayed-rendering/index.html',
  'scenarios/shadow-dom/index.html',
  'scenarios/iframes/index.html',
  'scenarios/navigation/index.html',
  'api/products/page-1.json',
  'api/products/page-2.json',
  'api/products/page-3.json',
  'api/network/error.json',
];

for (const rel of mustExist) {
  await fs.access(path.join(distDir, rel));
}

const products = JSON.parse(await fs.readFile(path.join(rootDir, 'src/data/products.json'), 'utf8'));
for (const p of products) {
  await fs.access(path.join(distDir, p.url.replace(/^\//, ''), 'index.html'));
}

const listHtml = await fs.readFile(path.join(distDir, 'scenarios/ecommerce/products/index.html'), 'utf8');
if (!listHtml.includes('data-testid="product-card"')) {
  throw new Error('Product listing missing product-card selector');
}

const scenariosHtml = await fs.readFile(path.join(distDir, 'scenarios/index.html'), 'utf8');
for (const slug of ['ecommerce', 'forms', 'tables', 'network', 'messy-markup', 'infinite-scroll', 'delayed-rendering', 'shadow-dom', 'iframes', 'navigation', 'dynamic-products']) {
  if (!scenariosHtml.includes(`data-scenario="${slug}"`)) {
    throw new Error(`Scenario index missing ${slug}`);
  }
}

const dynamicHtml = await fs.readFile(path.join(distDir, 'scenarios/dynamic-products/index.html'), 'utf8');
if (!dynamicHtml.includes('dynamic-products') || !dynamicHtml.includes('load-more-products')) {
  throw new Error('Dynamic products markers missing');
}

const htmlFiles = [];
const walk = async (dir) => {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
};
await walk(distDir);

for (const file of htmlFiles) {
  const html = await fs.readFile(file, 'utf8');
  const hrefs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of hrefs) {
    if (/^https?:\/\//.test(ref)) {
      if (!ref.startsWith('https://mockery.montferret.dev/')) {
        throw new Error(`External dependency found in ${path.relative(distDir, file)}: ${ref}`);
      }
      continue;
    }
    if (ref.startsWith('mailto:') || ref.startsWith('#')) continue;
    const clean = ref.split('#')[0].split('?')[0];
    const resolved = path.resolve(path.dirname(file), clean);
    const candidates = [resolved, path.join(resolved, 'index.html')];
    const ok = await Promise.any(candidates.map(async (c) => fs.access(c).then(() => true))).catch(() => false);
    if (!ok) {
      throw new Error(`Broken internal link in ${path.relative(distDir, file)}: ${ref}`);
    }
  }
}

console.log(`Validation passed for ${htmlFiles.length} HTML files and ${products.length} product pages.`);
