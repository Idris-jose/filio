import React from 'react';
import { useApp } from '../../context/AppContext';

interface StorageUsageProps {
  total?: number; // bytes
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 MB';
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export function StorageUsage({ total = 50_000_000_000 }: StorageUsageProps) {
  const { files } = useApp();
  const used = files.filter(f => !f.isDeleted).reduce((sum, f) => sum + f.size, 0);
  const pct = Math.min((used / total) * 100, 100);
  const isWarning = pct > 80;

  return (
    <div className="storage-usage">
      <div className="storage-usage__label">
        <span>Storage</span>
        <span className="mono">{formatBytes(used)} / {formatBytes(total)}</span>
      </div>
      <div className="storage-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Storage: ${pct.toFixed(0)}% used`}>
        <div
          className={`storage-bar__fill ${isWarning ? 'storage-bar__fill--warning' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mono" style={{ fontSize: 10, color: 'var(--color-sidebar-text-muted)', marginTop: 2 }}>
        {formatBytes(total - used)} available
      </p>
    </div>
  );
}
