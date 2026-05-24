import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');

const loadJson = async (name) => JSON.parse(await fs.readFile(path.join(srcDir, 'data', name), 'utf8'));

const [products, categories, reviews, orders, customers] = await Promise.all([
  loadJson('products.json'),
  loadJson('categories.json'),
  loadJson('reviews.json'),
  loadJson('orders.json'),
  loadJson('customers.json'),
]);

const scenarioDefs = [
  { slug: 'ecommerce', title: 'E-commerce', desc: 'Product listings, detail pages, categories, pagination, and reviews.' },
  { slug: 'dynamic-products', title: 'Dynamic Products', desc: 'Client-side rendering from static JSON with load-more behavior.' },
  { slug: 'network', title: 'Network Activity', desc: 'Buttons that trigger predictable fetch patterns and statuses.' },
  { slug: 'messy-markup', title: 'Messy Markup', desc: 'Intentional HTML inconsistencies for robust scraping examples.' },
  { slug: 'forms', title: 'Forms', desc: 'Interactive form controls with client-side result rendering.' },
  { slug: 'tables', title: 'Tables', desc: 'Clean and messy table extraction examples.' },
  { slug: 'infinite-scroll', title: 'Infinite Scroll', desc: 'Scroll-triggered loading of static JSON batches.' },
  { slug: 'delayed-rendering', title: 'Delayed Rendering', desc: 'Controlled delayed DOM updates for WAITFOR examples.' },
  { slug: 'shadow-dom', title: 'Shadow DOM', desc: 'Open shadow DOM components for browser-driver tests.' },
  { slug: 'iframes', title: 'Iframes', desc: 'Same-origin iframes with product, table, and delayed content.' },
  { slug: 'navigation', title: 'Navigation', desc: 'Multi-step flow with links, location changes, hash and query.' },
];

const topNav = [
  { label: 'Home', href: '/' },
  { label: 'Scenarios', href: '/scenarios/' },
  { label: 'E-commerce', href: '/scenarios/ecommerce/' },
  { label: 'API', href: '/api/products/index.json' },
];

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const ensureDir = (filePath) => fs.mkdir(path.dirname(filePath), { recursive: true });
const slash = (p) => p.split(path.sep).join('/');
const pageDir = (urlPath) => path.join(distDir, urlPath.replace(/^\//, ''), 'index.html');
const fromHtml = (htmlPath) => slash(path.relative(path.dirname(htmlPath), distDir)).replace(/\/$/, '') || '.';
const relHref = (htmlPath, targetPath) => {
  const [, rawPath, suffix] = targetPath.match(/^([^?#]*)(.*)$/) ?? [];
  const relative = slash(path.relative(path.dirname(htmlPath), pageDir(rawPath)).replace(/\/index\.html$/, '/')) || './';
  return `${relative}${suffix ?? ''}`;
};
const relFile = (htmlPath, filePath) => slash(path.relative(path.dirname(htmlPath), path.join(distDir, filePath.replace(/^\//, ''))));

const layout = ({ htmlPath, title, description, body, scripts = [] }) => {
  const nav = topNav.map((item) => `<li><a href="${item.href.endsWith('.json') ? relFile(htmlPath, item.href) : relHref(htmlPath, item.href)}">${item.label}</a></li>`).join('');
  const scriptTags = [relFile(htmlPath, '/assets/app.js'), ...scripts.map((s) => relFile(htmlPath, s))]
    .map((src) => `<script src="${src}" defer></script>`)
    .join('\n');
  return `<!doctype html>
<html lang="en" data-root-path="${relHref(htmlPath, '/')}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <link rel="canonical" href="" />
  <link rel="stylesheet" href="${relFile(htmlPath, '/assets/styles.css')}" />
</head>
<body>
  <header class="site-header">
    <div class="wrap">
      <strong>Mockery</strong>
      <nav aria-label="Primary"><ul>${nav}</ul></nav>
    </div>
  </header>
  <main class="wrap">
    ${body}
  </main>
  <footer class="site-footer">
    <div class="wrap">
      <p>Mockery is a fictional static website for Ferret demos, tests, and documentation. No real products, accounts, or payments exist.</p>
    </div>
  </footer>
  ${scriptTags}
</body>
</html>`;
};

await fs.rm(distDir, { recursive: true, force: true });
await fs.mkdir(distDir, { recursive: true });
await fs.cp(path.join(srcDir, 'assets'), path.join(distDir, 'assets'), { recursive: true });

const writePage = async (urlPath, content) => {
  const out = pageDir(urlPath);
  await ensureDir(out);
  await fs.writeFile(out, content);
};

const paginationChunks = [products.slice(0, 24), products.slice(24, 48), products.slice(48, 72)];

const productCard = (p, htmlPath) => `<article class="product-card" data-testid="product-card" data-product-id="${p.id}" data-category="${p.category}" data-price="${p.price}">
  <a class="product-link" data-testid="product-link" href="${relHref(htmlPath, p.url)}">
    <img class="product-image" src="${relFile(htmlPath, p.image)}" alt="${p.title}" />
    <h2 class="product-title" data-testid="product-title">${p.title}</h2>
  </a>
  <p class="product-brand" data-testid="product-brand">${p.brand}</p>
  <p class="product-price" data-testid="product-price" data-price="${p.price}" data-currency="${p.currency}">${fmt.format(p.price)}</p>
  <p class="product-rating" data-testid="product-rating" data-rating="${p.rating ?? ''}">${p.rating ? `${p.rating} out of 5` : 'Not rated yet'}</p>
  <p class="product-stock" data-testid="product-stock">${p.inStock ? `In stock (${p.stockCount})` : 'Out of stock'}</p>
</article>`;

const pageBody = (htmlPath, pageNumber, items) => {
  const previous = pageNumber > 1 ? `/scenarios/ecommerce/products/${pageNumber === 2 ? '' : `page/${pageNumber - 1}/`}` : '/scenarios/ecommerce/products/';
  const next = pageNumber < 3 ? `/scenarios/ecommerce/products/page/${pageNumber + 1}/` : '/scenarios/ecommerce/products/page/3/';
  return `<h1>Product listing page ${pageNumber}</h1>
  <div class="product-grid">${items.map((p) => productCard(p, htmlPath)).join('\n')}</div>
  <nav class="pagination" aria-label="Product pages">
    <a class="page-link previous" href="${relHref(htmlPath, previous)}">Previous</a>
    <a class="page-link" href="${relHref(htmlPath, '/scenarios/ecommerce/products/')}">1</a>
    <a class="page-link" href="${relHref(htmlPath, '/scenarios/ecommerce/products/page/2/')}">2</a>
    <a class="page-link" href="${relHref(htmlPath, '/scenarios/ecommerce/products/page/3/')}">3</a>
    <a class="page-link next" href="${relHref(htmlPath, next)}">Next</a>
  </nav>`;
};

await writePage('/', layout({
  htmlPath: pageDir('/'),
  title: 'Mockery: fake web scenarios for real Ferret tests',
  description: 'A safe playground of deterministic web scenarios for Ferret.',
  body: `<h1>Mockery</h1>
  <p class="notice"><strong>Fake demo notice:</strong> This entire website is deterministic demo content only.</p>
  <p>Mockery is a collection of deterministic fake web scenarios for testing Ferret and its HTML drivers. Each scenario models a common scraping situation: static pages, dynamic rendering, pagination, forms, tables, network activity, infinite scroll, messy markup, iframes, and browser interactions.</p>
  <section>
    <h2>Featured scenarios</h2>
    <div class="grid">${scenarioDefs.map((s) => `<article class="scenario-card" data-scenario="${s.slug}"><h3>${s.title}</h3><p>${s.desc}</p><a href="${relHref(pageDir('/'), `/scenarios/${s.slug}/`)}">Open scenario</a></article>`).join('')}</div>
  </section>`,
}));

await writePage('/scenarios/', layout({
  htmlPath: pageDir('/scenarios/'),
  title: 'Mockery scenarios index',
  description: 'Scenario index for deterministic scraping and browser automation demos.',
  body: `<h1>Scenarios</h1><p>Browse deterministic fake web scenarios.</p>
  <div class="grid">${scenarioDefs.map((s) => `<article class="scenario-card" data-scenario="${s.slug}"><h2>${s.title}</h2><p>${s.desc}</p><p>Demonstrates: deterministic selectors, automation-safe DOM states, static hosting behavior.</p><a href="${relHref(pageDir('/scenarios/'), `/scenarios/${s.slug}/`)}">Open scenario</a></article>`).join('')}</div>`,
}));

await writePage('/scenarios/ecommerce/', layout({
  htmlPath: pageDir('/scenarios/ecommerce/'),
  title: 'E-commerce scenario',
  description: 'Mock e-commerce scenario with products, categories, search and detail pages.',
  body: `<h1>E-commerce scenario</h1>
  <p>Deterministic fake storefront scenario for extraction and pagination examples.</p>
  <ul>
    <li><a href="${relHref(pageDir('/scenarios/ecommerce/'), '/scenarios/ecommerce/products/')}">Products</a></li>
    <li><a href="${relHref(pageDir('/scenarios/ecommerce/'), '/scenarios/ecommerce/categories/')}">Categories</a></li>
    <li><a href="${relHref(pageDir('/scenarios/ecommerce/'), '/scenarios/ecommerce/search/')}">Search</a></li>
  </ul>`,
}));

await writePage('/scenarios/ecommerce/products/', layout({
  htmlPath: pageDir('/scenarios/ecommerce/products/'),
  title: 'E-commerce products page 1',
  description: 'Product listing page 1.',
  body: pageBody(pageDir('/scenarios/ecommerce/products/'), 1, paginationChunks[0]),
}));
await writePage('/scenarios/ecommerce/products/page/2/', layout({
  htmlPath: pageDir('/scenarios/ecommerce/products/page/2/'),
  title: 'E-commerce products page 2',
  description: 'Product listing page 2.',
  body: pageBody(pageDir('/scenarios/ecommerce/products/page/2/'), 2, paginationChunks[1]),
}));
await writePage('/scenarios/ecommerce/products/page/3/', layout({
  htmlPath: pageDir('/scenarios/ecommerce/products/page/3/'),
  title: 'E-commerce products page 3',
  description: 'Product listing page 3.',
  body: pageBody(pageDir('/scenarios/ecommerce/products/page/3/'), 3, paginationChunks[2]),
}));

await writePage('/scenarios/ecommerce/categories/', layout({
  htmlPath: pageDir('/scenarios/ecommerce/categories/'),
  title: 'E-commerce categories',
  description: 'Category listing for e-commerce scenario.',
  body: `<h1>Categories</h1><ul>${categories.map((c) => `<li><a href="${relHref(pageDir('/scenarios/ecommerce/categories/'), `/scenarios/ecommerce/categories/${c.id}/`)}">${c.name}</a></li>`).join('')}</ul>`,
}));

for (const category of categories.map((item) => item.id)) {
  const items = products.filter((p) => p.category === category);
  const htmlPath = pageDir(`/scenarios/ecommerce/categories/${category}/`);
  await writePage(`/scenarios/ecommerce/categories/${category}/`, layout({
    htmlPath,
    title: `${category} category`,
    description: `Category page for ${category}.`,
    body: `<h1>${category}</h1><div class="product-grid">${items.map((p) => productCard(p, htmlPath)).join('')}</div>`,
  }));
}

await writePage('/scenarios/ecommerce/search/', layout({
  htmlPath: pageDir('/scenarios/ecommerce/search/'),
  title: 'E-commerce search',
  description: 'Static search-like page driven by query string.',
  body: `<h1>Search</h1>
  <p>Use <code>?q=laptop</code> to filter by title.</p>
  <div id="search-results" data-testid="search-results"></div>
  <script>
  (() => {
    const q = new URLSearchParams(window.location.search).get('q')?.toLowerCase() ?? '';
    const all = ${JSON.stringify(products.slice(0, 25).map((p) => ({ id: p.id, title: p.title, price: p.price })))};
    const filtered = q ? all.filter((p) => p.title.toLowerCase().includes(q)) : all;
    document.getElementById('search-results').innerHTML = filtered.map((p) => '<article class="product-card" data-testid="product-card"><h2 data-testid="product-title">' + p.title + '</h2><p data-testid="product-price">$' + p.price.toFixed(2) + '</p></article>').join('');
  })();
  </script>`,
}));

for (const p of products) {
  const htmlPath = pageDir(`/scenarios/ecommerce/products/${p.id}/`);
  const productReviews = reviews[p.id] ?? [];
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3);
  const breadcrumb = [
    ['Home', '/'],
    ['Scenarios', '/scenarios/'],
    ['E-commerce', '/scenarios/ecommerce/'],
    ['Products', '/scenarios/ecommerce/products/'],
  ];

  await writePage(`/scenarios/ecommerce/products/${p.id}/`, layout({
    htmlPath,
    title: `${p.title} - Mockery`,
    description: p.description,
    body: `<nav aria-label="Breadcrumb"><ol>${breadcrumb.map(([label, href]) => `<li><a href="${relHref(htmlPath, href)}">${label}</a></li>`).join('')}<li>${p.title}</li></ol></nav>
<h1 class="product-title" data-testid="product-title">${p.title}</h1>
<p class="product-brand" data-testid="product-brand">${p.brand}</p>
<div class="product-price" data-testid="product-price" data-price="${p.price}" data-currency="${p.currency}">${p.oldPrice ? `<span class="old-price">${fmt.format(p.oldPrice)}</span>` : ''}${fmt.format(p.price)}</div>
<p data-testid="product-stock">${p.inStock ? 'In stock' : 'Out of stock'}</p>
<p data-testid="product-rating">${p.rating ?? 'N/A'} (${p.reviewCount} reviews)</p>
<p>${p.description}</p>
<section class="product-specs" data-testid="product-specs"><h2>Specifications</h2><table><tbody>${Object.entries(p.specs).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</tbody></table></section>
<section><h2>Tags</h2>${p.tags.map((tag) => `<span class="badge">${tag}</span>`).join(' ')}</section>
<section class="reviews" data-testid="reviews"><h2>Reviews</h2>${productReviews.map((r) => `<article class="review" data-testid="review" data-review-id="${r.id}" data-stars="${r.stars}"><h3 class="review-title" data-testid="review-title">${r.title}</h3><p class="review-author" data-testid="review-author">${r.author}</p><time class="review-date" datetime="${r.date}">${new Date(r.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time><p class="review-body" data-testid="review-body">${r.body}</p></article>`).join('')}</section>
<section><h2>Related products</h2><div class="grid">${related.map((item) => `<a class="card" href="${relHref(htmlPath, item.url)}">${item.title}</a>`).join('')}</div></section>
<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: p.title,
  sku: p.sku,
  brand: { '@type': 'Brand', name: p.brand },
  offers: {
    '@type': 'Offer',
    priceCurrency: p.currency,
    price: p.price,
    availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
  },
})}</script>`,
  }));
}

await writePage('/scenarios/dynamic-products/', layout({
  htmlPath: pageDir('/scenarios/dynamic-products/'),
  title: 'Dynamic products scenario',
  description: 'Client-side rendering from static JSON pages.',
  body: `<h1>Dynamic products</h1>
<div id="dynamic-products" class="product-grid" data-testid="dynamic-products" data-loaded="false"></div>
<button id="load-more-products" data-testid="load-more-products" type="button">Load more</button>
<div id="dynamic-status" data-testid="dynamic-status" aria-live="polite">Loading...</div>`,
  scripts: ['/assets/dynamic-products.js'],
}));

await writePage('/scenarios/network/', layout({
  htmlPath: pageDir('/scenarios/network/'),
  title: 'Network activity scenario',
  description: 'Deterministic network activity via static JSON fetch calls.',
  body: `<h1>Network activity</h1>
<div class="grid">
  <button type="button" data-fetch="products">Fetch products</button>
  <button type="button" data-fetch="reviews">Fetch reviews</button>
  <button type="button" data-fetch="recommendations">Fetch recommendations</button>
  <button type="button" data-fetch="error">Fetch simulated error payload</button>
  <button id="network-sequential" type="button">Trigger delayed sequential requests</button>
  <button id="network-parallel" type="button">Trigger parallel requests</button>
</div>
<ul id="network-log" data-testid="network-log"></ul>
<div id="network-status" data-testid="network-status" data-state="idle">idle</div>`,
  scripts: ['/assets/network.js'],
}));

await writePage('/scenarios/messy-markup/', layout({
  htmlPath: pageDir('/scenarios/messy-markup/'),
  title: 'Messy markup scenario',
  description: 'Intentional inconsistency for scraping fallback examples.',
  body: `<h1>Messy markup</h1>
<!-- Inconsistencies below are intentional for parser robustness demos. -->
<section>
  <div class="product-card"><span class="title">Budget Mouse</span> <span class="price">$19.99</span></div>
  <div class="item product-card"><div><h2>Mechanical Keyboard</h2><!-- price missing intentionally --></div></div>
  <div class="product-card promoted"><div data-testid="product-name">USB-C Hub</div><div class="money">USD 49.00</div></div>
  <div class="product-card"><p data-testid="product-name"> Wireless Charger </p><a href="#"> View </a><img data-src="${relFile(pageDir('/scenarios/messy-markup/'), '/assets/images/products/laptop-pro-14.svg')}" alt="Lazy"/></div>
  <div class="product-card unavailable"><h3>Noise-Canceling Headphones</h3><span class="price">EUR 199,00</span><span>Unavailable</span></div>
  <div class="promo">Promoted card mixed with product list</div>
</section>`,
}));

await writePage('/scenarios/forms/', layout({
  htmlPath: pageDir('/scenarios/forms/'),
  title: 'Forms scenario',
  description: 'Form interactions with JS-intercepted submissions.',
  body: `<h1>Forms</h1>
<form id="search-form" data-testid="search-form"><label for="query">Search</label><input id="query" name="query"/><button type="submit">Submit</button></form>
<form id="newsletter-form" data-testid="newsletter-form"><label for="email">Email</label><input id="email" name="email" type="email" required /><label><input type="checkbox" name="weekly" value="yes" /> Weekly updates</label><button type="submit">Join</button></form>
<form id="checkout-form" data-testid="checkout-form"><label for="country">Country</label><select id="country" name="country"><option>US</option><option>DE</option></select><fieldset><legend>Delivery</legend><label><input type="radio" name="delivery" value="standard" checked /> Standard</label><label><input type="radio" name="delivery" value="express" /> Express</label></fieldset><label for="coupon">Coupon (disabled)</label><input id="coupon" name="coupon" disabled value="COMING-SOON" /><button type="submit">Review order</button></form>
<section id="form-result" data-testid="form-result" hidden></section>`,
  scripts: ['/assets/forms.js'],
}));

await writePage('/scenarios/tables/', layout({
  htmlPath: pageDir('/scenarios/tables/'),
  title: 'Tables scenario',
  description: 'Table extraction examples.',
  body: '<h1>Tables</h1><ul><li><a href="orders/">Orders table</a></li><li><a href="inventory/">Inventory table</a></li><li><a href="missing-cells/">Missing cells table</a></li></ul>',
}));

const ordersRows = orders.map((o) => `<tr data-order-id="${o.orderId}" data-total="${o.total}"><td>${o.orderId}</td><td><a href="#customer-${o.customer}">${o.customer}</a></td><td>${o.date}</td><td>${o.status}</td><td>${fmt.format(o.total)}</td><td>${o.itemCount}</td></tr>`).join('');
await writePage('/scenarios/tables/orders/', layout({
  htmlPath: pageDir('/scenarios/tables/orders/'),
  title: 'Orders table',
  description: 'Clean orders table with sortable control.',
  body: `<h1>Orders table</h1><button id="sort-total" type="button">Sort by total</button><table id="sortable-orders" data-testid="orders-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th><th>Item count</th></tr></thead><tbody>${ordersRows}</tbody><tfoot><tr><th colspan="4">Total</th><th>${fmt.format(orders.reduce((sum, item) => sum + item.total, 0))}</th><th>${orders.reduce((sum, item) => sum + item.itemCount, 0)}</th></tr></tfoot></table>`,
  scripts: ['/assets/tables.js'],
}));

await writePage('/scenarios/tables/inventory/', layout({
  htmlPath: pageDir('/scenarios/tables/inventory/'),
  title: 'Inventory table',
  description: 'Table with nested links and data attributes.',
  body: `<h1>Inventory</h1><table><thead><tr><th>SKU</th><th>Title</th><th>Category</th><th>Stock</th></tr></thead><tbody>${products.slice(0, 10).map((p) => `<tr data-sku="${p.sku}" data-category="${p.category}"><td>${p.sku}</td><td><a href="${relHref(pageDir('/scenarios/tables/inventory/'), p.url)}">${p.title}</a></td><td>${p.category}</td><td>${p.stockCount}</td></tr>`).join('')}</tbody></table>`,
}));

await writePage('/scenarios/tables/missing-cells/', layout({
  htmlPath: pageDir('/scenarios/tables/missing-cells/'),
  title: 'Missing cells table',
  description: 'Table with intentional missing cells.',
  body: `<h1>Missing cells</h1><table><thead><tr><th>Row</th><th>Name</th><th>Price</th><th>Status</th></tr></thead><tbody><tr><td>1</td><td>Alpha</td><td>$10</td><td>ok</td></tr><tr><td>2</td><td>Beta</td><td></td><td>pending</td></tr><tr><td>3</td><td></td><td>$33</td><td>ok</td></tr></tbody></table>`,
}));

await writePage('/scenarios/infinite-scroll/', layout({
  htmlPath: pageDir('/scenarios/infinite-scroll/'),
  title: 'Infinite scroll scenario',
  description: 'Loads additional products when scrolling near the bottom.',
  body: '<h1>Infinite scroll</h1><div id="infinite-scroll-status" data-testid="infinite-scroll-status" data-state="idle"></div><div id="infinite-products" data-testid="infinite-products"></div>',
  scripts: ['/assets/infinite-scroll.js'],
}));

await writePage('/scenarios/delayed-rendering/', layout({
  htmlPath: pageDir('/scenarios/delayed-rendering/'),
  title: 'Delayed rendering scenario',
  description: 'Controlled delayed content rendering and state changes.',
  body: '<h1>Delayed rendering</h1><div data-testid="delayed-short" data-state="pending"></div><div data-testid="delayed-long" data-state="pending"></div><button id="delayed-interactive" type="button">Reveal interaction content</button><div id="delayed-click-result" data-state="pending"></div><div id="delayed-ticker">Tick 0</div>',
  scripts: ['/assets/delayed-rendering.js'],
}));

await writePage('/scenarios/iframes/', layout({
  htmlPath: pageDir('/scenarios/iframes/'),
  title: 'Iframes scenario',
  description: 'Same-origin iframe traversal examples.',
  body: `<h1>Iframes</h1>
<iframe title="Frame A" src="${relHref(pageDir('/scenarios/iframes/'), '/scenarios/iframes/frame-a/')}" loading="lazy"></iframe>
<iframe title="Frame B" src="${relHref(pageDir('/scenarios/iframes/'), '/scenarios/iframes/frame-b/')}" loading="lazy"></iframe>
<iframe title="Frame Delayed" src="${relHref(pageDir('/scenarios/iframes/'), '/scenarios/delayed-rendering/')}" loading="lazy"></iframe>`,
}));

await writePage('/scenarios/iframes/frame-a/', layout({
  htmlPath: pageDir('/scenarios/iframes/frame-a/'),
  title: 'Frame A',
  description: 'Iframe with product-like content.',
  body: '<h1>Frame A</h1><article class="product-card" data-testid="product-card"><h2 data-testid="product-title">Frame Product Alpha</h2><p data-testid="product-price">$88.00</p></article>',
}));

await writePage('/scenarios/iframes/frame-b/', layout({
  htmlPath: pageDir('/scenarios/iframes/frame-b/'),
  title: 'Frame B',
  description: 'Iframe with simple table.',
  body: '<h1>Frame B</h1><table><thead><tr><th>ID</th><th>Value</th></tr></thead><tbody><tr><td>row-1</td><td>42</td></tr></tbody></table>',
}));

await writePage('/scenarios/shadow-dom/', layout({
  htmlPath: pageDir('/scenarios/shadow-dom/'),
  title: 'Shadow DOM scenario',
  description: 'Open shadow DOM custom element examples.',
  body: '<h1>Shadow DOM</h1><mockery-product-card title="Shadow Laptop"></mockery-product-card><mockery-hidden-details></mockery-hidden-details>',
  scripts: ['/assets/shadow-dom.js'],
}));

await writePage('/scenarios/navigation/', layout({
  htmlPath: pageDir('/scenarios/navigation/'),
  title: 'Navigation scenario',
  description: 'Link, hash and query based navigation flow.',
  body: `<h1>Navigation flow</h1><p><a href="${relHref(pageDir('/scenarios/navigation/'), '/scenarios/navigation/step-1/')}">Start flow</a></p><button type="button" onclick="window.location.href='${relHref(pageDir('/scenarios/navigation/'), '/scenarios/navigation/step-1/?mode=button')}';">Start by button</button><p><a href="#hash-example">Hash navigation target</a></p><div id="hash-example">Hash target block</div>`,
}));
await writePage('/scenarios/navigation/step-1/', layout({
  htmlPath: pageDir('/scenarios/navigation/step-1/'),
  title: 'Navigation step 1',
  description: 'Step 1 of navigation flow.',
  body: `<h1>Step 1</h1><a href="${relHref(pageDir('/scenarios/navigation/step-1/'), '/scenarios/navigation/step-2/?from=step-1')}">Continue to step 2</a>`,
}));
await writePage('/scenarios/navigation/step-2/', layout({
  htmlPath: pageDir('/scenarios/navigation/step-2/'),
  title: 'Navigation step 2',
  description: 'Step 2 of navigation flow.',
  body: `<h1>Step 2</h1><button type="button" onclick="window.location.href='${relHref(pageDir('/scenarios/navigation/step-2/'), '/scenarios/navigation/done/#complete')}';">Finish flow</button>`,
}));
await writePage('/scenarios/navigation/done/', layout({
  htmlPath: pageDir('/scenarios/navigation/done/'),
  title: 'Navigation done',
  description: 'Completed navigation flow.',
  body: '<h1 id="complete">Done</h1><p>Navigation scenario complete.</p>',
}));

const writeJson = async (filePath, payload) => {
  const full = path.join(distDir, filePath);
  await ensureDir(full);
  await fs.writeFile(full, JSON.stringify(payload, null, 2));
};

await writeJson('api/products/index.json', { page: 1, pageSize: products.length, total: products.length, items: products });
await Promise.all(paginationChunks.map((items, i) => writeJson(`api/products/page-${i + 1}.json`, { page: i + 1, pageSize: 24, total: products.length, items })));
await writeJson('api/categories/index.json', { total: categories.length, items: categories });
await writeJson('api/reviews/index.json', { total: Object.keys(reviews).length, items: reviews });
await Promise.all(Object.entries(reviews).map(([productId, entries]) => writeJson(`api/reviews/${productId}.json`, { productId, total: entries.length, items: entries })));
await writeJson('api/search/products.json', { query: 'all', total: products.length, items: products.map(({ id, title, price, category }) => ({ id, title, price, category })) });
await writeJson('api/network/products.json', { ok: true, items: products.slice(0, 5).map(({ id, title }) => ({ id, title })) });
await writeJson('api/network/reviews.json', { ok: true, reviews: Object.values(reviews).flat().slice(0, 5) });
await writeJson('api/network/recommendations.json', { ok: true, recommendations: products.slice(5, 10).map(({ id, title }) => ({ id, title })) });
await writeJson('api/network/error.json', { ok: false, error: 'Simulated upstream failure', code: 'MOCK_UPSTREAM_FAILURE' });
await writeJson('api/network/slow-1.json', { ok: true, step: 1 });
await writeJson('api/network/slow-2.json', { ok: true, step: 2 });
await writeJson('api/network/slow-3.json', { ok: true, step: 3 });
await writeJson('feeds/products.json', { generatedAt: '2026-05-24T00:00:00.000Z', total: products.length, items: products.map(({ id, title, price, category }) => ({ id, title, price, category })) });

for (const p of products) {
  const svgPath = path.join(distDir, p.image.replace(/^\//, ''));
  await ensureDir(svgPath);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" role="img" aria-label="${p.title}"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="45%" text-anchor="middle" font-family="Arial" font-size="28" fill="#0f172a">${p.title}</text><text x="50%" y="58%" text-anchor="middle" font-family="Arial" font-size="18" fill="#334155">${p.category}</text></svg>`;
  await fs.writeFile(svgPath, svg);
}

await fs.writeFile(path.join(distDir, 'robots.txt'), 'User-agent: *\nAllow: /\n');
await fs.writeFile(path.join(distDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://mockery.montferret.dev/</loc></url>${scenarioDefs.map((s) => `<url><loc>https://mockery.montferret.dev/scenarios/${s.slug}/</loc></url>`).join('')}</urlset>`);

console.log(`Mockery built to ${distDir} with ${products.length} products and ${scenarioDefs.length} scenarios.`);
