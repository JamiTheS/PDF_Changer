// ============================================================
// MergeModal — Premium merge UI with file list
// ============================================================

import { useState, useCallback } from 'react';
import { mergePdfs, readFileAsBytes, downloadPdf } from '../../utils/pdfHelpers';
import { CloseIcon, MergeIcon, FileIcon, UploadIcon } from '../icons';

interface MergeModalProps {
  onClose: () => void;
}

interface FileEntry {
  id: string;
  file: File;
  name: string;
  size: number;
}

export function MergeModal({ onClose }: MergeModalProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_MERGE_FILE_SIZE = 100 * 1024 * 1024; // 100 MB per file

  const handleAddFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = Array.from(e.target.files ?? []);

    // Validate all files are PDFs and within size limit
    const invalid = selected.filter(f => !f.name.toLowerCase().endsWith('.pdf') && f.type !== 'application/pdf');
    if (invalid.length > 0) {
      setError(`${invalid.map(f => f.name).join(', ')} — fichier(s) non-PDF ignoré(s)`);
    }
    const tooLarge = selected.filter(f => f.size > MAX_MERGE_FILE_SIZE);
    if (tooLarge.length > 0) {
      setError(prev => (prev ? prev + '. ' : '') + `${tooLarge.map(f => f.name).join(', ')} — trop volumineux (max 100 Mo)`);
    }

    const validFiles = selected
      .filter(f => (f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf') && f.size <= MAX_MERGE_FILE_SIZE)
      .map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        name: file.name,
        size: file.size,
      }));
    setFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    try {
      const bytesArray = await Promise.all(files.map((f) => readFileAsBytes(f.file)));
      const merged = await mergePdfs(bytesArray);
      downloadPdf(merged, 'merged.pdf');
      onClose();
    } catch (err) {
      console.error('Merge failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="bg-surface rounded-2xl shadow-xl w-[520px] max-h-[80vh] flex flex-col overflow-hidden"
        style={{ animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-brand text-white flex items-center justify-center">
              <MergeIcon size={16} />
            </div>
            <h2 className="text-sm font-bold text-text">Merge PDFs</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-text-muted transition-colors">
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Upload area */}
          <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-border-strong rounded-xl cursor-pointer hover:border-border-brand hover:bg-brand-subtle/30 transition-colors mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-light text-text-brand flex items-center justify-center">
              <UploadIcon size={20} />
            </div>
            <span className="text-xs font-medium text-text-secondary">Click to add PDFs</span>
            <input type="file" accept=".pdf" multiple onChange={handleAddFiles} className="hidden" />
          </label>

          {/* File list */}
          <div className="space-y-1.5">
            {files.map((f, i) => (
              <div key={f.id} className="flex items-center gap-3 px-3 py-2.5 bg-surface-sunken rounded-xl group">
                <span className="w-6 h-6 rounded-lg bg-brand-light text-text-brand flex items-center justify-center text-[10px] font-bold shrink-0">
                  {i + 1}
                </span>
                <FileIcon size={14} className="text-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text truncate">{f.name}</p>
                  <p className="text-[10px] text-text-muted">{(f.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  onClick={() => handleRemove(f.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-md text-text-muted hover:text-danger hover:bg-danger-light opacity-0 group-hover:opacity-100 transition-all"
                >
                  <CloseIcon size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg mb-3">
              <span className="text-xs text-red-600 flex-1">{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-surface-dim">
          <span className="text-[11px] text-text-muted">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-surface-hover transition-colors">
              Cancel
            </button>
            <button
              onClick={handleMerge}
              disabled={files.length < 2 || isProcessing}
              className="px-5 py-2 text-xs font-semibold text-text-inverse gradient-brand rounded-lg shadow-[0_2px_8px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_12px_rgba(124,58,237,0.35)] disabled:opacity-40 disabled:shadow-none transition-all"
            >
              {isProcessing ? 'Merging...' : 'Merge Files'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
