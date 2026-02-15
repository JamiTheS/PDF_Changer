// ============================================================
// Popup — Premium extension popup
// ============================================================

export function Popup() {
  const handleOpenEditor = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/editor/editor.html'),
    });
    window.close();
  };

  const handleEditCurrentPdf = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      chrome.runtime.sendMessage({
        type: 'OPEN_EDITOR',
        payload: { pdfUrl: tab.url, fileName: 'document.pdf' },
      });
      window.close();
    }
  };

  return (
    <div className="w-80 overflow-hidden">
      {/* Header with gradient */}
      <div className="gradient-brand px-5 py-4">
        <div className="flex items-center gap-2.5">
          {/* Inline logo SVG for popup (no external icon import needed) */}
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.2)" />
            <path d="M9 10h4.5a2.5 2.5 0 0 1 0 5H9v7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 10v12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 10h3" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 16h2.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div>
            <h1 className="text-sm font-bold text-white">PDF Editor Pro</h1>
            <p className="text-[10px] text-white/60">Edit PDFs in your browser</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 space-y-1.5">
        <PopupAction
          onClick={handleOpenEditor}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" /><path d="M8 11l4 4 4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          }
          title="Open Editor"
          description="Start fresh with a new PDF"
          primary
        />

        <PopupAction
          onClick={handleEditCurrentPdf}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.37 2.63a2.12 2.12 0 0 1 3 3L8.35 18.65l-4.22.84.84-4.22z" /><path d="M15.89 5.11l3 3" />
            </svg>
          }
          title="Edit Current PDF"
          description="Open the current page's PDF in editor"
        />
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-surface-dim border-t border-border flex items-center justify-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-brand">
          <path d="M12 2l8 4v6c0 5.25-3.44 9.74-8 11-4.56-1.26-8-5.75-8-11V6z" /><path d="M9 12l2 2 4-4" />
        </svg>
        <span className="text-[10px] text-text-muted">100% offline &middot; Your files stay private</span>
      </div>
    </div>
  );
}

function PopupAction({
  onClick,
  icon,
  title,
  description,
  primary,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left
        transition-all duration-200 group
        ${primary
          ? 'bg-brand-subtle hover:bg-brand-light'
          : 'hover:bg-surface-hover'
        }
      `}
    >
      <div className={`
        w-9 h-9 rounded-lg flex items-center justify-center shrink-0
        transition-all duration-200
        ${primary
          ? 'gradient-brand text-white shadow-[0_2px_8px_rgba(124,58,237,0.25)] group-hover:shadow-[0_4px_12px_rgba(124,58,237,0.35)]'
          : 'bg-surface-sunken text-text-muted group-hover:text-text-secondary'
        }
      `}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-text">{title}</p>
        <p className="text-[10px] text-text-muted">{description}</p>
      </div>
    </button>
  );
}
