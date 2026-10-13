import { supabase } from "@/lib/supabase";

export type FolioFile = {
  id: string;
  owner_id: string;
  folder_id: string | null;
  name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number;
  is_starred: boolean;
  created_at: string;
  updated_at: string;
};

export const BUCKET = "user-files";
export const MAX_FILE_SIZE = 50 * 1024 * 1024; 

/**
 * Upload a file to private Supabase Storage, then persist its metadata.
 */
export async function uploadFile(
  file: File,
  folderId: string | null,
  userId?: string,
): Promise<FolioFile> {
  if (!file) {
    throw new Error("Please select a file to upload.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Files must be 50 MB or smaller.");
  }

  let resolvedUserId = userId;
  if (!resolvedUserId) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Please sign in first.");
    }
    resolvedUserId = user.id;
  }

  // Use a generated object name so duplicate filenames do not overwrite files.
  const extension = file.name.includes(".")
    ? file.name.split(".").pop()
    : "";

  const objectName = extension
    ? `${crypto.randomUUID()}.${extension}`
    : crypto.randomUUID();

  // The first path segment must be the authenticated user's ID
  // to match your Storage policies.
  const storagePath = folderId
    ? `${resolvedUserId}/${folderId}/${objectName}`
    : `${resolvedUserId}/${objectName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Persist metadata only after Storage confirms the upload.
  const { data, error: metadataError } = await supabase
    .from("files")
    .insert({
      owner_id: resolvedUserId,
      folder_id: folderId,
      name: file.name,
      storage_path: storagePath,
      mime_type: file.type || null,
      size_bytes: file.size,
      is_starred: false,
    })
    .select("*")
    .single();

  if (metadataError) {
    // Best-effort rollback: avoid leaving an unlisted object behind.
    const { error: cleanupError } = await supabase.storage
      .from(BUCKET)
      .remove([storagePath]);

    if (cleanupError) {
      console.error(
        "Metadata save failed and Storage cleanup also failed:",
        cleanupError.message,
      );
    }

    throw new Error(`Could not save file details: ${metadataError.message}`);
  }

  return data as FolioFile;
}

/**
 * Get the files directly inside a folder.
 * Pass null to get files in the root.
 */
export async function getFiles(
  folderId: string | null,
): Promise<FolioFile[]> {
  let query = supabase
    .from("files")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  query = folderId === null
    ? query.is("folder_id", null)
    : query.eq("folder_id", folderId);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Could not load files: ${error.message}`);
  }

  return (data ?? []) as FolioFile[];
}

/**
 * Permanently delete the Storage object and its database row.
 */
export async function deleteFile(file: FolioFile | string): Promise<void> {
  let fileId: string;
  let storagePath: string | null = null;

  if (typeof file === "string") {
    fileId = file;
    const { data, error } = await supabase
      .from("files")
      .select("storage_path")
      .eq("id", fileId)
      .maybeSingle();

    if (error) {
      throw new Error(`Could not find file to delete: ${error.message}`);
    }
    storagePath = data?.storage_path ?? null;
  } else {
    fileId = file.id;
    storagePath = file.storage_path;
  }

  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([storagePath]);

    if (storageError) {
      throw new Error(`Could not delete file from storage: ${storageError.message}`);
    }
  }

  const { error: metadataError } = await supabase
    .from("files")
    .delete()
    .eq("id", fileId);

  if (metadataError) {
    throw new Error(
      `The file database record could not be deleted: ${metadataError.message}`,
    );
  }
}

/**
 * Toggle the is_starred status of a file.
 */
export async function toggleStarFile(fileId: string, isStarred?: boolean): Promise<FolioFile> {
  let targetStar = isStarred;
  if (targetStar === undefined) {
    const { data: current } = await supabase
      .from("files")
      .select("is_starred")
      .eq("id", fileId)
      .single();
    targetStar = !current?.is_starred;
  }

  const { data, error } = await supabase
    .from("files")
    .update({
      is_starred: targetStar,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fileId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Could not update star status: ${error.message}`);
  }

  return data as FolioFile;
}

/**
 * Get all starred files.
 */
export async function getStarredFiles(): Promise<FolioFile[]> {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("is_starred", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as FolioFile[];
}

/**
 * Get recent files.
 */
export async function getRecentFiles(limit = 20): Promise<FolioFile[]> {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as FolioFile[];
}

/**
 * Get files in trash.
 */
export async function getTrashFiles(): Promise<FolioFile[]> {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as FolioFile[];
}


/**
 * Rename a file.
 */
export async function renameFile(fileId: string, name: string): Promise<FolioFile> {
  const { data, error } = await supabase
    .from("files")
    .update({
      name: name.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", fileId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Could not rename file: ${error.message}`);
  }

  return data as FolioFile;
}

/**
 * Move a file to another folder (or root).
 */
export async function moveFile(fileId: string, targetFolderId: string | null): Promise<FolioFile> {
  const { data, error } = await supabase
    .from("files")
    .update({
      folder_id: targetFolderId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fileId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Could not move file: ${error.message}`);
  }

  return data as FolioFile;
}

/**
 * Download a file from private storage.
 */
export async function downloadFile(fileId: string, fallbackName?: string): Promise<void> {
  const { data, error } = await supabase
    .from("files")
    .select("storage_path, name")
    .eq("id", fileId)
    .single();

  if (error || !data) {
    throw new Error(`Could not find file: ${error?.message || 'File not found'}`);
  }

  const { data: blob, error: downloadError } = await supabase.storage
    .from(BUCKET)
    .download(data.storage_path);

  if (downloadError || !blob) {
    throw new Error(`Download failed: ${downloadError?.message || 'Could not retrieve file'}`);
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = data.name || fallbackName || "download";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

