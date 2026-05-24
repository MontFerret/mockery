import { defineConfig } from 'astro/config';

const normalizeBase = (value) => {
  const raw = value || '/';
  if (raw === '/') {
    return '/';
  }

  return `/${raw.replace(/^\/+|\/+$/g, '')}/`;
};

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  site: process.env.MOCKERY_SITE_URL || 'https://mockery.montferret.dev',
  base: normalizeBase(process.env.MOCKERY_BASE_PATH),
  outDir: process.env.MOCKERY_OUT_DIR || './dist',
});
