(() => {
  const root = document.getElementById('network-scenario');
  if (!root) return;

  const caseName = root.dataset.case;
  const status = document.getElementById('network-status');
  const log = document.getElementById('network-log');
  const defaultResults = document.getElementById('network-results');

  let requestCount = Number(root.dataset.requestCount || 0);
  let responseCount = Number(root.dataset.responseCount || 0);
  let errorCount = Number(root.dataset.errorCount || 0);

  const jsonRequest = (requestId, resource = requestId, name = requestId) => ({
    requestId,
    resource,
    url: `/api/network/${name}.json`,
    method: 'GET',
    contentType: 'application/json',
  });

  const textRequest = (requestId, resource, url, contentType) => ({
    requestId,
    resource,
    url,
    method: 'GET',
    contentType,
  });

  const requests = {
    products: jsonRequest('products'),
    reviews: jsonRequest('reviews'),
    recommendations: jsonRequest('recommendations'),
    categories: jsonRequest('categories'),
    pricing: jsonRequest('pricing'),
    inventory: jsonRequest('inventory'),
    simulatedError: jsonRequest('simulated-error', 'simulated-error'),
    poll1: jsonRequest('poll-1', 'poll'),
    poll2: jsonRequest('poll-2', 'poll'),
    poll3: jsonRequest('poll-3', 'poll'),
    slow1: jsonRequest('slow-1'),
    slow2: jsonRequest('slow-2'),
    slow3: jsonRequest('slow-3'),
    filterProducts: jsonRequest('filter-products', 'products'),
    filterReviews: jsonRequest('filter-reviews', 'reviews'),
    filterAnalytics: jsonRequest('filter-analytics', 'analytics'),
    mixedProducts: jsonRequest('mixed-products', 'mixed-products'),
    mixedText: textRequest('mixed-text', 'mixed-text', '/api/network/mixed-text.txt', 'text/plain'),
    mixedHtml: textRequest('mixed-fragment', 'mixed-fragment', '/api/network/mixed-fragment.html', 'text/html'),
  };

  const resolveUrl = (pathname) => {
    if (window.Mockery?.resolvePath) {
      return window.Mockery.resolvePath(pathname);
    }

    return pathname;
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const syncCounts = () => {
    root.dataset.requestCount = String(requestCount);
    root.dataset.responseCount = String(responseCount);
    root.dataset.errorCount = String(errorCount);
  };

  const setState = (state, details = {}) => {
    root.dataset.state = state;

    if (details.complete !== undefined) {
      root.dataset.complete = String(details.complete);
    }

    if (details.pollStep !== undefined) {
      root.dataset.pollStep = String(details.pollStep);
    }

    if (details.pollComplete !== undefined) {
      root.dataset.pollComplete = String(details.pollComplete);
    }

    if (details.lastErrorCode !== undefined) {
      root.dataset.lastErrorCode = details.lastErrorCode;
    }

    if (status) {
      status.dataset.state = state;
    }
  };

  const setStatus = (message, state) => {
    if (!status) return;

    status.textContent = message;

    if (state) {
      status.dataset.state = state;
    }
  };

  const eventText = (event, details = {}) => {
    const label = details.requestId || details.resource || 'scenario';

    if (event === 'scenario-started') return 'Scenario started.';
    if (event === 'request-started') return `Request started: ${label}.`;
    if (event === 'request-finished') return `Request finished: ${label}.`;
    if (event === 'response-rendered') return `Response rendered: ${label}.`;
    if (event === 'batch-started') return 'Batch started.';
    if (event === 'batch-finished') return 'Batch finished.';
    if (event === 'sequence-started') return 'Sequence started.';
    if (event === 'sequence-finished') return 'Sequence finished.';
    if (event === 'poll-started') return 'Polling started.';
    if (event === 'poll-finished') return 'Polling finished.';
    if (event === 'error-result') return `Error result: ${details.errorCode}.`;
    if (event === 'idle-wait-started') return `Idle wait started: ${label}.`;
    if (event === 'idle-observed') return 'Network activity complete.';
    if (event === 'complete') return 'Scenario complete.';
    return event;
  };

  const logEvent = (event, details = {}) => {
    if (!log) return;

    const li = document.createElement('li');
    li.dataset.testid = 'network-log-entry';
    li.dataset.event = event;

    if (details.requestId) {
      li.dataset.requestId = details.requestId;
    }

    if (details.resource) {
      li.dataset.resource = details.resource;
    }

    if (details.url) {
      li.dataset.url = details.url;
    }

    if (details.method) {
      li.dataset.method = details.method;
    }

    if (details.contentType) {
      li.dataset.contentType = details.contentType;
    }

    if (details.errorCode) {
      li.dataset.errorCode = details.errorCode;
    }

    li.textContent = details.text || eventText(event, details);
    log.append(li);
  };

  const startRequest = (request) => {
    requestCount += 1;
    syncCounts();
    logEvent('request-started', request);
  };

  const finishRequest = (request) => {
    logEvent('request-finished', request);
  };

  const fetchJson = async (request, options = {}) => {
    startRequest(request);
    const response = await fetch(resolveUrl(request.url), { method: request.method });
    const payload = await response.json();
    responseCount += 1;
    syncCounts();

    if (options.logFinished !== false) {
      finishRequest(request);
    }

    return { request, payload };
  };

  const fetchText = async (request, options = {}) => {
    startRequest(request);
    const response = await fetch(resolveUrl(request.url), { method: request.method });
    const payload = await response.text();
    responseCount += 1;
    syncCounts();

    if (options.logFinished !== false) {
      finishRequest(request);
    }

    return { request, payload };
  };

  const titleFor = (resource) => resource
    .split('-')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');

  const itemCount = (payload) => Array.isArray(payload.items) ? payload.items.length : 0;

  const summaryFor = (payload, request) => {
    if (payload.message) {
      return payload.step ? `Step ${payload.step}: ${payload.message}` : payload.message;
    }

    if (payload.profile) {
      return `Loaded profile ${payload.profile.id}.`;
    }

    if (payload.settings) {
      return 'Loaded deterministic settings.';
    }

    return `Loaded ${itemCount(payload)} ${request.resource}.`;
  };

  const incrementResultCount = (container) => {
    const nextCount = Number(container.dataset.resultCount || 0) + 1;
    container.dataset.resultCount = String(nextCount);
  };

  const renderResult = ({ request, payload }, container = defaultResults) => {
    if (!container) return;

    const resource = payload.resource || request.resource;
    const card = document.createElement('article');
    card.className = 'network-result-card';
    card.dataset.testid = 'network-result-card';
    card.dataset.resource = resource;
    card.dataset.requestId = request.requestId;

    const title = document.createElement('h2');
    title.dataset.testid = 'network-result-title';
    title.textContent = titleFor(resource);

    const summary = document.createElement('p');
    summary.dataset.testid = 'network-result-summary';
    summary.textContent = summaryFor(payload, request);

    card.append(title, summary);
    container.append(card);
    incrementResultCount(container);
    logEvent('response-rendered', request);
  };

  const renderTextResult = ({ request, payload }, container) => {
    if (!container) return;

    const article = document.createElement('article');
    article.className = 'network-result-card';
    article.dataset.testid = 'network-result-card';
    article.dataset.resource = request.resource;
    article.dataset.requestId = request.requestId;

    const title = document.createElement('h2');
    title.dataset.testid = 'network-result-title';
    title.textContent = 'Plain Text';

    const body = document.createElement('p');
    body.dataset.testid = 'network-result-summary';
    body.textContent = payload;

    article.append(title, body);
    container.append(article);
    incrementResultCount(container);
    logEvent('response-rendered', request);
  };

  const renderHtmlFragment = ({ request, payload }, container) => {
    if (!container) return;

    const parsed = new DOMParser().parseFromString(payload, 'text/html');
    const source = parsed.querySelector('[data-fragment-id="mixed-fragment"]');
    const titleText = source?.querySelector('h2')?.textContent || 'Static HTML Fragment';
    const bodyText = source?.querySelector('p')?.textContent || 'Trusted static fragment loaded.';

    const article = document.createElement('article');
    article.className = 'network-result-card';
    article.dataset.testid = 'network-result-card';
    article.dataset.resource = request.resource;
    article.dataset.requestId = request.requestId;
    article.dataset.fragmentId = 'mixed-fragment';

    const title = document.createElement('h2');
    title.dataset.testid = 'network-result-title';
    title.textContent = titleText;

    const body = document.createElement('p');
    body.dataset.testid = 'network-result-summary';
    body.textContent = bodyText;

    article.append(title, body);
    container.append(article);
    incrementResultCount(container);
    logEvent('response-rendered', request);
  };

  const renderError = (error) => {
    let panel = document.getElementById('network-error');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'network-error';
      panel.className = 'scenario-error';
      panel.dataset.testid = 'network-error';
      root.append(panel);
    }

    panel.hidden = false;
    panel.dataset.errorCode = error.code;
    panel.replaceChildren();

    const title = document.createElement('h2');
    title.textContent = 'Request returned an error payload';
    const body = document.createElement('p');
    body.textContent = error.message;
    panel.append(title, body);
  };

  const clearContainer = (element) => {
    if (!element) return;
    element.replaceChildren();
    if (element.dataset.resultCount !== undefined) {
      element.dataset.resultCount = '0';
    }
  };

  const resetRun = () => {
    requestCount = 0;
    responseCount = 0;
    errorCount = 0;
    syncCounts();
    root.dataset.complete = 'false';
    delete root.dataset.lastErrorCode;
    clearContainer(defaultResults);
    clearContainer(document.getElementById('network-primary-results'));
    clearContainer(document.getElementById('network-diagnostics'));
    clearContainer(document.getElementById('mixed-json-result'));
    clearContainer(document.getElementById('mixed-text-result'));
    clearContainer(document.getElementById('mixed-html-result'));
    clearContainer(log);

    const errorPanel = document.getElementById('network-error');
    if (errorPanel) {
      errorPanel.hidden = true;
      errorPanel.dataset.errorCode = '';
      errorPanel.replaceChildren();
    }
  };

  const startScenario = (state, message) => {
    setState(state, { complete: false });
    setStatus(message, state);
    logEvent('scenario-started');
  };

  const completeScenario = (state = 'complete', message = 'Scenario complete.') => {
    setState(state, { complete: true });
    setStatus(message, state);
    logEvent('complete');
  };

  const runSingle = async () => {
    startScenario('loading', 'Loading products.');
    const result = await fetchJson(requests.products);
    renderResult(result);
    completeScenario();
  };

  const runSequence = async () => {
    startScenario('running', 'Running sequential requests.');
    logEvent('sequence-started');

    for (const request of [
      requests.categories,
      requests.products,
      requests.pricing,
      requests.inventory,
      requests.reviews,
    ]) {
      const result = await fetchJson(request);
      renderResult(result);
    }

    logEvent('sequence-finished');
    completeScenario();
  };

  const runParallel = async () => {
    startScenario('running', 'Running parallel requests.');
    logEvent('batch-started');
    const batch = [
      requests.products,
      requests.reviews,
      requests.recommendations,
      requests.pricing,
      requests.inventory,
    ];

    const results = await Promise.all(batch.map((request) => fetchJson(request, { logFinished: false })));

    for (const result of results) {
      finishRequest(result.request);
      renderResult(result);
    }

    logEvent('batch-finished');
    completeScenario();
  };

  const runDelayed = async () => {
    const config = document.getElementById('network-delay-config');
    const steps = [
      [Number(config?.dataset.delay1Ms || 300), requests.slow1],
      [Number(config?.dataset.delay2Ms || 500), requests.slow2],
      [Number(config?.dataset.delay3Ms || 700), requests.slow3],
    ];

    startScenario('waiting', 'Waiting before delayed requests.');

    for (const [waitMs, request] of steps) {
      setState('waiting');
      setStatus(`Waiting ${waitMs}ms before ${request.requestId}.`, 'waiting');
      logEvent('idle-wait-started', request);
      await delay(waitMs);
      setState('loading');
      setStatus(`Loading ${request.requestId}.`, 'loading');
      const result = await fetchJson(request);
      renderResult(result);
    }

    completeScenario();
  };

  const runPolling = async () => {
    const config = document.getElementById('network-poll-config');
    const interval = Number(config?.dataset.intervalMs || 400);
    const polls = [requests.poll1, requests.poll2, requests.poll3];

    startScenario('polling', 'Polling started.');
    logEvent('poll-started');

    for (const [index, request] of polls.entries()) {
      if (index > 0) {
        await delay(interval);
      }

      const result = await fetchJson(request);
      setState('polling', {
        pollStep: result.payload.step,
        pollComplete: result.payload.complete,
      });
      renderResult(result);

      if (result.payload.complete) {
        break;
      }
    }

    logEvent('poll-finished');
    completeScenario();
  };

  const runSimulatedError = async () => {
    startScenario('loading', 'Loading simulated error payload.');
    const result = await fetchJson(requests.simulatedError);

    if (result.payload.ok === false) {
      errorCount += 1;
      syncCounts();
      setState('error', {
        lastErrorCode: result.payload.error.code,
      });
      renderError(result.payload.error);
      logEvent('error-result', {
        requestId: result.request.requestId,
        resource: result.request.resource,
        url: result.request.url,
        errorCode: result.payload.error.code,
      });
      completeScenario('complete', 'Request returned an error payload.');
      return;
    }

    renderResult(result);
    completeScenario();
  };

  const runRequestFiltering = async () => {
    const primary = document.getElementById('network-primary-results');
    const diagnostics = document.getElementById('network-diagnostics');
    const batch = [requests.filterProducts, requests.filterReviews, requests.filterAnalytics];

    startScenario('running', 'Running filterable requests.');
    logEvent('batch-started');
    const results = await Promise.all(batch.map((request) => fetchJson(request, { logFinished: false })));

    for (const result of results) {
      finishRequest(result.request);

      if (result.request.resource === 'analytics') {
        renderResult(result, diagnostics);
      } else {
        renderResult(result, primary);
      }
    }

    logEvent('batch-finished');
    completeScenario();
  };

  const runNetworkIdle = async () => {
    const idleMarker = document.getElementById('network-idle-marker');

    startScenario('running', 'Running network activity burst.');
    renderResult(await fetchJson(requests.products));
    await delay(250);
    renderResult(await fetchJson(requests.reviews));
    await delay(250);
    renderResult(await fetchJson(requests.recommendations));

    if (idleMarker) {
      idleMarker.dataset.idle = 'true';
      idleMarker.dataset.requestCount = String(requestCount);
      idleMarker.textContent = 'Network activity complete.';
    }

    logEvent('idle-observed');
    completeScenario('idle-observed', 'Network activity complete.');
  };

  const setControlsDisabled = (disabled) => {
    for (const button of root.querySelectorAll('button')) {
      button.disabled = disabled;
    }
  };

  const runUserTriggered = async (batch) => {
    resetRun();
    setControlsDisabled(true);
    startScenario(batch.length === 1 ? 'loading' : 'running', 'Running user-triggered request.');

    if (batch.length === 1) {
      renderResult(await fetchJson(batch[0]));
    } else {
      logEvent('batch-started');
      const results = await Promise.all(batch.map((request) => fetchJson(request, { logFinished: false })));

      for (const result of results) {
        finishRequest(result.request);
        renderResult(result);
      }

      logEvent('batch-finished');
    }

    completeScenario();
    setControlsDisabled(false);
  };

  const initUserTriggered = () => {
    document.getElementById('fetch-products')?.addEventListener('click', () => {
      runUserTriggered([requests.products]);
    });
    document.getElementById('fetch-reviews')?.addEventListener('click', () => {
      runUserTriggered([requests.reviews]);
    });
    document.getElementById('fetch-recommendations')?.addEventListener('click', () => {
      runUserTriggered([requests.recommendations]);
    });
    document.getElementById('fetch-all')?.addEventListener('click', () => {
      runUserTriggered([requests.products, requests.reviews, requests.recommendations]);
    });
  };

  const runMixedContent = async () => {
    const jsonContainer = document.getElementById('mixed-json-result');
    const textContainer = document.getElementById('mixed-text-result');
    const htmlContainer = document.getElementById('mixed-html-result');

    startScenario('running', 'Loading mixed static resources.');
    logEvent('batch-started');
    const results = await Promise.all([
      fetchJson(requests.mixedProducts, { logFinished: false }),
      fetchText(requests.mixedText, { logFinished: false }),
      fetchText(requests.mixedHtml, { logFinished: false }),
    ]);

    for (const result of results) {
      finishRequest(result.request);

      if (result.request.requestId === 'mixed-products') {
        renderResult(result, jsonContainer);
      } else if (result.request.requestId === 'mixed-text') {
        renderTextResult(result, textContainer);
      } else {
        renderHtmlFragment(result, htmlContainer);
      }
    }

    logEvent('batch-finished');
    completeScenario();
  };

  const initializers = {
    'single-request': runSingle,
    'sequential-requests': runSequence,
    'parallel-requests': runParallel,
    'delayed-requests': runDelayed,
    polling: runPolling,
    'simulated-error': runSimulatedError,
    'request-filtering': runRequestFiltering,
    'network-idle': runNetworkIdle,
    'user-triggered': initUserTriggered,
    'mixed-content': runMixedContent,
  };

  initializers[caseName]?.();
})();
