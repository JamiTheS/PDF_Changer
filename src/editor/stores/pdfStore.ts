// ============================================================
// PDF Store — Core PDF document state
// ============================================================

import { create } from 'zustand';
import type { PDFDocumentInfo, PDFPageInfo, ViewMode, ZoomLevel } from '@shared/types';
import { ZOOM_DEFAULT, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '@shared/constants';

interface PDFState {
  // Document
  documentInfo: PDFDocumentInfo | null;
  pages: PDFPageInfo[];
  pdfBytes: Uint8Array | null;
  pdfVersion: number; // increments on each pdfBytes update, triggers re-render
  isLoading: boolean;
  error: string | null;

  // Viewer
  currentPage: number;
  zoom: ZoomLevel;
  viewMode: ViewMode;

  // Actions
  setDocument: (info: PDFDocumentInfo, pages: PDFPageInfo[], bytes: Uint8Array) => void;
  setPdfBytes: (bytes: Uint8Array) => void;
  clearDocument: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: ZoomLevel) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setViewMode: (mode: ViewMode) => void;
  rotatePage: (pageIndex: number) => void;
}

export const usePDFStore = create<PDFState>((set, get) => ({
  documentInfo: null,
  pages: [],
  pdfBytes: null,
  pdfVersion: 0,
  isLoading: false,
  error: null,
  currentPage: 1,
  zoom: ZOOM_DEFAULT,
  viewMode: 'continuous',

  setDocument: (info, pages, bytes) =>
    set({ documentInfo: info, pages, pdfBytes: bytes, pdfVersion: 0, isLoading: false, error: null, currentPage: 1 }),

  setPdfBytes: (bytes) =>
    set((state) => ({ pdfBytes: bytes, pdfVersion: state.pdfVersion + 1 })),

  clearDocument: () =>
    set({ documentInfo: null, pages: [], pdfBytes: null, pdfVersion: 0, currentPage: 1, error: null }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),

  setCurrentPage: (page) => {
    const { documentInfo } = get();
    if (!documentInfo) return;
    const clamped = Math.max(1, Math.min(page, documentInfo.pageCount));
    set({ currentPage: clamped });
  },

  setZoom: (zoom) => set({ zoom: Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom)) }),
  zoomIn: () => {
    const { zoom } = get();
    set({ zoom: Math.min(ZOOM_MAX, zoom + ZOOM_STEP) });
  },
  zoomOut: () => {
    const { zoom } = get();
    set({ zoom: Math.max(ZOOM_MIN, zoom - ZOOM_STEP) });
  },
  resetZoom: () => set({ zoom: ZOOM_DEFAULT }),
  setViewMode: (mode) => set({ viewMode: mode }),

  rotatePage: (pageIndex) =>
    set((state) => {
      const newPages = [...state.pages];
      const page = newPages[pageIndex]; // pageIndex is 0-based
      if (page) {
        page.rotation = ((page.rotation + 90) % 360) as 0 | 90 | 180 | 270;
      }
      return { pages: newPages };
    }),
}));
