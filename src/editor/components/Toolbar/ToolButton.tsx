// ============================================================
// ToolButton — Individual toolbar button with premium design
// ============================================================

import type { ReactNode } from 'react';

interface ToolButtonProps {
  icon: ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function ToolButton({ icon, label, shortcut, active, disabled, onClick }: ToolButtonProps) {
  const tooltip = shortcut ? `${label} (${shortcut})` : label;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-tooltip={tooltip}
      className={`
        relative w-9 h-9 flex items-center justify-center rounded-[10px]
        transition-all duration-200 ease-out
        ${active
          ? 'gradient-brand text-text-inverse shadow-[0_2px_8px_rgba(124,58,237,0.35)] scale-[1.02]'
          : 'text-text-secondary hover:text-text hover:bg-surface-hover'
        }
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
      `}
    >
      <span className="relative z-10 flex items-center justify-center">
        {icon}
      </span>
      {active && (
        <span className="absolute inset-0 rounded-[10px] gradient-brand opacity-100" />
      )}
    </button>
  );
}
