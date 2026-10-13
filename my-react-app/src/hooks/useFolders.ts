import { useCallback, useEffect, useState } from "react";
import {
  createFolder as createFolderService,
  getFolders,
  renameFolder as renameFolderService,
  deleteFolder as deleteFolderService,
  type Folder,
} from "@/services/folder.service";

export function useFolders(parentId: string | null = null) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getFolders(parentId);
      setFolders(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load folders."
      );
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addFolder = async (name: string) => {
    const folder = await createFolderService(name, parentId);
    setFolders((current) => [...current, folder]);
    return folder;
  };

  const renameFolder = async (folderId: string, name: string) => {
    const updated = await renameFolderService(folderId, name);
    setFolders((current) =>
      current.map((f) => (f.id === folderId ? updated : f))
    );
    return updated;
  };

  const deleteFolder = async (folderId: string) => {
    await deleteFolderService(folderId);
    setFolders((current) => current.filter((f) => f.id !== folderId));
  };

  return {
    folders,
    loading,
    error,
    refresh,
    addFolder,
    renameFolder,
    deleteFolder,
  };
}

export type { Folder };
