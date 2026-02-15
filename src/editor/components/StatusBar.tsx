// ============================================================
// StatusBar — Premium bottom bar
// ============================================================

import { usePDFStore } from '@stores/pdfStore';
import { useAnnotationStore } from '@stores/annotationStore';
import { t } from '@shared/i18n';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

export function StatusBar() {
  const { documentInfo, currentPage, zoom, setCurrentPage } = usePDFStore();
  const activeTool = useAnnotationStore((s) => s.activeTool);

  if (!documentInfo) return null;

  return (
    <div className="flex items-center justify-between h-8 px-3 bg-surface border-t border-border text-[11px]">
      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-hover disabled:opacity-30 text-text-muted"
        >
          <ChevronLeftIcon size={12} />
        </button>
        <span className="text-text-secondary font-medium min-w-[60px] text-center">
          {t('page')} <span className="text-text font-semibold">{currentPage}</span> {t('of')} {documentInfo.pageCount}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= documentInfo.pageCount}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-hover disabled:opacity-30 text-text-muted"
        >
          <ChevronRightIcon size={12} />
        </button>
      </div>

      {/* File name + active tool */}
      <div className="flex items-center gap-3">
        <span className="text-text-muted truncate max-w-[200px]">{documentInfo.fileName}</span>
        <span className="px-1.5 py-0.5 rounded bg-brand-subtle text-text-brand text-[9px] font-semibold uppercase tracking-wider">
          {activeTool}
        </span>
      </div>

      {/* Zoom */}
      <span className="text-text-muted font-medium tabular-nums">{zoom}%</span>
    </div>
  );
}
