import React, { useEffect, useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { fetchActivityLogs } from '../api/notifications';
import type { ActivityLogItem } from '../api/notifications';

// ---------- Types ----------
type LogCategory = 'all' | 'alerts' | 'approvals' | 'bookings';

interface LogEntry {
  id: string;
  tag: string;
  icon: string;
  iconColor: string;
  tagColor: string;
  message: React.ReactNode;
  timeAgo: string;
  isUnread: boolean;
  category: LogCategory;
  actionLink?: { label: string; href: string };
}

// ---------- Mock Data (matches the HTML mockup exactly) ----------
const MOCK_LOGS: LogEntry[] = [
  {
    id: 'log-1',
    tag: '[TAG-8902]',
    icon: 'warning',
    iconColor: 'text-danger',
    tagColor: 'text-danger',
    message: (
      <>
        Overdue return for <strong className="font-medium text-neutral-text">Thermal Imager Pro</strong> assigned to{' '}
        <span className="text-neutral-muted">J. Vance</span>
      </>
    ),
    timeAgo: '2m ago',
    isUnread: true,
    category: 'alerts',
  },
  {
    id: 'log-2',
    tag: '[REQ-441A]',
    icon: 'fact_check',
    iconColor: 'text-primary',
    tagColor: 'text-primary',
    message: (
      <>
        Approval required for transfer of <strong className="font-medium text-neutral-text">Generator Set Beta</strong>{' '}
        to Site C.
      </>
    ),
    timeAgo: '15m ago',
    isUnread: true,
    category: 'approvals',
  },
  {
    id: 'log-3',
    tag: '[TAG-3312]',
    icon: 'sync_alt',
    iconColor: 'text-neutral-muted',
    tagColor: 'text-neutral-muted',
    message: (
      <>
        Transfer completed. <strong className="font-medium text-neutral-muted">Diagnostic Kit V3</strong> moved from Hub
        A to Lab 2 by <span className="text-neutral-muted">System Auto</span>.
      </>
    ),
    timeAgo: '1h ago',
    isUnread: false,
    category: 'all',
  },
  {
    id: 'log-4',
    tag: '[TAG-1055]',
    icon: 'calendar_add_on',
    iconColor: 'text-neutral-muted',
    tagColor: 'text-neutral-muted',
    message: (
      <>
        Booking confirmed. <strong className="font-medium text-neutral-muted">Drone Quadcopter Array</strong> reserved by{' '}
        <span className="text-neutral-muted">S. Mitchell</span> for Oct 12-14.
      </>
    ),
    timeAgo: '3h ago',
    isUnread: false,
    category: 'bookings',
  },
  {
    id: 'log-5',
    tag: '[AUD-77X]',
    icon: 'policy',
    iconColor: 'text-primary',
    tagColor: 'text-primary',
    message: (
      <>
        Audit discrepancy detected in Zone B storage. Expected qty: 45. Scanned: 44.
      </>
    ),
    timeAgo: '5h ago',
    isUnread: false,
    category: 'alerts',
    actionLink: { label: 'Review Report', href: '#' },
  },
  {
    id: 'log-6',
    tag: '[TAG-9011]',
    icon: 'handyman',
    iconColor: 'text-neutral-muted',
    tagColor: 'text-neutral-muted',
    message: (
      <>
        Maintenance logged. <strong className="font-medium text-neutral-muted">Heavy Lift Crane M4</strong> routine
        service completed by <span className="text-neutral-muted">Tech Ops Dept</span>.
      </>
    ),
    timeAgo: '1d ago',
    isUnread: false,
    category: 'all',
  },
];

// ---------- Component ----------
export const ActivityLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LogCategory>('all');
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [loadingMore, setLoadingMore] = useState(false);

  // Try fetching real data from the backend on mount
  useEffect(() => {
    let cancelled = false;

    const loadFromBackend = async () => {
      try {
        const dbLogs: ActivityLogItem[] = await fetchActivityLogs(20);
        if (cancelled || dbLogs.length === 0) return;

        const mapped: LogEntry[] = dbLogs.map((log, idx) => {
          let icon = 'info';
          let iconColor = 'text-primary';
          let tagColor = 'text-primary';
          let category: LogCategory = 'all';
          let isUnread = idx < 2;

          if (log.action === 'LOGGED_IN') {
            icon = 'login';
            iconColor = 'text-success';
            tagColor = 'text-success';
          } else if (log.action.includes('TRANSFER')) {
            icon = 'sync_alt';
            iconColor = 'text-neutral-muted';
            tagColor = 'text-neutral-muted';
          } else if (log.action.includes('APPROVE') || log.action.includes('REQUEST')) {
            icon = 'fact_check';
            category = 'approvals';
          } else if (log.action.includes('BOOK')) {
            icon = 'calendar_add_on';
            category = 'bookings';
          } else if (log.action.includes('ALERT') || log.action.includes('WARNING')) {
            icon = 'warning';
            iconColor = 'text-danger';
            tagColor = 'text-danger';
            category = 'alerts';
          }

          const assetTag = log.entityId ? `[AF-${log.entityId.toString().padStart(4, '0')}]` : '[SYS]';
          const timeStr = new Date(log.createdAt).toLocaleTimeString('en-US', { hour12: false });

          return {
            id: `db-${log.id}`,
            tag: assetTag,
            icon,
            iconColor,
            tagColor,
            message: <>{`${log.action} on ${log.entityType} by ${log.employee.name}`}</>,
            timeAgo: timeStr,
            isUnread,
            category,
          };
        });

        // Merge backend logs first, then mock logs
        if (!cancelled) {
          setLogs([...mapped, ...MOCK_LOGS]);
        }
      } catch {
        // Backend unavailable — keep mock data
      }
    };

    loadFromBackend();
    return () => { cancelled = true; };
  }, []);

  // Filter logs by active tab
  const filteredLogs = useMemo(() => {
    if (activeTab === 'all') return logs;
    return logs.filter((l) => l.category === activeTab);
  }, [logs, activeTab]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    // Simulate network delay for loading more historical records
    setTimeout(() => setLoadingMore(false), 1200);
  };

  const tabs: { key: LogCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'alerts', label: 'Alerts' },
    { key: 'approvals', label: 'Approvals' },
    { key: 'bookings', label: 'Bookings' },
  ];

  return (
    <Layout title="Activity Logs & Notifications">
      {/* ── Page Header & Segmented Tabs ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 mb-0">
        <div className="flex border border-border overflow-hidden bg-neutral-bg">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 font-label-sm text-[11px] uppercase tracking-wider transition-colors border-r border-border last:border-r-0 focus:outline-none ${
                activeTab === tab.key
                  ? 'bg-neutral-card text-neutral-text font-bold'
                  : 'text-neutral-muted hover:bg-neutral-card/50 hover:text-neutral-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Log Ledger List ── */}
      <div className="flex flex-col w-full bg-neutral-card border border-border border-t-0">
        {filteredLogs.map((log, idx) => (
          <div
            key={log.id}
            className="group border-b border-border relative flex items-center px-6 py-3 hover:bg-neutral-muted/10 transition-colors"
            style={{
              animation: `fadeUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
              animationDelay: `${0.05 * (idx + 1)}s`,
              opacity: 0,
              transform: 'translateY(10px)',
            }}
          >
            {/* Unread accent bar */}
            {log.isUnread && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            )}

            {/* Icon */}
            <div className="flex items-center justify-center w-8 h-8 shrink-0 mr-4">
              <span className={`material-symbols-outlined text-[20px] ${log.iconColor}`}>{log.icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className={`font-data-mono text-[13px] uppercase ${log.tagColor}`}>{log.tag}</span>
                <span
                  className={`font-body-md text-sm truncate ${
                    log.isUnread ? 'text-neutral-text' : 'text-neutral-muted'
                  }`}
                >
                  {log.message}
                  {log.actionLink && (
                    <a
                      href={log.actionLink.href}
                      className="text-primary hover:underline ml-1"
                      onClick={(e) => e.preventDefault()}
                    >
                      {log.actionLink.label}
                    </a>
                  )}
                </span>
              </div>
            </div>

            {/* Timestamp */}
            <div className="shrink-0 text-right">
              <span className="font-data-mono text-[11px] text-neutral-muted">{log.timeAgo}</span>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="py-12 flex items-center justify-center text-neutral-muted text-sm font-data-mono uppercase tracking-wider">
            No records matching filter.
          </div>
        )}
      </div>

      {/* ── Load More ── */}
      <div className="py-6 flex justify-center w-full">
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="font-label-sm text-[11px] uppercase text-neutral-muted hover:text-primary transition-colors flex items-center gap-2 focus:outline-none disabled:opacity-50"
        >
          {loadingMore ? (
            <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          )}
          Load Historical Records
        </button>
      </div>

      {/* Keyframe for staggered entrance */}
      <style>{`
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Layout>
  );
};
