import React, { useState } from 'react';
import { Star, MoreHorizontal, Trash2, StarOff, Share2, FolderOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Folder } from '../../types/folder';

interface FolderListRowProps {
  folder: Folder;
  onShare: (f: Folder) => void;
}

function formatSize(bytes: number) {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function FolderListRow({ folder, onShare }: FolderListRowProps) {
  const { openFolder, selectedIds, toggleSelect, toggleStarFolder, deleteFolder } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const isSelected = selectedIds.has(folder.id);

  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ x: r.left, y: r.bottom + 4 });
    setMenuOpen(true);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  return (
    <>
      <tr
        className={`file-list-row ${isSelected ? 'selected' : ''}`}
        onClick={() => toggleSelect(folder.id)}
        onDoubleClick={() => openFolder(folder)}
        onContextMenu={handleRightClick}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') openFolder(folder); }}
        aria-selected={isSelected}
      >
        <td className="file-list-cell file-list-cell--name">
          <div className="file-list-name-inner">
            <svg width="20" height="16" viewBox="0 0 80 64" className="pixel-art" aria-hidden="true">
              <polygon points="4,8 4,6 6,6 6,4 28,4 28,6 30,6 30,8 32,8 32,16 4,16" fill="#f0b429" stroke="#2a2520" strokeWidth="2" />
              <rect x="4" y="14" width="72" height="44" fill="#f0b429" stroke="#2a2520" strokeWidth="2" />
            </svg>
            <span className="file-name-label">{folder.name}</span>
            {folder.isStarred && <Star size={12} fill="var(--color-amber)" color="var(--color-amber-dark)" />}
          </div>
        </td>
        <td className="file-list-cell mono">{folder.fileCount} files</td>
        <td className="file-list-cell mono">{formatSize(folder.size)}</td>
        <td className="file-list-cell mono">{formatDate(folder.modifiedAt)}</td>
        <td className="file-list-cell file-list-cell--actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={openMenu}
            aria-label="Folder options"
          >
            <MoreHorizontal size={13} />
          </button>
        </td>
      </tr>

      {menuOpen && (
        <>
          <tr aria-hidden="true"><td colSpan={5} style={{ padding: 0, border: 'none' }} /></tr>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setMenuOpen(false)}
            onContextMenu={e => { e.preventDefault(); setMenuOpen(false); }}
          />
          <div className="context-menu" style={{ top: menuPos.y, left: menuPos.x }} role="menu">
            <button className="context-menu-item" onClick={() => { openFolder(folder); setMenuOpen(false); }} role="menuitem">
              <FolderOpen size={14} /> Open
            </button>
            <button className="context-menu-item" onClick={() => { onShare(folder); setMenuOpen(false); }} role="menuitem">
              <Share2 size={14} /> Share…
            </button>
            <button className="context-menu-item" onClick={() => { toggleStarFolder(folder.id); setMenuOpen(false); }} role="menuitem">
              {folder.isStarred ? <><StarOff size={14} /> Unstar</> : <><Star size={14} /> Star</>}
            </button>
            <div className="context-menu-separator" />
            <button className="context-menu-item danger" onClick={() => { deleteFolder(folder.id); setMenuOpen(false); }} role="menuitem">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}
    </>
  );
}
