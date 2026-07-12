import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { fetchDashboardReport } from '../api/reports';
import type { DashboardReportResponse } from '../api/reports';

// ---------- Types ----------
interface BarData {
  label: string;
  value: number; // percentage 0-100
}

interface LinePoint {
  label: string;
  value: number; // raw count
}

interface RankedAsset {
  rank: number;
  tag: string;
  pct: number;
}

interface AlertRow {
  tag: string;
  name: string;
  status: string;
  statusColor: string;
}

interface AllocationRow {
  deptCode: string;
  category: string;
  activeCount: number;
  idleCount: number;
  pctOfTotal: string;
  estValue: string;
  idleHighlight: boolean;
}

// ---------- Mock Data (matches the HTML mockup exactly) ----------
const MOCK_BAR_DATA: BarData[] = [
  { label: 'ENG', value: 86 },
  { label: 'OPS', value: 64 },
  { label: 'LOG', value: 93 },
  { label: 'FAC', value: 36 },
  { label: 'MAINT', value: 71 },
];

const MOCK_LINE_DATA: LinePoint[] = [
  { label: 'HVAC', value: 14 },
  { label: 'VEH', value: 28 },
  { label: 'IT', value: 7 },
  { label: 'HEAVY', value: 35 },
  { label: 'ELEC', value: 21 },
];

const MOCK_MOST_USED: RankedAsset[] = [
  { rank: 1, tag: 'TRK-9021', pct: 98 },
  { rank: 2, tag: 'GEN-44A', pct: 94 },
  { rank: 3, tag: 'FRK-L22', pct: 91 },
  { rank: 4, tag: 'SVR-RACK1', pct: 88 },
  { rank: 5, tag: 'PMP-09B', pct: 85 },
];

const MOCK_IDLE: RankedAsset[] = [
  { rank: 1, tag: 'GEN-12C', pct: 2 },
  { rank: 2, tag: 'TRK-4432', pct: 5 },
  { rank: 3, tag: 'WLD-M1', pct: 12 },
  { rank: 4, tag: 'CMP-Z9', pct: 15 },
  { rank: 5, tag: 'LFT-P8', pct: 18 },
];

const MOCK_ALERTS: AlertRow[] = [
  { tag: 'TRK-9021', name: 'Heavy Duty Forklift', status: 'OVERDUE', statusColor: 'text-danger' },
  { tag: 'GEN-44A', name: 'Backup Generator B', status: 'DUE 2D', statusColor: 'text-primary' },
  { tag: 'SVR-RACK1', name: 'Main Database Cluster', status: 'DUE 5D', statusColor: 'text-primary' },
  { tag: 'HVAC-RT2', name: 'Rooftop Unit North', status: 'DUE 14D', statusColor: 'text-neutral-muted' },
  { tag: 'LFT-P8', name: 'Scissor Lift (Retire)', status: 'DUE 30D', statusColor: 'text-neutral-muted' },
];

const MOCK_ALLOCATION: AllocationRow[] = [
  { deptCode: 'DEPT-ENG-01', category: 'Engineering Tools', activeCount: 342, idleCount: 12, pctOfTotal: '24.5%', estValue: '$1.2M', idleHighlight: false },
  { deptCode: 'DEPT-OPS-02', category: 'Heavy Machinery', activeCount: 128, idleCount: 24, pctOfTotal: '10.8%', estValue: '$4.5M', idleHighlight: true },
  { deptCode: 'DEPT-LOG-03', category: 'Transport Fleet', activeCount: 85, idleCount: 3, pctOfTotal: '6.2%', estValue: '$3.8M', idleHighlight: false },
  { deptCode: 'DEPT-FAC-04', category: 'Facility Eq.', activeCount: 520, idleCount: 45, pctOfTotal: '40.2%', estValue: '$0.9M', idleHighlight: false },
  { deptCode: 'DEPT-IT-05', category: 'IT Infrastructure', activeCount: 256, idleCount: 10, pctOfTotal: '18.3%', estValue: '$2.1M', idleHighlight: false },
];

// ---------- SVG Chart Sub-Components ----------

const BarChart: React.FC<{ data: BarData[] }> = ({ data }) => {
  const chartH = 140;
  const chartTop = 20;
  const chartBottom = chartTop + chartH;
  const barW = 30;
  const gap = 60;
  const startX = 60;

  return (
    <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
      {/* Y-Axis Labels */}
      <text x="30" y="20" textAnchor="end" className="fill-neutral-muted font-data-mono" style={{ fontSize: 8 }}>100%</text>
      <text x="30" y="90" textAnchor="end" className="fill-neutral-muted font-data-mono" style={{ fontSize: 8 }}>50%</text>
      <text x="30" y="160" textAnchor="end" className="fill-neutral-muted font-data-mono" style={{ fontSize: 8 }}>0%</text>
      {/* Gridlines */}
      <line x1="40" y1="20" x2="380" y2="20" className="stroke-border" strokeDasharray="2,2" strokeWidth="1" />
      <line x1="40" y1="90" x2="380" y2="90" className="stroke-border" strokeDasharray="2,2" strokeWidth="1" />
      <line x1="40" y1="160" x2="380" y2="160" className="stroke-border" strokeDasharray="2,2" strokeWidth="1" />
      <line x1="40" y1="20" x2="40" y2="160" className="stroke-border" strokeWidth="1" />
      {/* Bars */}
      {data.map((d, i) => {
        const x = startX + i * gap;
        const barH = (d.value / 100) * chartH;
        const y = chartBottom - barH;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={barH} fill="#024a79" className="hover:opacity-80 transition-opacity" />
            <text x={x + barW / 2} y="175" textAnchor="middle" className="fill-neutral-muted font-data-mono" style={{ fontSize: 8 }}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const LineChart: React.FC<{ data: LinePoint[] }> = ({ data }) => {
  const maxVal = 40;
  const chartTop = 20;
  const chartH = 140;
  const startX = 60;
  const gap = 80;

  const points = data.map((d, i) => ({
    x: startX + i * gap,
    y: chartTop + chartH - (d.value / maxVal) * chartH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
      {/* Y-Axis Labels */}
      <text x="30" y="20" textAnchor="end" className="fill-neutral-muted font-data-mono" style={{ fontSize: 8 }}>40</text>
      <text x="30" y="90" textAnchor="end" className="fill-neutral-muted font-data-mono" style={{ fontSize: 8 }}>20</text>
      <text x="30" y="160" textAnchor="end" className="fill-neutral-muted font-data-mono" style={{ fontSize: 8 }}>0</text>
      {/* Gridlines */}
      <line x1="40" y1="20" x2="380" y2="20" className="stroke-border" strokeDasharray="2,2" strokeWidth="1" />
      <line x1="40" y1="90" x2="380" y2="90" className="stroke-border" strokeDasharray="2,2" strokeWidth="1" />
      <line x1="40" y1="160" x2="380" y2="160" className="stroke-border" strokeDasharray="2,2" strokeWidth="1" />
      <line x1="40" y1="20" x2="40" y2="160" className="stroke-border" strokeWidth="1" />
      {/* Line Path */}
      <path d={pathD} fill="none" stroke="#54c4a4" strokeWidth="2" />
      {/* Data Points + Labels */}
      {points.map((p, i) => (
        <g key={data[i].label}>
          <circle cx={p.x} cy={p.y} r="3" fill="#54c4a4" />
          <text x={p.x} y="175" textAnchor="middle" className="fill-neutral-muted font-data-mono" style={{ fontSize: 8 }}>
            {data[i].label}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ---------- Main Component ----------
export const ReportsAnalytics: React.FC = () => {
  const [barData] = useState<BarData[]>(MOCK_BAR_DATA);
  const [lineData] = useState<LinePoint[]>(MOCK_LINE_DATA);
  const [mostUsed, setMostUsed] = useState<RankedAsset[]>(MOCK_MOST_USED);
  const [idleAssets, setIdleAssets] = useState<RankedAsset[]>(MOCK_IDLE);
  const [alerts] = useState<AlertRow[]>(MOCK_ALERTS);
  const [allocations] = useState<AllocationRow[]>(MOCK_ALLOCATION);
  const [totalAssets, setTotalAssets] = useState(1402);

  // Attempt to load from backend
  useEffect(() => {
    let cancelled = false;

    const loadFromBackend = async () => {
      try {
        const report: DashboardReportResponse = await fetchDashboardReport();
        if (cancelled) return;

        // Merge backend data where applicable
        if (report.utilization?.totalAssets) {
          setTotalAssets(report.utilization.totalAssets);
        }

        // Map idle assets from report
        if (report.idle?.assets?.length > 0) {
          const mapped: RankedAsset[] = report.idle.assets.slice(0, 5).map((a, i) => ({
            rank: i + 1,
            tag: a.tag,
            pct: 0, // backend doesn't have pct, keep default
          }));
          if (!cancelled) {
            setIdleAssets([...mapped, ...MOCK_IDLE].slice(0, 5));
          }
        }
      } catch {
        // Backend unavailable — keep mock data
      }
    };

    loadFromBackend();
    return () => { cancelled = true; };
  }, []);

  return (
    <Layout title="Reports & Analytics">
      <div className="flex flex-col gap-0">
        {/* ── Export header ── */}
        <div className="flex items-center justify-end mb-4">
          <button className="flex items-center gap-1 px-3 py-1.5 border border-border text-neutral-text hover:bg-neutral-muted/15 transition-colors font-label-sm text-[11px] uppercase tracking-wider focus:outline-none">
            <span className="material-symbols-outlined text-[14px]">download</span>
            Export Report
          </button>
        </div>

        {/* ── Main 2×2 Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-border bg-neutral-card">
          {/* MODULE 1: Utilization by Department (Bar Chart) */}
          <div className="border-b border-border lg:border-b-0 lg:border-r p-4 bg-neutral-card flex flex-col h-[320px]">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-1">
              <h3 className="font-label-sm text-[11px] uppercase tracking-wider text-neutral-muted">
                Utilization by Dept. (Q3)
              </h3>
              <span className="font-data-mono text-[10px] text-primary">METRIC: HOURS/WK</span>
            </div>
            <div className="flex-1 relative w-full h-full">
              <BarChart data={barData} />
            </div>
          </div>

          {/* MODULE 2: Maintenance Frequency by Category (Line Chart) */}
          <div className="p-4 bg-neutral-card flex flex-col h-[320px] border-b border-border">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-1">
              <h3 className="font-label-sm text-[11px] uppercase tracking-wider text-neutral-muted">
                Maint. Freq. by Category
              </h3>
              <span className="font-data-mono text-[10px] text-primary">METRIC: INCIDENTS</span>
            </div>
            <div className="flex-1 relative w-full h-full">
              <LineChart data={lineData} />
            </div>
          </div>

          {/* MODULE 3: Asset Usage Rankings (Two Lists) */}
          <div className="border-b border-border lg:border-b-0 lg:border-r p-0 bg-neutral-card flex flex-col md:flex-row h-auto min-h-[240px]">
            {/* Most Used */}
            <div className="flex-1 p-4 md:border-r border-b md:border-b-0 border-border">
              <h3 className="font-label-sm text-[11px] uppercase tracking-wider text-neutral-muted mb-2 border-b border-border pb-1">
                Most Used Assets
              </h3>
              <ul className="font-data-mono text-[12px] space-y-0">
                {mostUsed.map((item) => (
                  <li
                    key={item.tag}
                    className="flex justify-between items-center py-1 hover:bg-neutral-muted/10 px-1 transition-colors"
                  >
                    <span className={item.rank <= 3 ? 'text-primary' : 'text-neutral-muted'}>
                      {String(item.rank).padStart(2, '0')}
                    </span>
                    <span className="text-neutral-text ml-2">{item.tag}</span>
                    <span className="ml-auto text-neutral-muted text-right">{item.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Idle */}
            <div className="flex-1 p-4">
              <h3 className="font-label-sm text-[11px] uppercase tracking-wider text-neutral-muted mb-2 border-b border-border pb-1">
                Idle Assets
              </h3>
              <ul className="font-data-mono text-[12px] space-y-0">
                {idleAssets.map((item) => (
                  <li
                    key={item.tag}
                    className="flex justify-between items-center py-1 hover:bg-neutral-muted/10 px-1 transition-colors"
                  >
                    <span className={item.rank <= 3 ? 'text-danger' : 'text-neutral-muted'}>
                      {String(item.rank).padStart(2, '0')}
                    </span>
                    <span className="text-neutral-text ml-2">{item.tag}</span>
                    <span className="ml-auto text-neutral-muted text-right">{item.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* MODULE 4: Maintenance & Retirement Alerts */}
          <div className="p-4 bg-neutral-card flex flex-col h-auto min-h-[240px] border-b border-border">
            <h3 className="font-label-sm text-[11px] uppercase tracking-wider text-danger mb-2 border-b border-danger/30 pb-1">
              Maint. & Retirement Alerts
            </h3>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left font-data-mono text-[12px] border-collapse">
                <tbody>
                  {alerts.map((alert, idx) => (
                    <tr
                      key={alert.tag}
                      className={`hover:bg-neutral-muted/10 transition-colors ${
                        idx < alerts.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <td className="py-2 px-1 text-neutral-text w-24">{alert.tag}</td>
                      <td className="py-2 px-1 text-neutral-muted">{alert.name}</td>
                      <td className={`py-2 px-1 text-right font-bold ${alert.statusColor}`}>{alert.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MODULE 5: Allocation Summary Table (Full Width) */}
          <div className="col-span-1 lg:col-span-2 p-4 bg-neutral-card flex flex-col h-auto">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-1">
              <h3 className="font-label-sm text-[11px] uppercase tracking-wider text-neutral-muted">
                Allocation Summary
              </h3>
              <span className="font-data-mono text-[10px] text-primary">
                TOTAL ASSETS: {totalAssets.toLocaleString()}
              </span>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left font-data-mono text-[12px] border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-border text-neutral-muted text-[10px] uppercase">
                    <th className="py-1 px-1 font-normal">Department Code</th>
                    <th className="py-1 px-1 font-normal">Category</th>
                    <th className="py-1 px-1 font-normal text-right">Active Count</th>
                    <th className="py-1 px-1 font-normal text-right">Idle Count</th>
                    <th className="py-1 px-1 font-normal text-right">% of Total</th>
                    <th className="py-1 px-1 font-normal text-right">Est. Value</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((row, idx) => (
                    <tr
                      key={row.deptCode}
                      className={`hover:bg-neutral-muted/10 transition-colors ${
                        idx < allocations.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <td className="py-2 px-1 text-neutral-text">{row.deptCode}</td>
                      <td className="py-2 px-1 text-neutral-muted">{row.category}</td>
                      <td className="py-2 px-1 text-right text-success">{row.activeCount}</td>
                      <td className={`py-2 px-1 text-right ${row.idleHighlight ? 'text-danger' : 'text-neutral-muted'}`}>
                        {row.idleCount}
                      </td>
                      <td className="py-2 px-1 text-right text-neutral-text">{row.pctOfTotal}</td>
                      <td className="py-2 px-1 text-right text-neutral-muted">{row.estValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
