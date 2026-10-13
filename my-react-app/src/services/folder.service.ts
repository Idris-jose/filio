
import { supabase } from "@/lib/supabase";

export type Folder = {
  id: string;
  owner_id: string;
  parent_id: string | null;
  name: string;
  color: string;
  is_starred: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  file_count?: number;
  size_bytes?: number;
};

export async function getFolders(parentId: string | null = null) {
  let query = supabase
    .from("folders")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  query = parentId === null
    ? query.is("parent_id", null)
    : query.eq("parent_id", parentId);

  const { data, error } = await query;

  if (error) throw error;
  const folders = (data ?? []) as Folder[];

  try {
    const { data: filesData } = await supabase
      .from("files")
      .select("folder_id, size_bytes")
      .is("deleted_at", null);

    if (filesData && filesData.length > 0) {
      const statsMap = new Map<string, { count: number; size: number }>();
      for (const f of filesData) {
        if (!f.folder_id) continue;
        const current = statsMap.get(f.folder_id) || { count: 0, size: 0 };
        current.count += 1;
        current.size += (f.size_bytes || 0);
        statsMap.set(f.folder_id, current);
      }

      return folders.map(folder => {
        const stats = statsMap.get(folder.id);
        return {
          ...folder,
          file_count: stats?.count ?? 0,
          size_bytes: stats?.size ?? 0,
        };
      });
    }
  } catch {
    // Graceful fallback
  }

  return folders;
}

export async function createFolder(
  name: string,
  parentId: string | null = null
) {
  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("Please sign in first.");

  const { data, error } = await supabase
    .from("folders")
    .insert({
      name: name.trim(),
      owner_id: user.id,
      parent_id: parentId,
    })
    .select()
    .single();

  if (error) throw error;

  return data as Folder;
}

export async function renameFolder(
  folderId: string,
  name: string
) {
  const { data, error } = await supabase
    .from("folders")
    .update({
      name: name.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", folderId)
    .select()
    .single();

  if (error) throw error;

  return data as Folder;
}

export async function deleteFolder(folderId: string) {
  const { error } = await supabase
    .from("folders")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", folderId);

  if (error) throw error;
}

export async function toggleStarFolder(folderId: string, isStarred?: boolean) {
  let targetStar = isStarred;
  if (targetStar === undefined) {
    const { data: current } = await supabase
      .from("folders")
      .select("is_starred")
      .eq("id", folderId)
      .single();
    targetStar = !current?.is_starred;
  }

  const { data, error } = await supabase
    .from("folders")
    .update({
      is_starred: targetStar,
      updated_at: new Date().toISOString(),
    })
    .eq("id", folderId)
    .select()
    .single();

  if (error) throw error;
  return data as Folder;
}

export async function getStarredFolders(): Promise<Folder[]> {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("is_starred", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Folder[];
}

export async function getRecentFolders(limit = 8): Promise<Folder[]> {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Folder[];
}

export async function getTrashFolders(): Promise<Folder[]> {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Folder[];
}



export async function getAllFolders() {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data as Folder[];
}

export async function getHomeStats() {
  const { data: foldersData, error: foldersError } = await supabase
    .from("folders")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (foldersError) throw foldersError;

  const folders = (foldersData || []) as Folder[];

  let files: any[] = [];
  try {
    const { data: filesData } = await supabase
      .from("files")
      .select("*")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (filesData) files = filesData;
  } catch {
    // Graceful fallback if files table is not yet created
  }

  const statsMap = new Map<string, { count: number; size: number }>();
  for (const f of files) {
    if (!f.folder_id) continue;
    const current = statsMap.get(f.folder_id) || { count: 0, size: 0 };
    current.count += 1;
    current.size += (f.size_bytes || 0);
    statsMap.set(f.folder_id, current);
  }

  const enrichedFolders = folders.map(folder => {
    const stats = statsMap.get(folder.id);
    return {
      ...folder,
      file_count: stats?.count ?? 0,
      size_bytes: stats?.size ?? 0,
    };
  });

  return {
    folderCount: folders.length,
    starredCount: folders.filter((f) => f.is_starred).length,
    fileCount: files.length,
    sharedCount: 0,
    recentFolders: enrichedFolders.slice(0, 4),
    recentFiles: files.slice(0, 5),
  };
}
