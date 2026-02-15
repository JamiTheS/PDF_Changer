// ============================================================
// Sidebar — Premium tabbed sidebar with icons
// ============================================================

import { useState, type ReactNode } from 'react';
import { usePDFStore } from '@stores/pdfStore';
import { t } from '@shared/i18n';
import { PageThumbnails } from './PageThumbnails';
import { PropertiesPanel } from './PropertiesPanel';
import { PagesIcon, PropertiesIcon, LayersIcon } from '../icons';

type SidebarTab = 'pages' | 'properties' | 'layers';

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('pages');
  const documentInfo = usePDFStore((s) => s.documentInfo);

  if (!documentInfo) return null;

  const tabs: Array<{ id: SidebarTab; labelKey: string; icon: ReactNode }> = [
    { id: 'pages', labelKey: 'sidebar.pages', icon: <PagesIcon size={16} /> },
    { id: 'properties', labelKey: 'sidebar.properties', icon: <PropertiesIcon size={16} /> },
    { id: 'layers', labelKey: 'sidebar.layers', icon: <LayersIcon size={16} /> },
  ];

  return (
    <div className="w-56 bg-surface border-r border-border flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex px-1 pt-1 gap-0.5 bg-surface-dim">
        {tabs.map(({ id, labelKey, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium
              rounded-t-lg transition-all duration-200
              ${activeTab === id
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'
              }
            `}
          >
            <span className={activeTab === id ? 'text-text-brand' : ''}>{icon}</span>
            {t(labelKey)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto" style={{ animation: 'fadeIn 0.2s ease-out' }}>
        {activeTab === 'pages' && <PageThumbnails />}
        {activeTab === 'properties' && <PropertiesPanel />}
        {activeTab === 'layers' && (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <LayersIcon size={32} className="text-border-strong mb-3" />
            <p className="text-xs text-text-muted">
              Layers panel coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
