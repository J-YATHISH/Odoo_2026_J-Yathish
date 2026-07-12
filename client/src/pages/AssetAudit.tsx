import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { AlertTriangle, Lock, ChevronDown } from 'lucide-react';

type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'MISSING' | 'DAMAGED';

interface AuditItem {
  id: string;
  tag: string;
  name: string;
  expectedLoc: string;
  status: VerificationStatus;
}

const initialItems: AuditItem[] = [
  { id: '1', tag: 'AF-99321', name: 'Heavy Duty Forklift', expectedLoc: 'Bay 4', status: 'UNVERIFIED' },
  { id: '2', tag: 'AF-99322', name: 'Pallet Jack (Manual)', expectedLoc: 'Aisle 12', status: 'UNVERIFIED' },
  { id: '3', tag: 'AF-99325', name: 'Conveyor Belt Motor', expectedLoc: 'Line B', status: 'UNVERIFIED' },
  { id: '4', tag: 'AF-99328', name: 'Industrial Scanner', expectedLoc: 'Receiving', status: 'UNVERIFIED' },
];

export const AssetAudit: React.FC = () => {
  const [items, setItems] = useState<AuditItem[]>(initialItems);

  const updateStatus = (id: string, newStatus: VerificationStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const missingCount = items.filter((i) => i.status === 'MISSING').length;
  const damagedCount = items.filter((i) => i.status === 'DAMAGED').length;
  const hasDiscrepancy = missingCount > 0 || damagedCount > 0;

  return (
    <Layout title="Asset Audit">
      <div className="max-w-5xl mx-auto flex flex-col gap-4 w-full">
        {/* Audit Metadata Bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 bg-neutral-card/40 border border-border rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-muted uppercase tracking-wider font-semibold text-xs">Cycle ID</span>
            <span className="text-primary font-data-mono font-medium">AUD-2024-05-12</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-muted uppercase tracking-wider font-semibold text-xs">Scope</span>
            <span className="text-neutral-text font-medium">Warehouse A1 - Logistics</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-muted uppercase tracking-wider font-semibold text-xs">Date</span>
            <span className="text-neutral-text font-medium">2024-05-10 TO 2024-05-15</span>
          </div>
          <div className="w-px h-4 bg-border hidden md:block"></div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-muted uppercase tracking-wider font-semibold text-xs">Auditors</span>
            <div className="flex items-center gap-1">
              {['JD', 'AM', 'RL'].map((initials) => (
                <div key={initials} className="w-6 h-6 rounded bg-neutral-card border border-border flex items-center justify-center text-[10px] text-neutral-muted font-bold">
                  {initials}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-neutral-card/20 border border-border rounded-lg overflow-hidden mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-neutral-card/40 text-[10px] uppercase tracking-wider text-neutral-muted font-semibold">
                <th className="px-4 py-3 w-40">Asset Tag</th>
                <th className="px-4 py-3">Asset Name</th>
                <th className="px-4 py-3 w-48">Expected Loc</th>
                <th className="px-4 py-3 w-96">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-card/30 transition-colors">
                  <td className="px-4 py-3 font-data-mono text-primary text-sm">
                    {item.tag}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-text font-medium">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-muted">
                    {item.expectedLoc}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex bg-neutral-card/50 rounded-md border border-border p-1 gap-1">
                      <button
                        onClick={() => updateStatus(item.id, 'VERIFIED')}
                        className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-all duration-200 ${
                          item.status === 'VERIFIED'
                            ? 'bg-neutral-bg text-neutral-text shadow-sm'
                            : 'text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg/50'
                        }`}
                      >
                        Verified
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, 'MISSING')}
                        className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-all duration-200 ${
                          item.status === 'MISSING'
                            ? 'bg-neutral-bg text-neutral-text shadow-sm'
                            : 'text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg/50'
                        }`}
                      >
                        Missing
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, 'DAMAGED')}
                        className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-all duration-200 ${
                          item.status === 'DAMAGED'
                            ? 'bg-neutral-bg text-neutral-text shadow-sm'
                            : 'text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg/50'
                        }`}
                      >
                        Damaged
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Discrepancy Alert */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          {hasDiscrepancy ? (
            <div className="flex items-center gap-4 px-4 py-3 bg-[#2a1d20] border border-danger/20 rounded-lg w-full sm:w-auto flex-1">
              <div className="flex items-center gap-3 text-danger">
                <AlertTriangle size={24} strokeWidth={2} className="text-[#ffb4ab]" />
                <span className="font-headline-md tracking-widest uppercase font-bold text-sm text-[#ffb4ab]">
                  Discrepancy Alert
                </span>
              </div>
              <div className="flex gap-4 ml-auto">
                {missingCount > 0 && (
                  <div className="flex items-center gap-2 bg-neutral-card/80 border border-danger/30 px-3 py-1.5 rounded">
                    <div className="w-2 h-2 bg-[#ffb4ab]"></div>
                    <div className="flex flex-col leading-none">
                      <span className="text-white font-bold text-sm">{missingCount}</span>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-muted mt-1">Missing</span>
                    </div>
                  </div>
                )}
                {damagedCount > 0 && (
                  <div className="flex items-center gap-2 bg-neutral-card/80 border border-warning/30 px-3 py-1.5 rounded">
                    <div className="w-2 h-2 bg-[#ffc176]"></div>
                    <div className="flex flex-col leading-none">
                      <span className="text-white font-bold text-sm">{damagedCount}</span>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-muted mt-1">Damaged</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1"></div>
          )}

          <div className="flex items-center gap-4 w-full sm:w-auto self-end">
            <button className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-neutral-text border border-border hover:bg-neutral-card rounded transition-colors w-full sm:w-auto">
              Save Draft
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-2 bg-[rgb(var(--color-btn-primary-bg))] hover:bg-[rgb(var(--color-btn-primary-hover))] text-[rgb(var(--color-btn-primary-text))] text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-lg shadow-primary/10 w-full sm:w-auto">
              <Lock size={16} />
              Close Audit Cycle
            </button>
          </div>
        </div>

        {/* Audit History Accordion */}
        <div className="mt-4 border border-border rounded-lg bg-neutral-card/10 overflow-hidden">
          <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-card/30 transition-colors">
            <span className="font-headline-md font-bold uppercase tracking-wider text-neutral-text">
              Audit History
            </span>
            <ChevronDown size={20} className="text-neutral-muted" />
          </button>
        </div>

      </div>
    </Layout>
  );
};
