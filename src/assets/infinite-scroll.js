(() => {
  const status = document.getElementById('infinite-scroll-status');
  const target = document.getElementById('infinite-products');
  if (!status || !target) return;

  let page = 1;
  const maxPage = Number(status.dataset.totalPages);
  let loadedCount = 0;
  let loading = false;

  const add = (items) => {
    for (const item of items) {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.dataset.testid = 'product-card';
      card.dataset.productId = item.id;

      const link = document.createElement('a');
      link.href = window.Mockery.resolvePath(item.url);

      const title = document.createElement('h3');
      title.dataset.testid = 'product-title';
      title.textContent = item.title;

      const price = document.createElement('p');
      price.dataset.testid = 'product-price';
      price.textContent = `$${Number(item.price).toFixed(2)}`;

      link.append(title);
      card.append(link, price);
      target.append(card);
    }
  };

  const load = async () => {
    if (loading || page > maxPage) return;
    loading = true;
    status.dataset.state = 'loading';
    status.textContent = `Loading page ${page}...`;
    const response = await fetch(window.Mockery.resolvePath(`api/products/page-${page}.json`));
    const payload = await response.json();
    const items = payload.items.slice(0, 8);
    add(items);
    loadedCount += items.length;
    status.dataset.page = String(page);
    status.dataset.loadedCount = String(loadedCount);
    status.dataset.state = page === maxPage ? 'done' : 'idle';
    status.textContent = page === maxPage ? 'All batches loaded' : `Loaded page ${page}`;
    page += 1;
    loading = false;
  };

  load().catch(() => {
    status.dataset.state = 'error';
    status.textContent = 'Failed to load data';
  });

  window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200)) {
      load();
    }
  });
})();
