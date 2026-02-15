// ============================================================
// PDFViewer — Main viewer with scroll and page rendering
// ============================================================

import { useRef, useCallback } from 'react';
import { usePDFStore } from '@stores/pdfStore';
import { PDFPage } from './PDFPage';
import { PAGE_GAP } from '@shared/constants';

export function PDFViewer() {
  const { pages, zoom, viewMode, currentPage, documentInfo, setCurrentPage } = usePDFStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const scale = zoom / 100;

  const handleScroll = useCallback(() => {
    if (viewMode !== 'continuous' || !containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const children = container.children;

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const childTop = child.offsetTop - container.offsetTop;
      const childBottom = childTop + child.offsetHeight;

      if (scrollTop >= childTop && scrollTop < childBottom) {
        setCurrentPage(i + 1);
        break;
      }
    }
  }, [viewMode, setCurrentPage]);

  if (!documentInfo || pages.length === 0) {
    return null;
  }

  // Determine which pages to render
  const pagesToRender = (() => {
    switch (viewMode) {
      case 'single':
        return [pages[currentPage - 1]];
      case 'double': {
        const result = [pages[currentPage - 1]];
        if (currentPage < pages.length) {
          result.push(pages[currentPage]);
        }
        return result;
      }
      case 'continuous':
        return pages;
    }
  })();

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-auto bg-texture-dots"
      style={{ padding: PAGE_GAP }}
    >
      <div
        className={`flex ${
          viewMode === 'double' ? 'flex-row flex-wrap justify-center' : 'flex-col items-center'
        }`}
        style={{ gap: PAGE_GAP }}
      >
        {pagesToRender.map((page) => (
          <PDFPage
            key={page.index}
            pageInfo={page}
            pageNumber={page.index + 1}
            scale={scale}
          />
        ))}
      </div>
    </div>
  );
}
