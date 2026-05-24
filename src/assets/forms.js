(() => {
  const result = document.getElementById('form-result');
  if (!result) return;

  document.querySelectorAll('form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const payload = Object.fromEntries(data.entries());
      result.hidden = false;
      result.textContent = `${form.id} submitted: ${JSON.stringify(payload)}`;
    });
  });
})();
