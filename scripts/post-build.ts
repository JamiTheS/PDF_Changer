// Post-build: copy manifest.json, icons, and locales to dist/
import { cpSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');

if (!existsSync(dist)) {
  mkdirSync(dist, { recursive: true });
}

// Copy public/* to dist/
cpSync(resolve(root, 'public'), dist, { recursive: true });

console.log('Post-build: copied public assets to dist/');
