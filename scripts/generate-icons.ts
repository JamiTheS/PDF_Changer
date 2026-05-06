// Generates real PNG icons for the Chrome Web Store package.

import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { deflateSync } from 'zlib';

const sizes = [16, 48, 128];
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function roundedRect(x: number, y: number, width: number, height: number, radius: number, px: number, py: number): boolean {
  const right = x + width;
  const bottom = y + height;
  const innerX = px >= x + radius && px < right - radius;
  const innerY = py >= y + radius && py < bottom - radius;
  if ((px >= x && px < right && innerY) || (py >= y && py < bottom && innerX)) return true;

  const corners = [
    [x + radius, y + radius],
    [right - radius - 1, y + radius],
    [x + radius, bottom - radius - 1],
    [right - radius - 1, bottom - radius - 1],
  ];
  return corners.some(([cx, cy]) => (px - cx) ** 2 + (py - cy) ** 2 <= radius ** 2);
}

function setPixel(pixels: Uint8Array, size: number, x: number, y: number, color: number[]): void {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const index = (y * size + x) * 4;
  pixels[index] = color[0];
  pixels[index + 1] = color[1];
  pixels[index + 2] = color[2];
  pixels[index + 3] = color[3];
}

function drawIcon(size: number): Uint8Array {
  const pixels = new Uint8Array(size * size * 4);
  const blue = [37, 99, 235, 255];
  const blueDark = [29, 78, 216, 255];
  const white = [255, 255, 255, 255];
  const page = [238, 242, 255, 255];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const mix = y / Math.max(size - 1, 1);
      const color = blue.map((channel, index) => Math.round(channel * (1 - mix) + blueDark[index] * mix));
      setPixel(pixels, size, x, y, color);
    }
  }

  const margin = Math.max(2, Math.round(size * 0.18));
  const docX = margin;
  const docY = Math.round(size * 0.16);
  const docW = size - margin * 2;
  const docH = size - Math.round(size * 0.28);
  const radius = Math.max(1, Math.round(size * 0.08));

  for (let y = docY; y < docY + docH; y++) {
    for (let x = docX; x < docX + docW; x++) {
      if (roundedRect(docX, docY, docW, docH, radius, x, y)) {
        setPixel(pixels, size, x, y, page);
      }
    }
  }

  const fold = Math.max(3, Math.round(size * 0.18));
  for (let y = 0; y < fold; y++) {
    for (let x = 0; x < fold - y; x++) {
      setPixel(pixels, size, docX + docW - fold + x, docY + y, white);
    }
  }

  const lineHeight = Math.max(1, Math.round(size * 0.045));
  const lineGap = Math.max(2, Math.round(size * 0.11));
  const lineX = docX + Math.round(docW * 0.22);
  const lineW = Math.round(docW * 0.56);
  const firstLineY = docY + Math.round(docH * 0.42);

  for (let i = 0; i < 3; i++) {
    const yStart = firstLineY + i * lineGap;
    const width = i === 2 ? Math.round(lineW * 0.7) : lineW;
    for (let y = yStart; y < yStart + lineHeight; y++) {
      for (let x = lineX; x < lineX + width; x++) {
        setPixel(pixels, size, x, y, blue);
      }
    }
  }

  return pixels;
}

function encodePng(size: number, pixels: Uint8Array): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const rows = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    rows[rowStart] = 0;
    Buffer.from(pixels.subarray(y * size * 4, (y + 1) * size * 4)).copy(rows, rowStart + 1);
  }

  return Buffer.concat([
    pngSignature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const iconsDir = resolve(__dirname, '..', 'public', 'icons');
mkdirSync(iconsDir, { recursive: true });

for (const size of sizes) {
  const png = encodePng(size, drawIcon(size));
  const outPath = resolve(iconsDir, `icon${size}.png`);
  writeFileSync(outPath, png);
  console.log(`Generated ${outPath}`);
}
