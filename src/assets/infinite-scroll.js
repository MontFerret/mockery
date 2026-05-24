(() => {
  const status = document.getElementById('infinite-scroll-status');
  const target = document.getElementById('infinite-products');
  if (!status || !target) return;

  let page = 1;
  const maxPage = 3;
  let loading = false;

  const add = (items) => {
    target.insertAdjacentHTML('beforeend', items.map((item) => `<article class="product-card" data-testid="product-card"><h3>${item.title}</h3><p data-testid="product-price">$${Number(item.price).toFixed(2)}</p></article>`).join(''));
  };

  const load = async () => {
    if (loading || page > maxPage) return;
    loading = true;
    status.dataset.state = 'loading';
    status.textContent = `Loading page ${page}...`;
    const response = await fetch(window.Mockery.resolvePath(`api/products/page-${page}.json`));
    const payload = await response.json();
    add(payload.items.slice(0, 8));
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
