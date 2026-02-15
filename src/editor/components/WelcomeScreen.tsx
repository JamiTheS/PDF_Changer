// ============================================================
// WelcomeScreen — Premium landing with Edit & Merge actions
// ============================================================

import { useCallback, useState } from 'react';
import { PdfLogoIcon, UploadIcon, ShieldIcon, SparkleIcon, MergeIcon } from './icons';
import { MergeModal } from './Modals/MergeModal';

interface WelcomeScreenProps {
  onFileSelected: (file: File) => void;
}

export function WelcomeScreen({ onFileSelected }: WelcomeScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showMerge, setShowMerge] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type === 'application/pdf') {
        onFileSelected(file);
      }
    },
    [onFileSelected],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.08]"
          style={{
            background: 'radial-gradient(circle, #6366f1, transparent 70%)',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, #8b5cf6, transparent 70%)',
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #a78bfa, transparent 70%)',
            animation: 'float 7s ease-in-out infinite 1s',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-3xl" style={{ animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4" style={{ animation: 'float 3s ease-in-out infinite' }}>
            <PdfLogoIcon size={56} />
          </div>
          <h1 className="text-2xl font-bold text-text mb-1.5">
            PDF Editor <span className="gradient-brand-text">Pro</span>
          </h1>
          <p className="text-sm text-text-muted">
            Éditez, annotez, signez & combinez vos PDFs — directement dans votre navigateur
          </p>
        </div>

        {/* Two-column action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* ── CARD 1: Edit a PDF ── */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              rounded-2xl border transition-all duration-300 ease-out
              ${isDragging
                ? 'bg-brand-subtle border-brand scale-[1.02] shadow-[0_0_40px_rgba(124,58,237,0.15)]'
                : 'glass-strong border-border shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:border-border-strong'
              }
            `}
          >
            <div className="h-1 gradient-brand rounded-t-2xl" />
            <div className="p-6 text-center">
              <div className={`
                w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center
                transition-all duration-200
                ${isDragging ? 'gradient-brand text-white scale-110' : 'bg-brand-light text-text-brand'}
              `}>
                <UploadIcon size={22} />
              </div>
              <h2 className="text-base font-bold text-text mb-1">Éditer un PDF</h2>
              <p className="text-xs text-text-muted mb-4">
                {isDragging ? 'Relâchez pour ouvrir' : 'Glissez-déposez ou sélectionnez un fichier'}
              </p>

              <div className={`
                rounded-xl border-2 border-dashed p-4 mb-4 transition-all
                ${isDragging ? 'border-brand bg-brand-light/50' : 'border-border-strong hover:border-border-brand'}
              `}>
                <label className={`
                  inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                  cursor-pointer transition-all duration-200
                  text-text-inverse gradient-brand
                  shadow-[0_2px_12px_rgba(124,58,237,0.3)]
                  hover:shadow-[0_4px_20px_rgba(124,58,237,0.4)]
                  hover:scale-[1.03] active:scale-[0.97]
                `}>
                  Choisir un fichier
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <FeatureBadge icon={<SparkleIcon size={12} />} text="Annoter" />
                <FeatureBadge icon={<ShieldIcon size={12} />} text="Signer" />
                <FeatureBadge
                  icon={
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4v16h7" /><path d="M7 8h4" /><path d="M7 12h3" /><path d="M17.5 6.5l-5 5V15h3.5l5-5a1.77 1.77 0 0 0-2.12-2.83z" />
                    </svg>
                  }
                  text="Éditer texte"
                />
              </div>
            </div>
          </div>

          {/* ── CARD 2: Merge PDFs ── */}
          <button
            onClick={() => setShowMerge(true)}
            className="rounded-2xl border glass-strong border-border shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:border-border-strong transition-all duration-300 text-left group"
          >
            <div className="h-1 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform">
                <MergeIcon size={22} />
              </div>
              <h2 className="text-base font-bold text-text mb-1">Combiner des PDFs</h2>
              <p className="text-xs text-text-muted mb-4">
                Fusionnez plusieurs fichiers PDF en un seul document
              </p>

              <div className="rounded-xl border-2 border-dashed border-border-strong p-4 mb-4 group-hover:border-amber-400 transition-colors">
                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-[0_2px_12px_rgba(245,158,11,0.3)] group-hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)] group-hover:scale-[1.03] transition-all" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                  <MergeIcon size={16} />
                  Sélectionner les fichiers
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <FeatureBadge
                  icon={
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  }
                  text="Multi-fichiers"
                />
                <FeatureBadge
                  icon={
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  }
                  text="Instantané"
                />
                <FeatureBadge icon={<ShieldIcon size={12} />} text="100% privé" />
              </div>
            </div>
          </button>
        </div>

        {/* Global feature badges */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <FeatureBadge icon={<ShieldIcon size={14} />} text="100% Local & Privé" />
          <FeatureBadge icon={<SparkleIcon size={14} />} text="Fonctionne hors-ligne" />
          <FeatureBadge
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            }
            text="Ultra rapide"
          />
        </div>
      </div>

      {/* Merge modal */}
      {showMerge && <MergeModal onClose={() => setShowMerge(false)} />}
    </div>
  );
}

function FeatureBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-sunken text-text-muted text-[11px] font-medium">
      <span className="text-text-brand">{icon}</span>
      {text}
    </div>
  );
}
