import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CreateFolderDialogProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateFolderDialog({ onClose, onSuccess }: CreateFolderDialogProps) {
  const { createFolder, currentFolderId } = useApp();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Folder name cannot be empty');
      return;
    }
    if (trimmed.length > 64) {
      setError('Folder name must be 64 characters or fewer');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await createFolder(trimmed, currentFolderId);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Create new folder">
      <div className="dialog card" style={{ width: 380, padding: 0 }}>
        {/* Title bar */}
        <div className="dialog__titlebar">
          <span className="dialog__title">New Folder</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close dialog" disabled={isSubmitting}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          <label className="dialog__label" htmlFor="folder-name-input">
            Folder Name
          </label>
          <input
            ref={inputRef}
            id="folder-name-input"
            className="input"
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="e.g. Retro Assets"
            maxLength={64}
            autoComplete="off"
            disabled={isSubmitting}
            style={{ marginTop: 8 }}
          />
          {error && <p className="dialog__error" role="alert">{error}</p>}

          <div className="dialog__actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Loader2 size={13} className="spin" /> Creating...
                </span>
              ) : (
                'Create Folder'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
