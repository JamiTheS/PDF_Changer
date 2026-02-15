// ============================================================
// PDF Editor Pro — Shared Types
// ============================================================

// --- PDF Document ---

export interface PDFDocumentInfo {
  fileName: string;
  pageCount: number;
  fileSizeBytes: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

export interface PDFPageInfo {
  index: number; // 0-based
  width: number;
  height: number;
  rotation: PageRotation;
}

export type PageRotation = 0 | 90 | 180 | 270;

// --- Viewer ---

export type ViewMode = 'single' | 'double' | 'continuous';

export type ZoomLevel = number; // percentage, e.g. 100 = 100%

export interface ViewerState {
  currentPage: number; // 1-based
  zoom: ZoomLevel;
  viewMode: ViewMode;
}

// --- Tools ---

export type EditorTool =
  | 'select'
  | 'text'
  | 'highlight'
  | 'underline'
  | 'strikethrough'
  | 'pen'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'line'
  | 'signature'
  | 'image'
  | 'eraser'
  | 'text-edit';

// --- Annotations ---

export interface BaseAnnotation {
  id: string;
  pageIndex: number;
  type: AnnotationType;
  createdAt: number;
  updatedAt: number;
}

export type AnnotationType =
  | 'text'
  | 'text-edit'
  | 'highlight'
  | 'underline'
  | 'strikethrough'
  | 'freehand'
  | 'shape'
  | 'signature'
  | 'image';

export interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  bold: boolean;
  italic: boolean;
}

/** Annotation for editing existing PDF text (replaces original) */
export interface TextEditAnnotation extends BaseAnnotation {
  type: 'text-edit';
  /** Position & size of the original text to cover */
  originalX: number;
  originalY: number;
  originalWidth: number;
  originalHeight: number;
  /** The original text (for reference/undo) */
  originalText: string;
  /** The new (edited) text */
  newText: string;
  /** Rendering properties */
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontColor: string;
}

export interface HighlightAnnotation extends BaseAnnotation {
  type: 'highlight' | 'underline' | 'strikethrough';
  rects: Array<{ x: number; y: number; width: number; height: number }>;
  color: string;
  opacity: number;
}

export interface FreehandAnnotation extends BaseAnnotation {
  type: 'freehand';
  points: Array<{ x: number; y: number }>;
  strokeColor: string;
  strokeWidth: number;
}

export interface ShapeAnnotation extends BaseAnnotation {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'arrow' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
}

export interface SignatureAnnotation extends BaseAnnotation {
  type: 'signature';
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string; // base64 image
}

export interface ImageAnnotation extends BaseAnnotation {
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string;
  originalFileName?: string;
}

export type Annotation =
  | TextAnnotation
  | TextEditAnnotation
  | HighlightAnnotation
  | FreehandAnnotation
  | ShapeAnnotation
  | SignatureAnnotation
  | ImageAnnotation;

// --- History (Undo/Redo) ---

export interface EditorCommand {
  id: string;
  type: string;
  timestamp: number;
  execute(): void;
  undo(): void;
}

// --- Toolbar ---

export interface ToolbarConfig {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  opacity: number;
}

// --- Messages (Background <-> Content/Editor) ---

export type MessageType =
  | 'PDF_DETECTED'
  | 'OPEN_EDITOR'
  | 'GET_PDF_DATA'
  | 'PDF_DATA_RESPONSE';

export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
}

export interface PdfDetectedPayload {
  url: string;
  fileName: string;
}

export interface OpenEditorPayload {
  pdfUrl: string;
  fileName: string;
}
