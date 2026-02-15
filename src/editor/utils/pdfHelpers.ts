// ============================================================
// PDF Helpers — Loading, rendering, exporting
// ============================================================

import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import type { PDFDocumentInfo, PDFPageInfo, PageRotation, Annotation } from '@shared/types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

let currentPdfDoc: pdfjsLib.PDFDocumentProxy | null = null;

/**
 * Load a PDF from a URL or Uint8Array using PDF.js for rendering
 */
export async function loadPdfForViewing(
  source: string | Uint8Array,
): Promise<{ doc: pdfjsLib.PDFDocumentProxy; info: PDFDocumentInfo; pages: PDFPageInfo[] }> {
  // IMPORTANT: PDF.js takes ownership of the ArrayBuffer (transfers it),
  // which would detach the original Uint8Array. We pass a copy to keep
  // the original bytes valid for pdf-lib operations later.
  const loadingTask = pdfjsLib.getDocument(
    typeof source === 'string' ? { url: source } : { data: source.slice() },
  );

  const doc = await loadingTask.promise;
  currentPdfDoc = doc;

  const metadata = await doc.getMetadata().catch(() => null);
  const info = metadata?.info as Record<string, unknown> | undefined;

  const pages: PDFPageInfo[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    pages.push({
      index: i - 1,
      width: viewport.width,
      height: viewport.height,
      rotation: (page.rotate % 360) as PageRotation,
    });
  }

  const docInfo: PDFDocumentInfo = {
    fileName: 'document.pdf',
    pageCount: doc.numPages,
    fileSizeBytes: 0,
    title: (info?.['Title'] as string) ?? undefined,
    author: (info?.['Author'] as string) ?? undefined,
    subject: (info?.['Subject'] as string) ?? undefined,
  };

  return { doc, info: docInfo, pages };
}

/**
 * Get text content for a specific page
 */
/**
 * Get text items with canvas coordinates for a specific page
 */
export async function getPageTextItems(
  pageNumber: number,
  scale: number,
  pdfBytes?: Uint8Array | null,
): Promise<Array<{ text: string; x: number; y: number; width: number; height: number; fontSize: number; fontName: string }>> {
  if (!currentPdfDoc) {
    if (pdfBytes) {
      // Attempt to recover by reloading
      console.warn('getPageTextItems: currentPdfDoc is null, reloading from bytes...');
      const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
      currentPdfDoc = await loadingTask.promise;
    } else {
      throw new Error('No PDF loaded');
    }
  }

  const page = await currentPdfDoc.getPage(pageNumber);
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale });

  return textContent.items.map((item: any) => {
    const tx = item.transform;
    const pdfX = tx[4];
    const pdfY = tx[5];
    const pdfWidth = item.width;
    const pdfHeight = Math.hypot(tx[2], tx[3]);

    // Construct rect in PDF space: [x, y, x+w, y+h]
    // Note: text draws upwards from baseline y.
    const pdfRect = [pdfX, pdfY, pdfX + pdfWidth, pdfY + pdfHeight];

    // Convert to viewing port (Canvas) coords
    const viewRect = viewport.convertToViewportRectangle(pdfRect);

    // Normalize (viewport might flip Y)
    const x = Math.min(viewRect[0], viewRect[2]);
    const y = Math.min(viewRect[1], viewRect[3]);
    const width = Math.abs(viewRect[2] - viewRect[0]);
    const height = Math.abs(viewRect[3] - viewRect[1]);

    return {
      text: item.str,
      x,
      y, // Top-left
      width,
      height,
      fontSize: height,
      fontName: item.fontName
    };
  });
}

/**
 * Render a single page to a canvas
 */
export async function renderPageToCanvas(
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number,
  rotation?: number,
): Promise<void> {
  if (!currentPdfDoc) throw new Error('No PDF loaded');

  const page = await currentPdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale, rotation: rotation ?? page.rotate });
  const dpr = window.devicePixelRatio || 1;

  // Set dimensions for high-DPI rendering
  canvas.width = viewport.width * dpr;
  canvas.height = viewport.height * dpr;

  // Ensure visual size matches viewport
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Scale context to match device pixel ratio
  ctx.scale(dpr, dpr);

  await page.render({ canvasContext: ctx, viewport } as any).promise;
}

/**
 * Load a PDF with pdf-lib for manipulation (merge, split, edit metadata, etc.)
 */
export async function loadPdfForEditing(bytes: Uint8Array): Promise<PDFDocument> {
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}

/**
 * Merge multiple PDFs into one
 */
export async function mergePdfs(pdfBytesArray: Uint8Array[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();

  for (const bytes of pdfBytesArray) {
    const donor = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(donor, donor.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  return merged.save();
}

/**
 * Split a PDF — extract specific pages
 */
export async function splitPdf(
  pdfBytes: Uint8Array,
  pageIndices: number[],
): Promise<Uint8Array> {
  const source = await PDFDocument.load(pdfBytes);
  const newDoc = await PDFDocument.create();

  const pages = await newDoc.copyPages(source, pageIndices);
  pages.forEach((page) => newDoc.addPage(page));

  return newDoc.save();
}

/**
 * Rotate pages in a PDF
 */
export async function rotatePages(
  pdfBytes: Uint8Array,
  pageIndices: number[],
  rotation: PageRotation,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);

  for (const idx of pageIndices) {
    const page = doc.getPage(idx);
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + rotation) % 360));
  }

  return doc.save();
}

/**
 * Export modified PDF (flatten annotations onto pages)
 */
export async function exportPdf(
  pdfBytes: Uint8Array,
  annotations: Map<number, Annotation[]>,
  pagesInfo: PDFPageInfo[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const embedFont = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const pageInfo = pagesInfo[i];
    const pageAnns = annotations.get(i) || [];
    const { height } = page.getSize();

    // Apply rotation
    if (pageInfo) {
      page.setRotation(degrees(pageInfo.rotation));
    }

    for (const ann of pageAnns) {
      // Color helper
      const parseColor = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return rgb(r, g, b);
      };

      try {
        switch (ann.type) {
          case 'text-edit': {
            // 1. Draw white rectangle to cover the original PDF text
            const PADDING = 2;
            page.drawRectangle({
              x: ann.originalX - PADDING,
              y: height - ann.originalY - ann.originalHeight - PADDING,
              width: ann.originalWidth + PADDING * 2,
              height: ann.originalHeight + PADDING * 2,
              color: rgb(1, 1, 1), // white
              borderWidth: 0,
            });

            // 2. Draw the new text on top
            page.drawText(ann.newText, {
              x: ann.x,
              y: height - ann.y - ann.fontSize,
              size: ann.fontSize,
              font: embedFont,
              color: parseColor(ann.fontColor),
            });
            break;
          }

          case 'text': {
            page.drawText(ann.content, {
              x: ann.x,
              y: height - ann.y - ann.fontSize,
              size: ann.fontSize,
              font: embedFont,
              color: parseColor(ann.fontColor),
            });
            break;
          }

          case 'shape': {
            const color = ann.strokeColor ? parseColor(ann.strokeColor) : rgb(0, 0, 0);
            const fillColor =
              ann.fillColor && ann.fillColor !== 'transparent'
                ? parseColor(ann.fillColor)
                : undefined;

            if (ann.shapeType === 'rectangle') {
              page.drawRectangle({
                x: ann.x,
                y: height - ann.y - ann.height,
                width: ann.width,
                height: ann.height,
                borderColor: color,
                borderWidth: ann.strokeWidth,
                color: fillColor,
                opacity: fillColor ? 1 : 0,
              });
            } else if (ann.shapeType === 'circle') {
              const radius = ann.width / 2;
              page.drawCircle({
                x: ann.x + radius,
                y: height - (ann.y + radius),
                size: radius,
                borderColor: color,
                borderWidth: ann.strokeWidth,
                color: fillColor,
                opacity: fillColor ? 1 : 0,
              });
            } else if (ann.shapeType === 'line') {
              page.drawLine({
                start: { x: ann.x, y: height - ann.y },
                end: { x: ann.x + ann.width, y: height - (ann.y + ann.height) },
                color: color,
                thickness: ann.strokeWidth,
              });
            }
            break;
          }

          case 'freehand': {
            if (ann.points.length > 1) {
              const pathData = ann.points.map((p, idx) =>
                idx === 0 ? `M ${p.x} ${height - p.y}` : `L ${p.x} ${height - p.y}`
              ).join(' ');

              page.drawSvgPath(pathData, {
                borderColor: parseColor(ann.strokeColor),
                borderWidth: ann.strokeWidth,
              });
            }
            break;
          }

          case 'image':
          case 'signature': {
            const imgBytes = await fetch(ann.dataUrl).then(res => res.arrayBuffer());
            let image;
            if (ann.dataUrl.startsWith('data:image/png')) {
              image = await doc.embedPng(imgBytes);
            } else {
              image = await doc.embedJpg(imgBytes);
            }

            page.drawImage(image, {
              x: ann.x,
              y: height - ann.y - ann.height,
              width: ann.width,
              height: ann.height,
            });
            break;
          }
        }
      } catch (e) {
        console.error('Failed to burn annotation:', ann, e);
      }
    }
  }

  return doc.save();
}

/**
 * Reload the PDF.js document from new bytes (after in-place edits).
 * Updates the global currentPdfDoc so renderPageToCanvas uses the new content.
 */
export async function reloadPdfDocument(bytes: Uint8Array): Promise<void> {
  // Pass a copy to prevent PDF.js from detaching the original ArrayBuffer
  const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
  currentPdfDoc = await loadingTask.promise;
}

/**
 * Ensure we have a valid, fresh copy of PDF bytes.
 * Zustand stores can have shared/detached ArrayBuffers.
 */
function ensureValidPdfBytes(bytes: Uint8Array): Uint8Array {
  // Make a fresh copy to avoid detached buffer issues
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);

  // Validate PDF header (%PDF-)
  if (copy.length < 5 || copy[0] !== 0x25 || copy[1] !== 0x50 || copy[2] !== 0x44 || copy[3] !== 0x46 || copy[4] !== 0x2D) {
    const headerPreview = new TextDecoder().decode(copy.slice(0, 20));
    throw new Error(`Invalid PDF bytes (length=${copy.length}, header="${headerPreview}"). The PDF data may not have loaded correctly.`);
  }

  return copy;
}

/**
 * Apply a text edit directly into the PDF bytes.
 * Draws a white rectangle over the original text area and writes the new text.
 * Returns the modified PDF bytes.
 */
export async function applyTextEdit(
  pdfBytes: Uint8Array,
  edit: {
    originalX: number;
    originalY: number;
    originalWidth: number;
    originalHeight: number;
    newText: string;
    fontSize: number;
    fontColor: string;
  },
  pageIndex: number,
  viewportScale: number,
): Promise<Uint8Array> {
  const safePdfBytes = ensureValidPdfBytes(pdfBytes);
  const doc = await PDFDocument.load(safePdfBytes, { ignoreEncryption: true });
  const page = doc.getPages()[pageIndex];
  const { height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  // Convert viewport (canvas) coordinates back to PDF coordinates
  const pdfOrigX = edit.originalX / viewportScale;
  const pdfOrigY = edit.originalY / viewportScale;
  const pdfOrigW = edit.originalWidth / viewportScale;
  const pdfOrigH = edit.originalHeight / viewportScale;
  const pdfFontSize = edit.fontSize / viewportScale;

  const parseHexColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return rgb(r, g, b);
  };

  /**
   * Sanitize text to ensure it is compatible with WinAnsi encoding (used by StandardFonts).
   * Replaces unsupported characters with '?'.
   */
  const sanitizeText = (str: string) => {
    // WinAnsi supports roughly 0x00-0xFF, with some gaps and specific mappings.
    // For simplicity, we filter out characters > 255.
    return str.replace(/[^\x00-\xFF]/g, '?');
  };

  const safeText = sanitizeText(edit.newText);
  if (safeText !== edit.newText) {
    console.warn('TextEdit: Some characters were sanitized because they are not supported by the standard font.');
  }

  const PADDING = 2;

  // 1. White rectangle to cover original text
  page.drawRectangle({
    x: pdfOrigX - PADDING,
    y: height - pdfOrigY - pdfOrigH - PADDING,
    width: pdfOrigW + PADDING * 2,
    height: pdfOrigH + PADDING * 2,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  });

  // 2. Draw the new text
  page.drawText(safeText, {
    x: pdfOrigX,
    y: height - pdfOrigY - pdfFontSize,
    size: pdfFontSize,
    font,
    color: parseHexColor(edit.fontColor),
  });

  return doc.save();
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Read a File as Uint8Array
 */
export function readFileAsBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Trigger browser download of a PDF
 */
export function downloadPdf(bytes: Uint8Array, fileName: string): void {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

