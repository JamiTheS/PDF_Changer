// ============================================================
// App — Main Editor Application
// ============================================================

import { useEffect } from 'react';
import { usePDF } from './hooks/usePDF';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Toolbar } from './components/Toolbar';
import { PDFViewer } from './components/Canvas';
import { Sidebar } from './components/Sidebar';
import { StatusBar } from './components/StatusBar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PdfLogoIcon } from './components/icons';
import { setLocale, detectLocale } from '@shared/i18n';

export function App() {
  const { documentInfo, isLoading, error, loadFromUrl, loadFromFile } = usePDF();

  useKeyboardShortcuts();

  // Set locale on mount
  useEffect(() => {
    setLocale(detectLocale());
  }, []);

  // Check URL params for PDF to load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pdfUrl = params.get('url');
    if (pdfUrl) {
      loadFromUrl(pdfUrl);
    }
  }, [loadFromUrl]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-dim">
        <div className="text-center" style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div className="mb-4" style={{ animation: 'float 2s ease-in-out infinite' }}>
            <PdfLogoIcon size={48} />
          </div>
          <div className="w-8 h-8 mx-auto mb-3 relative">
            <div className="absolute inset-0 border-2 border-brand/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm font-medium text-text-secondary">Loading your PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-dim">
        <div className="text-center max-w-md p-8" style={{ animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-danger-light text-danger flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6" /><path d="M9 9l6 6" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-text mb-1">Failed to load PDF</h2>
          <p className="text-sm text-text-muted mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 text-sm font-semibold text-text-inverse gradient-brand rounded-xl shadow-[0_2px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!documentInfo) {
    return (
      <div className="h-screen flex flex-col bg-surface-dim">
        <WelcomeScreen onFileSelected={loadFromFile} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-surface-dim overflow-hidden">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <PDFViewer />
      </div>
      <StatusBar />
    </div>
  );
}
