import React from 'react';
import { useApp } from '../../context/AppContext';
import type { FolderPath } from '../../types/folder';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const { breadcrumbs, navigateTo, currentFolderId } = useApp();

  const handleRoot = () => navigateTo(null, []);

  const handleCrumb = (crumb: FolderPath, index: number) => {
    const newCrumbs = breadcrumbs.slice(0, index + 1);
    navigateTo(crumb.id, newCrumbs);
  };

  return (
    <nav className="breadcrumbs" aria-label="File location">
      <button
        className="breadcrumb-item breadcrumb-item--home"
        onClick={handleRoot}
        aria-label="Go to root"
        aria-current={currentFolderId === null ? 'page' : undefined}
      >
        <Home size={13} />
        <span>My Files</span>
      </button>
      {breadcrumbs.map((crumb, i) => (
        <React.Fragment key={crumb.id}>
          <ChevronRight size={12} className="breadcrumb-sep" aria-hidden="true" />
          <button
            className="breadcrumb-item"
            onClick={() => handleCrumb(crumb, i)}
            aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}
          >
            {crumb.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}
