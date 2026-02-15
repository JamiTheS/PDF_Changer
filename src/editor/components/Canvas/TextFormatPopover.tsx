// ============================================================
// TextFormatPopover — Floating formatting bar for text editing
// ============================================================

import { DEFAULT_FONTS, COLOR_PALETTE } from '@shared/constants';

interface TextFormatPopoverProps {
  /** Position (top-left of the popover) */
  x: number;
  y: number;
  /** Current values */
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  /** Callbacks */
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onFontColorChange: (color: string) => void;
}

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

export function TextFormatPopover({
  x,
  y,
  fontSize,
  fontFamily,
  fontColor,
  onFontSizeChange,
  onFontFamilyChange,
  onFontColorChange,
}: TextFormatPopoverProps) {
  return (
    <div
      className="absolute z-[100] flex items-center gap-1.5 px-2 py-1.5 rounded-lg shadow-lg"
      style={{
        left: Math.max(0, x),
        top: Math.max(0, y - 44),
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        color: '#1f2937',
      }}
      // Prevent blur on the input AND prevent parent mouseDown handler
      // But do NOT preventDefault on selects — that blocks their dropdown from opening
      onMouseDown={(e) => {
        e.stopPropagation();
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== 'SELECT' && tag !== 'OPTION') {
          e.preventDefault();
        }
      }}
    >
      {/* Font family */}
      <select
        value={fontFamily}
        onChange={(e) => onFontFamilyChange(e.target.value)}
        className="h-7 text-[11px] rounded px-1 outline-none cursor-pointer"
        style={{ border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#374151' }}
        title="Police"
      >
        {DEFAULT_FONTS.map((f) => (
          <option key={f} value={f} style={{ fontFamily: f, color: '#374151' }}>
            {f}
          </option>
        ))}
      </select>

      {/* Separator */}
      <div style={{ width: 1, height: 20, backgroundColor: '#e5e7eb' }} />

      {/* Font size */}
      <select
        value={fontSize}
        onChange={(e) => onFontSizeChange(Number(e.target.value))}
        className="h-7 w-14 text-[11px] rounded px-1 outline-none cursor-pointer text-center"
        style={{ border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#374151' }}
        title="Taille"
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s} style={{ color: '#374151' }}>
            {s}px
          </option>
        ))}
        {/* Add current fontSize if not in list */}
        {!FONT_SIZES.includes(Math.round(fontSize)) && (
          <option value={Math.round(fontSize)} style={{ color: '#374151' }}>
            {Math.round(fontSize)}px
          </option>
        )}
      </select>

      {/* Separator */}
      <div style={{ width: 1, height: 20, backgroundColor: '#e5e7eb' }} />

      {/* Color swatches */}
      <div className="flex items-center gap-0.5">
        {COLOR_PALETTE.slice(0, 8).map((color) => (
          <button
            key={color}
            onClick={() => onFontColorChange(color)}
            className="rounded-full transition-transform hover:scale-125"
            style={{
              width: 20,
              height: 20,
              backgroundColor: color,
              border: fontColor === color ? '2px solid #3b82f6' : '2px solid #e5e7eb',
              transform: fontColor === color ? 'scale(1.1)' : undefined,
            }}
            title={color}
          />
        ))}
        {/* Custom color picker */}
        <div className="relative ml-0.5">
          <input
            type="color"
            value={fontColor}
            onChange={(e) => onFontColorChange(e.target.value)}
            className="cursor-pointer opacity-0 absolute inset-0"
            style={{ width: 20, height: 20 }}
            title="Couleur personnalisée"
          />
          <div
            className="flex items-center justify-center pointer-events-none"
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '2px dashed #9ca3af',
              fontSize: 8,
              color: '#9ca3af',
            }}
          >
            +
          </div>
        </div>
      </div>
    </div>
  );
}
