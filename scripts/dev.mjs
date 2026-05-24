import { spawnSync } from 'node:child_process';

const build = spawnSync(process.execPath, ['scripts/build.mjs'], { stdio: 'inherit' });
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

spawnSync(process.execPath, ['scripts/serve.mjs', 'dist', '4173'], { stdio: 'inherit' });
