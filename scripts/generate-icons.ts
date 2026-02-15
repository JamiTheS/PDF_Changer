// Run with: npx tsx scripts/generate-icons.ts
// Generates simple placeholder SVG icons for the extension

import { writeFileSync } from 'fs';
import { resolve } from 'path';

const sizes = [16, 48, 128];

function generateSvg(size: number): string {
  const fontSize = Math.round(size * 0.35);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#2563eb"/>
  <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="bold">PDF</text>
</svg>`;
}

for (const size of sizes) {
  const svg = generateSvg(size);
  const outPath = resolve(__dirname, '..', 'public', 'icons', `icon${size}.svg`);
  writeFileSync(outPath, svg, 'utf-8');
  console.log(`Generated ${outPath}`);
}

console.log('Note: Convert SVGs to PNG for Chrome Web Store submission.');
console.log('For development, we use SVGs referenced in manifest as .png (Chrome accepts both in dev mode).');
