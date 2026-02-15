// ============================================================
// SignaturePad — Draw or upload a signature (native Canvas 2D)
// ============================================================

import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

export function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDrawing(true);
    lastPoint.current = getPoint(e);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !lastPoint.current) return;

    const point = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint.current = point;
    setHasContent(true);
  }, [isDrawing]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDrawing(false);
    lastPoint.current = null;
  }, []);

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setHasContent(false);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSave(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    }
  };

  const modal = (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 99999,
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
      onClick={handleBackdropClick}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        style={{
          backgroundColor: '#1e1e2e',
          borderRadius: 12,
          padding: 20,
          width: 460,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          color: '#e0e0e0',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#ffffff' }}>
          ✍️ Signature
        </h2>

        <div style={{
          border: '2px solid #444',
          borderRadius: 8,
          marginBottom: 12,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}>
          <canvas
            ref={canvasRef}
            width={420}
            height={200}
            style={{ width: '100%', height: 200, cursor: 'crosshair', display: 'block' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleClear}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              border: '1px solid #555',
              borderRadius: 6,
              background: 'transparent',
              color: '#ccc',
              cursor: 'pointer',
            }}
          >
            Effacer
          </button>
          <label style={{
            padding: '6px 12px',
            fontSize: 12,
            border: '1px solid #555',
            borderRadius: 6,
            background: 'transparent',
            color: '#ccc',
            cursor: 'pointer',
          }}>
            📁 Importer
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
          </label>
          <div style={{ flex: 1 }} />
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCancel(); }}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              border: '1px solid #555',
              borderRadius: 6,
              background: 'transparent',
              color: '#ccc',
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!hasContent}
            style={{
              padding: '6px 16px',
              fontSize: 12,
              border: 'none',
              borderRadius: 6,
              background: hasContent ? '#7c3aed' : '#555',
              color: '#fff',
              cursor: hasContent ? 'pointer' : 'not-allowed',
              fontWeight: 600,
            }}
          >
            ✓ Appliquer
          </button>
        </div>
      </div>
    </div>
  );

  // Render as portal to avoid event propagation issues with PDF page
  return createPortal(modal, document.body);
}
