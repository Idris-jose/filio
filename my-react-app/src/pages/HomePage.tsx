import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CreateFolderDialog } from '../components/folders/CreateFolderDialog';
import { UploadDialog } from '../components/upload/UploadDialog';
import { HomeHero } from '../components/home/HomeHero';
import { HomeStatsStrip } from '../components/home/HomeStatsStrip';
import { RecentFoldersSection } from '../components/home/RecentFoldersSection';
import { RecentFilesSection } from '../components/home/RecentFilesSection';
import { getHomeStats } from '../services/folder.service';
import type { Folder, FolderColor } from '../types/folder';
import { getFileTypeFromNameOrMime, type FileItem } from '../types/file';

export function HomePage() {
  const { dataVersion } = useApp();
  const { user } = useAuth();

  const [showCreate, setShowCreate] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    folderCount: 0,
    fileCount: 0,
    sharedCount: 0,
    starredCount: 0,
    recentFolders: [] as Folder[],
    recentFiles: [] as FileItem[],
  });

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getHomeStats();

      const mappedFolders: Folder[] = data.recentFolders.map(dbf => {
        return {
          id: dbf.id,
          name: dbf.name,
          parentId: dbf.parent_id,
          color: (dbf.color || 'amber') as FolderColor,
          fileCount: dbf.file_count ?? 0,
          size: dbf.size_bytes ?? 0,
          createdAt: dbf.created_at ? new Date(dbf.created_at) : new Date(),
          modifiedAt: dbf.updated_at ? new Date(dbf.updated_at) : new Date(),
          isStarred: Boolean(dbf.is_starred),
          isShared: false,
          sharedWith: [],
          owner: dbf.owner_id || 'Me',
          tags: [],
        };
      });

      const mappedFiles: FileItem[] = (data.recentFiles || []).map((dbf: any) => ({
        id: dbf.id,
        name: dbf.name,
        type: getFileTypeFromNameOrMime(dbf.name, dbf.mime_type),
        folderId: dbf.folder_id,
        size: dbf.size_bytes || 0,
        createdAt: dbf.created_at ? new Date(dbf.created_at) : new Date(),
        modifiedAt: dbf.updated_at ? new Date(dbf.updated_at) : new Date(),
        isStarred: Boolean(dbf.is_starred),
        isShared: false,
        sharedWith: [],
        owner: dbf.owner_id || 'Me',
        isDeleted: false,
      }));

      setStats({
        folderCount: data.folderCount,
        fileCount: data.fileCount,
        sharedCount: data.sharedCount,
        starredCount: data.starredCount,
        recentFolders: mappedFolders,
        recentFiles: mappedFiles,
      });
    } catch (err) {
      console.warn('Could not load Supabase stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchStats(); }, [fetchStats, dataVersion]);

  const userName = user?.email ? user.email.split('@')[0] : 'Operator';

  return (
    <div className="files-page">
      <HomeHero
        userName={userName}
        loading={loading}
        onSync={fetchStats}
        onUpload={() => setShowUpload(true)}
        onNewFolder={() => setShowCreate(true)}
      />

      <HomeStatsStrip
        loading={loading}
        stats={[
          { label: 'Folders', value: stats.folderCount },
          { label: 'Files', value: stats.fileCount },
          { label: 'Shared', value: stats.sharedCount },
          { label: 'Starred', value: stats.starredCount },
        ]}
      />

      <div className="files-page__content">
        <RecentFoldersSection
          folders={stats.recentFolders}
          loading={loading}
          onCreateFolder={() => setShowCreate(true)}
        />
        <RecentFilesSection files={stats.recentFiles} />
      </div>

      {showCreate && (
        <CreateFolderDialog onClose={() => setShowCreate(false)} onSuccess={fetchStats} />
      )}
      {showUpload && (
        <UploadDialog onClose={() => setShowUpload(false)} onSuccess={fetchStats} />
      )}
    </div>
  );
}
