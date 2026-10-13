import React, { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Folder, FolderPath } from '../types/folder';
import type { FileItem, SortField, SortOrder, ViewMode, FilterType, UploadItem } from '../types/file';
import {
  deleteFile as deleteFileService,
  toggleStarFile as toggleStarFileService,
  renameFile as renameFileService,
  moveFile as moveFileService,
  downloadFile as downloadFileService,
} from '@/services/file.service';
import {
  createFolder as createFolderService,
  renameFolder as renameFolderService,
  deleteFolder as deleteFolderService,
  toggleStarFolder as toggleStarFolderService,
} from '@/services/folder.service';

// ─── Toast ───────────────────────────────────────────────────────────────────
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ─── App State (Only Client UI State — backend data is handled by Supabase) ────
interface AppState {
  folders: Folder[];
  files: FileItem[];
  currentFolderId: string | null;
  breadcrumbs: FolderPath[];
  viewMode: ViewMode;
  sortField: SortField;
  sortOrder: SortOrder;
  filterType: FilterType;
  searchQuery: string;
  selectedIds: Set<string>;
  toasts: Toast[];
  uploadQueue: UploadItem[];
  sidebarOpen: boolean;
  activePage: string;
  dataVersion: number;
}

interface AppContextValue extends AppState {
  // Navigation
  openFolder: (folder: Folder) => void;
  navigateTo: (folderId: string | null, breadcrumbs: FolderPath[]) => void;
  setActivePage: (page: string) => void;
  // Folders (Delegates to Supabase)
  createFolder: (name: string, parentId?: string | null) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  toggleStarFolder: (id: string, isStarred?: boolean) => Promise<void>;
  // Files (Delegates to Supabase)
  addFiles: (files?: FileItem[]) => void;
  renameFile: (id: string, name: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  toggleStarFile: (id: string, isStarred?: boolean) => Promise<void>;
  moveFile: (fileId: string, targetFolderId: string | null) => Promise<void>;
  restoreFile: (id: string) => void;
  downloadFile: (fileId: string, fileName?: string) => Promise<void>;
  // View / Sort / Filter / Search
  setViewMode: (mode: ViewMode) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setFilterType: (type: FilterType) => void;
  setSearchQuery: (q: string) => void;
  // Selection
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  // Toast
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  // Upload
  addUploadItems: (items: UploadItem[]) => void;
  updateUploadItem: (id: string, updates: Partial<UploadItem>) => void;
  removeUploadItem: (id: string) => void;
  // Sidebar
  toggleSidebar: () => void;
  // Data synchronization trigger
  triggerRefresh: () => void;
}

export const AppContext = React.createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

let toastCounter = 0;

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    folders: [],
    files: [],
    currentFolderId: null,
    breadcrumbs: [],
    viewMode: 'grid',
    sortField: 'name',
    sortOrder: 'asc',
    filterType: 'all',
    searchQuery: '',
    selectedIds: new Set(),
    toasts: [],
    uploadQueue: [],
    sidebarOpen: true,
    activePage: 'files',
    dataVersion: 0,
  });

  const triggerRefresh = useCallback(() => {
    setState(s => ({ ...s, dataVersion: s.dataVersion + 1 }));
  }, []);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = `toast-${++toastCounter}`;
    setState(s => ({ ...s, toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) }));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) }));
  }, []);

  const openFolder = useCallback((folder: Folder) => {
    setState(s => {
      const newCrumbs: FolderPath[] = folder.parentId
        ? [...s.breadcrumbs, { id: folder.id, name: folder.name }]
        : [{ id: folder.id, name: folder.name }];
      return {
        ...s,
        currentFolderId: folder.id,
        breadcrumbs: newCrumbs,
        selectedIds: new Set(),
        searchQuery: '',
        activePage: 'files',
      };
    });
  }, []);

  const navigateTo = useCallback((folderId: string | null, breadcrumbs: FolderPath[]) => {
    setState(s => ({ ...s, currentFolderId: folderId, breadcrumbs, selectedIds: new Set(), searchQuery: '' }));
  }, []);

  const setActivePage = useCallback((page: string) => {
    setState(s => ({
      ...s,
      activePage: page,
      currentFolderId: null,
      breadcrumbs: [],
      selectedIds: new Set(),
      searchQuery: '',
    }));
  }, []);

  // ─── Folders (Delegates completely to Supabase) ───────────────────────────
  const createFolder = useCallback(async (name: string, parentId: string | null = null) => {
    try {
      await createFolderService(name, parentId);
      setState(s => ({ ...s, dataVersion: s.dataVersion + 1 }));
      addToast(`Folder "${name}" created`, 'success');
    } catch (err: any) {
      console.error('Error creating folder:', err);
      addToast(err?.message || 'Failed to create folder', 'error');
      throw err;
    }
  }, [addToast]);

  const renameFolder = useCallback(async (id: string, name: string) => {
    try {
      await renameFolderService(id, name);
      setState(s => ({ ...s, dataVersion: s.dataVersion + 1 }));
      addToast(`Folder renamed to "${name}"`, 'success');
    } catch (err: any) {
      console.error('Error renaming folder:', err);
      addToast(err?.message || 'Failed to rename folder', 'error');
    }
  }, [addToast]);

  const deleteFolder = useCallback(async (id: string) => {
    try {
      await deleteFolderService(id);
      setState(s => ({
        ...s,
        dataVersion: s.dataVersion + 1,
        selectedIds: new Set([...s.selectedIds].filter(selId => selId !== id)),
      }));
      addToast('Folder moved to Trash', 'info');
    } catch (err: any) {
      console.error('Error deleting folder:', err);
      addToast(err?.message || 'Failed to delete folder', 'error');
    }
  }, [addToast]);

  const toggleStarFolder = useCallback(async (id: string, isStarred?: boolean) => {
    try {
      await toggleStarFolderService(id, isStarred);
      setState(s => ({ ...s, dataVersion: s.dataVersion + 1 }));
    } catch (err: any) {
      console.error('Error toggling folder star:', err);
      addToast('Failed to update star', 'error');
    }
  }, [addToast]);

  // ─── Files (Delegates completely to Supabase) ─────────────────────────────
  const addFiles = useCallback((_files?: FileItem[]) => {
    // Notify any listeners to refetch from Supabase
    setState(s => ({ ...s, dataVersion: s.dataVersion + 1 }));
  }, []);

  const renameFile = useCallback(async (id: string, name: string) => {
    try {
      await renameFileService(id, name);
      setState(s => ({ ...s, dataVersion: s.dataVersion + 1 }));
      addToast(`File renamed to "${name}"`, 'success');
    } catch (err: any) {
      console.error('Error renaming file:', err);
      addToast(err?.message || 'Failed to rename file', 'error');
    }
  }, [addToast]);

  const deleteFile = useCallback(async (id: string) => {
    try {
      await deleteFileService(id);
      setState(s => ({
        ...s,
        dataVersion: s.dataVersion + 1,
        selectedIds: new Set([...s.selectedIds].filter(selId => selId !== id)),
      }));
      addToast('File deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting file:', err);
      addToast(err?.message || 'Failed to delete file', 'error');
    }
  }, [addToast]);

  const toggleStarFile = useCallback(async (id: string, isStarred?: boolean) => {
    try {
      await toggleStarFileService(id, isStarred);
      setState(s => ({ ...s, dataVersion: s.dataVersion + 1 }));
    } catch (err: any) {
      console.error('Error toggling star on file:', err);
      addToast('Failed to update star', 'error');
    }
  }, [addToast]);

  const moveFile = useCallback(async (fileId: string, targetFolderId: string | null) => {
    try {
      await moveFileService(fileId, targetFolderId);
      setState(s => ({ ...s, dataVersion: s.dataVersion + 1 }));
      addToast('File moved', 'success');
    } catch (err: any) {
      console.error('Error moving file:', err);
      addToast(err?.message || 'Failed to move file', 'error');
    }
  }, [addToast]);

  const restoreFile = useCallback((_id: string) => {
    setState(s => ({ ...s, dataVersion: s.dataVersion + 1 }));
    addToast('File restored', 'success');
  }, [addToast]);

  const downloadFile = useCallback(async (fileId: string, fileName?: string) => {
    try {
      addToast('Starting download...', 'info');
      await downloadFileService(fileId, fileName);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      addToast(err?.message || 'Download failed', 'error');
    }
  }, [addToast]);

  // ─── UI State Handlers ────────────────────────────────────────────────────
  const setViewMode = useCallback((mode: ViewMode) => setState(s => ({ ...s, viewMode: mode })), []);
  const setSortField = useCallback((field: SortField) => setState(s => ({ ...s, sortField: field })), []);
  const setSortOrder = useCallback((order: SortOrder) => setState(s => ({ ...s, sortOrder: order })), []);
  const setFilterType = useCallback((type: FilterType) => setState(s => ({ ...s, filterType: type })), []);
  const setSearchQuery = useCallback((q: string) => setState(s => ({ ...s, searchQuery: q })), []);

  const toggleSelect = useCallback((id: string) => {
    setState(s => {
      const next = new Set(s.selectedIds);
      if (next.has(id)) next.delete(id); else next.add(id);
      return { ...s, selectedIds: next };
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setState(s => ({ ...s, selectedIds: new Set(ids) }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(s => ({ ...s, selectedIds: new Set() }));
  }, []);

  const addUploadItems = useCallback((items: UploadItem[]) => {
    setState(s => ({ ...s, uploadQueue: [...s.uploadQueue, ...items] }));
  }, []);

  const updateUploadItem = useCallback((id: string, updates: Partial<UploadItem>) => {
    setState(s => ({
      ...s,
      uploadQueue: s.uploadQueue.map(u => u.id === id ? { ...u, ...updates } : u),
    }));
  }, []);

  const removeUploadItem = useCallback((id: string) => {
    setState(s => ({ ...s, uploadQueue: s.uploadQueue.filter(u => u.id !== id) }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(s => ({ ...s, sidebarOpen: !s.sidebarOpen }));
  }, []);

  const value: AppContextValue = {
    ...state,
    openFolder, navigateTo, setActivePage,
    createFolder, renameFolder, deleteFolder, toggleStarFolder,
    addFiles, renameFile, deleteFile, toggleStarFile, moveFile, restoreFile, downloadFile,
    setViewMode, setSortField, setSortOrder, setFilterType, setSearchQuery,
    toggleSelect, selectAll, clearSelection,
    addToast, removeToast,
    addUploadItems, updateUploadItem, removeUploadItem,
    toggleSidebar,
    triggerRefresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
