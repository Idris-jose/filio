import React from 'react';
import type { FileType } from '../../types/file';

interface FileTypeIconProps {
  type: FileType;
  size?: number;
  className?: string;
}

const typeConfig: Record<FileType, { bg: string; text: string; label: string }> = {
  pdf:  { bg: '#e53e3e', text: '#fff', label: 'PDF'  },
  docx: { bg: '#2b6cb0', text: '#fff', label: 'DOC'  },
  xlsx: { bg: '#276749', text: '#fff', label: 'XLS'  },
  png:  { bg: '#805ad5', text: '#fff', label: 'PNG'  },
  jpg:  { bg: '#dd6b20', text: '#fff', label: 'JPG'  },
  zip:  { bg: '#744210', text: '#fff', label: 'ZIP'  },
  txt:  { bg: '#4a5568', text: '#fff', label: 'TXT'  },
  mp4:  { bg: '#c53030', text: '#fff', label: 'MP4'  },
  psd:  { bg: '#2d3748', text: '#31a8ff', label: 'PSD' },
  fig:  { bg: '#1e1e1e', text: '#a259ff', label: 'FIG' },
  svg:  { bg: '#f6ad55', text: '#1a1510', label: 'SVG' },
};

/**
 * Pixel-art inspired file type icon rendered as an SVG document shape
 * with a color-coded label indicating the file format.
 */
export function FileTypeIcon({ type, size = 36, className }: FileTypeIconProps) {
  const config = typeConfig[type] || { bg: '#718096', text: '#fff', label: type.toUpperCase() };
  const w = 28;
  const h = 34;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={size * (h / w)}
      className={`pixel-art ${className || ''}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${config.label} file`}
    >
      {/* Document body */}
      <polygon
        points="2,2 18,2 18,6 22,6 22,8 26,8 26,32 2,32"
        fill="#faf8f3"
        stroke="#2a2520"
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      {/* Folded corner */}
      <polygon
        points="18,2 26,8 18,8"
        fill="#e8e0d0"
        stroke="#2a2520"
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      {/* Type badge */}
      <rect x="2" y="20" width="24" height="10" fill={config.bg} />
      <text
        x="14"
        y="28"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="6"
        fontWeight="700"
        fill={config.text}
      >
        {config.label}
      </text>
      {/* Document lines */}
      <line x1="5" y1="11" x2="17" y2="11" stroke="#2a2520" strokeWidth="1" opacity="0.3" />
      <line x1="5" y1="14" x2="17" y2="14" stroke="#2a2520" strokeWidth="1" opacity="0.25" />
      <line x1="5" y1="17" x2="13" y2="17" stroke="#2a2520" strokeWidth="1" opacity="0.2" />
    </svg>
  );
}
