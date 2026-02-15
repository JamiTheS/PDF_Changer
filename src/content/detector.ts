// ============================================================
// PDF Editor Pro — Content Script (PDF Detector)
// ============================================================

import type { ExtensionMessage, PdfDetectedPayload } from '@shared/types';

// Listen for messages from background
chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
  if (message.type === 'PDF_DETECTED') {
    const payload = message.payload as PdfDetectedPayload;
    showEditorBanner(payload.url, payload.fileName);
  }
});

// Also detect on page load if current page is a PDF
function detectPdfOnLoad(): void {
  // Chrome's built-in PDF viewer uses an embed element
  const embed = document.querySelector('embed[type="application/pdf"]');
  const isPdfViewer = document.contentType === 'application/pdf';

  if (embed || isPdfViewer) {
    const url = window.location.href;
    const fileName = extractFileNameFromUrl(url);
    showEditorBanner(url, fileName);
  }
}

function showEditorBanner(pdfUrl: string, fileName: string): void {
  // Avoid duplicate banners
  if (document.getElementById('pdf-editor-pro-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'pdf-editor-pro-banner';
  banner.setAttribute('style', `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2147483647;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    animation: slideDown 0.3s ease-out;
  `);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
  `;
  document.head.appendChild(style);

  const text = document.createElement('span');
  const displayName = fileName.length > 60 ? fileName.slice(0, 57) + '...' : fileName;
  text.textContent = `PDF detected: ${displayName}`;

  const actions = document.createElement('div');
  actions.setAttribute('style', 'display:flex;gap:8px;align-items:center;');

  const openBtn = document.createElement('button');
  openBtn.textContent = 'Open in PDF Editor Pro';
  openBtn.setAttribute('style', `
    background: white;
    color: #2563eb;
    border: none;
    padding: 6px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
  `);
  openBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'OPEN_EDITOR',
      payload: { pdfUrl, fileName },
    } satisfies ExtensionMessage);
    banner.remove();
  });

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('style', `
    background: transparent;
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `);
  closeBtn.addEventListener('click', () => banner.remove());

  actions.appendChild(openBtn);
  actions.appendChild(closeBtn);
  banner.appendChild(text);
  banner.appendChild(actions);
  document.body.appendChild(banner);
}

function extractFileNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const segments = u.pathname.split('/');
    const last = segments[segments.length - 1];
    return decodeURIComponent(last) || 'document.pdf';
  } catch {
    return 'document.pdf';
  }
}

// Run detection
if (document.readyState === 'complete') {
  detectPdfOnLoad();
} else {
  window.addEventListener('load', detectPdfOnLoad);
}
