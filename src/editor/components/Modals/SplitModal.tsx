// ============================================================
// SplitModal — Premium split UI
// ============================================================

import { useState } from 'react';
import { usePDFStore } from '@stores/pdfStore';
import { splitPdf, downloadPdf } from '../../utils/pdfHelpers';
import { CloseIcon, SplitIcon, FileIcon } from '../icons';

interface SplitModalProps {
  onClose: () => void;
}

export function SplitModal({ onClose }: SplitModalProps) {
  const { pdfBytes, documentInfo } = usePDFStore();
  const [rangeInput, setRangeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSplit = async () => {
    if (!pdfBytes || !documentInfo) return;

    const indices = parsePageRange(rangeInput, documentInfo.pageCount);
    if (indices.length === 0) {
      setError('Invalid page range. Use format: 1-3, 5, 7-9');
      return;
    }

    setIsProcessing(true);
    setError('');
    try {
      const result = await splitPdf(pdfBytes, indices);
      const baseName = documentInfo.fileName.replace('.pdf', '');
      downloadPdf(result, `${baseName}_pages.pdf`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Split failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
         style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="bg-surface rounded-2xl shadow-xl w-[440px] overflow-hidden"
           style={{ animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-brand text-white flex items-center justify-center">
              <SplitIcon size={16} />
            </div>
            <h2 className="text-sm font-bold text-text">Split PDF</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-text-muted transition-colors">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="p-5">
          {/* Document info */}
          {documentInfo && (
            <div className="flex items-center gap-2.5 p-3 bg-surface-sunken rounded-xl mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-light text-text-brand flex items-center justify-center shrink-0">
                <FileIcon size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text truncate">{documentInfo.fileName}</p>
                <p className="text-[10px] text-text-muted">{documentInfo.pageCount} pages</p>
              </div>
            </div>
          )}

          {/* Range input */}
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
            Page Range
          </label>
          <input
            type="text"
            value={rangeInput}
            onChange={(e) => { setRangeInput(e.target.value); setError(''); }}
            placeholder="e.g. 1-3, 5, 7-9"
            className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-surface hover:border-border-strong focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none transition-all"
          />

          {error && (
            <p className="text-[11px] text-danger mt-1.5 flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-danger text-white flex items-center justify-center text-[8px] font-bold">!</span>
              {error}
            </p>
          )}

          <p className="text-[10px] text-text-muted mt-2">
            Separate pages with commas, use dashes for ranges.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-2 justify-end px-5 py-4 border-t border-border bg-surface-dim">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-surface-hover transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSplit}
            disabled={!rangeInput.trim() || isProcessing}
            className="px-5 py-2 text-xs font-semibold text-text-inverse gradient-brand rounded-lg shadow-[0_2px_8px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_12px_rgba(124,58,237,0.35)] disabled:opacity-40 disabled:shadow-none transition-all"
          >
            {isProcessing ? 'Splitting...' : 'Extract Pages'}
          </button>
        </div>
      </div>
    </div>
  );
}

function parsePageRange(input: string, maxPage: number): number[] {
  const indices = new Set<number>();
  const parts = input.split(',').map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    const rangeParts = part.split('-').map((s) => parseInt(s.trim(), 10));
    if (rangeParts.length === 1 && !isNaN(rangeParts[0])) {
      const p = rangeParts[0];
      if (p >= 1 && p <= maxPage) indices.add(p - 1);
    } else if (rangeParts.length === 2 && !isNaN(rangeParts[0]) && !isNaN(rangeParts[1])) {
      const start = Math.max(1, rangeParts[0]);
      const end = Math.min(maxPage, rangeParts[1]);
      for (let i = start; i <= end; i++) indices.add(i - 1);
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}
