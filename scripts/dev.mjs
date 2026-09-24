import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;

const api = spawn(node, ['scripts/dev-api.mjs'], { cwd: root, stdio: 'inherit' });
const shop = spawn(node, ['node_modules/@angular/cli/bin/ng.js', 'serve', '--proxy-config', 'proxy.conf.json'], {
  cwd: root,
  stdio: 'inherit',
});

function stop() {
  api.kill();
  shop.kill();
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

api.on('exit', (code) => {
  if (code && code !== 0) {
    shop.kill();
    process.exit(code);
  }
});

shop.on('exit', (code) => {
  api.kill();
  process.exit(code ?? 0);
});
