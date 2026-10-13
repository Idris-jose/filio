import React, { useState, useRef } from 'react';
import { Star, Share2, MoreHorizontal, FolderOpen, Edit2, Trash2, StarOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FolderIcon } from './FolderIcon';
import type { Folder } from '../../types/folder';

interface FolderCardProps {
  folder: Folder;
  onShare?: (folder: Folder) => void;
  onDetails?: (folder: Folder) => void;
}

function formatSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function FolderCard({ folder, onShare, onDetails }: FolderCardProps) {
  const { openFolder, toggleStarFolder, deleteFolder, selectedIds, toggleSelect } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedIds.has(folder.id);

  const handleDoubleClick = () => openFolder(folder);

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      toggleSelect(folder.id);
    } else {
      // single click just selects this card
      toggleSelect(folder.id);
    }
  };

  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ x: rect.left, y: rect.bottom + 4 });
    setMenuOpen(true);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <article
        className={`folder-card focus-ring ${isSelected ? 'selected' : ''}`}
        tabIndex={0}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleRightClick}
        onKeyDown={e => { if (e.key === 'Enter') openFolder(folder); }}
        aria-label={`Folder: ${folder.name}, ${folder.fileCount} files`}
        aria-selected={isSelected}
      >
        {/* Top row: star, shared, menu */}
        <div className="folder-card__header">
          <button
            className="folder-card__icon-btn"
            onClick={e => { e.stopPropagation(); toggleStarFolder(folder.id); }}
            aria-label={folder.isStarred ? 'Unstar folder' : 'Star folder'}
            title={folder.isStarred ? 'Unstar' : 'Star'}
          >
            {folder.isStarred
              ? <Star size={13} fill="var(--color-amber)" color="var(--color-amber-dark)" />
              : <Star size={13} color="var(--color-text-disabled)" />
            }
          </button>
          {folder.isShared && (
            <span className="folder-card__shared-badge" title="Shared">
              <Share2 size={11} />
            </span>
          )}
          <button
            className="folder-card__icon-btn folder-card__menu-btn"
            onClick={openMenu}
            aria-label="Folder options"
            aria-haspopup="true"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>

        {/* Folder illustration */}
        <div className="folder-card__icon">
          <FolderIcon color={folder.color} size={72} />
        </div>

        {/* Folder name */}
        <div className="folder-card__name" title={folder.name}>
          {folder.name}
        </div>

        {/* Meta info */}
        <div className="folder-card__meta">
          <span className="mono">{folder.fileCount} files</span>
          <span className="mono">{formatSize(folder.size)}</span>
        </div>
        <div className="folder-card__date mono">
          {formatDate(folder.modifiedAt)}
        </div>
      </article>

      {/* Context Menu */}
      {menuOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={closeMenu}
            onContextMenu={e => { e.preventDefault(); closeMenu(); }}
          />
          <div
            ref={menuRef}
            className="context-menu"
            style={{ top: menuPos.y, left: menuPos.x }}
            role="menu"
          >
            <button className="context-menu-item" onClick={() => { openFolder(folder); closeMenu(); }} role="menuitem">
              <FolderOpen size={14} /> Open
            </button>
            <button className="context-menu-item" onClick={() => { onDetails?.(folder); closeMenu(); }} role="menuitem">
              <FolderOpen size={14} /> Details
            </button>
            <button className="context-menu-item" onClick={() => { onShare?.(folder); closeMenu(); }} role="menuitem">
              <Share2 size={14} /> Share…
            </button>
            <div className="context-menu-separator" />
            <button className="context-menu-item" onClick={() => { toggleStarFolder(folder.id); closeMenu(); }} role="menuitem">
              {folder.isStarred ? <><StarOff size={14} /> Unstar</> : <><Star size={14} /> Star</>}
            </button>
            <div className="context-menu-separator" />
            <button className="context-menu-item danger" onClick={() => { deleteFolder(folder.id); closeMenu(); }} role="menuitem">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}
    </>
  );
}
