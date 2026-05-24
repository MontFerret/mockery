(() => {
  const basePath = document.documentElement.dataset.basePath || '/';
  const baseHref = new URL(basePath, window.location.origin);

  window.Mockery = {
    basePath,
    resolvePath(pathname) {
      const raw = String(pathname);

      if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
        return raw;
      }

      if (raw.startsWith(basePath)) {
        return new URL(raw, window.location.origin).toString();
      }

      if (raw.startsWith('/')) {
        return new URL(`${basePath}${raw.replace(/^\/+/, '')}`, window.location.origin).toString();
      }

      return new URL(raw, baseHref).toString();
    },
  };
})();
