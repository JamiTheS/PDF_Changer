// ============================================================
// PDF Editor Pro — Custom SVG Icon System
// Unique, consistent 24x24 icons with 1.5px stroke
// ============================================================

import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

const defaultProps = (size = 20): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

// --- Navigation & Actions ---

export function CursorIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
    </svg>
  );
}

export function UndoIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M3 7v6h6" />
      <path d="M3 13a9 9 0 0 1 15.36-6.36" />
    </svg>
  );
}

export function RedoIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M21 7v6h-6" />
      <path d="M21 13a9 9 0 0 0-15.36-6.36" />
    </svg>
  );
}

// --- Text Tools ---

export function TextIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M6 4h12" />
      <path d="M12 4v16" />
      <path d="M8 20h8" />
    </svg>
  );
}

export function TextEditIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M11 4H4v16h7" />
      <path d="M7 8h4" />
      <path d="M7 12h3" />
      <path d="M7 16h2" />
      <path d="M17.5 6.5l-5 5V15h3.5l5-5a1.77 1.77 0 0 0-2.12-2.83z" />
    </svg>
  );
}

export function HighlightIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M12 3L2 14l4.5 4.5L17 8z" />
      <path d="M2 14l4.5 4.5" />
      <rect x="8" y="19" width="12" height="2" rx="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function UnderlineIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M6 4v6a6 6 0 0 0 12 0V4" />
      <path d="M4 20h16" />
    </svg>
  );
}

export function StrikethroughIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M17.3 4.9c-1.5-1.3-3.4-1.9-5.3-1.9-3.3 0-5 1.6-5 3.9 0 1.2.4 2.1 1.3 2.8" />
      <path d="M3 12h18" />
      <path d="M12 12c3.5 0 5.8 1.2 5.8 3.5 0 2.3-2 3.8-5.2 3.8-2.1 0-4-.7-5.4-1.9" />
    </svg>
  );
}

// --- Drawing Tools ---

export function PenIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M18.37 2.63a2.12 2.12 0 0 1 3 3L8.35 18.65l-4.22.84.84-4.22z" />
      <path d="M15.89 5.11l3 3" />
    </svg>
  );
}

export function EraserIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M7 21h10" />
      <path d="M5.636 15.364L16.95 4.05a2 2 0 0 1 2.828 0l.172.172a2 2 0 0 1 0 2.828L8.636 18.364a2 2 0 0 1-2.828 0l-.172-.172a2 2 0 0 1 0-2.828z" />
      <path d="M8.636 18.364L5.636 15.364" />
    </svg>
  );
}

// --- Shapes ---

export function RectangleIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
    </svg>
  );
}

export function CircleIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function ArrowIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M5 19L19 5" />
      <path d="M10 5h9v9" />
    </svg>
  );
}

export function LineIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M4 20L20 4" />
    </svg>
  );
}

// --- Special Tools ---

export function SignatureIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M3 17c1-1 3-5 5-5s2 3 4 3 3-4 5-4 2 2 4 1" />
      <path d="M3 21h18" />
    </svg>
  );
}

export function ImageIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

// --- View Modes ---

export function SinglePageIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
    </svg>
  );
}

export function DoublePageIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <rect x="2" y="3" width="9" height="18" rx="1.5" />
      <rect x="13" y="3" width="9" height="18" rx="1.5" />
    </svg>
  );
}

export function ContinuousIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <rect x="5" y="1" width="14" height="8" rx="1.5" />
      <rect x="5" y="11" width="14" height="8" rx="1.5" />
      <path d="M12 9v2" strokeDasharray="1 1" />
      <path d="M12 19v3" strokeDasharray="1 1" />
    </svg>
  );
}

// --- Zoom ---

export function ZoomInIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16 16l4.5 4.5" />
      <path d="M8 11h6" />
      <path d="M11 8v6" />
    </svg>
  );
}

export function ZoomOutIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16 16l4.5 4.5" />
      <path d="M8 11h6" />
    </svg>
  );
}

// --- File actions ---

export function DownloadIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M12 3v12" />
      <path d="M8 11l4 4 4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function MergeIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M8 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4" />
      <path d="M16 6h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4" />
      <rect x="8" y="3" width="8" height="18" rx="2" />
    </svg>
  );
}

export function SplitIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <rect x="2" y="3" width="8" height="18" rx="2" />
      <rect x="14" y="3" width="8" height="18" rx="2" />
      <path d="M12 7v10" strokeDasharray="2 2" />
    </svg>
  );
}

export function RotateIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

// --- Sidebar ---

export function PagesIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M9 6h6" />
      <path d="M9 10h6" />
      <path d="M9 14h3" />
    </svg>
  );
}

export function PropertiesIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4" />
      <path d="M12 19v4" />
      <path d="M4.22 4.22l2.83 2.83" />
      <path d="M16.95 16.95l2.83 2.83" />
      <path d="M1 12h4" />
      <path d="M19 12h4" />
      <path d="M4.22 19.78l2.83-2.83" />
      <path d="M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

export function LayersIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <polygon points="12 2 2 7 12 12 22 7" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

// --- Misc ---

export function ChevronLeftIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function CloseIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export function FileIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export function UploadIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M12 15V3" />
      <path d="M8 7l4-4 4 4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function SparkleIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" fill="currentColor" opacity="0.15" />
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
    </svg>
  );
}

export function ShieldIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M12 2l8 4v6c0 5.25-3.44 9.74-8 11-4.56-1.26-8-5.75-8-11V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function PdfLogoIcon({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <rect width="32" height="32" rx="8" fill="url(#pdf-grad)" />
      <path d="M9 10h4.5a2.5 2.5 0 0 1 0 5H9v7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 10v12" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 10h3" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 16h2.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="pdf-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function TrashIcon({ size, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
