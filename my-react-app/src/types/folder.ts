// ─── Folder Types ────────────────────────────────────────────────────────────
import type { SharedUser } from './file';

export type FolderColor = 'amber' | 'orange' | 'golden' | 'cream' | 'brown';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color: FolderColor;
  fileCount: number;
  size: number; // bytes
  createdAt: Date;
  modifiedAt: Date;
  isStarred: boolean;
  isShared: boolean;
  sharedWith: SharedUser[];
  owner: string;
  tags: string[];
}

export interface FolderPath {
  id: string;
  name: string;
}
