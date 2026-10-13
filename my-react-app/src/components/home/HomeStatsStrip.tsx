import React from 'react';
import { Loader2 } from 'lucide-react';

interface StatItem {
  label: string;
  value: number;
}

interface HomeStatsStripProps {
  loading: boolean;
  stats: StatItem[];
}

export function HomeStatsStrip({ loading, stats }: HomeStatsStripProps) {
  return (
    <div className="home-stats">
      {stats.map(({ label, value }) => (
        <div key={label} className="home-stat">
          <span className="home-stat__value">
            {loading
              ? <Loader2 size={16} className="spin" style={{ display: 'inline' }} />
              : value}
          </span>
          <span className="home-stat__label mono">{label}</span>
        </div>
      ))}
    </div>
  );
}
