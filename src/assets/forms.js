(() => {
  const eventNames = [
    'focus',
    'focusin',
    'focusout',
    'blur',
    'beforeinput',
    'input',
    'change',
    'select',
    'invalid',
    'submit',
    'reset',
    'formdata',
  ];
  const root = document.getElementById('forms-scenario');
  const result = document.getElementById('form-result');
  const eventStatuses = document.getElementById('form-event-statuses');
  const eventLog = document.getElementById('form-event-log');
  const resetButton = document.getElementById('form-event-reset');
  const query = document.getElementById('query');
  const selectQueryText = document.getElementById('select-query-text');
  const maxLogEntries = 50;
  let trackingSuspended = false;

  if (
    !root ||
    !result ||
    !eventStatuses ||
    !eventLog ||
    !resetButton ||
    !query ||
    !selectQueryText
  ) {
    return;
  }

  const forms = Array.from(root.querySelectorAll('form'));

  const increment = (element, key) => {
    const value = Number(element.dataset[key] || 0) + 1;
    element.dataset[key] = String(value);
    return value;
  };

  const eventTargetName = (target) => {
    if (!(target instanceof Element)) {
      return 'unknown';
    }

    return target.id || target.dataset.testid || target.tagName.toLowerCase();
  };

  const clearEmptyLog = () => {
    eventLog.querySelector('[data-testid="form-event-log-empty"]')?.remove();
  };

  const recordEvent = (event) => {
    if (trackingSuspended) {
      return;
    }

    if (event.type === 'invalid') {
      event.preventDefault();
    }

    const status = eventStatuses.querySelector(`[data-event="${event.type}"]`);
    if (!status) {
      return;
    }

    const target = eventTargetName(event.target);
    const eventCount = increment(status, 'count');
    status.dataset.seen = 'true';
    status.dataset.lastTarget = target;

    const statusText = status.querySelector('dd');
    if (statusText) {
      statusText.textContent = `Seen. Count: ${eventCount}. Last target: ${target}.`;
    }

    clearEmptyLog();
    const totalCount = increment(root, 'eventCount');
    const entry = document.createElement('li');
    entry.dataset.index = String(totalCount);
    entry.dataset.event = event.type;
    entry.dataset.target = target;
    entry.textContent = `${totalCount}. ${event.type} on ${target}`;
    eventLog.appendChild(entry);

    while (eventLog.children.length > maxLogEntries) {
      eventLog.firstElementChild?.remove();
    }

    eventLog.dataset.entryCount = String(eventLog.children.length);
    root.dataset.state = 'active';
    root.dataset.lastEvent = event.type;
    root.dataset.lastTarget = target;
  };

  for (const eventName of eventNames) {
    root.addEventListener(eventName, recordEvent, true);
  }

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const payload = Object.fromEntries(data.entries());
      result.hidden = false;
      result.textContent = `${form.id} submitted: ${JSON.stringify(payload)}`;
    });
  });

  selectQueryText.addEventListener('click', () => {
    query.focus();
    query.select();
  });

  const resetFixture = () => {
    trackingSuspended = true;

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement && root.contains(activeElement)) {
      activeElement.blur();
    }

    for (const form of forms) {
      form.reset();
    }

    result.hidden = true;
    result.textContent = '';

    root.dataset.state = 'idle';
    root.dataset.eventCount = '0';
    root.dataset.lastEvent = 'none';
    root.dataset.lastTarget = 'none';

    for (const status of eventStatuses.querySelectorAll('[data-event]')) {
      status.dataset.seen = 'false';
      status.dataset.count = '0';
      status.dataset.lastTarget = 'none';

      const statusText = status.querySelector('dd');
      if (statusText) {
        statusText.textContent = 'Not seen. Count: 0. Last target: none.';
      }
    }

    const empty = document.createElement('li');
    empty.dataset.testid = 'form-event-log-empty';
    empty.textContent = 'No form events recorded.';
    eventLog.replaceChildren(empty);
    eventLog.dataset.entryCount = '0';

    trackingSuspended = false;
  };

  resetButton.addEventListener('click', resetFixture);
})();
