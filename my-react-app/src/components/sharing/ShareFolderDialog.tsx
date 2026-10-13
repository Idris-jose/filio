import React, { useState } from 'react';
import { X, Link, Copy, UserPlus, Trash2 } from 'lucide-react';
import type { Folder } from '../../types/folder';
import type { SharedUser } from '../../types/file';

interface ShareFolderDialogProps {
  folder: Folder;
  onClose: () => void;
}

type Role = 'viewer' | 'editor' | 'uploader';

const roleLabels: Record<Role, string> = {
  viewer: 'Viewer',
  editor: 'Editor',
  uploader: 'Uploader',
};

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

export function ShareFolderDialog({ folder, onClose }: ShareFolderDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('viewer');
  const [shared, setShared] = useState<SharedUser[]>(folder.sharedWith);
  const [copied, setCopied] = useState(false);
  const [emailError, setEmailError] = useState('');

  const shareLink = `${window.location.origin}/share/${folder.id}`;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setEmailError('Enter a valid email address'); return; }
    const newUser: SharedUser = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      addedAt: new Date(),
    };
    setShared(s => [...s, newUser]);
    setEmail('');
    setEmailError('');
  };

  const handleRevoke = (id: string) => {
    setShared(s => s.filter(u => u.id !== id));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={`Share folder: ${folder.name}`}>
      <div className="dialog card" style={{ width: 460, padding: 0, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Title bar */}
        <div className="dialog__titlebar">
          <span className="dialog__title">Share "{folder.name}"</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close"><X size={14} /></button>
        </div>

        <div style={{ overflowY: 'auto', padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Invite form */}
          <form onSubmit={handleInvite}>
            <p className="dialog__section-label">Invite people</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                className="input"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                style={{ flex: 1 }}
              />
              <select
                className="input"
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                style={{ width: 120 }}
                aria-label="Permission role"
              >
                {Object.entries(roleLabels).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                <UserPlus size={14} /> Invite
              </button>
            </div>
            {emailError && <p className="dialog__error" role="alert" style={{ marginTop: 6 }}>{emailError}</p>}
          </form>

          {/* People with access */}
          {shared.length > 0 && (
            <div>
              <p className="dialog__section-label">People with access</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {shared.map(user => (
                  <div key={user.id} className="share-user-row">
                    <div className="share-user-avatar">{getInitials(user.name)}</div>
                    <div className="share-user-info">
                      <span className="share-user-name">{user.name}</span>
                      <span className="mono" style={{ fontSize: 11 }}>{user.email}</span>
                    </div>
                    <span className="badge">{roleLabels[user.role]}</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleRevoke(user.id)}
                      aria-label={`Revoke access for ${user.name}`}
                      title="Revoke access"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Copy link */}
          <div>
            <p className="dialog__section-label">Share link</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
              <div className="share-link-box">
                <Link size={12} style={{ flexShrink: 0 }} />
                <span className="mono" style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {shareLink}
                </span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleCopyLink} style={{ whiteSpace: 'nowrap' }}>
                <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="mono" style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
              Anyone with this link will have view access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
