// ============================================================
// PDF Editor Pro — Constants
// ============================================================

export const APP_NAME = 'PDF Editor Pro';
export const APP_VERSION = '0.1.0';

// --- Zoom ---
export const ZOOM_MIN = 25;
export const ZOOM_MAX = 500;
export const ZOOM_STEP = 25;
export const ZOOM_DEFAULT = 100;

// --- Fonts ---
export const DEFAULT_FONTS = [
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Arial',
  'Georgia',
  'Verdana',
] as const;

export const DEFAULT_FONT_FAMILY = 'Helvetica';
export const DEFAULT_FONT_SIZE = 14;
export const DEFAULT_FONT_COLOR = '#000000';

// --- Drawing ---
export const DEFAULT_STROKE_COLOR = '#000000';
export const DEFAULT_FILL_COLOR = 'transparent';
export const DEFAULT_STROKE_WIDTH = 2;
export const DEFAULT_HIGHLIGHT_COLOR = '#FFFF00';
export const DEFAULT_HIGHLIGHT_OPACITY = 0.35;

// --- Colors palette ---
export const COLOR_PALETTE = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FF6600', '#6600FF',
  '#009900', '#990000', '#000099', '#666666', '#CCCCCC',
] as const;

export const STROKE_WIDTHS = [1, 2, 3, 5, 8, 12] as const;

// --- Pages ---
export const PAGE_GAP = 16; // pixels between pages in continuous mode
export const THUMBNAIL_WIDTH = 120;

// --- Storage keys ---
export const STORAGE_KEYS = {
  PREFERENCES: 'pdf-editor-preferences',
  RECENT_FILES: 'pdf-editor-recent-files',
  SAVED_SIGNATURES: 'pdf-editor-signatures',
} as const;

// --- Keyboard shortcuts ---
export const SHORTCUTS = {
  UNDO: { key: 'z', ctrl: true },
  REDO: { key: 'z', ctrl: true, shift: true },
  SAVE: { key: 's', ctrl: true },
  ZOOM_IN: { key: '=', ctrl: true },
  ZOOM_OUT: { key: '-', ctrl: true },
  ZOOM_RESET: { key: '0', ctrl: true },
  SELECT_TOOL: { key: 'v' },
  TEXT_TOOL: { key: 't' },
  PEN_TOOL: { key: 'p' },
  HIGHLIGHT_TOOL: { key: 'h' },
  ERASER_TOOL: { key: 'e' },
  DELETE: { key: 'Delete' },
} as const;
