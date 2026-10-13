import React from 'react';
import { FileCard } from '../files/FileCard';
import type { FileItem } from '../../types/file';

interface RecentFilesSectionProps {
  files: FileItem[];
}

export function RecentFilesSection({ files }: RecentFilesSectionProps) {
  if (files.length === 0) return null;

  return (
    <section style={{ marginTop: 32 }}>
      <h2 className="section-heading">Recent Files</h2>
      <table className="file-list-table">
        <thead>
          <tr>
            <th className="file-list-th">Name</th>
            <th className="file-list-th">Type</th>
            <th className="file-list-th">Size</th>
            <th className="file-list-th">Modified</th>
            <th className="file-list-th" />
          </tr>
        </thead>
        <tbody>
          {files.map(f => (
            <FileCard key={f.id} file={f} viewMode="list" />
          ))}
        </tbody>
      </table>
    </section>
  );
}
