(() => {
  const root = document.getElementById('mouse-scenario');
  const hoverCase = document.getElementById('mouse-hover-case');
  const hoverTarget = document.getElementById('mouse-hover-target');
  const hoverStatus = document.getElementById('mouse-hover-status');
  const moveCase = document.getElementById('mouse-move-case');
  const moveTarget = document.getElementById('mouse-move-target');
  const moveStatus = document.getElementById('mouse-move-status');
  const pressCase = document.getElementById('mouse-press-case');
  const pressTarget = document.getElementById('mouse-press-target');
  const pressStatus = document.getElementById('mouse-press-status');
  const clickCase = document.getElementById('mouse-click-case');
  const clickTarget = document.getElementById('mouse-click-target');
  const clickStatus = document.getElementById('mouse-click-status');
  const doubleClickCase = document.getElementById('mouse-double-click-case');
  const doubleClickTarget = document.getElementById('mouse-double-click-target');
  const doubleClickStatus = document.getElementById('mouse-double-click-status');
  const contextMenuCase = document.getElementById('mouse-context-menu-case');
  const contextMenuTarget = document.getElementById('mouse-context-menu-target');
  const contextMenuStatus = document.getElementById('mouse-context-menu-status');
  const resetButton = document.getElementById('mouse-reset');
  const eventLog = document.getElementById('mouse-event-log');
  const maxLogEntries = 50;

  if (
    !root ||
    !hoverCase ||
    !hoverTarget ||
    !hoverStatus ||
    !moveCase ||
    !moveTarget ||
    !moveStatus ||
    !pressCase ||
    !pressTarget ||
    !pressStatus ||
    !clickCase ||
    !clickTarget ||
    !clickStatus ||
    !doubleClickCase ||
    !doubleClickTarget ||
    !doubleClickStatus ||
    !contextMenuCase ||
    !contextMenuTarget ||
    !contextMenuStatus ||
    !resetButton ||
    !eventLog
  ) {
    return;
  }

  const buttonName = (button) => {
    if (button === 0) return 'left';
    if (button === 1) return 'middle';
    if (button === 2) return 'right';
    return 'none';
  };

  const increment = (element, key) => {
    const value = Number(element.dataset[key] || 0) + 1;
    element.dataset[key] = String(value);
    return value;
  };

  const clearEmptyLog = () => {
    eventLog.querySelector('[data-testid="mouse-log-empty"]')?.remove();
  };

  const record = (eventName, targetName, event) => {
    clearEmptyLog();

    const index = increment(root, 'eventCount');
    const buttonEvents = ['mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu'];
    const button = event && buttonEvents.includes(eventName) ? buttonName(event.button) : 'none';
    const entry = document.createElement('li');
    entry.dataset.index = String(index);
    entry.dataset.event = eventName;
    entry.dataset.target = targetName;
    entry.dataset.button = button;

    let details = button === 'none' ? '' : `, button=${button}`;
    if (eventName === 'mousemove') {
      entry.dataset.x = String(Math.round(event.clientX));
      entry.dataset.y = String(Math.round(event.clientY));
      details += `, x=${entry.dataset.x}, y=${entry.dataset.y}`;
    }

    entry.textContent = `${index}. ${eventName} on ${targetName}${details}`;
    eventLog.appendChild(entry);
    while (eventLog.children.length > maxLogEntries) {
      eventLog.firstElementChild?.remove();
    }
    eventLog.dataset.entryCount = String(eventLog.children.length);

    root.dataset.state = 'active';
    root.dataset.lastEvent = eventName;
    root.dataset.lastTarget = targetName;
  };

  const updateHoverStatus = () => {
    const hovered = hoverCase.dataset.hovered === 'true';
    hoverStatus.dataset.state = hovered ? 'hovered' : 'idle';
    hoverStatus.textContent = `${hovered ? 'Hovered' : 'Not hovered'}. Enters: ${hoverCase.dataset.enterCount}; leaves: ${hoverCase.dataset.leaveCount}; over: ${hoverCase.dataset.overCount}; out: ${hoverCase.dataset.outCount}.`;
  };

  const setHovered = (hovered) => {
    hoverCase.dataset.hovered = String(hovered);
    hoverTarget.style.backgroundColor = hovered ? '#15803d' : '';
    hoverTarget.style.borderColor = hovered ? '#166534' : '';
    hoverTarget.style.transform = hovered ? 'translateY(-2px)' : '';
  };

  hoverTarget.addEventListener('mouseenter', (event) => {
    setHovered(true);
    increment(hoverCase, 'enterCount');
    updateHoverStatus();
    record('mouseenter', 'hover-target', event);
  });

  hoverTarget.addEventListener('mouseleave', (event) => {
    setHovered(false);
    increment(hoverCase, 'leaveCount');
    updateHoverStatus();
    record('mouseleave', 'hover-target', event);
  });

  hoverTarget.addEventListener('mouseover', (event) => {
    increment(hoverCase, 'overCount');
    updateHoverStatus();
    record('mouseover', 'hover-target', event);
  });

  hoverTarget.addEventListener('mouseout', (event) => {
    increment(hoverCase, 'outCount');
    updateHoverStatus();
    record('mouseout', 'hover-target', event);
  });

  document.addEventListener('mousemove', (event) => {
    const x = String(Math.round(event.clientX));
    const y = String(Math.round(event.clientY));
    const count = increment(moveCase, 'moveCount');

    moveCase.dataset.x = x;
    moveCase.dataset.y = y;
    root.dataset.mouseX = x;
    root.dataset.mouseY = y;
    moveStatus.textContent = `Position: x=${x}, y=${y}. Moves: ${count}.`;

    if (event.target instanceof Element && event.target.closest('#mouse-move-target')) {
      record('mousemove', 'move-target', event);
    }
  });

  pressTarget.addEventListener('mousedown', (event) => {
    const count = increment(pressCase, 'downCount');
    const button = buttonName(event.button);
    pressCase.dataset.state = 'pressed';
    pressCase.dataset.lastButton = button;
    pressStatus.dataset.state = 'pressed';
    pressStatus.textContent = `State: pressed. Downs: ${count}; ups: ${pressCase.dataset.upCount}; button: ${button}.`;
    record('mousedown', 'press-target', event);
  });

  pressTarget.addEventListener('mouseup', (event) => {
    const count = increment(pressCase, 'upCount');
    const button = buttonName(event.button);
    pressCase.dataset.state = 'released';
    pressCase.dataset.lastButton = button;
    pressStatus.dataset.state = 'released';
    pressStatus.textContent = `State: released. Downs: ${pressCase.dataset.downCount}; ups: ${count}; button: ${button}.`;
    record('mouseup', 'press-target', event);
  });

  clickTarget.addEventListener('click', (event) => {
    const count = increment(clickCase, 'clickCount');
    const button = buttonName(event.button);
    clickCase.dataset.lastButton = button;
    clickStatus.textContent = `Clicks: ${count}. Last button: ${button}.`;
    record('click', 'click-target', event);
  });

  doubleClickTarget.addEventListener('dblclick', (event) => {
    const count = increment(doubleClickCase, 'doubleClickCount');
    const button = buttonName(event.button);
    doubleClickCase.dataset.lastButton = button;
    doubleClickStatus.textContent = `Double clicks: ${count}. Last button: ${button}.`;
    record('dblclick', 'double-click-target', event);
  });

  contextMenuTarget.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const count = increment(contextMenuCase, 'contextCount');
    const button = buttonName(event.button);
    contextMenuCase.dataset.lastButton = button;
    contextMenuStatus.textContent = `Context menus: ${count}. Last button: ${button}.`;
    record('contextmenu', 'context-menu-target', event);
  });

  const reset = () => {
    root.dataset.state = 'idle';
    root.dataset.eventCount = '0';
    root.dataset.lastEvent = 'none';
    root.dataset.lastTarget = 'none';
    root.dataset.mouseX = '0';
    root.dataset.mouseY = '0';

    setHovered(false);
    hoverCase.dataset.enterCount = '0';
    hoverCase.dataset.leaveCount = '0';
    hoverCase.dataset.overCount = '0';
    hoverCase.dataset.outCount = '0';
    updateHoverStatus();

    moveCase.dataset.x = '0';
    moveCase.dataset.y = '0';
    moveCase.dataset.moveCount = '0';
    moveStatus.textContent = 'Position: x=0, y=0. Moves: 0.';

    pressCase.dataset.state = 'idle';
    pressCase.dataset.downCount = '0';
    pressCase.dataset.upCount = '0';
    pressCase.dataset.lastButton = 'none';
    pressStatus.dataset.state = 'idle';
    pressStatus.textContent = 'State: idle.';

    clickCase.dataset.clickCount = '0';
    clickCase.dataset.lastButton = 'none';
    clickStatus.textContent = 'Clicks: 0.';

    doubleClickCase.dataset.doubleClickCount = '0';
    doubleClickCase.dataset.lastButton = 'none';
    doubleClickStatus.textContent = 'Double clicks: 0.';

    contextMenuCase.dataset.contextCount = '0';
    contextMenuCase.dataset.lastButton = 'none';
    contextMenuStatus.textContent = 'Context menus: 0.';

    const empty = document.createElement('li');
    empty.dataset.testid = 'mouse-log-empty';
    empty.textContent = 'No mouse events recorded.';
    eventLog.replaceChildren(empty);
    eventLog.dataset.entryCount = '0';
  };

  resetButton.addEventListener('click', reset);
})();
