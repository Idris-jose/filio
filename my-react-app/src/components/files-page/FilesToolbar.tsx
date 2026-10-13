import React from 'react';
import {
  LayoutGrid, List, SortAsc, SortDesc, Upload, FolderPlus, RefreshCw,
} from 'lucide-react';
import type { SortField } from '../../types/file';

interface FilesToolbarProps {
  sortField: SortField;
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  loading: boolean;
  hasSelection: boolean;
  selectionCount: number;
  onToggleSort: (field: SortField) => void;
  onSetViewMode: (mode: 'grid' | 'list') => void;
  onSync: () => void;
  onUpload: () => void;
  onNewFolder: () => void;
  onClearSelection: () => void;
}

export function FilesToolbar({
  sortField,
  sortOrder,
  viewMode,
  loading,
  hasSelection,
  selectionCount,
  onToggleSort,
  onSetViewMode,
  onSync,
  onUpload,
  onNewFolder,
  onClearSelection,
}: FilesToolbarProps) {
  const SortIcon = sortOrder === 'asc' ? SortAsc : SortDesc;

  return (
    <div className="files-page__toolbar">
      {hasSelection && (
        <span className="mono" style={{ fontSize: 12, color: 'var(--color-text-muted)', alignSelf: 'center' }}>
          {selectionCount} selected
        </span>
      )}
      {hasSelection && (
        <button className="btn btn-ghost btn-sm" onClick={onClearSelection}>
          Clear
        </button>
      )}

      {/* Sort */}
      <div className="toolbar-group">
        {(['name', 'modifiedAt', 'size'] as SortField[]).map(field => (
          <button
            key={field}
            className={`btn btn-ghost btn-sm ${sortField === field ? 'toolbar-sort--active' : ''}`}
            onClick={() => onToggleSort(field)}
            title={`Sort by ${field}`}
          >
            <SortAsc size={13} />
            {field === 'name' ? 'Name' : field === 'modifiedAt' ? 'Date' : 'Size'}
            {sortField === field && <SortIcon size={11} />}
          </button>
        ))}
      </div>

      {/* View switcher */}
      <div className="toolbar-group toolbar-view-switcher">
        <button
          className={`btn btn-ghost btn-sm ${viewMode === 'grid' ? 'view-btn--active' : ''}`}
          onClick={() => onSetViewMode('grid')}
          aria-label="Grid view"
          aria-pressed={viewMode === 'grid'}
        >
          <LayoutGrid size={14} />
        </button>
        <button
          className={`btn btn-ghost btn-sm ${viewMode === 'list' ? 'view-btn--active' : ''}`}
          onClick={() => onSetViewMode('list')}
          aria-label="List view"
          aria-pressed={viewMode === 'list'}
        >
          <List size={14} />
        </button>
      </div>

      {/* Actions */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={onSync}
        title="Sync files & folders with Supabase"
        disabled={loading}
      >
        <RefreshCw size={13} className={loading ? 'spin' : ''} />
        <span className="mono" style={{ fontSize: 11 }}>SYNC</span>
      </button>
      <button className="btn btn-secondary btn-sm" onClick={onUpload} id="upload-btn">
        <Upload size={14} /> Upload
      </button>
      <button className="btn btn-primary btn-sm" onClick={onNewFolder} id="new-folder-btn">
        <FolderPlus size={14} /> New Folder
      </button>
    </div>
  );
}
