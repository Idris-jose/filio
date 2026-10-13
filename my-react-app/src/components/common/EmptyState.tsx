import React from 'react';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

export function EmptyState({ title, subtitle, icon, action, style }: EmptyStateProps) {
  return (
    <div className="empty-state" style={style}>
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__subtitle">{subtitle}</p>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
