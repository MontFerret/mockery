(() => {
  const log = document.getElementById('network-log');
  const status = document.getElementById('network-status');
  if (!log || !status) return;

  const write = (label, data) => {
    const li = document.createElement('li');
    li.textContent = `${label}: ${typeof data === 'string' ? data : JSON.stringify(data)}`;
    log.appendChild(li);
  };

  const hit = async (name, endpoint, delay = 0) => {
    status.dataset.state = 'loading';
    if (delay) await new Promise((r) => setTimeout(r, delay));
    const response = await fetch(window.Mockery.resolvePath(endpoint));
    const data = await response.json();
    write(name, data.ok === false ? `error:${data.code}` : `ok:${(data.items || data.reviews || data.recommendations || []).length || 1}`);
    status.dataset.state = data.ok === false ? 'error' : 'loaded';
  };

  document.querySelectorAll('[data-fetch]').forEach((button) => {
    button.addEventListener('click', () => hit(button.dataset.fetch, `api/network/${button.dataset.fetch}.json`));
  });

  document.getElementById('network-sequential')?.addEventListener('click', async () => {
    status.dataset.state = 'loading';
    await hit('slow-1', 'api/network/slow-1.json', 200);
    await hit('slow-2', 'api/network/slow-2.json', 300);
    await hit('slow-3', 'api/network/slow-3.json', 500);
    status.dataset.state = 'loaded';
  });

  document.getElementById('network-parallel')?.addEventListener('click', async () => {
    status.dataset.state = 'loading';
    await Promise.all([
      hit('parallel-products', 'api/network/products.json'),
      hit('parallel-reviews', 'api/network/reviews.json'),
      hit('parallel-recommendations', 'api/network/recommendations.json'),
    ]);
    status.dataset.state = 'loaded';
  });
})();
