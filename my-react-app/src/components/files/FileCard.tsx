import React, { useState } from 'react';
import { Star, MoreHorizontal, Download, Trash2, StarOff } from 'lucide-react';

import { useApp } from '../../context/AppContext';
import { FileTypeIcon } from './FileTypeIcon';
import type { FileItem } from '../../types/file';

interface FileCardProps {
  file: FileItem;
  viewMode?: 'grid' | 'list';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function FileCard({ file, viewMode = 'grid' }: FileCardProps) {
  const { selectedIds, toggleSelect } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const isSelected = selectedIds.has(file.id);

  const handleClick = () => {
    toggleSelect(file.id);
  };

  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ x: rect.left, y: rect.bottom + 4 });
    setMenuOpen(true);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  if (viewMode === 'list') {
    return (
      <>
        <tr
          className={`file-list-row ${isSelected ? 'selected' : ''}`}
          onClick={handleClick}
          onContextMenu={handleRightClick}
          tabIndex={0}
          onKeyDown={e => e.key === ' ' && toggleSelect(file.id)}
          aria-selected={isSelected}
        >
          <td className="file-list-cell file-list-cell--name">
            <div className="file-list-name-inner">
              <FileTypeIcon type={file.type} size={28} />
              <span className="file-name-label">{file.name}</span>
              {file.isStarred && <Star size={12} fill="var(--color-amber)" color="var(--color-amber-dark)" />}
            </div>
          </td>
          <td className="file-list-cell mono">{file.type.toUpperCase()}</td>
          <td className="file-list-cell mono">{formatSize(file.size)}</td>
          <td className="file-list-cell mono">{formatDate(file.modifiedAt)}</td>
          <td className="file-list-cell file-list-cell--actions">
            <button className="btn btn-ghost btn-sm" onClick={openMenu} aria-label="File options">
              <MoreHorizontal size={13} />
            </button>
          </td>
        </tr>
        {menuOpen && <FileContextMenuPortal file={file} pos={menuPos} onClose={() => setMenuOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <article
        className={`file-card focus-ring ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        tabIndex={0}
        onKeyDown={e => e.key === ' ' && toggleSelect(file.id)}
        aria-selected={isSelected}
        aria-label={`File: ${file.name}`}
      >
        <div className="file-card__icon">
          <FileTypeIcon type={file.type} size={44} />
        </div>
        <div className="file-card__info">
          <span className="file-card__name" title={file.name}>{file.name}</span>
          <div className="file-card__meta">
            <span className="mono">{formatSize(file.size)}</span>
            <span className="mono">{formatDate(file.modifiedAt)}</span>
          </div>
        </div>
        <div className="file-card__actions">
          {file.isStarred && <Star size={12} fill="var(--color-amber)" color="var(--color-amber-dark)" />}
          <button className="folder-card__icon-btn" onClick={openMenu} aria-label="File options">
            <MoreHorizontal size={13} />
          </button>
        </div>
      </article>
      {menuOpen && <FileContextMenuPortal file={file} pos={menuPos} onClose={() => setMenuOpen(false)} />}
    </>
  );
}

function FileContextMenuPortal({ file, pos, onClose }: { file: FileItem; pos: { x: number; y: number }; onClose: () => void }) {
  const { toggleStarFile, deleteFile, downloadFile } = useApp();
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={onClose} onContextMenu={e => { e.preventDefault(); onClose(); }} />
      <div className="context-menu" style={{ top: pos.y, left: pos.x }} role="menu">
        <button className="context-menu-item" onClick={() => { void toggleStarFile(file.id); onClose(); }} role="menuitem">
          {file.isStarred ? <><StarOff size={14} /> Unstar</> : <><Star size={14} /> Star</>}
        </button>
        <button className="context-menu-item" onClick={() => { void downloadFile(file.id, file.name); onClose(); }} role="menuitem">
          <Download size={14} /> Download
        </button>
        <div className="context-menu-separator" />
        <button className="context-menu-item danger" onClick={() => {
          void deleteFile(file.id);
          onClose();
        }} role="menuitem">
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </>
  );
}

