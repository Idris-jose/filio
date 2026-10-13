// ─── File Types ──────────────────────────────────────────────────────────────

export type FileType = 'pdf' | 'docx' | 'xlsx' | 'png' | 'jpg' | 'zip' | 'txt' | 'mp4' | 'psd' | 'fig' | 'svg';

export function getFileTypeFromNameOrMime(name: string, mime?: string | null): FileType {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const validExts: Record<string, FileType> = {
    pdf: 'pdf',
    docx: 'docx',
    doc: 'docx',
    xlsx: 'xlsx',
    xls: 'xlsx',
    csv: 'xlsx',
    png: 'png',
    jpg: 'jpg',
    jpeg: 'jpg',
    webp: 'png',
    gif: 'png',
    zip: 'zip',
    rar: 'zip',
    '7z': 'zip',
    tar: 'zip',
    gz: 'zip',
    txt: 'txt',
    md: 'txt',
    json: 'txt',
    js: 'txt',
    ts: 'txt',
    tsx: 'txt',
    jsx: 'txt',
    html: 'txt',
    css: 'txt',
    mp4: 'mp4',
    mov: 'mp4',
    avi: 'mp4',
    webm: 'mp4',
    psd: 'psd',
    fig: 'fig',
    svg: 'svg',
  };

  if (validExts[ext]) return validExts[ext];
  if (mime) {
    if (mime.includes('pdf')) return 'pdf';
    if (mime.includes('sheet') || mime.includes('excel')) return 'xlsx';
    if (mime.includes('word') || mime.includes('document')) return 'docx';
    if (mime.includes('svg')) return 'svg';
    if (mime.includes('image/')) return 'png';
    if (mime.includes('video/')) return 'mp4';
    if (mime.includes('zip') || mime.includes('compressed')) return 'zip';
  }
  return 'txt';
}

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  folderId: string | null;
  size: number; // bytes
  createdAt: Date;
  modifiedAt: Date;
  isStarred: boolean;
  isShared: boolean;
  sharedWith: SharedUser[];
  owner: string;
  thumbnailUrl?: string;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  folderId: string | null;
}

export interface SharedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'viewer' | 'editor' | 'uploader';
  addedAt: Date;
}

export type SortField = 'name' | 'modifiedAt' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'grid' | 'list';
export type FilterType = 'all' | 'folders' | 'files' | FileType;
