import React from 'react';
import type { FolderColor } from '../../types/folder';

interface FolderIconProps {
  color?: FolderColor;
  size?: number;
  isOpen?: boolean;
  className?: string;
}

// Color maps for folder fills
const colorMap: Record<FolderColor, { body: string; tab: string; tabEdge: string; bodyEdge: string; shadow: string; paper: string }> = {
  amber: {
    body: '#f0b429',
    tab: '#d4910a',
    tabEdge: '#c07800',
    bodyEdge: '#2a2520',
    shadow: '#c07800',
    paper: '#fef9ee',
  },
  orange: {
    body: '#e07a1c',
    tab: '#c05a08',
    tabEdge: '#a04000',
    bodyEdge: '#2a2520',
    shadow: '#a04000',
    paper: '#fff5ec',
  },
  golden: {
    body: '#d4a017',
    tab: '#b07a00',
    tabEdge: '#906000',
    bodyEdge: '#2a2520',
    shadow: '#906000',
    paper: '#fdf8e8',
  },
  cream: {
    body: '#e8d8b0',
    tab: '#c4a870',
    tabEdge: '#a08040',
    bodyEdge: '#2a2520',
    shadow: '#a08040',
    paper: '#fdfaf2',
  },
  brown: {
    body: '#c4904a',
    tab: '#8b6035',
    tabEdge: '#5e3e18',
    bodyEdge: '#2a2520',
    shadow: '#5e3e18',
    paper: '#fdf6ec',
  },
};

/**
 * Pixel-art style folder SVG icon with handcrafted stepped geometry.
 * Rendering is crisp with pixelated image rendering applied via CSS.
 */
export function FolderIcon({ color = 'amber', size = 80, isOpen = false, className }: FolderIconProps) {
  const c = colorMap[color];
  const w = 80;
  const h = 64;

  // Pixel grid values (designed on 80×64 grid)
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={size * (h / w)}
      className={`pixel-art ${className || ''}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Shadow layer (offset 2px) */}
      <rect x="6" y="18" width="72" height="44" rx="0" fill={c.shadow} opacity="0.35" />

      {/* Folder tab (top left protrusion) */}
      {/* Stepped pixel tab shape */}
      <polygon
        points="4,8 4,6 6,6 6,4 28,4 28,6 30,6 30,8 32,8 32,16 4,16"
        fill={c.tab}
        stroke={c.bodyEdge}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      {/* Tab highlight */}
      <rect x="6" y="6" width="22" height="2" fill={c.body} opacity="0.5" />

      {/* Main folder body */}
      <rect
        x="4"
        y="14"
        width="72"
        height="44"
        fill={c.body}
        stroke={c.bodyEdge}
        strokeWidth="2"
      />

      {/* Document pages peeking above folder top */}
      {!isOpen && (
        <g>
          {/* Paper 1 (back) */}
          <rect x="16" y="10" width="28" height="8" fill={c.paper} stroke={c.bodyEdge} strokeWidth="1.5" />
          {/* Paper 2 */}
          <rect x="22" y="10" width="28" height="8" fill={c.paper} stroke={c.bodyEdge} strokeWidth="1.5" />
          {/* Paper lines */}
          <line x1="25" y1="13" x2="38" y2="13" stroke={c.bodyEdge} strokeWidth="1" opacity="0.3" />
          <line x1="25" y1="15" x2="35" y2="15" stroke={c.bodyEdge} strokeWidth="1" opacity="0.2" />
        </g>
      )}

      {/* Folder body internal lines (pixel detail) */}
      <rect x="6" y="16" width="68" height="2" fill={c.shadow} opacity="0.15" />

      {/* Stepped pixel corners on body */}
      {/* Top-left corner step */}
      <rect x="4" y="14" width="2" height="2" fill={c.bodyEdge} />
      {/* Bottom-left corner step */}
      <rect x="4" y="56" width="2" height="2" fill={c.bodyEdge} />
      {/* Bottom-right corner step */}
      <rect x="74" y="56" width="2" height="2" fill={c.bodyEdge} />
      {/* Top-right corner step */}
      <rect x="74" y="14" width="2" height="2" fill={c.bodyEdge} />

      {/* Pixel highlight on folder top edge */}
      <rect x="6" y="14" width="68" height="2" fill={c.body} opacity="0.6" />

      {/* Inner document shapes when folder open */}
      {isOpen && (
        <g>
          <rect x="18" y="24" width="20" height="26" fill={c.paper} stroke={c.bodyEdge} strokeWidth="1.5" />
          <line x1="20" y1="29" x2="36" y2="29" stroke={c.bodyEdge} strokeWidth="1" opacity="0.4" />
          <line x1="20" y1="33" x2="36" y2="33" stroke={c.bodyEdge} strokeWidth="1" opacity="0.3" />
          <line x1="20" y1="37" x2="30" y2="37" stroke={c.bodyEdge} strokeWidth="1" opacity="0.25" />
          <rect x="42" y="26" width="18" height="22" fill={c.paper} stroke={c.bodyEdge} strokeWidth="1.5" />
          <line x1="44" y1="31" x2="58" y2="31" stroke={c.bodyEdge} strokeWidth="1" opacity="0.4" />
          <line x1="44" y1="35" x2="58" y2="35" stroke={c.bodyEdge} strokeWidth="1" opacity="0.3" />
        </g>
      )}

      {/* Bottom pixel row accent */}
      <rect x="6" y="55" width="68" height="2" fill={c.shadow} opacity="0.2" />
    </svg>
  );
}
