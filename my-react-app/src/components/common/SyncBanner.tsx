import React from 'react';
import { Loader2 } from 'lucide-react';

interface SyncBannerProps {
  loading: boolean;
  label?: string;
}

export function SyncBanner({ loading, label = 'SYNCING WITH SUPABASE...' }: SyncBannerProps) {
  if (!loading) return null;
  return (
    <div style={{
      padding: '6px 24px',
      background: 'var(--color-bg-muted)',
      borderBottom: '1px solid var(--color-border-subtle)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      color: 'var(--color-text-muted)',
    }}>
      <Loader2 size={12} className="spin" />
      <span>{label}</span>
    </div>
  );
}
