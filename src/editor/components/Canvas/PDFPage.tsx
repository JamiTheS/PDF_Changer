// ============================================================
// PDFPage — Renders a single PDF page with annotation overlay
// ============================================================

import { useEffect, useRef, useCallback, useState } from 'react';
import { Canvas as FabricCanvas, Rect as FabricRect } from 'fabric';
import { renderPageToCanvas, getPageTextItems, applyTextEdit, reloadPdfDocument } from '../../utils/pdfHelpers';
import {
  createAnnotationCanvas,
  configureCanvasForTool,
  addTextToCanvas,
  addImageToCanvas,
  setupShapeDrawing,
  setupEraserTool,
} from '../../utils/canvasHelpers';
import { useAnnotationStore } from '@stores/annotationStore';
import { usePDFStore } from '@stores/pdfStore';
import { useHistoryStore } from '@stores/historyStore';
import type { PDFPageInfo } from '@shared/types';
import { TextFormatPopover } from './TextFormatPopover';
import { SignaturePad } from '../Signature/SignaturePad';

interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
}

interface PDFPageProps {
  pageInfo: PDFPageInfo;
  pageNumber: number; // 1-based
  scale: number;
}

export function PDFPage({ pageInfo, pageNumber, scale }: PDFPageProps) {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTool = useAnnotationStore((s) => s.activeTool);
  const toolbarConfig = useAnnotationStore((s) => s.toolbarConfig);
  const addAnnotation = useAnnotationStore((s) => s.addAnnotation);
  const pdfBytes = usePDFStore((s) => s.pdfBytes);
  const pdfVersion = usePDFStore((s) => s.pdfVersion);
  const setPdfBytes = usePDFStore((s) => s.setPdfBytes);

  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [hoveredItem, setHoveredItem] = useState<TextItem | null>(null);
  const [editingItem, setEditingItem] = useState<TextItem | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [editFontSize, setEditFontSize] = useState(14);
  const [editFontFamily, setEditFontFamily] = useState('Helvetica');
  const [editFontColor, setEditFontColor] = useState('#000000');
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Refs to always have fresh values in callbacks (avoid stale closures) ──
  const editValueRef = useRef(editValue);
  editValueRef.current = editValue;
  const editingItemRef = useRef(editingItem);
  editingItemRef.current = editingItem;
  const isApplyingRef = useRef(isApplying);
  isApplyingRef.current = isApplying;
  const pdfBytesRef = useRef(pdfBytes);
  pdfBytesRef.current = pdfBytes;
  const editFontSizeRef = useRef(editFontSize);
  editFontSizeRef.current = editFontSize;
  const editFontFamilyRef = useRef(editFontFamily);
  editFontFamilyRef.current = editFontFamily;
  const editFontColorRef = useRef(editFontColor);
  editFontColorRef.current = editFontColor;

  // Flag to skip text items re-fetch after our own edit (avoids overwriting updated items)
  const skipNextTextRefresh = useRef(false);

  const width = pageInfo.width * scale;
  const height = pageInfo.height * scale;

  // ── Load text items when text-edit or markup tool is active ──
  const needsTextItems = activeTool === 'text-edit' || ['highlight', 'underline', 'strikethrough'].includes(activeTool);
  useEffect(() => {
    if (!needsTextItems) {
      setTextItems([]);
      setHoveredItem(null);
      setEditingItem(null);
      return;
    }

    // Skip re-fetching after our own edit — we already updated textItems locally
    if (skipNextTextRefresh.current) {
      skipNextTextRefresh.current = false;
      return;
    }

    let mounted = true;

    getPageTextItems(pageNumber, scale, pdfBytes).then((items) => {
      if (mounted) setTextItems(items);
    }).catch(err => {
      console.error('TextEdit: Failed to load text items', err);
    });

    return () => { mounted = false; };
  }, [pageNumber, scale, activeTool, pdfBytes, pdfVersion]);

  // ── Render PDF page (re-renders when pdfVersion changes) ──
  useEffect(() => {
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;

    renderPageToCanvas(pageNumber, canvas, scale, pageInfo.rotation).catch(console.error);
  }, [pageNumber, scale, pageInfo.rotation, pdfVersion]);

  // ── Initialize Fabric.js annotation canvas ──
  useEffect(() => {
    const el = annotationCanvasRef.current;
    if (!el || fabricRef.current) return;

    fabricRef.current = createAnnotationCanvas(el, width, height);

    return () => {
      fabricRef.current?.dispose();
      fabricRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Resize fabric canvas when scale changes ──
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    fc.setDimensions({ width, height });
  }, [width, height]);

  // ── Load annotations from store on mount/page change ──
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;

    const anns = useAnnotationStore.getState().getPageAnnotations(pageNumber - 1);
    if (anns.length > 0) {
      import('../../utils/canvasHelpers').then(({ renderAnnotations, clearCanvas }) => {
        clearCanvas(fc);
        renderAnnotations(fc, anns);
      });
    }
  }, [pageNumber]);

  // ── Sync Fabric -> Store (for non-text-edit annotations only) ──
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;

    const handlePathCreated = (e: any) => {
      const path = e.path;
      if (!path) return;

      const points = path.path.map((p: any[]) => ({ x: p[1], y: p[2] })).filter((p: any) => p.x != null);

      addAnnotation({
        id: crypto.randomUUID(),
        pageIndex: pageNumber - 1,
        type: 'freehand',
        points,
        strokeColor: path.stroke || '#000000',
        strokeWidth: path.strokeWidth || 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    };

    const handleObjectAdded = (e: any) => {
      const obj = e.target;
      if (!obj) return;
      if (obj.type === 'path') return;
      if ((obj as any).__internal) return;

      if (obj.type === 'i-text') {
        addAnnotation({
          id: crypto.randomUUID(),
          pageIndex: pageNumber - 1,
          type: 'text',
          x: obj.left || 0,
          y: obj.top || 0,
          width: obj.width || 0,
          height: obj.height || 0,
          content: obj.text || '',
          fontFamily: obj.fontFamily || 'Helvetica',
          fontSize: obj.fontSize || 14,
          fontColor: obj.fill as string || '#000000',
          bold: obj.fontWeight === 'bold',
          italic: obj.fontStyle === 'italic',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      } else if (obj.type === 'rect') {
        addAnnotation({
          id: crypto.randomUUID(),
          pageIndex: pageNumber - 1,
          type: 'shape',
          shapeType: 'rectangle',
          x: obj.left || 0,
          y: obj.top || 0,
          width: obj.width || 0,
          height: obj.height || 0,
          strokeColor: obj.stroke || 'transparent',
          strokeWidth: obj.strokeWidth || 0,
          fillColor: obj.fill as string || 'transparent',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    };

    fc.on('path:created', handlePathCreated);
    fc.on('object:added', handleObjectAdded);

    return () => {
      fc.off('path:created', handlePathCreated);
      fc.off('object:added', handleObjectAdded);
    };
  }, [addAnnotation, pageNumber]);

  // ── Delete selected object (toolbar trash button or Delete key) ──
  useEffect(() => {
    const handleDeleteSelected = () => {
      const fc = fabricRef.current;
      if (!fc) return;
      const active = fc.getActiveObject();
      if (!active) return;
      const annotationId = (active as any).id;
      fc.remove(active);
      fc.renderAll();
      if (annotationId) {
        useAnnotationStore.getState().removeAnnotation(annotationId);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't delete if user is typing in an input
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        handleDeleteSelected();
      }
    };

    window.addEventListener('pdf-editor-delete-selected', handleDeleteSelected);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pdf-editor-delete-selected', handleDeleteSelected);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // ── Configure tool mode ──
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    configureCanvasForTool(fc, activeTool, toolbarConfig);
  }, [activeTool, toolbarConfig]);

  // ── Shape drawing (rect, circle, line, arrow) ──
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    if (!['rectangle', 'circle', 'line', 'arrow'].includes(activeTool)) return;

    const cleanup = setupShapeDrawing(fc, activeTool, toolbarConfig, (shape, shapeType) => {
      addAnnotation({
        id: crypto.randomUUID(),
        pageIndex: pageNumber - 1,
        type: 'shape',
        shapeType: shapeType as any,
        x: shape.left || 0,
        y: shape.top || 0,
        width: shape.width || 0,
        height: shape.height || 0,
        strokeColor: toolbarConfig.strokeColor,
        strokeWidth: toolbarConfig.strokeWidth,
        fillColor: toolbarConfig.fillColor,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    return cleanup;
  }, [activeTool, toolbarConfig, addAnnotation, pageNumber]);

  // ── Eraser tool ──
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    if (activeTool !== 'eraser') return;

    const cleanup = setupEraserTool(fc, (obj) => {
      const annotationId = (obj as any).id;
      if (annotationId) {
        useAnnotationStore.getState().removeAnnotation(annotationId);
      }
    });

    return cleanup;
  }, [activeTool]);

  // ── Handle canvas click for tools that need it ──
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Add new text
      if (activeTool === 'text') {
        const fc = fabricRef.current;
        if (!fc) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addTextToCanvas(fc, x, y, toolbarConfig);
        return;
      }

      // Signature: show pad
      if (activeTool === 'signature') {
        setShowSignaturePad(true);
        return;
      }

      // Image: trigger file picker
      if (activeTool === 'image') {
        imageInputRef.current?.click();
        return;
      }

      // Highlight / Underline / Strikethrough: click on text items
      if (['highlight', 'underline', 'strikethrough'].includes(activeTool)) {
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const hit = textItems.find((item) =>
          mx >= item.x && mx <= item.x + item.width &&
          my >= item.y && my <= item.y + item.height
        );

        if (hit) {
          const fc = fabricRef.current;
          if (!fc) return;

          const highlightColor = toolbarConfig.strokeColor || '#FFFF00';
          const opacity = toolbarConfig.opacity || 0.35;

          if (activeTool === 'highlight') {
            const highlight = new FabricRect({
              left: hit.x,
              top: hit.y,
              width: hit.width,
              height: hit.height,
              fill: highlightColor,
              opacity,
              selectable: true,
              evented: true,
            });
            const annId = crypto.randomUUID();
            (highlight as any).id = annId;
            fc.add(highlight);
            addAnnotation({
              id: annId,
              pageIndex: pageNumber - 1,
              type: 'highlight',
              rects: [{ x: hit.x, y: hit.y, width: hit.width, height: hit.height }],
              color: highlightColor,
              opacity,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          } else if (activeTool === 'underline') {
            const underline = new FabricRect({
              left: hit.x,
              top: hit.y + hit.height - 1,
              width: hit.width,
              height: 2,
              fill: toolbarConfig.strokeColor || '#000000',
              selectable: true,
              evented: true,
            });
            const annId = crypto.randomUUID();
            (underline as any).id = annId;
            fc.add(underline);
            addAnnotation({
              id: annId,
              pageIndex: pageNumber - 1,
              type: 'underline',
              rects: [{ x: hit.x, y: hit.y, width: hit.width, height: hit.height }],
              color: toolbarConfig.strokeColor || '#000000',
              opacity: 1,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          } else if (activeTool === 'strikethrough') {
            const strikethrough = new FabricRect({
              left: hit.x,
              top: hit.y + hit.height / 2 - 1,
              width: hit.width,
              height: 2,
              fill: toolbarConfig.strokeColor || '#FF0000',
              selectable: true,
              evented: true,
            });
            const annId = crypto.randomUUID();
            (strikethrough as any).id = annId;
            fc.add(strikethrough);
            addAnnotation({
              id: annId,
              pageIndex: pageNumber - 1,
              type: 'strikethrough',
              rects: [{ x: hit.x, y: hit.y, width: hit.width, height: hit.height }],
              color: toolbarConfig.strokeColor || '#FF0000',
              opacity: 1,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          }
          fc.renderAll();
        }
        return;
      }
    },
    [activeTool, toolbarConfig, textItems, addAnnotation, pageNumber],
  );

  // ── Signature save handler ──
  const handleSignatureSave = useCallback(
    (dataUrl: string) => {
      setShowSignaturePad(false);
      const fc = fabricRef.current;
      if (!fc) return;
      // Place signature in center of page
      addImageToCanvas(fc, dataUrl, width / 2 - 100, height / 2 - 50, 200, 100).then(() => {
        const obj = fc.getActiveObject();
        if (obj) {
          const annId = crypto.randomUUID();
          (obj as any).id = annId;
          addAnnotation({
            id: annId,
            pageIndex: pageNumber - 1,
            type: 'signature',
            x: obj.left || 0,
            y: obj.top || 0,
            width: (obj.width || 200) * (obj.scaleX || 1),
            height: (obj.height || 100) * (obj.scaleY || 1),
            dataUrl,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      });
    },
    [width, height, addAnnotation, pageNumber],
  );

  // ── Image file selected handler ──
  const handleImageFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const fc = fabricRef.current;
        if (!fc) return;
        addImageToCanvas(fc, dataUrl, width / 2 - 100, height / 2 - 100, 300, 300).then(() => {
          const obj = fc.getActiveObject();
          if (obj) {
            const annId = crypto.randomUUID();
            (obj as any).id = annId;
            addAnnotation({
              id: annId,
              pageIndex: pageNumber - 1,
              type: 'image',
              x: obj.left || 0,
              y: obj.top || 0,
              width: (obj.width || 300) * (obj.scaleX || 1),
              height: (obj.height || 300) * (obj.scaleY || 1),
              dataUrl,
              originalFileName: file.name,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          }
        });
      };
      reader.readAsDataURL(file);
      // Reset input so same file can be picked again
      e.target.value = '';
    },
    [width, height, addAnnotation, pageNumber],
  );

  // ── Text-Edit + Markup: hover detection ──
  const handleMouseMoveForTextEdit = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!needsTextItems || editingItemRef.current) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const hit = textItems.find((item) =>
        mx >= item.x && mx <= item.x + item.width &&
        my >= item.y && my <= item.y + item.height
      );

      setHoveredItem(hit || null);
    },
    [activeTool, textItems],
  );

  // ── Commit the text edit into the PDF bytes (uses refs, no stale closure) ──
  const commitEdit = useCallback(async () => {
    const currentEditingItem = editingItemRef.current;
    const currentEditValue = editValueRef.current;
    const currentPdfBytes = pdfBytesRef.current;
    const currentIsApplying = isApplyingRef.current;

    if (!currentEditingItem || !currentPdfBytes || currentIsApplying) return;

    const newText = currentEditValue.trim();

    // If text unchanged or empty, just close
    if (newText === currentEditingItem.text || newText === '') {
      setEditingItem(null);
      setEditValue('');
      return;
    }

    setIsApplying(true);

    try {
      const currentFontSize = editFontSizeRef.current;
      const currentFontColor = editFontColorRef.current;

      const newBytes = await applyTextEdit(
        currentPdfBytes,
        {
          originalX: currentEditingItem.x,
          originalY: currentEditingItem.y,
          originalWidth: currentEditingItem.width,
          originalHeight: currentEditingItem.height,
          newText,
          fontSize: currentFontSize,
          fontColor: currentFontColor,
        },
        pageNumber - 1,
        scale,
      );

      // Reload PDF.js document from new bytes
      await reloadPdfDocument(newBytes);

      // Capture for undo/redo
      const previousBytes = currentPdfBytes;
      const annotationId = crypto.randomUUID();

      // Create undo/redo command
      const command = {
        id: annotationId,
        type: 'text-edit',
        timestamp: Date.now(),
        execute: () => {
          reloadPdfDocument(newBytes).then(() => {
            setPdfBytes(newBytes);
          });
        },
        undo: () => {
          reloadPdfDocument(previousBytes).then(() => {
            setPdfBytes(previousBytes);
          });
        },
      };

      // Store annotation for tracking
      addAnnotation({
        id: annotationId,
        pageIndex: pageNumber - 1,
        type: 'text-edit',
        originalX: currentEditingItem.x,
        originalY: currentEditingItem.y,
        originalWidth: currentEditingItem.width,
        originalHeight: currentEditingItem.height,
        originalText: currentEditingItem.text,
        newText,
        x: currentEditingItem.x,
        y: currentEditingItem.y,
        fontSize: currentFontSize,
        fontFamily: editFontFamilyRef.current,
        fontColor: currentFontColor,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Mark to skip auto-refresh of textItems (we update them manually below)
      skipNextTextRefresh.current = true;

      // Update store — triggers re-render
      setPdfBytes(newBytes);

      // Update local textItems so re-editing shows the new text, not the original
      setTextItems(prev => prev.map(item =>
        item.x === currentEditingItem.x && item.y === currentEditingItem.y
          ? { ...item, text: newText, fontSize: currentFontSize }
          : item
      ));

      // Push to history (without re-executing)
      useHistoryStore.getState().undoStack.push(command);
      useHistoryStore.setState({
        undoStack: [...useHistoryStore.getState().undoStack],
        redoStack: [],
        canUndo: true,
        canRedo: false,
      });

      // Only close on success
      setEditingItem(null);
      setEditValue('');
    } catch (err) {
      console.error('TextEdit: Failed to apply edit', err);
      alert('Failed to save text edit.\n' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsApplying(false);
    }
  }, [pageNumber, scale, setPdfBytes, addAnnotation]); // stable deps only — values come from refs

  // ── Text-Edit: click to start editing ──
  const handleClickForTextEdit = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (activeTool !== 'text-edit' || isApplyingRef.current) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const hit = textItems.find((item) =>
        mx >= item.x && mx <= item.x + item.width &&
        my >= item.y && my <= item.y + item.height
      );

      if (hit) {
        // If already editing the SAME item, do nothing (user just clicked inside input)
        if (editingItemRef.current && editingItemRef.current.x === hit.x && editingItemRef.current.y === hit.y) {
          return;
        }
        // If editing a DIFFERENT item, commit the previous one first
        if (editingItemRef.current) {
          commitEdit();
        }
        setEditingItem(hit);
        setEditValue(hit.text);
        setEditFontSize(hit.fontSize);
        setEditFontFamily(hit.fontName || 'Helvetica');
        setEditFontColor('#000000');
        setHoveredItem(null);
        setTimeout(() => inputRef.current?.focus(), 0);
      } else if (editingItemRef.current) {
        // Clicking outside — commit current edit
        commitEdit();
      }
    },
    [activeTool, textItems, commitEdit],
  );

  // ── Handle input key events ──
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
      } else if (e.key === 'Escape') {
        // Cancel without saving
        setEditingItem(null);
        setEditValue('');
      }
    },
    [commitEdit],
  );

  // ── Prevent mouseDown on edit UI from bubbling to parent div ──
  const stopMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const isTextEditMode = activeTool === 'text-edit';
  const markupMode = ['highlight', 'underline', 'strikethrough'].includes(activeTool);

  return (
    <div
      className="relative bg-white shadow-md mx-auto"
      style={{ width, height }}
      onClick={handleCanvasClick}
      onMouseMove={isTextEditMode || markupMode ? handleMouseMoveForTextEdit : undefined}
      onMouseDown={isTextEditMode ? handleClickForTextEdit : undefined}
    >
      {/* PDF render layer */}
      <canvas
        ref={pdfCanvasRef}
        className="absolute inset-0"
        style={{ width, height }}
      />

      {/* Annotation overlay layer (Fabric.js — NOT used for text-edit) */}
      <canvas
        ref={annotationCanvasRef}
        className="absolute inset-0"
        style={{
          width,
          height,
          pointerEvents: isTextEditMode || markupMode ? 'none' : 'auto',
        }}
      />

      {/* Text-Edit: hover highlight */}
      {isTextEditMode && hoveredItem && !editingItem && (
        <div
          className="absolute border border-blue-400 bg-blue-500/10 pointer-events-none"
          style={{
            left: hoveredItem.x,
            top: hoveredItem.y,
            width: hoveredItem.width,
            height: hoveredItem.height,
          }}
        />
      )}

      {/* Text-Edit: format popover + inline input */}
      {isTextEditMode && editingItem && (
        <>
          <TextFormatPopover
            x={editingItem.x - 2}
            y={editingItem.y - 2}
            fontSize={editFontSize}
            fontFamily={editFontFamily}
            fontColor={editFontColor}
            onFontSizeChange={setEditFontSize}
            onFontFamilyChange={setEditFontFamily}
            onFontColorChange={setEditFontColor}
          />
          <div className="absolute z-50 flex gap-1"
            onMouseDown={stopMouseDown}
            style={{
              left: editingItem.x + Math.max(editingItem.width + 40, 100) + 5,
              top: editingItem.y - 2,
            }}>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-medium"
              onClick={(e) => {
                e.stopPropagation();
                commitEdit();
              }}
            >
              ✓ OK
            </button>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-0.5 rounded text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setEditingItem(null);
                setEditValue('');
              }}
            >
              ✕
            </button>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onMouseDown={stopMouseDown}
            disabled={isApplying}
            className="absolute border-2 border-blue-500 bg-white outline-none"
            style={{
              left: editingItem.x - 2,
              top: editingItem.y - 2,
              width: Math.max(editingItem.width + 40, 100),
              height: editingItem.height + 4,
              fontSize: editFontSize,
              fontFamily: editFontFamily,
              color: editFontColor,
              padding: '0 2px',
              lineHeight: `${editingItem.height}px`,
              zIndex: 50,
            }}
          />
        </>
      )}

      {/* Text-Edit: subtle outlines on all detected text */}
      {isTextEditMode && !editingItem && textItems.map((item, i) => (
        <div
          key={i}
          className="absolute border border-blue-300/30 pointer-events-none"
          style={{
            left: item.x,
            top: item.y,
            width: item.width,
            height: item.height,
          }}
        />
      ))}

      {/* Hidden file input for image tool */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* Signature pad modal */}
      {showSignaturePad && (
        <SignaturePad
          onSave={handleSignatureSave}
          onCancel={() => setShowSignaturePad(false)}
        />
      )}
    </div>
  );
}
