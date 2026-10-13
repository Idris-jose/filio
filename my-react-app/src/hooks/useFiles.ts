import { useCallback, useEffect, useState } from "react";
import {
  uploadFile as uploadFileService,
  getFiles as getFilesService,
  deleteFile as deleteFileService,
  type FolioFile,
} from "@/services/file.service";

export function useFiles(folderId: string | null = null) {
  const [files, setFiles] = useState<FolioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getFilesService(folderId);
      setFiles(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load files."
      );
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const uploadFile = async (file: File, userId?: string) => {
    const uploaded = await uploadFileService(file, folderId, userId);
    setFiles((current) => [uploaded, ...current.filter((f) => f.id !== uploaded.id)]);
    return uploaded;
  };

  const deleteFile = async (file: FolioFile) => {
    await deleteFileService(file);
    setFiles((current) => current.filter((f) => f.id !== file.id));
  };

  return {
    files,
    loading,
    error,
    refresh,
    uploadFile,
    deleteFile,
  };
}

export default useFiles;

export {
  uploadFile,
  getFiles,
  deleteFile,
  BUCKET,
  MAX_FILE_SIZE,
  type FolioFile,
} from "@/services/file.service";
