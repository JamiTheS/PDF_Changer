// ============================================================
// useKeyboardShortcuts — Global keyboard shortcut handler
// ============================================================

import { useEffect } from 'react';
import { useAnnotationStore } from '@stores/annotationStore';
import { useHistoryStore } from '@stores/historyStore';
import { usePDFStore } from '@stores/pdfStore';

export function useKeyboardShortcuts() {
  const setActiveTool = useAnnotationStore((s) => s.setActiveTool);
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);
  const zoomIn = usePDFStore((s) => s.zoomIn);
  const zoomOut = usePDFStore((s) => s.zoomOut);
  const resetZoom = usePDFStore((s) => s.resetZoom);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Ctrl+Z / Ctrl+Shift+Z work even in inputs (for PDF-level undo/redo)
      if (ctrl && !shift && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      if (ctrl && shift && e.key === 'z') {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl+Y — Redo (alternative)
      if (ctrl && !shift && e.key === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // Don't capture other shortcuts when typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Ctrl+= — Zoom In
      if (ctrl && e.key === '=') {
        e.preventDefault();
        zoomIn();
        return;
      }

      // Ctrl+- — Zoom Out
      if (ctrl && e.key === '-') {
        e.preventDefault();
        zoomOut();
        return;
      }

      // Ctrl+0 — Reset Zoom
      if (ctrl && e.key === '0') {
        e.preventDefault();
        resetZoom();
        return;
      }

      // Tool shortcuts (no modifier)
      if (!ctrl && !shift && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v': setActiveTool('select'); break;
          case 't': setActiveTool('text'); break;
          case 'p': setActiveTool('pen'); break;
          case 'h': setActiveTool('highlight'); break;
          case 'e': setActiveTool('eraser'); break;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, undo, redo, zoomIn, zoomOut, resetZoom]);
}
