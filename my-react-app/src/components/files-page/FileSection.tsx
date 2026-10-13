import React from 'react';
import { FileCard } from '../files/FileCard';
import type { FileItem } from '../../types/file';

interface FileSectionProps {
  files: FileItem[];
  viewMode: 'grid' | 'list';
  /** Extra top margin when rendered after a folders section */
  hasOffset?: boolean;
}

export function FileSection({ files, viewMode, hasOffset = false }: FileSectionProps) {
  if (files.length === 0) return null;

  return (
    <section aria-label="Files" style={{ marginTop: hasOffset ? 32 : 0 }}>
      <h2 className="section-heading">Files</h2>
      {viewMode === 'grid' ? (
        <div className="file-grid">
          {files.map(file => (
            <FileCard key={file.id} file={file} viewMode="grid" />
          ))}
        </div>
      ) : (
        <table className="file-list-table" aria-label="Files">
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
            {files.map(file => (
              <FileCard key={file.id} file={file} viewMode="list" />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
