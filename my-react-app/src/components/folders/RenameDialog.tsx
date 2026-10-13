import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface RenameDialogProps {
  currentName: string;
  type: 'folder' | 'file';
  onRename: (name: string) => void;
  onClose: () => void;
}

export function RenameDialog({ currentName, type, onRename, onClose }: RenameDialogProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Name cannot be empty'); return; }
    if (trimmed.length > 128) { setError('Name must be 128 characters or fewer'); return; }
    onRename(trimmed);
    onClose();
  };

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={`Rename ${type}`}>
      <div className="dialog card" style={{ width: 380, padding: 0 }}>
        <div className="dialog__titlebar">
          <span className="dialog__title">Rename {type === 'folder' ? 'Folder' : 'File'}</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            <X size={14} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          <label className="dialog__label" htmlFor="rename-input">New name</label>
          <input
            ref={inputRef}
            id="rename-input"
            className="input"
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            maxLength={128}
            autoComplete="off"
            style={{ marginTop: 8 }}
          />
          {error && <p className="dialog__error" role="alert">{error}</p>}
          <div className="dialog__actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Rename</button>
          </div>
        </form>
      </div>
    </div>
  );
}
