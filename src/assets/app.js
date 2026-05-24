(() => {
  const rootPath = document.documentElement.dataset.rootPath || './';
  const baseHref = new URL(rootPath, window.location.href);
  window.Mockery = {
    resolvePath(pathname) {
      return new URL(pathname.replace(/^\//, ''), baseHref).toString();
    },
  };

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.href = window.location.href.split('#')[0];
  }
})();
