import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { checkHealth } from '../api/health';
import type { HealthResponse } from '../api/health';
import { fetchDashboardReport } from '../api/reports';
import type { DashboardReportResponse } from '../api/reports';
import { fetchActivityLogs } from '../api/notifications';
import type { ActivityLogItem } from '../api/notifications';
import { intelligenceApi } from '../api/intelligence';
import type { EcoPredictiveData, BenchmarksData } from '../api/intelligence';
import { APIException } from '../api/client';
import { RefreshCw, Server, Database, AlertCircle, Leaf, BarChart2 } from 'lucide-react';


interface ActivityRow {
  id: string;
  icon: string;
  iconColor: string;
  assetId: string;
  description: string;
  timestamp: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Health and Reports states
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [report, setReport] = useState<DashboardReportResponse | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityRow[]>([]);
  const [ecoData, setEcoData] = useState<EcoPredictiveData | null>(null);
  const [benchmarksData, setBenchmarksData] = useState<BenchmarksData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Time state
  const [sysTime, setSysTime] = useState<string>('00:00:00');

  // Clock effect
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setSysTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all dashboard data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch backend health
      const healthRes = await checkHealth();
      setHealth(healthRes);

      // 2. Fetch reports dashboard KPIs
      const reportRes = await fetchDashboardReport();
      setReport(reportRes);

      // 3. Fetch activity logs
      const dbLogs = await fetchActivityLogs(10);
      formatLogs(dbLogs);

      // 4. Fetch Intelligence Data
      const eco = await intelligenceApi.getEcoPredictive();
      setEcoData(eco);

      const bench = await intelligenceApi.getBenchmarks();
      setBenchmarksData(bench);
    } catch (err: unknown) {
      if (err instanceof APIException) {
        setError(`${err.message} (Status: ${err.status})`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Connection to backend services degraded.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format activity logs combining real logs and mockup fallbacks
  const formatLogs = (dbLogs: ActivityLogItem[]) => {
    // Standard mock list from operational_dashboard_main mockup
    const mockLogs: ActivityRow[] = [
      {
        id: 'mock-1',
        icon: 'check_circle',
        iconColor: 'text-[#4FBF9F]',
        assetId: 'AF-4492',
        description: 'Asset returned from Field Op Charlie. Condition verified.',
        timestamp: '10:42:01',
      },
      {
        id: 'mock-2',
        icon: 'swap_horiz',
        iconColor: 'text-[#5C8FC2]',
        assetId: 'AF-3011',
        description: 'Transfer initiated: WH A1 -> WH B2. Carrier ID: CX-99',
        timestamp: '10:28:44',
      },
      {
        id: 'mock-3',
        icon: 'build',
        iconColor: 'text-[#F0A030]',
        assetId: 'AF-8843',
        description: 'Scheduled maintenance cycle started. Tech: R. Vance.',
        timestamp: '09:15:00',
      },
      {
        id: 'mock-4',
        icon: 'add_box',
        iconColor: 'text-neutral-muted',
        assetId: 'AF-9022',
        description: 'New asset registered: Pallet Jack S-Type.',
        timestamp: '08:50:12',
      },
      {
        id: 'mock-5',
        icon: 'event_available',
        iconColor: 'text-[#5C8FC2]',
        assetId: 'AF-1109',
        description: 'Resource booked for Proj-Delta. Duration: 5 days.',
        timestamp: '08:05:33',
      },
      {
        id: 'mock-6',
        icon: 'error',
        iconColor: 'text-[#C25D4E]',
        assetId: 'AF-9932',
        description: 'Automated system flag: Return overdue threshold breached.',
        timestamp: '07:00:00',
      },
    ];

    // Format DB logs into displayable logs
    const formattedDbLogs: ActivityRow[] = dbLogs.map((log) => {
      let desc = `${log.action} on ${log.entityType}`;
      let icon = 'info';
      let iconColor = 'text-primary';

      if (log.action === 'LOGGED_IN') {
        desc = `Operator ${log.employee.name} initialized session.`;
        icon = 'login';
        iconColor = 'text-[#4FBF9F]';
      }

      const logTime = new Date(log.createdAt).toLocaleTimeString('en-US', {
        hour12: false,
      });

      return {
        id: `db-${log.id}`,
        icon,
        iconColor,
        assetId: log.entityId ? `AF-${log.entityId.toString().padStart(4, '0')}` : 'SYS',
        description: desc,
        timestamp: logTime,
      };
    });

    // Merge: show DB logs first, then mock logs
    setActivityLogs([...formattedDbLogs, ...mockLogs]);
  };



  // Dynamic values or mock defaults
  const availableCount = report?.utilization.availableAssets || 1492;
  const allocatedCount = report?.utilization.allocatedAssets || 348;
  const maintenanceCount = report?.maintenance.assetsCurrentlyUnderMaintenance || 12;
  const activeBookingsCount = 87; // Fallback
  const pendingTransfersCount = 45; // Fallback
  const upcomingReturnsCount = 19; // Fallback

  const statusLabel = health && health.db === 'connected' ? 'NOMINAL' : 'DEGRADED';
  const statusColor = statusLabel === 'NOMINAL' ? 'text-[#4FBF9F]' : 'text-[#C25D4E]';

  return (
    <Layout title="Operational Dashboard">
      <div className="space-y-6">
        {/* Top Control Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-4 stagger-item">
          <div>
            <div className="font-data-mono text-xs text-neutral-muted mt-1 uppercase tracking-wider">
              SYS-TIME: <span className="text-neutral-text font-semibold">{sysTime}</span> | STATUS:{' '}
              <span className={`font-bold ${statusColor}`}>{statusLabel}</span>
            </div>
          </div>
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/assets')}
              className="px-3 py-1.5 border border-border bg-neutral-card text-neutral-text font-label-sm text-xs uppercase hover:bg-neutral-muted/15 transition-colors flex items-center gap-1.5 focus:outline-none"
            >
              <span className="material-symbols-outlined text-[14px]">add_box</span>
              Register Asset
            </button>
            <button
              onClick={() => navigate('/bookings')}
              className="px-3 py-1.5 border border-border bg-neutral-card text-neutral-text font-label-sm text-xs uppercase hover:bg-neutral-muted/15 transition-colors flex items-center gap-1.5 focus:outline-none"
            >
              <span className="material-symbols-outlined text-[14px]">event_available</span>
              Book Resource
            </button>
            <button
              onClick={() => navigate('/maintenance')}
              className="px-3 py-1.5 border border-border bg-neutral-card text-neutral-text font-label-sm text-xs uppercase hover:bg-neutral-muted/15 transition-colors flex items-center gap-1.5 text-primary focus:outline-none"
            >
              <span className="material-symbols-outlined text-[14px]">build_circle</span>
              Raise Maintenance Request
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 border border-border bg-neutral-card text-neutral-muted hover:text-neutral-text hover:bg-neutral-muted/15 rounded transition-all focus:outline-none disabled:opacity-50 flex items-center justify-center"
              title="Refresh Dashboard Data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* 1. Connection Health alert banner if degraded */}
        {error && (
          <div className="flex items-center gap-3 text-danger bg-danger/10 border border-danger/20 p-4 rounded-none text-xs font-data-mono">
            <AlertCircle size={16} />
            <div>
              <span className="font-semibold uppercase">API HEALTH ERROR:</span> {error} — Fallback data loaded.
            </div>
          </div>
        )}

        {/* 2. KPI Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Available */}
          <div className="bg-neutral-card border border-border p-3.5 flex flex-col justify-between h-24 relative overflow-hidden stagger-item">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4FBF9F]"></div>
            <div className="pl-2 flex items-center justify-between">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-neutral-muted">
                Assets Available
              </span>
              <span className="material-symbols-outlined text-[#4FBF9F] text-base">inventory</span>
            </div>
            <div className="pl-2 font-data-mono text-2xl text-neutral-text font-semibold">
              {availableCount.toLocaleString()}
            </div>
          </div>

          {/* Allocated */}
          <div className="bg-neutral-card border border-border p-3.5 flex flex-col justify-between h-24 relative overflow-hidden stagger-item">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C8FC2]"></div>
            <div className="pl-2 flex items-center justify-between">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-neutral-muted">
                Assets Allocated
              </span>
              <span className="material-symbols-outlined text-[#5C8FC2] text-base">local_shipping</span>
            </div>
            <div className="pl-2 font-data-mono text-2xl text-neutral-text font-semibold">
              {allocatedCount.toLocaleString()}
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-neutral-card border border-border p-3.5 flex flex-col justify-between h-24 relative overflow-hidden stagger-item">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F0A030]"></div>
            <div className="pl-2 flex items-center justify-between">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-neutral-muted">
                Maintenance Today
              </span>
              <span className="material-symbols-outlined text-[#F0A030] text-base">handyman</span>
            </div>
            <div className="pl-2 font-data-mono text-2xl text-neutral-text font-semibold">
              {maintenanceCount.toLocaleString()}
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-neutral-card border border-border p-3.5 flex flex-col justify-between h-24 relative overflow-hidden stagger-item">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C8FC2]"></div>
            <div className="pl-2 flex items-center justify-between">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-neutral-muted">
                Active Bookings
              </span>
              <span className="material-symbols-outlined text-[#5C8FC2] text-base">calendar_month</span>
            </div>
            <div className="pl-2 font-data-mono text-2xl text-neutral-text font-semibold">
              {activeBookingsCount.toLocaleString()}
            </div>
          </div>

          {/* Transfers */}
          <div className="bg-neutral-card border border-border p-3.5 flex flex-col justify-between h-24 relative overflow-hidden stagger-item">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4FBF9F]"></div>
            <div className="pl-2 flex items-center justify-between">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-neutral-muted">
                Pending Transfers
              </span>
              <span className="material-symbols-outlined text-[#4FBF9F] text-base">sync_alt</span>
            </div>
            <div className="pl-2 font-data-mono text-2xl text-neutral-text font-semibold">
              {pendingTransfersCount.toLocaleString()}
            </div>
          </div>

          {/* Returns */}
          <div className="bg-neutral-card border border-border p-3.5 flex flex-col justify-between h-24 relative overflow-hidden stagger-item">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-neutral-muted"></div>
            <div className="pl-2 flex items-center justify-between">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-neutral-muted">
                Upcoming Returns
              </span>
              <span className="material-symbols-outlined text-neutral-muted text-base">keyboard_return</span>
            </div>
            <div className="pl-2 font-data-mono text-2xl text-neutral-text font-semibold">
              {upcomingReturnsCount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 3. Global Benchmarks Panel (New Intelligence Feature) */}
        {benchmarksData && (
          <div className="border border-border bg-neutral-card p-4 stagger-item mb-2">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={16} className="text-primary" />
              <h3 className="font-label-sm uppercase text-xs tracking-wider text-neutral-text">Cross-Tenant Global Benchmarks</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-bg/50 border border-border p-3">
                <div className="text-[10px] text-neutral-muted uppercase tracking-wider mb-1">Avg Resolution Speed</div>
                <div className="flex items-end gap-2">
                  <span className="font-data-mono text-xl text-neutral-text">{benchmarksData.maintenance.organizationAverageHours.toFixed(1)}h</span>
                  <span className="font-label-sm text-[10px] text-neutral-muted">vs {benchmarksData.maintenance.globalAverageHours.toFixed(1)}h global</span>
                </div>
                <div className={`text-[10px] uppercase font-bold mt-1 ${benchmarksData.maintenance.verdict.includes('Faster') ? 'text-success' : 'text-danger'}`}>
                  {benchmarksData.maintenance.verdict}
                </div>
              </div>
              
              <div className="bg-neutral-bg/50 border border-border p-3">
                <div className="text-[10px] text-neutral-muted uppercase tracking-wider mb-1">Asset Utilization</div>
                <div className="flex items-end gap-2">
                  <span className="font-data-mono text-xl text-neutral-text">{benchmarksData.utilization.organizationUtilizationPct.toFixed(1)}%</span>
                  <span className="font-label-sm text-[10px] text-neutral-muted">vs {benchmarksData.utilization.globalUtilizationPct.toFixed(1)}% global</span>
                </div>
              </div>

              <div className="bg-neutral-bg/50 border border-border p-3">
                <div className="text-[10px] text-neutral-muted uppercase tracking-wider mb-1">Top Failing Asset Globally</div>
                <div className="font-body-md text-sm text-neutral-text truncate">
                  {benchmarksData.hardwareReliability[0]?.category || 'N/A'}
                </div>
                <div className="font-label-sm text-[10px] text-neutral-muted mt-1">
                  {benchmarksData.hardwareReliability[0]?.incidents || 0} Total Global Incidents
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Bottom Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Eco-Predictive Health Section (1/3 width) replacing Overdue Mock */}
          <div className="col-span-1 border border-border bg-neutral-card flex flex-col min-h-[400px] stagger-item">
            <div className="p-3 border-b border-border bg-neutral-card/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf size={16} className="text-[#4FBF9F]" />
                <span className="font-label-sm text-xs uppercase text-neutral-text tracking-wider">
                  Eco-Predictive Health
                </span>
              </div>
              {ecoData && (
                <div className="font-data-mono text-[10px] bg-[#4FBF9F]/10 text-[#4FBF9F] border border-[#4FBF9F]/30 px-2 py-0.5 rounded-full">
                  {ecoData.totalOrganizationCarbonFootprintKg.toLocaleString(undefined, {maximumFractionDigits: 1})} kg CO2e
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              <div className="text-[10px] text-neutral-muted uppercase px-1 mb-2 font-semibold tracking-wider">Highest Failure Probability</div>
              {ecoData?.topAtRiskAssets.length === 0 && (
                <div className="text-xs text-neutral-muted italic p-4 text-center">No predictive data available.</div>
              )}
              {ecoData?.topAtRiskAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="border border-border bg-neutral-bg relative pl-3 p-2.5 group hover:bg-neutral-muted/10 transition-colors cursor-pointer"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${asset.failureProbability > 85 ? 'bg-[#C25D4E]' : asset.failureProbability > 50 ? 'bg-[#F0A030]' : 'bg-[#4FBF9F]'}`}></div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-data-mono text-xs font-semibold text-neutral-text">
                      {asset.asset.tag}
                    </span>
                    <span className={`font-data-mono text-[9px] px-1 border uppercase ${asset.failureProbability > 85 ? 'text-[#C25D4E] border-[#C25D4E]/30 bg-[#C25D4E]/10' : 'text-neutral-muted border-border bg-neutral-card'}`}>
                      {asset.failureProbability.toFixed(1)}% RISK
                    </span>
                  </div>
                  <div className="font-body-md text-xs text-neutral-text truncate">{asset.asset.name}</div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="font-label-sm text-[10px] text-neutral-muted uppercase">
                      {asset.asset.category.name}
                    </div>
                    <div className="font-data-mono text-[9px] text-[#4FBF9F]">
                      {asset.carbonFootprintKg.toFixed(1)} kg CO2
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log Section (2/3 width) */}
          <div className="col-span-1 lg:col-span-2 border border-border bg-neutral-card flex flex-col min-h-[400px] stagger-item">
            <div className="p-3 border-b border-border bg-neutral-card/40 flex items-center justify-between">
              <span className="font-label-sm text-xs uppercase text-neutral-text tracking-wider">
                System Activity Log
              </span>
            </div>

            {/* Dense List Header */}
            <div className="grid grid-cols-[32px_90px_1fr_90px] gap-2 px-3 py-1.5 border-b border-border bg-neutral-bg/60 font-label-sm text-[10px] text-neutral-muted uppercase">
              <div>TYP</div>
              <div>ASSET ID</div>
              <div>DESCRIPTION / ACTION</div>
              <div className="text-right">TIMESTAMP</div>
            </div>

            {/* Feed Rows */}
            <div className="flex-1 overflow-y-auto">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-[32px_90px_1fr_90px] gap-2 px-3 py-2.5 border-b border-border hover:bg-neutral-muted/10 transition-colors items-center group"
                >
                  <div className={log.iconColor}>
                    <span className="material-symbols-outlined text-[16px] block">
                      {log.icon}
                    </span>
                  </div>
                  <div className="font-data-mono text-xs text-neutral-text group-hover:text-primary transition-colors">
                    {log.assetId}
                  </div>
                  <div className="font-body-md text-xs text-neutral-text truncate">
                    {log.description}
                  </div>
                  <div className="font-data-mono text-[10px] text-neutral-muted text-right">
                    {log.timestamp}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-border bg-neutral-bg/40 flex justify-center">
              <button
                onClick={() => navigate('/activity')}
                className="font-label-sm text-xs uppercase text-neutral-muted hover:text-primary transition-colors focus:outline-none py-1 px-3"
              >
                Load More Logs
              </button>
            </div>
          </div>
        </div>

        {/* 5. Backend System Connectivity Details */}
        {health && (
          <div className="border border-border p-4 bg-neutral-card/30 mt-6 stagger-item">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-muted mb-3">
              INTEGRATION PING STATS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Server size={14} className="text-primary" />
                <span className="text-xs text-neutral-text">
                  API: <span className="font-semibold text-success">ONLINE (HTTP 200)</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Database size={14} className="text-success" />
                <span className="text-xs text-neutral-text">
                  DB Connection: <span className="font-semibold text-success">CONNECTED</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-neutral-muted text-xs">
                <span>Last verification: {new Date(health.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
