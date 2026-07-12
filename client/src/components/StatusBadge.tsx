import React from 'react';

export type BadgeType = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface StatusBadgeProps {
  label: string;
  type?: BadgeType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, type = 'neutral' }) => {
  const typeMap: Record<BadgeType, string> = {
    primary: 'bg-primary/10 border-primary/20 text-primary',
    success: 'bg-success/10 border-success/20 text-success',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    danger: 'bg-danger/10 border-danger/20 text-danger',
    neutral: 'bg-neutral-bg border-border text-neutral-muted',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase ${typeMap[type]}`}
    >
      {label}
    </span>
  );
};
