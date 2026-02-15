// ============================================================
// usePDF Hook — Load and manage PDF documents
// ============================================================

import { useCallback } from 'react';
import { usePDFStore } from '@stores/pdfStore';
import { loadPdfForViewing, readFileAsBytes } from '../utils/pdfHelpers';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const ALLOWED_SCHEMES = ['https:', 'http:', 'chrome-extension:', 'file:'];

export function usePDF() {
  const {
    documentInfo,
    pages,
    pdfBytes,
    isLoading,
    error,
    currentPage,
    zoom,
    viewMode,
    setDocument,
    clearDocument,
    setLoading,
    setError,
    setCurrentPage,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setViewMode,
  } = usePDFStore();

  const loadFromUrl = useCallback(async (url: string) => {
    setLoading(true);
    try {
      // Validate URL scheme to prevent fetching internal resources
      const parsedUrl = new URL(url);
      if (!ALLOWED_SCHEMES.includes(parsedUrl.protocol)) {
        throw new Error(`Unsupported URL scheme: ${parsedUrl.protocol}`);
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // Validate content type
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/pdf') && !url.toLowerCase().endsWith('.pdf')) {
        throw new Error('The URL does not point to a valid PDF file');
      }

      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
        throw new Error('File too large (max 100 MB)');
      }

      const bytes = new Uint8Array(arrayBuffer);
      const { info, pages: pageInfos } = await loadPdfForViewing(bytes);
      info.fileName = extractFileName(url);
      info.fileSizeBytes = bytes.byteLength;

      setDocument(info, pageInfos, bytes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PDF');
    }
  }, [setDocument, setLoading, setError]);

  const loadFromFile = useCallback(async (file: File) => {
    setLoading(true);
    try {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        throw new Error('Please select a valid PDF file');
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File too large (max 100 MB)');
      }

      const bytes = await readFileAsBytes(file);
      const { info, pages: pageInfos } = await loadPdfForViewing(bytes);
      info.fileName = file.name;
      info.fileSizeBytes = file.size;

      setDocument(info, pageInfos, bytes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PDF');
    }
  }, [setDocument, setLoading, setError]);

  return {
    documentInfo,
    pages,
    pdfBytes,
    isLoading,
    error,
    currentPage,
    zoom,
    viewMode,
    loadFromUrl,
    loadFromFile,
    clearDocument,
    setCurrentPage,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setViewMode,
  };
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
