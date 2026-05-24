(() => {
  const table = document.getElementById('sortable-orders');
  if (!table) return;
  const body = table.querySelector('tbody');
  document.getElementById('sort-total')?.addEventListener('click', () => {
    const rows = [...body.querySelectorAll('tr')];
    rows.sort((a, b) => Number(b.dataset.total) - Number(a.dataset.total));
    rows.forEach((row) => body.appendChild(row));
  });
})();
