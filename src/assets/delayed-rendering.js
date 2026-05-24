(() => {
  const short = document.querySelector('[data-testid="delayed-short"]');
  const long = document.querySelector('[data-testid="delayed-long"]');
  const interactive = document.getElementById('delayed-interactive');
  if (!short || !long || !interactive) return;

  setTimeout(() => {
    short.dataset.state = 'ready';
    short.textContent = 'Ready after 500ms';
  }, 500);

  setTimeout(() => {
    long.dataset.state = 'ready';
    long.textContent = 'Ready after 1500ms';
  }, 1500);

  let ticks = 0;
  const ticker = document.getElementById('delayed-ticker');
  setInterval(() => {
    ticks += 1;
    ticker.textContent = `Tick ${ticks}`;
  }, 1000);

  interactive.addEventListener('click', () => {
    const panel = document.getElementById('delayed-click-result');
    panel.textContent = 'User interaction rendered this content.';
    panel.dataset.state = 'ready';
  });
})();
