(() => {
  const root = document.getElementById('dynamic-products-scenario');
  if (!root) return;

  const grid = document.getElementById('dynamic-products-grid');
  const status = document.getElementById('dynamic-products-status');
  const log = document.getElementById('dynamic-products-log');
  const caseName = root.dataset.case;

  const resolvePath = (pathname) => {
    if (window.Mockery?.resolvePath) {
      return window.Mockery.resolvePath(pathname);
    }

    return pathname;
  };

  const apiPath = (name) => `api/dynamic-products/${name}.json`;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const setState = (state, details = {}) => {
    root.dataset.state = state;

    if (details.page !== undefined) {
      root.dataset.page = String(details.page);
    }

    if (details.loadedCount !== undefined) {
      root.dataset.loadedCount = String(details.loadedCount);
    }

    if (details.totalCount !== undefined) {
      root.dataset.totalCount = String(details.totalCount);
    }

    if (details.updateMode !== undefined) {
      root.dataset.updateMode = details.updateMode;
    }

    if (status) {
      status.dataset.state = state;
    }
  };

  const setStatus = (text, state) => {
    if (!status) return;
    status.textContent = text;

    if (state) {
      status.dataset.state = state;
    }
  };

  const eventText = (event, page) => {
    if (event === 'fetch-started') return page ? `Fetch started for page ${page}.` : 'Fetch started.';
    if (event === 'fetch-finished') return page ? `Fetch finished for page ${page}.` : 'Fetch finished.';
    if (event === 'render-started') return page ? `Render started for page ${page}.` : 'Render started.';
    if (event === 'render-finished') return page ? `Render finished for page ${page}.` : 'Render finished.';
    if (event === 'load-more-clicked') return 'Load more clicked.';
    if (event === 'infinite-scroll-ready') return 'Infinite scroll sentinel ready.';
    if (event === 'infinite-scroll-triggered') return page ? `Infinite scroll triggered page ${page}.` : 'Infinite scroll triggered.';
    if (event === 'filter-changed') return 'Filter changed.';
    if (event === 'empty-result') return 'Empty result.';
    if (event === 'error-result') return 'Error result.';
    if (event === 'complete') return 'All products loaded.';
    if (event === 'append-page') return 'Append page 2 requested.';
    if (event === 'replace-page') return 'Replace with page 2 requested.';
    if (event === 'page-changed') return page ? `Page changed to ${page}.` : 'Page changed.';
    return event;
  };

  const logEvent = (event, details = {}) => {
    if (!log) return;

    const li = document.createElement('li');
    li.dataset.testid = 'dynamic-products-log-entry';
    li.dataset.event = event;

    if (details.page !== undefined) {
      li.dataset.page = String(details.page);
    }

    li.textContent = details.text || eventText(event, details.page);
    log.append(li);
  };

  const fetchJson = async (name, details = {}) => {
    logEvent('fetch-started', details);
    const response = await fetch(resolvePath(apiPath(name)));
    const payload = await response.json();
    logEvent('fetch-finished', details);
    return payload;
  };

  const formatMoney = (value, currency) => {
    if (currency === 'USD') {
      return `$${Number(value).toFixed(2)}`;
    }

    return `${currency} ${Number(value).toFixed(2)}`;
  };

  const createText = (tagName, className, testId, text) => {
    const element = document.createElement(tagName);
    element.className = className;
    element.dataset.testid = testId;
    element.textContent = text;
    return element;
  };

  const createProductCard = (product) => {
    const card = document.createElement('article');
    card.className = 'product-card dynamic-product-card';
    card.id = `product-${product.slug}`;
    card.dataset.testid = 'dynamic-product-card';
    card.dataset.productId = product.id;
    card.dataset.productSku = product.sku;
    card.dataset.category = product.category;
    card.dataset.brand = product.brand;
    card.dataset.price = String(product.price);
    card.dataset.inStock = String(product.inStock);

    const link = document.createElement('a');
    link.className = 'product-link';
    link.dataset.testid = 'product-link';
    link.href = resolvePath(product.url || `#${product.slug}`);

    const image = document.createElement('img');
    image.className = 'product-image';
    image.dataset.testid = 'product-image';
    image.src = resolvePath(product.image);
    image.alt = `${product.title} product image`;
    image.loading = 'lazy';

    const title = createText('h2', 'product-title', 'product-title', product.title);
    link.append(image, title);

    const brand = createText('p', 'product-brand', 'product-brand', product.brand);

    const price = createText('p', 'product-price', 'product-price', formatMoney(product.price, product.currency));
    price.dataset.price = String(product.price);
    price.dataset.currency = product.currency;

    const rating = createText(
      'p',
      'product-rating',
      'product-rating',
      product.rating === null ? 'No reviews yet' : `${product.rating} out of 5`,
    );
    rating.dataset.rating = product.rating === null ? '' : String(product.rating);

    const stock = createText('p', 'product-stock', 'product-stock', product.inStock ? 'In stock' : 'Out of stock');
    stock.dataset.stockCount = String(product.stockCount);

    card.append(link, brand, price);

    if (product.oldPrice !== null) {
      const oldPrice = createText('p', 'product-old-price old-price', 'product-old-price', formatMoney(product.oldPrice, product.currency));
      oldPrice.dataset.price = String(product.oldPrice);
      card.append(oldPrice);
    }

    card.append(rating, stock);
    return card;
  };

  const renderProducts = (items, options = {}) => {
    if (!grid) return 0;

    const mode = options.mode || 'replace';
    const page = options.page;
    logEvent('render-started', { page });

    if (mode === 'replace') {
      grid.replaceChildren();
    }

    for (const item of items) {
      grid.append(createProductCard(item));
    }

    logEvent('render-finished', { page });
    return grid.querySelectorAll('[data-testid="dynamic-product-card"]').length;
  };

  const showEmpty = (heading = 'No products found', message = 'The API returned an empty product list.') => {
    let panel = document.getElementById('dynamic-products-empty');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'dynamic-products-empty';
      panel.className = 'scenario-empty';
      panel.dataset.testid = 'dynamic-products-empty';
      root.append(panel);
    }

    panel.replaceChildren();
    const title = document.createElement('h2');
    title.textContent = heading;
    const body = document.createElement('p');
    body.textContent = message;
    panel.append(title, body);
    panel.hidden = false;
  };

  const hideEmpty = () => {
    const panel = document.getElementById('dynamic-products-empty');
    if (panel) {
      panel.hidden = true;
    }
  };

  const showError = (error) => {
    let panel = document.getElementById('dynamic-products-error');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'dynamic-products-error';
      panel.className = 'scenario-error';
      panel.dataset.testid = 'dynamic-products-error';
      root.append(panel);
    }

    panel.dataset.errorCode = error.code;
    panel.replaceChildren();
    const title = document.createElement('h2');
    title.textContent = 'Unable to load products';
    const body = document.createElement('p');
    body.textContent = error.message;
    panel.append(title, body);
    panel.hidden = false;
  };

  const handlePayload = (payload) => {
    if (payload.ok === false) {
      showError(payload.error);
      logEvent('error-result');
      setState('error', { loadedCount: 0, totalCount: 0 });
      setStatus('Unable to load products.', 'error');
      return false;
    }

    if (!payload.items.length) {
      showEmpty();
      logEvent('empty-result');
      setState('empty', {
        page: payload.page || 1,
        loadedCount: 0,
        totalCount: payload.total || 0,
      });
      setStatus('No products found.', 'empty');
      return false;
    }

    hideEmpty();
    return true;
  };

  const initBasic = async () => {
    const PAGE_SIZE = 12;
    const paginationNav = document.getElementById('dynamic-products-pagination');
    let allProducts = [];
    let currentPage = 1;
    let totalPages = 1;

    const renderPagination = () => {
      if (!paginationNav) return;
      paginationNav.replaceChildren();

      const prev = document.createElement('a');
      prev.className = 'page-link previous';
      prev.dataset.testid = 'page-previous';
      prev.href = '#';
      prev.textContent = 'Previous';
      if (currentPage <= 1) {
        prev.setAttribute('aria-disabled', 'true');
      }
      prev.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
          logEvent('page-changed', { page: currentPage - 1 });
          showPage(currentPage - 1);
        }
      });
      paginationNav.append(prev);

      for (let p = 1; p <= totalPages; p++) {
        const link = document.createElement('a');
        link.className = 'page-link';
        link.dataset.testid = 'page-link';
        link.dataset.pagenum = String(p);
        link.href = '#';
        link.textContent = String(p);
        if (p === currentPage) {
          link.setAttribute('aria-current', 'page');
        }
        const pageNum = p;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          if (pageNum !== currentPage) {
            logEvent('page-changed', { page: pageNum });
            showPage(pageNum);
          }
        });
        paginationNav.append(link);
      }

      const next = document.createElement('a');
      next.className = 'page-link next';
      next.dataset.testid = 'page-next';
      next.href = '#';
      next.textContent = 'Next';
      if (currentPage >= totalPages) {
        next.setAttribute('aria-disabled', 'true');
      }
      next.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
          logEvent('page-changed', { page: currentPage + 1 });
          showPage(currentPage + 1);
        }
      });
      paginationNav.append(next);
    };

    const showPage = (page) => {
      currentPage = page;
      const start = (page - 1) * PAGE_SIZE;
      const pageItems = allProducts.slice(start, start + PAGE_SIZE);

      const loadedCount = renderProducts(pageItems, { mode: 'replace', page });

      setState('loaded', {
        page,
        loadedCount,
        totalCount: allProducts.length,
      });
      setStatus(`Showing page ${page} of ${totalPages} (${allProducts.length} products).`, 'loaded');

      renderPagination();
    };

    try {
      setState('loading');
      setStatus('Loading products.', 'loading');

      const payload = await fetchJson('search');
      if (!handlePayload(payload)) return;

      allProducts = payload.items;
      totalPages = Math.ceil(allProducts.length / PAGE_SIZE);

      showPage(1);
    } catch {
      showError({ code: 'MOCK_DYNAMIC_PRODUCTS_FETCH_ERROR', message: 'Failed to load dynamic products.' });
      setState('error', { loadedCount: 0 });
      setStatus('Unable to load products.', 'error');
    }
  };

  const initLoadMore = async () => {
    const button = document.getElementById('load-more-products');
    if (!button) return;

    let nextPage = 1;

    const loadPage = async (page) => {
      const loadingState = page === 1 ? 'loading' : 'loading-more';
      button.disabled = true;
      setState(loadingState);
      setStatus(page === 1 ? 'Loading products.' : `Loading page ${page}.`, loadingState);

      const payload = await fetchJson(`page-${page}`, { page });
      if (!handlePayload(payload)) return;

      const loadedCount = renderProducts(payload.items, {
        mode: page === 1 ? 'replace' : 'append',
        page,
      });
      nextPage = payload.nextPage;

      if (payload.hasNextPage) {
        setState('loaded', {
          page: payload.page,
          loadedCount,
          totalCount: payload.total,
        });
        setStatus(`Loaded ${loadedCount} of ${payload.total} products.`, 'loaded');
        button.disabled = false;
        button.dataset.complete = 'false';
        button.textContent = 'Load more';
      } else {
        setState('complete', {
          page: payload.page,
          loadedCount,
          totalCount: payload.total,
        });
        setStatus('All products loaded.', 'complete');
        logEvent('complete', { page: payload.page });
        button.disabled = true;
        button.dataset.complete = 'true';
        button.textContent = 'All products loaded';
      }
    };

    button.addEventListener('click', async () => {
      if (!nextPage) return;
      logEvent('load-more-clicked', { page: nextPage });
      await loadPage(nextPage);
    });

    await loadPage(nextPage);
  };

  const initFiltering = async () => {
    const form = document.getElementById('dynamic-products-filter-form');
    const queryInput = document.getElementById('dynamic-search-query');
    const categorySelect = document.getElementById('dynamic-category');
    const brandSelect = document.getElementById('dynamic-brand');
    const sortSelect = document.getElementById('dynamic-sort');
    const inStockInput = document.getElementById('dynamic-in-stock');
    const resetButton = document.getElementById('dynamic-filter-reset');
    const filterStatus = document.getElementById('dynamic-filter-status');
    if (!form || !queryInput || !categorySelect || !brandSelect || !sortSelect || !inStockInput || !filterStatus) return;

    let products = [];

    const addOptions = (select, values, allLabel) => {
      select.replaceChildren();
      const allOption = document.createElement('option');
      allOption.value = '';
      allOption.textContent = allLabel;
      select.append(allOption);

      for (const value of values) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.append(option);
      }
    };

    const updateFilterStatus = (count) => {
      filterStatus.dataset.resultCount = String(count);
      filterStatus.textContent = `Showing ${count} ${count === 1 ? 'product' : 'products'}.`;
    };

    const matchesQuery = (product, query) => {
      if (!query) return true;
      const searchable = [
        product.title,
        product.brand,
        product.category,
        ...product.tags,
      ].join(' ').toLowerCase();
      return searchable.includes(query);
    };

    const sortProducts = (items, sort) => {
      const sorted = [...items];
      sorted.sort((left, right) => {
        if (sort === 'price-asc') return left.price - right.price || left.title.localeCompare(right.title);
        if (sort === 'price-desc') return right.price - left.price || left.title.localeCompare(right.title);
        if (sort === 'rating-desc') {
          const leftRating = left.rating === null ? -1 : left.rating;
          const rightRating = right.rating === null ? -1 : right.rating;
          return rightRating - leftRating || left.title.localeCompare(right.title);
        }

        return left.title.localeCompare(right.title);
      });

      return sorted;
    };

    const applyFilters = () => {
      const query = queryInput.value.trim().toLowerCase();
      const category = categorySelect.value;
      const brand = brandSelect.value;
      const inStockOnly = inStockInput.checked;

      const filtered = sortProducts(
        products.filter((product) => (
          matchesQuery(product, query) &&
          (!category || product.category === category) &&
          (!brand || product.brand === brand) &&
          (!inStockOnly || product.inStock === true)
        )),
        sortSelect.value,
      );

      const loadedCount = renderProducts(filtered, { mode: 'replace' });
      updateFilterStatus(loadedCount);
      setState(loadedCount === 0 ? 'empty' : 'loaded', {
        page: 1,
        loadedCount,
        totalCount: products.length,
      });
      setStatus(`Showing ${loadedCount} ${loadedCount === 1 ? 'product' : 'products'}.`, loadedCount === 0 ? 'empty' : 'loaded');

      if (loadedCount === 0) {
        showEmpty('No products found', 'No products match the current filters.');
        logEvent('empty-result');
      } else {
        hideEmpty();
      }
    };

    form.addEventListener('input', () => {
      logEvent('filter-changed');
      applyFilters();
    });
    form.addEventListener('change', () => {
      logEvent('filter-changed');
      applyFilters();
    });

    resetButton?.addEventListener('click', () => {
      form.reset();
      logEvent('filter-changed');
      applyFilters();
    });

    setState('loading');
    setStatus('Loading products.', 'loading');
    const payload = await fetchJson('search');
    products = payload.items;

    const categories = [...new Set(products.map((product) => product.category))].sort();
    const brands = [...new Set(products.map((product) => product.brand))].sort();
    addOptions(categorySelect, categories, 'All categories');
    addOptions(brandSelect, brands, 'All brands');
    applyFilters();
  };

  const initInfiniteScroll = async () => {
    const sentinel = document.getElementById('dynamic-products-scroll-sentinel');
    if (!sentinel) return;

    let nextPage = 1;
    let loading = false;
    let complete = false;
    let observer = null;

    const setSentinel = (text, details = {}) => {
      sentinel.textContent = text;

      if (details.complete !== undefined) {
        sentinel.dataset.complete = String(details.complete);
      }

      if (details.loading !== undefined) {
        sentinel.dataset.loading = String(details.loading);
      }

      if (details.nextPage !== undefined) {
        sentinel.dataset.nextPage = details.nextPage === null ? '' : String(details.nextPage);
      }
    };

    const isSentinelNearViewport = () => {
      const rect = sentinel.getBoundingClientRect();
      return rect.top <= window.innerHeight + 300;
    };

    const cleanupFallback = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };

    const finish = (payload, loadedCount) => {
      complete = true;
      nextPage = null;
      setState('complete', {
        page: payload.page,
        loadedCount,
        totalCount: payload.total,
      });
      setStatus('All products loaded.', 'complete');
      setSentinel('All products loaded.', {
        complete: true,
        loading: false,
        nextPage: null,
      });
      logEvent('complete', { page: payload.page });

      if (observer) {
        observer.disconnect();
      }

      cleanupFallback();
    };

    const loadPage = async (page) => {
      if (loading || complete || !page) return;

      loading = true;
      const loadingState = page === 1 ? 'loading' : 'loading-more';
      setState(loadingState);
      setStatus(page === 1 ? 'Loading products.' : `Loading page ${page}.`, loadingState);
      setSentinel(page === 1 ? 'Loading initial products.' : `Loading page ${page}.`, {
        loading: true,
        complete: false,
        nextPage: page,
      });

      try {
        const payload = await fetchJson(`page-${page}`, { page });
        if (!handlePayload(payload)) {
          complete = true;
          setSentinel('No more products to load.', {
            loading: false,
            complete: true,
            nextPage: null,
          });
          return;
        }

        const loadedCount = renderProducts(payload.items, {
          mode: page === 1 ? 'replace' : 'append',
          page,
        });
        nextPage = payload.nextPage;

        if (payload.hasNextPage) {
          setState('loaded', {
            page: payload.page,
            loadedCount,
            totalCount: payload.total,
          });
          setStatus(`Loaded ${loadedCount} of ${payload.total} products.`, 'loaded');
          setSentinel(`Scroll to load page ${payload.nextPage}.`, {
            loading: false,
            complete: false,
            nextPage: payload.nextPage,
          });

          requestAnimationFrame(() => {
            if (isSentinelNearViewport()) {
              maybeLoadNext();
            }
          });
        } else {
          finish(payload, loadedCount);
        }
      } catch {
        complete = true;
        showError({ code: 'MOCK_DYNAMIC_PRODUCTS_FETCH_ERROR', message: 'Failed to load dynamic products.' });
        setState('error', { loadedCount: getLoadedCount() });
        setStatus('Unable to load products.', 'error');
        setSentinel('Unable to load more products.', {
          loading: false,
          complete: true,
          nextPage: null,
        });
      } finally {
        loading = false;

        if (!complete) {
          sentinel.dataset.loading = 'false';
        }
      }
    };

    const maybeLoadNext = () => {
      if (loading || complete || !nextPage) return;
      logEvent('infinite-scroll-triggered', { page: nextPage });
      loadPage(nextPage);
    };

    function onScroll() {
      if (isSentinelNearViewport()) {
        maybeLoadNext();
      }
    }

    const startScrollWatcher = () => {
      logEvent('infinite-scroll-ready');

      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            maybeLoadNext();
          }
        }, { rootMargin: '300px 0px' });
        observer.observe(sentinel);
        return;
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      onScroll();
    };

    await loadPage(nextPage);

    if (!complete) {
      startScrollWatcher();
    }
  };

  const initErrorState = async () => {
    setState('loading');
    setStatus('Loading products.', 'loading');
    const payload = await fetchJson('error');
    handlePayload(payload);
  };

  const initEmptyState = async () => {
    setState('loading');
    setStatus('Loading products.', 'loading');
    const payload = await fetchJson('empty', { page: 1 });
    handlePayload(payload);
  };

  const initDelayed = async () => {
    const marker = document.getElementById('dynamic-delay-marker');
    const initialDelay = Number(marker?.dataset.delayMs || 500);
    const renderDelay = Number(marker?.dataset.renderDelayMs || 1000);

    setState('loading');
    setStatus('Preparing request.', 'loading');
    await delay(initialDelay);
    setStatus('Loading products.', 'loading');

    const payload = await fetchJson('slow-page-1', { page: 1 });
    if (!handlePayload(payload)) return;

    setState('rendering');
    setStatus('Rendering products.', 'rendering');
    await delay(renderDelay);

    const loadedCount = renderProducts(payload.items, { mode: 'replace', page: 1 });
    setState('loaded', {
      page: payload.page,
      loadedCount,
      totalCount: payload.total,
    });
    setStatus('Products loaded.', 'loaded');
  };

  const initReplaceVsAppend = async () => {
    const appendButton = document.getElementById('append-page');
    const replaceButton = document.getElementById('replace-page');
    if (!appendButton || !replaceButton) return;

    let pageOneItems = [];

    const setButtonsDisabled = (disabled) => {
      appendButton.disabled = disabled;
      replaceButton.disabled = disabled;
    };

    setButtonsDisabled(true);
    setState('loading', { updateMode: 'initial' });
    setStatus('Loading products.', 'loading');

    const firstPayload = await fetchJson('page-1', { page: 1 });
    if (!handlePayload(firstPayload)) return;

    pageOneItems = firstPayload.items;
    const loadedCount = renderProducts(pageOneItems, { mode: 'replace', page: 1 });
    setState('loaded', {
      page: 1,
      loadedCount,
      totalCount: firstPayload.total,
      updateMode: 'initial',
    });
    setStatus(`Loaded ${loadedCount} of ${firstPayload.total} products.`, 'loaded');
    setButtonsDisabled(false);

    appendButton.addEventListener('click', async () => {
      setButtonsDisabled(true);
      logEvent('append-page', { page: 2 });
      setState('loading-more', { updateMode: 'append' });
      setStatus('Appending page 2.', 'loading-more');

      const secondPayload = await fetchJson('page-2', { page: 2 });
      renderProducts(pageOneItems, { mode: 'replace', page: 1 });
      const appendedCount = renderProducts(secondPayload.items, { mode: 'append', page: 2 });
      setState('loaded', {
        page: 2,
        loadedCount: appendedCount,
        totalCount: secondPayload.total,
        updateMode: 'append',
      });
      setStatus(`Appended page 2. Showing ${appendedCount} products.`, 'loaded');
      setButtonsDisabled(false);
    });

    replaceButton.addEventListener('click', async () => {
      setButtonsDisabled(true);
      logEvent('replace-page', { page: 2 });
      setState('loading', { updateMode: 'replace' });
      setStatus('Replacing with page 2.', 'loading');

      const secondPayload = await fetchJson('page-2', { page: 2 });
      const replacedCount = renderProducts(secondPayload.items, { mode: 'replace', page: 2 });
      setState('loaded', {
        page: 2,
        loadedCount: replacedCount,
        totalCount: secondPayload.total,
        updateMode: 'replace',
      });
      setStatus(`Replaced with page 2. Showing ${replacedCount} products.`, 'loaded');
      setButtonsDisabled(false);
    });
  };

  const initializers = {
    basic: initBasic,
    'load-more': initLoadMore,
    'infinite-scroll': initInfiniteScroll,
    filtering: initFiltering,
    'error-state': initErrorState,
    'empty-state': initEmptyState,
    delayed: initDelayed,
    'replace-vs-append': initReplaceVsAppend,
  };

  initializers[caseName]?.();
})();
