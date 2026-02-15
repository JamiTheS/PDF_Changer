// ============================================================
// Toolbar — Premium toolbar with SVG icons, groups, and glass effect
// ============================================================

import { useState, type ReactNode } from 'react';
import { useAnnotationStore } from '@stores/annotationStore';
import { useHistoryStore } from '@stores/historyStore';
import { usePDFStore } from '@stores/pdfStore';
import { t } from '@shared/i18n';
import type { EditorTool, ViewMode } from '@shared/types';
import { downloadPdf, exportPdf } from '../../utils/pdfHelpers';
import { ToolButton } from './ToolButton';
import {
  CursorIcon, TextIcon, TextEditIcon, HighlightIcon, UnderlineIcon, StrikethroughIcon,
  PenIcon, RectangleIcon, CircleIcon, ArrowIcon, LineIcon,
  SignatureIcon, ImageIcon, EraserIcon,
  UndoIcon, RedoIcon, TrashIcon, MergeIcon,
  ZoomInIcon, ZoomOutIcon,
  SinglePageIcon, DoublePageIcon, ContinuousIcon,
  DownloadIcon, PdfLogoIcon,
} from '../icons';
import { MergeModal } from '../Modals/MergeModal';

interface ToolDef {
  tool: EditorTool;
  labelKey: string;
  icon: ReactNode;
  shortcut?: string;
}

const textTools: ToolDef[] = [
  { tool: 'select', labelKey: 'tool.select', icon: <CursorIcon size={18} />, shortcut: 'V' },
  { tool: 'text-edit', labelKey: 'tool.editText', icon: <TextEditIcon size={18} />, shortcut: 'E' },
  { tool: 'text', labelKey: 'tool.text', icon: <TextIcon size={18} />, shortcut: 'T' },
  { tool: 'highlight', labelKey: 'tool.highlight', icon: <HighlightIcon size={18} />, shortcut: 'H' },
  { tool: 'underline', labelKey: 'tool.underline', icon: <UnderlineIcon size={18} /> },
  { tool: 'strikethrough', labelKey: 'tool.strikethrough', icon: <StrikethroughIcon size={18} /> },
];

const drawTools: ToolDef[] = [
  { tool: 'pen', labelKey: 'tool.pen', icon: <PenIcon size={18} />, shortcut: 'P' },
  { tool: 'rectangle', labelKey: 'tool.rectangle', icon: <RectangleIcon size={18} /> },
  { tool: 'circle', labelKey: 'tool.circle', icon: <CircleIcon size={18} /> },
  { tool: 'arrow', labelKey: 'tool.arrow', icon: <ArrowIcon size={18} /> },
  { tool: 'line', labelKey: 'tool.line', icon: <LineIcon size={18} /> },
];

const insertTools: ToolDef[] = [
  { tool: 'signature', labelKey: 'tool.signature', icon: <SignatureIcon size={18} /> },
  { tool: 'image', labelKey: 'tool.image', icon: <ImageIcon size={18} /> },
  { tool: 'eraser', labelKey: 'tool.eraser', icon: <EraserIcon size={18} />, shortcut: 'E' },
];

const viewModes: Array<{ mode: ViewMode; labelKey: string; icon: ReactNode }> = [
  { mode: 'single', labelKey: 'view.singlePage', icon: <SinglePageIcon size={16} /> },
  { mode: 'double', labelKey: 'view.doublePage', icon: <DoublePageIcon size={16} /> },
  { mode: 'continuous', labelKey: 'view.continuous', icon: <ContinuousIcon size={16} /> },
];

function ToolGroup({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="flex items-center gap-0.5 px-1.5">
      {label && (
        <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted mr-1 hidden xl:block">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

function Divider() {
  return <div className="w-px h-7 bg-border mx-1.5 shrink-0" />;
}

export function Toolbar() {
  const activeTool = useAnnotationStore((s) => s.activeTool);
  const setActiveTool = useAnnotationStore((s) => s.setActiveTool);
  const [showMerge, setShowMerge] = useState(false);

  const { canUndo, canRedo, undo, redo } = useHistoryStore();

  const { zoom, viewMode, documentInfo, pdfBytes, pages } = usePDFStore();
  const { zoomIn, zoomOut, resetZoom, setViewMode } = usePDFStore();

  const annotations = useAnnotationStore((s) => s.annotations);

  const handleSave = async () => {
    if (!pdfBytes || !documentInfo) return;
    const exported = await exportPdf(pdfBytes, annotations, pages);
    downloadPdf(exported, documentInfo.fileName);
  };

  return (
    <div className="glass-strong border-b border-border z-10 relative shadow-sm" style={{ animation: 'slideDown 0.3s ease-out' }}>
      <div className="flex items-center h-12 px-2 overflow-visible">

        {/* Logo */}
        <div className="flex items-center gap-2 pr-3 mr-1 shrink-0">
          <PdfLogoIcon size={28} />
          <span className="text-sm font-bold gradient-brand-text hidden sm:block">
            PDF Editor Pro
          </span>
        </div>

        <Divider />

        {/* Undo / Redo / Delete */}
        <ToolGroup>
          <ToolButton
            icon={<UndoIcon size={18} />}
            label={t('action.undo')}
            shortcut="Ctrl+Z"
            onClick={undo}
            disabled={!canUndo}
          />
          <ToolButton
            icon={<RedoIcon size={18} />}
            label={t('action.redo')}
            shortcut="Ctrl+Shift+Z"
            onClick={redo}
            disabled={!canRedo}
          />
          <ToolButton
            icon={<TrashIcon size={18} />}
            label="Supprimer la sélection"
            shortcut="Suppr"
            onClick={() => window.dispatchEvent(new CustomEvent('pdf-editor-delete-selected'))}
          />
        </ToolGroup>

        <Divider />

        {/* Text & annotation tools */}
        <ToolGroup>
          {textTools.map(({ tool, labelKey, icon, shortcut }) => (
            <ToolButton
              key={tool}
              icon={icon}
              label={t(labelKey)}
              shortcut={shortcut}
              active={activeTool === tool}
              onClick={() => setActiveTool(tool)}
            />
          ))}
        </ToolGroup>

        <Divider />

        {/* Drawing tools */}
        <ToolGroup>
          {drawTools.map(({ tool, labelKey, icon, shortcut }) => (
            <ToolButton
              key={tool}
              icon={icon}
              label={t(labelKey)}
              shortcut={shortcut}
              active={activeTool === tool}
              onClick={() => setActiveTool(tool)}
            />
          ))}
        </ToolGroup>

        <Divider />

        {/* Insert tools */}
        <ToolGroup>
          {insertTools.map(({ tool, labelKey, icon, shortcut }) => (
            <ToolButton
              key={tool}
              icon={icon}
              label={t(labelKey)}
              shortcut={shortcut}
              active={activeTool === tool}
              onClick={() => setActiveTool(tool)}
            />
          ))}
        </ToolGroup>

        <Divider />

        {/* Zoom */}
        <ToolGroup>
          <ToolButton icon={<ZoomOutIcon size={18} />} label="Zoom out" onClick={zoomOut} />
          <button
            onClick={resetZoom}
            className="px-2 h-7 text-[11px] font-semibold text-text-secondary hover:text-text hover:bg-surface-hover rounded-lg transition-colors min-w-[50px] text-center"
            data-tooltip="Reset zoom"
          >
            {zoom}%
          </button>
          <ToolButton icon={<ZoomInIcon size={18} />} label="Zoom in" onClick={zoomIn} />
        </ToolGroup>

        <Divider />

        {/* View mode */}
        <div className="flex items-center bg-surface-sunken rounded-lg p-0.5 gap-0.5">
          {viewModes.map(({ mode, labelKey, icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              data-tooltip={t(labelKey)}
              className={`
                flex items-center gap-1.5 px-2.5 h-7 text-[11px] font-medium rounded-md
                transition-all duration-200
                ${viewMode === mode
                  ? 'bg-surface shadow-sm text-text'
                  : 'text-text-muted hover:text-text-secondary'
                }
              `}
            >
              {icon}
              <span className="hidden lg:inline">{t(labelKey)}</span>
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1 min-w-4" />

        {/* Download button */}
        <button
          onClick={handleSave}
          disabled={!pdfBytes}
          className={`
            flex items-center gap-2 px-5 h-9 rounded-xl text-sm font-semibold
            text-text-inverse gradient-brand
            shadow-[0_2px_12px_rgba(124,58,237,0.3)]
            hover:shadow-[0_4px_20px_rgba(124,58,237,0.4)]
            hover:scale-[1.02]
            active:scale-[0.98]
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100
            transition-all duration-200
          `}
        >
          <DownloadIcon size={16} />
          {t('action.download')}
        </button>

        {/* Merge button */}
        <button
          onClick={() => setShowMerge(true)}
          className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold border border-border text-text-secondary hover:text-text hover:bg-surface-hover transition-all duration-200"
          data-tooltip="Combiner des PDFs"
        >
          <MergeIcon size={16} />
          <span className="hidden lg:inline">Combiner</span>
        </button>
      </div>

      {/* Merge modal */}
      {showMerge && <MergeModal onClose={() => setShowMerge(false)} />}
    </div>
  );
}
