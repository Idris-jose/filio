import React from 'react';
import { Clock, FolderPlus } from 'lucide-react';
import { FolderCard } from '../folders/FolderCard';
import type { Folder } from '../../types/folder';

interface RecentFoldersSectionProps {
  folders: Folder[];
  loading: boolean;
  onCreateFolder: () => void;
}

export function RecentFoldersSection({ folders, loading, onCreateFolder }: RecentFoldersSectionProps) {
  if (loading) return null;

  if (folders.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '36px 20px' }}>
        <div className="empty-state__icon">
          <FolderPlus size={36} color="var(--color-folder-amber)" />
        </div>
        <h3 className="empty-state__title">No Folders Yet</h3>
        <p className="empty-state__subtitle">
          Create your first virtual folder to see it synchronized with Supabase.
        </p>
        <div className="empty-state__action">
          <button className="btn btn-primary" onClick={onCreateFolder}>
            <FolderPlus size={14} /> Create First Folder
          </button>
        </div>
      </div>
    );
  }

  return (
    <section>
      <h2 className="section-heading">
        <Clock size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
        Recent Folders
      </h2>
      <div className="folder-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {folders.map(f => (
          <FolderCard key={f.id} folder={f} />
        ))}
      </div>
    </section>
  );
}
