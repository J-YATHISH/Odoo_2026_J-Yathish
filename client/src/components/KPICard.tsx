import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, description, icon, trend }) => {
  return (
    <div className="bg-neutral-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-muted">
            {title}
          </span>
          {icon && <div className="text-primary/80">{icon}</div>}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-neutral-text">{value}</span>
          {trend && (
            <span
              className={`text-xs font-medium ${
                trend.type === 'positive'
                  ? 'text-success'
                  : trend.type === 'negative'
                    ? 'text-danger'
                    : 'text-neutral-muted'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      </div>
      {description && <p className="mt-2 text-xs text-neutral-muted">{description}</p>}
    </div>
  );
};
