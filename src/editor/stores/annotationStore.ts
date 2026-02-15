// ============================================================
// Annotation Store — Manages all annotations
// ============================================================

import { create } from 'zustand';
import type { Annotation, EditorTool, ToolbarConfig } from '@shared/types';
import {
  DEFAULT_STROKE_COLOR,
  DEFAULT_FILL_COLOR,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_COLOR,
  DEFAULT_HIGHLIGHT_OPACITY,
} from '@shared/constants';

interface AnnotationState {
  // Annotations per page (pageIndex -> annotations)
  annotations: Map<number, Annotation[]>;
  selectedAnnotationId: string | null;

  // Current tool
  activeTool: EditorTool;

  // Toolbar config
  toolbarConfig: ToolbarConfig;

  // Actions
  setActiveTool: (tool: EditorTool) => void;
  updateToolbarConfig: (config: Partial<ToolbarConfig>) => void;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  removeAnnotation: (id: string) => void;
  selectAnnotation: (id: string | null) => void;
  getPageAnnotations: (pageIndex: number) => Annotation[];
  clearAllAnnotations: () => void;
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  annotations: new Map(),
  selectedAnnotationId: null,
  activeTool: 'select',

  toolbarConfig: {
    strokeColor: DEFAULT_STROKE_COLOR,
    fillColor: DEFAULT_FILL_COLOR,
    strokeWidth: DEFAULT_STROKE_WIDTH,
    fontSize: DEFAULT_FONT_SIZE,
    fontFamily: DEFAULT_FONT_FAMILY,
    fontColor: DEFAULT_FONT_COLOR,
    opacity: DEFAULT_HIGHLIGHT_OPACITY,
  },

  setActiveTool: (tool) => set({ activeTool: tool, selectedAnnotationId: null }),

  updateToolbarConfig: (config) =>
    set((state) => ({
      toolbarConfig: { ...state.toolbarConfig, ...config },
    })),

  addAnnotation: (annotation) =>
    set((state) => {
      const newMap = new Map(state.annotations);
      const pageAnns = newMap.get(annotation.pageIndex) ?? [];
      // Deduplicate: if an annotation with the same ID already exists, replace it
      const existingIdx = pageAnns.findIndex((a) => a.id === annotation.id);
      if (existingIdx !== -1) {
        const newAnns = [...pageAnns];
        newAnns[existingIdx] = annotation;
        newMap.set(annotation.pageIndex, newAnns);
      } else {
        newMap.set(annotation.pageIndex, [...pageAnns, annotation]);
      }
      return { annotations: newMap };
    }),

  updateAnnotation: (id, updates) =>
    set((state) => {
      const newMap = new Map(state.annotations);
      for (const [pageIndex, anns] of newMap) {
        const idx = anns.findIndex((a) => a.id === id);
        if (idx !== -1) {
          const updated = { ...anns[idx], ...updates, updatedAt: Date.now() } as Annotation;
          const newAnns = [...anns];
          newAnns[idx] = updated;
          newMap.set(pageIndex, newAnns);
          break;
        }
      }
      return { annotations: newMap };
    }),

  removeAnnotation: (id) =>
    set((state) => {
      const newMap = new Map(state.annotations);
      for (const [pageIndex, anns] of newMap) {
        const filtered = anns.filter((a) => a.id !== id);
        if (filtered.length !== anns.length) {
          newMap.set(pageIndex, filtered);
          break;
        }
      }
      return {
        annotations: newMap,
        selectedAnnotationId: state.selectedAnnotationId === id ? null : state.selectedAnnotationId,
      };
    }),

  selectAnnotation: (id) => set({ selectedAnnotationId: id }),

  getPageAnnotations: (pageIndex) => {
    return get().annotations.get(pageIndex) ?? [];
  },

  clearAllAnnotations: () => set({ annotations: new Map(), selectedAnnotationId: null }),
}));
