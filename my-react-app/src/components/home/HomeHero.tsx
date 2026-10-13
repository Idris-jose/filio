import React from 'react';
import { FolderPlus, Upload, RefreshCw } from 'lucide-react';

interface HomeHeroProps {
  userName: string;
  loading: boolean;
  onSync: () => void;
  onUpload: () => void;
  onNewFolder: () => void;
}

export function HomeHero({ userName, loading, onSync, onUpload, onNewFolder }: HomeHeroProps) {
  return (
    <div className="home-hero">
      <div>
        <h1 className="files-page__title" style={{ fontSize: 26 }}>
          Welcome back, {userName} 👋
        </h1>
        <p className="files-page__subtitle mono">
          Real-time virtual filing system powered by Supabase.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onSync}
          title="Refresh stats from Supabase"
          disabled={loading}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span className="mono" style={{ fontSize: 11 }}>SYNC</span>
        </button>
        <button className="btn btn-secondary" onClick={onUpload}>
          <Upload size={14} /> Upload Files
        </button>
        <button className="btn btn-primary" onClick={onNewFolder}>
          <FolderPlus size={14} /> New Folder
        </button>
      </div>
    </div>
  );
}
