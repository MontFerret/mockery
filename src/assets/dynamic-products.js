(() => {
  const root = document.getElementById('dynamic-products');
  const status = document.getElementById('dynamic-status');
  const loadMore = document.getElementById('load-more-products');
  if (!root || !status || !loadMore) return;

  let page = 1;
  const maxPage = 3;
  const render = (items) => {
    root.insertAdjacentHTML('beforeend', items.map((item) => `\n      <article class="product-card" data-testid="product-card" data-product-id="${item.id}" data-category="${item.category}" data-price="${item.price}">\n        <a class="product-link" data-testid="product-link" href="${item.url}">\n          <img class="product-image" src="${item.image}" alt="${item.title}" loading="lazy" />\n          <h2 class="product-title" data-testid="product-title">${item.title}</h2>\n        </a>\n        <p class="product-brand" data-testid="product-brand">${item.brand}</p>\n        <p class="product-price" data-testid="product-price" data-price="${item.price}" data-currency="${item.currency}">$${Number(item.price).toFixed(2)}</p>\n      </article>`).join(''));
  };

  const load = async () => {
    status.textContent = 'Loading...';
    status.dataset.state = 'loading';
    const response = await fetch(window.Mockery.resolvePath(`api/products/page-${page}.json`));
    const payload = await response.json();
    render(payload.items);
    root.dataset.loaded = 'true';
    status.dataset.state = 'loaded';
    status.textContent = `Loaded page ${page} (${payload.items.length} items)`;
    if (page >= maxPage) {
      loadMore.disabled = true;
      loadMore.textContent = 'No more products';
    }
  };

  load().catch(() => {
    status.dataset.state = 'error';
    status.textContent = 'Failed to load products';
  });

  loadMore.addEventListener('click', async () => {
    if (page >= maxPage) return;
    page += 1;
    await load();
  });
})();
