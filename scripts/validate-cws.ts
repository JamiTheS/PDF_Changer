import { readFileSync, readdirSync, statSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');
const failures: string[] = [];
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function fail(message: string): void {
  failures.push(message);
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const manifest = JSON.parse(readFileSync(join(dist, 'manifest.json'), 'utf-8'));
const permissions = manifest.permissions ?? [];
const hostPermissions = manifest.host_permissions ?? [];
const optionalHostPermissions = manifest.optional_host_permissions ?? [];

for (const permission of ['tabs', 'webNavigation', 'downloads', 'scripting']) {
  if (permissions.includes(permission)) {
    fail(`Unexpected broad or unnecessary permission: ${permission}`);
  }
}

for (const pattern of [...hostPermissions, ...optionalHostPermissions]) {
  if (pattern === '<all_urls>' || pattern === 'http://*/*' || pattern === 'https://*/*') {
    fail(`Broad host permission is not allowed in the store package: ${pattern}`);
  }
}

if (manifest.content_scripts?.length) {
  fail('Static content scripts are disabled for the store package to keep host access user initiated.');
}

for (const [size, iconPath] of Object.entries<string>(manifest.icons ?? {})) {
  const icon = readFileSync(join(dist, iconPath));
  if (!icon.subarray(0, pngSignature.length).equals(pngSignature)) {
    fail(`Icon ${size} at ${iconPath} is not a valid PNG file.`);
  }
}

for (const file of walk(dist)) {
  if (file.endsWith('.map')) fail(`Source map must not be shipped: ${file}`);
  if (/\.(js|html|css)$/.test(file)) {
    const contents = readFileSync(file, 'utf-8');
    if (/new Function|eval\(|import\s*\(\s*['"]https?:\/\/|<script[^>]+src=['"]https?:\/\//.test(contents)) {
      fail(`Dynamic evaluation or remote executable code pattern found in ${file}`);
    }
  }
}

if (failures.length) {
  console.error('Chrome Web Store validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Chrome Web Store validation passed.');
