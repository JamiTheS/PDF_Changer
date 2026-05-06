// ============================================================
// PDF Editor Pro — Background Service Worker (Manifest V3)
// ============================================================

import type { ExtensionMessage } from '@shared/types';

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
