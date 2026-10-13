import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FileCard } from '../components/files/FileCard';
import { FolderCard } from '../components/folders/FolderCard';
import { Star, Loader2 } from 'lucide-react';
import { getStarredFolders } from '../services/folder.service';
import { getStarredFiles } from '../services/file.service';
import type { Folder, FolderColor } from '../types/folder';
import { getFileTypeFromNameOrMime, type FileItem } from '../types/file';

export function StarredPage() {
  const { dataVersion } = useApp();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStarred() {
      try {
        setLoading(true);
        const [dbFolders, dbFiles] = await Promise.all([
          getStarredFolders(),
          getStarredFiles(),
        ]);

        setFolders(dbFolders.map(dbf => ({
          id: dbf.id,
          name: dbf.name,
          parentId: dbf.parent_id,
          color: (dbf.color || 'amber') as FolderColor,
          fileCount: dbf.file_count ?? 0,
          size: dbf.size_bytes ?? 0,
          createdAt: dbf.created_at ? new Date(dbf.created_at) : new Date(),
          modifiedAt: dbf.updated_at ? new Date(dbf.updated_at) : new Date(),
          isStarred: true,
          isShared: false,
          sharedWith: [],
          owner: dbf.owner_id || 'Me',
          tags: [],
        })));

        setFiles(dbFiles.map(dbf => ({
          id: dbf.id,
          name: dbf.name,
          type: getFileTypeFromNameOrMime(dbf.name, dbf.mime_type),
          folderId: dbf.folder_id,
          size: dbf.size_bytes,
          createdAt: dbf.created_at ? new Date(dbf.created_at) : new Date(),
          modifiedAt: dbf.updated_at ? new Date(dbf.updated_at) : new Date(),
          isStarred: true,
          isShared: false,
          sharedWith: [],
          owner: dbf.owner_id || 'Me',
          isDeleted: false,
        })));
      } catch (err) {
        console.warn('Could not load starred items:', err);
      } finally {
        setLoading(false);
      }
    }

    void loadStarred();
  }, [dataVersion]);

  const isEmpty = !loading && folders.length === 0 && files.length === 0;

  return (
    <div className="files-page">
      <div className="files-page__header">
        <div>
          <h1 className="files-page__title">Starred</h1>
          <p className="files-page__subtitle mono">Items you've starred for quick access</p>
        </div>
      </div>
      <div className="files-page__content">
        {loading && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px' }} />
            <p className="mono" style={{ fontSize: 13 }}>Loading starred items...</p>
          </div>
        )}
        {isEmpty && (
          <div className="empty-state">
            <div className="empty-state__icon">
              <Star size={48} color="var(--color-border-muted)" />
            </div>
            <h3 className="empty-state__title">No starred items</h3>
            <p className="empty-state__subtitle">Star folders and files to find them quickly here.</p>
          </div>
        )}
        {folders.length > 0 && (
          <section aria-label="Starred folders">
            <h2 className="section-heading">Starred Folders</h2>
            <div className="folder-grid">
              {folders.map(f => <FolderCard key={f.id} folder={f} />)}
            </div>
          </section>
        )}
        {files.length > 0 && (
          <section aria-label="Starred files" style={{ marginTop: 32 }}>
            <h2 className="section-heading">Starred Files</h2>
            <table className="file-list-table">
              <thead><tr>
                <th className="file-list-th">Name</th>
                <th className="file-list-th">Type</th>
                <th className="file-list-th">Size</th>
                <th className="file-list-th">Modified</th>
                <th className="file-list-th" />
              </tr></thead>
              <tbody>
                {files.map(f => <FileCard key={f.id} file={f} viewMode="list" />)}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}
