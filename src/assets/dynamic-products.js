(() => {
  const root = document.getElementById('dynamic-products');
  const status = document.getElementById('dynamic-status');
  const loadMore = document.getElementById('load-more-products');
  if (!root || !status || !loadMore) return;

  let page = 1;
  const maxPage = 3;
  const render = (items) => {
    for (const item of items) {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.dataset.testid = 'product-card';
      card.dataset.productId = item.id;
      card.dataset.category = item.category;
      card.dataset.price = item.price;

      const link = document.createElement('a');
      link.className = 'product-link';
      link.dataset.testid = 'product-link';
      link.href = window.Mockery.resolvePath(item.url);

      const image = document.createElement('img');
      image.className = 'product-image';
      image.src = window.Mockery.resolvePath(item.image);
      image.alt = item.title;
      image.loading = 'lazy';

      const title = document.createElement('h2');
      title.className = 'product-title';
      title.dataset.testid = 'product-title';
      title.textContent = item.title;

      const brand = document.createElement('p');
      brand.className = 'product-brand';
      brand.dataset.testid = 'product-brand';
      brand.textContent = item.brand;

      const price = document.createElement('p');
      price.className = 'product-price';
      price.dataset.testid = 'product-price';
      price.dataset.price = item.price;
      price.dataset.currency = item.currency;
      price.textContent = `$${Number(item.price).toFixed(2)}`;

      link.append(image, title);
      card.append(link, brand, price);
      root.append(card);
    }
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
