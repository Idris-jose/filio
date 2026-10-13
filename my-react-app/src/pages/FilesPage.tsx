import React, { useState, useMemo, useEffect } from 'react';
import { FolderPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFolders } from '../hooks/useFolders';
import { useFiles } from '../hooks/useFiles';
import { CreateFolderDialog } from '../components/folders/CreateFolderDialog';
import { ShareFolderDialog } from '../components/sharing/ShareFolderDialog';
import { UploadDialog } from '../components/upload/UploadDialog';
import { FilesToolbar } from '../components/files-page/FilesToolbar';
import { FolderSection } from '../components/files-page/FolderSection';
import { FileSection } from '../components/files-page/FileSection';
import { SyncBanner } from '../components/common/SyncBanner';
import { EmptyState } from '../components/common/EmptyState';
import type { Folder, FolderColor } from '../types/folder';
import type { SortField } from '../types/file';
import { getFileTypeFromNameOrMime, type FileItem } from '../types/file';

export function FilesPage() {
  const {
    currentFolderId, breadcrumbs,
    viewMode, setViewMode,
    sortField, setSortField,
    sortOrder, setSortOrder,
    searchQuery,
    selectedIds, clearSelection,
    dataVersion,
  } = useApp();

  const {
    folders: dbFolders,
    loading: foldersLoading,
    refresh: refreshFolders,
  } = useFolders(currentFolderId);

  const {
    files: dbFiles,
    loading: filesLoading,
    refresh: refreshFiles,
  } = useFiles(currentFolderId);

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [shareFolder, setShareFolder] = useState<Folder | null>(null);

  // ── Supabase folders ──────────────────────────────────────────────────────
  const mappedFolders: Folder[] = useMemo(() => {
    return (dbFolders || []).map(dbf => ({
      id: dbf.id,
      name: dbf.name,
      parentId: dbf.parent_id,
      color: (dbf.color || 'amber') as FolderColor,
      fileCount: dbf.file_count ?? 0,
      size: dbf.size_bytes ?? 0,
      createdAt: dbf.created_at ? new Date(dbf.created_at) : new Date(),
      modifiedAt: dbf.updated_at ? new Date(dbf.updated_at) : new Date(),
      isStarred: Boolean(dbf.is_starred),
      isShared: false,
      sharedWith: [],
      owner: dbf.owner_id || 'Me',
      tags: [],
    }));
  }, [dbFolders]);

  // ── Supabase files ────────────────────────────────────────────────────────
  const mappedFiles: FileItem[] = useMemo(() => {
    return (dbFiles || []).map(dbf => ({
      id: dbf.id,
      name: dbf.name,
      type: getFileTypeFromNameOrMime(dbf.name, dbf.mime_type),
      folderId: dbf.folder_id,
      size: dbf.size_bytes,
      createdAt: dbf.created_at ? new Date(dbf.created_at) : new Date(),
      modifiedAt: dbf.updated_at ? new Date(dbf.updated_at) : new Date(),
      isStarred: Boolean(dbf.is_starred),
      isShared: false,
      sharedWith: [],
      owner: dbf.owner_id || 'Me',
      isDeleted: false,
    }));
  }, [dbFiles]);

  // ── Filtered + sorted views ───────────────────────────────────────────────
  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  const applySort = <T extends { name: string; modifiedAt: Date; size: number; type?: string }>(list: T[]): T[] => {
    const mult = sortOrder === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortField === 'name') return mult * a.name.localeCompare(b.name);
      if (sortField === 'modifiedAt') return mult * (a.modifiedAt.getTime() - b.modifiedAt.getTime());
      if (sortField === 'size') return mult * (a.size - b.size);
      return 0;
    });
  };

  const q = searchQuery.toLowerCase();
  const visibleFolders = applySort(
    mappedFolders.filter(f => !searchQuery || f.name.toLowerCase().includes(q))
  );
  const visibleFiles = applySort(
    mappedFiles.filter(f => !searchQuery || f.name.toLowerCase().includes(q))
  );

  const isEmpty = visibleFolders.length === 0 && visibleFiles.length === 0;

  const pageTitle = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'My Files';
  const pageSubtitle = breadcrumbs.length > 0
    ? `Inside ${breadcrumbs.map(b => b.name).join(' / ')}`
    : 'All your folders and documents in one place';


  useEffect(() => {
    void refreshFolders();
    void refreshFiles();
  }, [currentFolderId, dataVersion]);

  return (
    <div className="files-page">
      {/* Page header */}
      <div className="files-page__header">
        <div>
          <h1 className="files-page__title">{pageTitle}</h1>
          <p className="files-page__subtitle mono">{pageSubtitle}</p>
        </div>
        <FilesToolbar
          sortField={sortField}
          sortOrder={sortOrder}
          viewMode={viewMode}
          loading={foldersLoading || filesLoading}
          hasSelection={selectedIds.size > 0}
          selectionCount={selectedIds.size}
          onToggleSort={toggleSort}
          onSetViewMode={setViewMode}
          onSync={() => { void refreshFolders(); void refreshFiles(); }}
          onUpload={() => setShowUpload(true)}
          onNewFolder={() => setShowCreateFolder(true)}
          onClearSelection={clearSelection}
        />
      </div>

      <SyncBanner
        loading={foldersLoading || filesLoading}
        label="SYNCING FILES & VIRTUAL FOLDERS WITH SUPABASE..."
      />

      {/* Content */}
      <div className="files-page__content">
        {isEmpty && !searchQuery && (
          <EmptyState
            title="This folder is empty"
            subtitle="Create a folder or upload files to get started."
            icon={
              <svg width="64" height="52" viewBox="0 0 80 64" className="pixel-art" aria-hidden="true">
                <polygon points="4,8 4,6 6,6 6,4 28,4 28,6 30,6 30,8 32,8 32,16 4,16" fill="#e8d8b0" stroke="#c4a870" strokeWidth="2" />
                <rect x="4" y="14" width="72" height="44" fill="#e8d8b0" stroke="#c4a870" strokeWidth="2" />
                <text x="40" y="42" textAnchor="middle" fontSize="16" fill="#c4a870" fontFamily="monospace">?</text>
              </svg>
            }
            action={
              <button className="btn btn-primary" onClick={() => setShowCreateFolder(true)}>
                <FolderPlus size={14} /> New Folder
              </button>
            }
          />
        )}
        {isEmpty && searchQuery && (
          <EmptyState
            title={`No results for "${searchQuery}"`}
            subtitle="Try a different search term or browse manually."
          />
        )}

        {!isEmpty && (
          <>
            <FolderSection folders={visibleFolders} viewMode={viewMode} onShare={setShareFolder} />
            <FileSection files={visibleFiles} viewMode={viewMode} hasOffset={visibleFolders.length > 0} />
          </>
        )}
      </div>

      {/* Dialogs */}
      {showCreateFolder && (
        <CreateFolderDialog onClose={() => setShowCreateFolder(false)} onSuccess={refreshFolders} />
      )}
      {showUpload && (
        <UploadDialog
          onClose={() => setShowUpload(false)}
          onSuccess={() => { void refreshFolders(); void refreshFiles(); }}
        />
      )}
      {shareFolder && <ShareFolderDialog folder={shareFolder} onClose={() => setShareFolder(null)} />}
    </div>
  );
}
