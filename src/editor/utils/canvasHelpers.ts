// ============================================================
// Canvas Helpers — Fabric.js canvas management for annotations
// ============================================================

import { Canvas, PencilBrush, Rect, Circle, Line, IText, FabricImage } from 'fabric';
import type { EditorTool, ToolbarConfig } from '@shared/types';

/**
 * Create a Fabric.js canvas overlay for a PDF page
 */
export function createAnnotationCanvas(
  canvasElement: HTMLCanvasElement,
  width: number,
  height: number,
): Canvas {
  const fabricCanvas = new Canvas(canvasElement, {
    width,
    height,
    selection: true,
    preserveObjectStacking: true,
    renderOnAddRemove: true,
  });

  return fabricCanvas;
}

/**
 * Configure the canvas based on the active tool
 */
export function configureCanvasForTool(
  canvas: Canvas,
  tool: EditorTool,
  config: ToolbarConfig,
): void {
  // Reset canvas state
  canvas.isDrawingMode = false;
  canvas.selection = false;
  canvas.defaultCursor = 'default';

  const isSelectMode = tool === 'select';

  // Toggle ALL objects' interactivity based on tool
  canvas.getObjects().forEach((obj: any) => {
    if (obj.__internal) return; // skip whiteout rects etc.
    obj.selectable = isSelectMode;
    obj.evented = isSelectMode;
    obj.hasControls = isSelectMode;
    obj.hasBorders = isSelectMode;
    obj.lockMovementX = !isSelectMode;
    obj.lockMovementY = !isSelectMode;
  });

  switch (tool) {
    case 'select':
      canvas.selection = true;
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'move';
      break;

    case 'pen': {
      canvas.isDrawingMode = true;
      const brush = new PencilBrush(canvas);
      brush.color = config.strokeColor;
      brush.width = config.strokeWidth;
      canvas.freeDrawingBrush = brush;
      break;
    }

    case 'text':
      canvas.defaultCursor = 'text';
      break;

    case 'text-edit':
      canvas.defaultCursor = 'text';
      break;

    case 'rectangle':
    case 'circle':
    case 'arrow':
    case 'line':
      canvas.defaultCursor = 'crosshair';
      canvas.selection = false;
      break;

    case 'highlight':
    case 'underline':
    case 'strikethrough':
      canvas.defaultCursor = 'text';
      break;

    case 'signature':
      canvas.defaultCursor = 'pointer';
      break;

    case 'image':
      canvas.defaultCursor = 'pointer';
      break;

    case 'eraser':
      canvas.defaultCursor = 'not-allowed';
      // Re-enable evented so eraser can detect clicks on objects
      canvas.getObjects().forEach((obj: any) => {
        if (obj.__internal) return;
        obj.evented = true;
        obj.selectable = false;
        obj.hasControls = false;
      });
      break;

    default:
      break;
  }

  canvas.discardActiveObject();
  canvas.requestRenderAll();
}

/**
 * Add a text object to the canvas
 */
export function addTextToCanvas(
  canvas: Canvas,
  x: number,
  y: number,
  config: ToolbarConfig,
): IText {
  const text = new IText('Text', {
    left: x,
    top: y,
    fontFamily: config.fontFamily,
    fontSize: config.fontSize,
    fill: config.fontColor,
    fontWeight: config.strokeWidth > 2 ? 'bold' : 'normal',
    editable: true,
  });

  canvas.add(text);
  canvas.setActiveObject(text);
  text.enterEditing();
  return text;
}

/**
 * Add a rectangle shape to the canvas
 */
export function addRectToCanvas(
  canvas: Canvas,
  x: number,
  y: number,
  width: number,
  height: number,
  config: ToolbarConfig,
): Rect {
  const rect = new Rect({
    left: x,
    top: y,
    width,
    height,
    stroke: config.strokeColor,
    strokeWidth: config.strokeWidth,
    fill: config.fillColor === 'transparent' ? '' : config.fillColor,
  });

  canvas.add(rect);
  return rect;
}

/**
 * Add a circle/ellipse to the canvas
 */
export function addCircleToCanvas(
  canvas: Canvas,
  x: number,
  y: number,
  radius: number,
  config: ToolbarConfig,
): Circle {
  const circle = new Circle({
    left: x - radius,
    top: y - radius,
    radius,
    stroke: config.strokeColor,
    strokeWidth: config.strokeWidth,
    fill: config.fillColor === 'transparent' ? '' : config.fillColor,
  });

  canvas.add(circle);
  return circle;
}

/**
 * Add a line to the canvas
 */
export function addLineToCanvas(
  canvas: Canvas,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  config: ToolbarConfig,
): Line {
  const line = new Line([x1, y1, x2, y2], {
    stroke: config.strokeColor,
    strokeWidth: config.strokeWidth,
  });

  canvas.add(line);
  return line;
}

/**
 * Export canvas annotations as an image (for flattening onto PDF)
 */
export function canvasToDataUrl(canvas: Canvas): string {
  return canvas.toDataURL({ format: 'png', multiplier: 2 });
}

/**
 * Clear all objects from the canvas
 */
export function clearCanvas(canvas: Canvas): void {
  canvas.clear();
}

/**
 * Add an image to the canvas from a data URL
 */
export function addImageToCanvas(
  canvas: Canvas,
  dataUrl: string,
  x: number,
  y: number,
  maxWidth: number = 200,
  maxHeight: number = 200,
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Scale to fit
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) { h *= maxWidth / w; w = maxWidth; }
      if (h > maxHeight) { w *= maxHeight / h; h = maxHeight; }

      const fabricImg = new FabricImage(img, {
        left: x,
        top: y,
        scaleX: w / img.width,
        scaleY: h / img.height,
      });
      canvas.add(fabricImg);
      canvas.setActiveObject(fabricImg);
      canvas.renderAll();
      resolve();
    };
    img.src = dataUrl;
  });
}

/**
 * Render annotations from storage onto the canvas
 */
export async function renderAnnotations(
  canvas: Canvas,
  annotations: import('@shared/types').Annotation[],
): Promise<void> {
  for (const ann of annotations) {
    let obj: any = null;

    switch (ann.type) {
      case 'text-edit': {
        const PADDING = 2;
        const whiteout = new Rect({
          left: ann.originalX - PADDING,
          top: ann.originalY - PADDING,
          width: ann.originalWidth + PADDING * 2,
          height: ann.originalHeight + PADDING * 2,
          fill: '#FFFFFF',
          selectable: false,
          evented: false,
        });
        (whiteout as any).__internal = true;
        (whiteout as any).id = ann.id + '_whiteout';
        canvas.add(whiteout);

        obj = new IText(ann.newText, {
          left: ann.x,
          top: ann.y,
          fontFamily: ann.fontFamily,
          fontSize: ann.fontSize,
          fill: ann.fontColor,
          editable: true,
          hasControls: false,
          data: { id: ann.id },
        });
        break;
      }

      case 'text':
        obj = new IText(ann.content, {
          left: ann.x,
          top: ann.y,
          fontFamily: ann.fontFamily,
          fontSize: ann.fontSize,
          fill: ann.fontColor,
          fontWeight: ann.bold ? 'bold' : 'normal',
          fontStyle: ann.italic ? 'italic' : 'normal',
          editable: true,
          data: { id: ann.id },
        });
        break;

      case 'shape':
        if (ann.shapeType === 'rectangle') {
          obj = new Rect({
            left: ann.x,
            top: ann.y,
            width: ann.width,
            height: ann.height,
            stroke: ann.strokeColor,
            strokeWidth: ann.strokeWidth,
            fill: ann.fillColor === 'transparent' ? '' : ann.fillColor,
          });
        } else if (ann.shapeType === 'circle') {
          const radius = ann.width / 2;
          obj = new Circle({
            left: ann.x,
            top: ann.y,
            radius,
            stroke: ann.strokeColor,
            strokeWidth: ann.strokeWidth,
            fill: ann.fillColor === 'transparent' ? '' : ann.fillColor,
          });
        }
        break;
    }

    if (obj) {
      (obj as any).id = ann.id;
      canvas.add(obj);
    }
  }

  canvas.requestRenderAll();
}

/**
 * Setup interactive shape drawing (rect, circle, line, arrow) on Fabric canvas.
 * Returns a cleanup function to remove the event listeners.
 */
export function setupShapeDrawing(
  canvas: Canvas,
  tool: EditorTool,
  config: ToolbarConfig,
  onShapeCreated: (shape: any, shapeType: string) => void,
): () => void {
  let isDrawing = false;
  let startX = 0;
  let startY = 0;
  let currentShape: any = null;

  const handleMouseDown = (opt: any) => {
    if (!['rectangle', 'circle', 'arrow', 'line'].includes(tool)) return;
    isDrawing = true;
    const pointer = canvas.getScenePoint(opt.e);
    startX = pointer.x;
    startY = pointer.y;

    if (tool === 'rectangle') {
      currentShape = new Rect({
        left: startX,
        top: startY,
        width: 0,
        height: 0,
        stroke: config.strokeColor,
        strokeWidth: config.strokeWidth,
        fill: config.fillColor === 'transparent' ? '' : config.fillColor,
        selectable: false,
        evented: false,
      });
    } else if (tool === 'circle') {
      currentShape = new Circle({
        left: startX,
        top: startY,
        radius: 0,
        stroke: config.strokeColor,
        strokeWidth: config.strokeWidth,
        fill: config.fillColor === 'transparent' ? '' : config.fillColor,
        selectable: false,
        evented: false,
      });
    } else if (tool === 'line' || tool === 'arrow') {
      currentShape = new Line([startX, startY, startX, startY], {
        stroke: config.strokeColor,
        strokeWidth: config.strokeWidth,
        selectable: false,
        evented: false,
      });
    }

    if (currentShape) {
      (currentShape as any).__drawing = true;
      canvas.add(currentShape);
    }
  };

  const handleMouseMove = (opt: any) => {
    if (!isDrawing || !currentShape) return;
    const pointer = canvas.getScenePoint(opt.e);

    if (tool === 'rectangle') {
      const w = pointer.x - startX;
      const h = pointer.y - startY;
      currentShape.set({
        left: w < 0 ? pointer.x : startX,
        top: h < 0 ? pointer.y : startY,
        width: Math.abs(w),
        height: Math.abs(h),
      });
    } else if (tool === 'circle') {
      const dx = pointer.x - startX;
      const dy = pointer.y - startY;
      const radius = Math.sqrt(dx * dx + dy * dy) / 2;
      const cx = (startX + pointer.x) / 2;
      const cy = (startY + pointer.y) / 2;
      currentShape.set({
        left: cx - radius,
        top: cy - radius,
        radius,
      });
    } else if (tool === 'line' || tool === 'arrow') {
      currentShape.set({ x2: pointer.x, y2: pointer.y });
    }

    currentShape.setCoords();
    canvas.renderAll();
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentShape) return;
    isDrawing = false;

    // Make the shape fully interactive with resize handles
    currentShape.set({
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      lockMovementX: false,
      lockMovementY: false,
    });
    delete (currentShape as any).__drawing;
    currentShape.setCoords();

    // For arrow, add a triangle head
    if (tool === 'arrow') {
      const x1 = currentShape.x1!;
      const y1 = currentShape.y1!;
      const x2 = currentShape.x2!;
      const y2 = currentShape.y2!;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const headLen = 12;
      const a1x = x2 - headLen * Math.cos(angle - Math.PI / 6);
      const a1y = y2 - headLen * Math.sin(angle - Math.PI / 6);
      const a2x = x2 - headLen * Math.cos(angle + Math.PI / 6);
      const a2y = y2 - headLen * Math.sin(angle + Math.PI / 6);
      const arrowHead1 = new Line([x2, y2, a1x, a1y], {
        stroke: config.strokeColor,
        strokeWidth: config.strokeWidth,
      });
      const arrowHead2 = new Line([x2, y2, a2x, a2y], {
        stroke: config.strokeColor,
        strokeWidth: config.strokeWidth,
      });
      canvas.add(arrowHead1);
      canvas.add(arrowHead2);
    }

    const shapeType = tool === 'arrow' ? 'arrow' : tool;
    onShapeCreated(currentShape, shapeType);
    currentShape = null;
    canvas.renderAll();
  };

  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);
  canvas.on('mouse:up', handleMouseUp);

  return () => {
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);
    canvas.off('mouse:up', handleMouseUp);
  };
}

/**
 * Setup eraser tool: clicking on an object removes it.
 * Returns cleanup function.
 */
export function setupEraserTool(
  canvas: Canvas,
  onObjectRemoved: (obj: any) => void,
): () => void {
  const handleMouseDown = (opt: any) => {
    const target = opt.target;
    if (target) {
      onObjectRemoved(target);
      canvas.remove(target);
      canvas.renderAll();
    }
  };

  canvas.on('mouse:down', handleMouseDown);
  return () => {
    canvas.off('mouse:down', handleMouseDown);
  };
}

