import React from 'react';
import { FolderCard } from '../folders/FolderCard';
import { FolderListRow } from '../folders/FolderListRow';
import type { Folder } from '../../types/folder';

interface FolderSectionProps {
  folders: Folder[];
  viewMode: 'grid' | 'list';
  onShare: (f: Folder) => void;
}

export function FolderSection({ folders, viewMode, onShare }: FolderSectionProps) {
  if (folders.length === 0) return null;

  return (
    <section aria-label="Folders">
      <h2 className="section-heading">Folders</h2>
      {viewMode === 'grid' ? (
        <div className="folder-grid">
          {folders.map(folder => (
            <FolderCard key={folder.id} folder={folder} onShare={onShare} />
          ))}
        </div>
      ) : (
        <table className="file-list-table" aria-label="Folders">
          <thead>
            <tr>
              <th className="file-list-th">Name</th>
              <th className="file-list-th">Files</th>
              <th className="file-list-th">Size</th>
              <th className="file-list-th">Modified</th>
              <th className="file-list-th" />
            </tr>
          </thead>
          <tbody>
            {folders.map(folder => (
              <FolderListRow key={folder.id} folder={folder} onShare={onShare} />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
