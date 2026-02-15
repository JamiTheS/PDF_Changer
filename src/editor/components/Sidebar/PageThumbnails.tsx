// ============================================================
// PageThumbnails — Premium thumbnail grid for page navigation
// ============================================================

import { useEffect, useRef } from 'react';
import { usePDFStore } from '@stores/pdfStore';
import { renderPageToCanvas } from '../../utils/pdfHelpers';
import { THUMBNAIL_WIDTH } from '@shared/constants';

import { RotateIcon } from '../icons';

export function PageThumbnails() {
  const { pages, currentPage, setCurrentPage, rotatePage } = usePDFStore();

  return (
    <div className="p-2 flex flex-col gap-2 items-center">
      {pages.map((page) => (
        <ThumbnailItem
          key={page.index}
          pageNumber={page.index + 1}
          isActive={currentPage === page.index + 1}
          pageWidth={page.width}
          pageHeight={page.height}
          onClick={() => setCurrentPage(page.index + 1)}
          onRotate={(e) => {
            e.stopPropagation();
            rotatePage(page.index);
          }}
        />
      ))}
    </div>
  );
}

function ThumbnailItem({
  pageNumber,
  isActive,
  pageWidth,
  pageHeight,
  onClick,
  onRotate,
}: {
  pageNumber: number;
  isActive: boolean;
  pageWidth: number;
  pageHeight: number;
  onClick: () => void;
  onRotate: (e: React.MouseEvent) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayWidth = Math.min(THUMBNAIL_WIDTH, 180);
  const displayHeight = (pageHeight / pageWidth) * displayWidth;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scale to render at display resolution
    const scale = displayWidth / pageWidth;
    renderPageToCanvas(pageNumber, canvas, scale).catch(console.error);
  }, [pageNumber, pageWidth, displayWidth]);

  return (
    <button
      onClick={onClick}
      className={`
        group relative flex flex-col items-center gap-1 p-1.5 rounded-lg
        transition-all duration-200 w-full
        ${isActive
          ? 'bg-brand-subtle ring-2 ring-brand shadow-[0_0_12px_rgba(124,58,237,0.1)]'
          : 'hover:bg-surface-hover'
        }
      `}
    >
      {/* Page number badge */}
      <span className={`
        absolute top-2.5 left-2.5 z-10 px-1.5 py-0.5 rounded-md text-[9px] font-bold
        ${isActive
          ? 'gradient-brand text-text-inverse'
          : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
        }
        transition-opacity duration-150
      `}>
        {pageNumber}
      </span>

      {/* Rotate button */}
      <div
        role="button"
        onClick={onRotate}
        className="absolute top-2.5 right-2.5 z-20 p-1 rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-brand hover:scale-110 transition-all"
        title="Rotation"
      >
        <RotateIcon size={10} />
      </div>

      {/* Canvas */}
      <div className={`
        rounded-md overflow-hidden shadow-sm
        transition-shadow duration-200
        ${isActive ? 'shadow-md' : 'group-hover:shadow-md'}
      `}>
        <canvas
          ref={canvasRef}
          className="bg-white block"
          style={{
            width: displayWidth,
            height: displayHeight,
            maxWidth: '100%',
          }}
        />
      </div>
    </button>
  );
}
