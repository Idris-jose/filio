import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FileCard } from '../components/files/FileCard';
import { Trash2, Loader2 } from 'lucide-react';
import { getTrashFiles } from '../services/file.service';
import { getFileTypeFromNameOrMime, type FileItem } from '../types/file';

export function TrashPage() {
  const { addToast, dataVersion } = useApp();
  const [deletedFiles, setDeletedFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrash() {
      try {
        setLoading(true);
        const dbFiles = await getTrashFiles();
        setDeletedFiles(dbFiles.map(dbf => ({
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
          isDeleted: true,
        })));
      } catch (err) {
        console.warn('Could not load trash items:', err);
      } finally {
        setLoading(false);
      }
    }

    void loadTrash();
  }, [dataVersion]);

  const isEmpty = !loading && deletedFiles.length === 0;

  return (
    <div className="files-page">
      <div className="files-page__header">
        <div>
          <h1 className="files-page__title">Trash</h1>
          <p className="files-page__subtitle mono">Items deleted in the last 30 days</p>
        </div>
        {deletedFiles.length > 0 && (
          <div className="files-page__toolbar">
            <button
              className="btn btn-danger btn-sm"
              onClick={() => addToast('Trash emptied', 'info')}
            >
              <Trash2 size={13} /> Empty Trash
            </button>
          </div>
        )}
      </div>

      <div className="files-page__content">
        {loading && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px' }} />
            <p className="mono" style={{ fontSize: 13 }}>Loading trash...</p>
          </div>
        )}
        {isEmpty && (
          <div className="empty-state">
            <div className="empty-state__icon">
              <Trash2 size={48} color="var(--color-border-muted)" />
            </div>
            <h3 className="empty-state__title">Trash is empty</h3>
            <p className="empty-state__subtitle">Deleted files will appear here for 30 days.</p>
          </div>
        )}
        {deletedFiles.length > 0 && (
          <table className="file-list-table" aria-label="Deleted files">
            <thead><tr>
              <th className="file-list-th">Name</th>
              <th className="file-list-th">Type</th>
              <th className="file-list-th">Size</th>
              <th className="file-list-th">Modified</th>
              <th className="file-list-th" />
            </tr></thead>
            <tbody>
              {deletedFiles.map(f => <FileCard key={f.id} file={f} viewMode="list" />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
