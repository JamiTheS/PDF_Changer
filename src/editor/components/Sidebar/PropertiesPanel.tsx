// ============================================================
// PropertiesPanel — Premium properties with grouped sections
// ============================================================

import { usePDFStore } from '@stores/pdfStore';
import { useAnnotationStore } from '@stores/annotationStore';
import { COLOR_PALETTE, STROKE_WIDTHS, DEFAULT_FONTS } from '@shared/constants';
import { FileIcon } from '../icons';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function PropertiesPanel() {
  const documentInfo = usePDFStore((s) => s.documentInfo);
  const { toolbarConfig, updateToolbarConfig } = useAnnotationStore();

  return (
    <div className="p-3 flex flex-col gap-5">
      {/* Document info card */}
      {documentInfo && (
        <div className="bg-surface-sunken rounded-xl p-3">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-light text-text-brand flex items-center justify-center shrink-0 mt-0.5">
              <FileIcon size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text truncate" title={documentInfo.fileName}>
                {documentInfo.fileName}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {documentInfo.pageCount} pages &middot; {formatBytes(documentInfo.fileSizeBytes)}
              </p>
              {documentInfo.title && (
                <p className="text-[10px] text-text-muted mt-0.5 truncate">{documentInfo.title}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stroke color */}
      <Section title="Stroke Color">
        <div className="grid grid-cols-8 gap-1">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              onClick={() => updateToolbarConfig({ strokeColor: color })}
              className={`
                w-full aspect-square rounded-lg border transition-all duration-150
                hover:scale-110
                ${toolbarConfig.strokeColor === color
                  ? 'ring-2 ring-brand ring-offset-1 border-brand scale-110'
                  : 'border-border-subtle hover:border-border-strong'
                }
              `}
              style={{ backgroundColor: color }}
              data-tooltip={color}
            />
          ))}
        </div>
      </Section>

      {/* Fill color */}
      <Section title="Fill Color">
        <div className="grid grid-cols-8 gap-1">
          <button
            onClick={() => updateToolbarConfig({ fillColor: 'transparent' })}
            className={`
              w-full aspect-square rounded-lg border transition-all duration-150
              hover:scale-110 relative overflow-hidden
              ${toolbarConfig.fillColor === 'transparent'
                ? 'ring-2 ring-brand ring-offset-1 border-brand'
                : 'border-border-subtle'
              }
            `}
            data-tooltip="None"
          >
            <div className="absolute inset-0 bg-white" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, transparent 45%, #ef4444 45%, #ef4444 55%, transparent 55%)' }} />
          </button>
          {COLOR_PALETTE.slice(0, 7).map((color) => (
            <button
              key={color}
              onClick={() => updateToolbarConfig({ fillColor: color })}
              className={`
                w-full aspect-square rounded-lg border transition-all duration-150
                hover:scale-110
                ${toolbarConfig.fillColor === color
                  ? 'ring-2 ring-brand ring-offset-1 border-brand scale-110'
                  : 'border-border-subtle hover:border-border-strong'
                }
              `}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </Section>

      {/* Stroke width */}
      <Section title="Stroke Width">
        <div className="flex gap-1">
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => updateToolbarConfig({ strokeWidth: w })}
              className={`
                flex-1 h-8 flex items-center justify-center rounded-lg text-[10px] font-semibold
                transition-all duration-150
                ${toolbarConfig.strokeWidth === w
                  ? 'gradient-brand text-text-inverse shadow-[0_2px_6px_rgba(124,58,237,0.25)]'
                  : 'bg-surface-sunken text-text-muted hover:bg-surface-active hover:text-text-secondary'
                }
              `}
            >
              {w}
            </button>
          ))}
        </div>
      </Section>

      {/* Font settings */}
      <Section title="Font">
        <select
          value={toolbarConfig.fontFamily}
          onChange={(e) => updateToolbarConfig({ fontFamily: e.target.value })}
          className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-surface hover:border-border-strong focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition-colors"
        >
          {DEFAULT_FONTS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <div className="flex gap-2 mt-2">
          <div className="flex-1">
            <label className="text-[10px] text-text-muted mb-0.5 block">Size</label>
            <input
              type="number"
              min={6}
              max={120}
              value={toolbarConfig.fontSize}
              onChange={(e) => updateToolbarConfig({ fontSize: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-surface hover:border-border-strong focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-text-muted mb-0.5 block">Color</label>
            <div className="relative">
              <input
                type="color"
                value={toolbarConfig.fontColor}
                onChange={(e) => updateToolbarConfig({ fontColor: e.target.value })}
                className="w-full h-[34px] rounded-lg border border-border cursor-pointer"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Opacity */}
      <Section title="Opacity">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(toolbarConfig.opacity * 100)}
            onChange={(e) => updateToolbarConfig({ opacity: Number(e.target.value) / 100 })}
            className="flex-1 h-1.5 accent-[#7c3aed] rounded-full"
          />
          <span className="text-[10px] font-semibold text-text-muted w-8 text-right">
            {Math.round(toolbarConfig.opacity * 100)}%
          </span>
        </div>
      </Section>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
