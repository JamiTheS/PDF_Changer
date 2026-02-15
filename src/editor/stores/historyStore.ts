// ============================================================
// History Store — Undo/Redo (Command Pattern)
// ============================================================

import { create } from 'zustand';
import type { EditorCommand } from '@shared/types';

interface HistoryState {
  undoStack: EditorCommand[];
  redoStack: EditorCommand[];
  canUndo: boolean;
  canRedo: boolean;

  execute: (command: EditorCommand) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

const MAX_HISTORY = 100;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  execute: (command) => {
    command.execute();
    set((state) => {
      const newUndo = [...state.undoStack, command].slice(-MAX_HISTORY);
      return {
        undoStack: newUndo,
        redoStack: [], // clear redo on new action
        canUndo: true,
        canRedo: false,
      };
    });
  },

  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return;

    const command = undoStack[undoStack.length - 1];
    command.undo();

    set((state) => {
      const newUndo = state.undoStack.slice(0, -1);
      const newRedo = [...state.redoStack, command];
      return {
        undoStack: newUndo,
        redoStack: newRedo,
        canUndo: newUndo.length > 0,
        canRedo: true,
      };
    });
  },

  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return;

    const command = redoStack[redoStack.length - 1];
    command.execute();

    set((state) => {
      const newRedo = state.redoStack.slice(0, -1);
      const newUndo = [...state.undoStack, command];
      return {
        undoStack: newUndo,
        redoStack: newRedo,
        canUndo: true,
        canRedo: newRedo.length > 0,
      };
    });
  },

  clear: () => set({ undoStack: [], redoStack: [], canUndo: false, canRedo: false }),
}));
