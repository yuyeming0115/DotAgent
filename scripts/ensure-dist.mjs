import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = new URL('../dist/', import.meta.url);
mkdirSync(distDir, { recursive: true });

const indexPath = new URL('../dist/index.html', import.meta.url);
if (!existsSync(indexPath)) {
  writeFileSync(indexPath, '<!doctype html><html><head><meta charset="UTF-8"></head><body><div id="root"></div></body></html>');
}
