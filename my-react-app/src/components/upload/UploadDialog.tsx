import React, { useCallback, useRef, useState } from 'react';
import { X, Upload, File as FileIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { UploadItem } from '../../types/file';
import type { FileType } from '../../types/file';

import { uploadFile } from '@/services/file.service';

interface UploadDialogProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png', 'image/jpeg', 'application/zip', 'text/plain',
  'image/svg+xml', 'video/mp4'];
const MAX_SIZE_MB = 50;

function getFileType(mimeType: string): FileType {
  const map: Record<string, FileType> = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'application/zip': 'zip',
    'text/plain': 'txt',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
  };
  return map[mimeType] || 'txt';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

let itemCounter = 500;

export function UploadDialog({ onClose, onSuccess }: UploadDialogProps) {
  const { addUploadItems, updateUploadItem, removeUploadItem, uploadQueue, currentFolderId, addFiles, addToast } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((rawFiles: FileList | null) => {
    if (!rawFiles) return;
    const items: UploadItem[] = [];

    Array.from(rawFiles).forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        addToast(`${file.name}: unsupported file type`, 'error');
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        addToast(`${file.name}: exceeds ${MAX_SIZE_MB} MB limit`, 'error');
        return;
      }
      items.push({
        id: `upload-${++itemCounter}`,
        file,
        progress: 0,
        status: 'pending',
        folderId: currentFolderId,
      });
    });

    addUploadItems(items);
  }, [addUploadItems, currentFolderId, addToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const performUpload = useCallback(async (item: UploadItem) => {
    updateUploadItem(item.id, { status: 'uploading', progress: 40 });
    try {
      const folioFile = await uploadFile(item.file, item.folderId);
      updateUploadItem(item.id, { status: 'success', progress: 100 });
      addFiles([{
        id: folioFile.id,
        name: folioFile.name,
        type: getFileType(item.file.type),
        folderId: folioFile.folder_id,
        size: folioFile.size_bytes,
        createdAt: new Date(folioFile.created_at),
        modifiedAt: new Date(folioFile.updated_at),
        isStarred: folioFile.is_starred,
        isShared: false,
        sharedWith: [],
        owner: folioFile.owner_id || 'Me',
        isDeleted: false,
      }]);
      addToast(`${item.file.name} uploaded successfully`, 'success');
      onSuccess?.();
    } catch (err: any) {
      const errorMsg = err?.message || 'Upload failed';
      updateUploadItem(item.id, { status: 'error', error: errorMsg });
      addToast(`${item.file.name}: ${errorMsg}`, 'error');
    }
  }, [updateUploadItem, addFiles, addToast, onSuccess]);

  const handleUploadAll = () => {
    uploadQueue.filter(i => i.status === 'pending').forEach(performUpload);
  };

  const pendingQueue = uploadQueue.filter(i => i.folderId === currentFolderId || !i.folderId);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Upload files">
      <div className="dialog card" style={{ width: 520, padding: 0, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div className="dialog__titlebar">
          <span className="dialog__title">Upload Files</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close"><X size={14} /></button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          {/* Dropzone */}
          <div
            className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
            aria-label="Drop files here or click to browse"
          >
            <Upload size={32} className="upload-dropzone__icon" />
            <p className="upload-dropzone__title">Drop files here or click to browse</p>
            <p className="upload-dropzone__hint mono">PDF, DOCX, XLSX, PNG, JPG, ZIP, TXT, SVG, MP4 — max {MAX_SIZE_MB} MB</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              accept={ALLOWED_TYPES.join(',')}
              onChange={e => processFiles(e.target.files)}
            />
          </div>

          {/* Queue */}
          {pendingQueue.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <p className="dialog__section-label">Upload Queue ({pendingQueue.length})</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleUploadAll}
                  disabled={pendingQueue.every(i => i.status !== 'pending')}
                >
                  <Upload size={12} /> Upload All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pendingQueue.map(item => (
                  <div key={item.id} className="upload-queue-item">
                    <FileIcon size={16} style={{ flexShrink: 0, color: 'var(--color-text-muted)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="upload-filename" title={item.file.name}>{item.file.name}</span>
                        <span className="mono">{formatSize(item.file.size)}</span>
                      </div>
                      {item.status === 'uploading' && (
                        <div className="upload-progress-bar">
                          <div className="upload-progress-fill" style={{ width: `${item.progress}%` }} />
                        </div>
                      )}
                      {item.status === 'success' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle size={12} color="var(--color-success)" />
                          <span className="mono" style={{ color: 'var(--color-success)', fontSize: 11 }}>Uploaded</span>
                        </div>
                      )}
                      {item.status === 'error' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <AlertCircle size={12} color="var(--color-error)" />
                          <span className="mono" style={{ color: 'var(--color-error)', fontSize: 11 }}>{item.error}</span>
                        </div>
                      )}
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeUploadItem(item.id)}
                      aria-label="Remove from queue"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            ✦ Uploaded directly to Supabase Storage &amp; synchronized with your files table.
          </p>
        </div>

        <div className="dialog__footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
