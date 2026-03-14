// ============================================================
// PDF Editor Pro — Background Service Worker (Manifest V3)
// ============================================================

import type { ExtensionMessage, PdfDetectedPayload } from '@shared/types';

// Listen for PDF navigation and offer to open in editor
chrome.webNavigation?.onCompleted.addListener((details) => {
  if (details.frameId !== 0) return;

  const url = details.url;
  if (isPdfUrl(url)) {
    // Notify the content script (or directly open editor)
    chrome.tabs.sendMessage(details.tabId, {
      type: 'PDF_DETECTED',
      payload: { url, fileName: extractFileName(url) } satisfies PdfDetectedPayload,
    } satisfies ExtensionMessage);
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  switch (message.type) {
    case 'OPEN_EDITOR': {
      const payload = message.payload as { pdfUrl: string; fileName: string };
      openEditor(payload.pdfUrl, payload.fileName);
      sendResponse({ success: true });
      break;
    }
    default:
      break;
  }
  return true; // keep channel open for async responses
});

// --- Helpers ---

function isPdfUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    if (path.endsWith('.pdf')) return true;
    // Check content-type header hint in the URL
    if (u.searchParams.get('type') === 'application/pdf') return true;
    return false;
  } catch {
    return false;
  }
}

function extractFileName(url: string): string {
  try {
    const u = new URL(url);
    const segments = u.pathname.split('/');
    const last = segments[segments.length - 1];
    return decodeURIComponent(last) || 'document.pdf';
  } catch {
    return 'document.pdf';
  }
}

function openEditor(pdfUrl?: string, fileName?: string): void {
  const editorUrl = chrome.runtime.getURL('src/editor/editor.html');
  const params = new URLSearchParams();
  if (pdfUrl) params.set('url', pdfUrl);
  if (fileName) params.set('name', fileName);

  const fullUrl = params.toString()
    ? `${editorUrl}?${params.toString()}`
    : editorUrl;

  chrome.tabs.create({ url: fullUrl });
}

