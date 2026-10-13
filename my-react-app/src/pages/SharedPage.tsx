import React from 'react';
import { useApp } from '../context/AppContext';
import { FolderCard } from '../components/folders/FolderCard';
import { FileCard } from '../components/files/FileCard';

export function SharedPage() {
  const { folders, files } = useApp();
  const sharedFolders = folders.filter(f => f.isShared);
  const sharedFiles = files.filter(f => f.isShared && !f.isDeleted);

  return (
    <div className="files-page">
      <div className="files-page__header">
        <div>
          <h1 className="files-page__title">Shared With Me</h1>
          <p className="files-page__subtitle mono">Folders and files shared with collaborators</p>
        </div>
      </div>
      <div className="files-page__content">
        {sharedFolders.length > 0 && (
          <section>
            <h2 className="section-heading">Shared Folders</h2>
            <div className="folder-grid">
              {sharedFolders.map(f => <FolderCard key={f.id} folder={f} />)}
            </div>
          </section>
        )}
        {sharedFiles.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <h2 className="section-heading">Shared Files</h2>
            <table className="file-list-table">
              <thead><tr>
                <th className="file-list-th">Name</th>
                <th className="file-list-th">Type</th>
                <th className="file-list-th">Size</th>
                <th className="file-list-th">Modified</th>
                <th className="file-list-th" />
              </tr></thead>
              <tbody>
                {sharedFiles.map(f => <FileCard key={f.id} file={f} viewMode="list" />)}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}
