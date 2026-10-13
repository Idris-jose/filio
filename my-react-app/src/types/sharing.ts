import type { SharedUser } from './file';

export type Permission = 'viewer' | 'editor' | 'uploader';

export interface ShareLink {
  id: string;
  url: string;
  permission: Permission;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface ShareConfig {
  resourceId: string;
  resourceType: 'folder' | 'file';
  sharedWith: SharedUser[];
  shareLinks: ShareLink[];
  isPublic: boolean;
}

export { type SharedUser };
