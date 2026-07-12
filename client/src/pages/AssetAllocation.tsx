import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { fetchAllocations } from '../api/allocations';
import { fetchAssets } from '../api/assets';

// ---------- Types ----------
interface AllocationHistory {
  assetTag: string;
  assignee: string;
  startDate: string;
  endDate: string;
  status: 'OVERDUE' | 'RETURNED' | 'ACTIVE';
  notes: string;
}

interface TransferStep {
  label: string;
  detail: string;
  state: 'done' | 'pending' | 'future';
}

// ---------- Mock Data (matches the HTML mockup exactly) ----------
const MOCK_HISTORY: AllocationHistory[] = [
  {
    assetTag: 'AF-9932',
    assignee: 'R. Vance',
    startDate: '2023-10-01',
    endDate: '2023-10-10',
    status: 'OVERDUE',
    notes: 'Field op extended.',
  },
  {
    assetTag: 'AF-9932',
    assignee: 'L. Gomez',
    startDate: '2023-09-15',
    endDate: '2023-09-28',
    status: 'RETURNED',
    notes: 'Routine maint required.',
  },
  {
    assetTag: 'AF-9932',
    assignee: 'T. Sterling',
    startDate: '2023-08-01',
    endDate: '2023-08-14',
    status: 'RETURNED',
    notes: '--',
  },
];

const TRANSFER_STEPS: TransferStep[] = [
  { label: 'Requested', detail: 'Oct 12, 09:14 AM by T. Sterling', state: 'done' },
  { label: 'Approval Pending', detail: 'Awaiting Supervisor Authorization', state: 'pending' },
  { label: 'Re-Allocated', detail: '', state: 'future' },
];

const ASSIGNEE_OPTIONS = ['T. Sterling', 'M. Chen', 'J. Doe'];

// ---------- Component ----------
export const AssetAllocation: React.FC = () => {
  // Form state
  const [searchTag, setSearchTag] = useState('AF-9932');
  const [hasConflict, setHasConflict] = useState(true);
  const [transferTo, setTransferTo] = useState(ASSIGNEE_OPTIONS[0]);
  const [reason, setReason] = useState('');
  const [history, setHistory] = useState<AllocationHistory[]>(MOCK_HISTORY);
  const [steps] = useState<TransferStep[]>(TRANSFER_STEPS);
  const [conditionCheckin, setConditionCheckin] = useState<'nominal' | 'damaged' | null>(null);
  const [submitFlash, setSubmitFlash] = useState(false);
  const [returnFlash, setReturnFlash] = useState(false);

  // Current custodian derived from conflict state
  const currentCustodian = hasConflict
    ? { name: 'R. Vance', location: 'Sector 4B' }
    : null;

  // Try fetching real data from the backend on mount
  useEffect(() => {
    let cancelled = false;

    const loadFromBackend = async () => {
      try {
        const [allocations, assets] = await Promise.all([
          fetchAllocations(),
          fetchAssets(),
        ]);

        if (cancelled || allocations.length === 0) return;

        // Map real data into history format
        const mapped: AllocationHistory[] = allocations.slice(0, 5).map((alloc) => {
          const asset = assets.find((a) => a.id === alloc.assetId);
          return {
            assetTag: asset?.tag || `AF-${alloc.assetId.toString().padStart(4, '0')}`,
            assignee: `Employee #${alloc.holderId}`,
            startDate: new Date(alloc.allocatedAt).toISOString().split('T')[0],
            endDate: alloc.isActive ? '--' : new Date(alloc.allocatedAt).toISOString().split('T')[0],
            status: alloc.isActive ? 'ACTIVE' : 'RETURNED',
            notes: alloc.isActive ? 'Currently allocated' : 'Returned',
          };
        });

        if (!cancelled && mapped.length > 0) {
          setHistory([...mapped, ...MOCK_HISTORY]);
        }
      } catch {
        // Backend unavailable — keep mock data
      }
    };

    loadFromBackend();
    return () => { cancelled = true; };
  }, []);

  const handleLookup = () => {
    // Simulate lookup — re-trigger conflict for mock
    if (searchTag.trim().toUpperCase() === 'AF-9932') {
      setHasConflict(true);
    } else {
      setHasConflict(false);
    }
  };

  const handleSubmitTransfer = () => {
    setSubmitFlash(true);
    setTimeout(() => setSubmitFlash(false), 600);
  };

  const handleMarkReturned = () => {
    setReturnFlash(true);
    setHasConflict(false);
    setConditionCheckin(null);
    setTimeout(() => setReturnFlash(false), 600);
  };

  // Status badge styling
  const statusBadge = (status: AllocationHistory['status']) => {
    if (status === 'OVERDUE') {
      return 'bg-neutral-card text-neutral-text border border-[#C25D4E] px-1 py-0.5 uppercase text-[10px] tracking-wider font-data-mono';
    }
    if (status === 'ACTIVE') {
      return 'bg-neutral-card text-primary border border-primary/30 px-1 py-0.5 uppercase text-[10px] tracking-wider font-data-mono';
    }
    return 'bg-border text-neutral-text px-1 py-0.5 uppercase text-[10px] tracking-wider font-data-mono';
  };

  return (
    <Layout title="Asset Allocation & Transfer">
      <div className="flex flex-col gap-6">
        {/* ═══ Top Section: Two Zones ═══ */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── LEFT ZONE (60%) ── */}
          <div className="lg:w-[60%] flex flex-col gap-6">
            {/* Asset Selector */}
            <section className="bg-neutral-card border border-border p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h2 className="font-headline-md text-base uppercase font-semibold text-neutral-text">
                  Asset Selection
                </h2>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block font-label-sm text-[11px] text-neutral-muted mb-1 uppercase tracking-wider">
                    Asset ID / Tag
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 material-symbols-outlined text-neutral-muted text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchTag}
                      onChange={(e) => setSearchTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                      placeholder="Scan or type ID..."
                      className="w-full bg-neutral-bg border border-border text-neutral-text font-data-mono text-[13px] pl-10 pr-3 py-2 rounded-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                </div>
                <button
                  onClick={handleLookup}
                  className="bg-border text-neutral-text font-headline-md text-[14px] px-4 py-2 border border-border hover:bg-neutral-muted/20 transition-colors h-[38px] uppercase"
                >
                  Lookup
                </button>
              </div>
            </section>

            {/* Conflict Panel */}
            {hasConflict && (
              <section className="bg-neutral-card border border-border flex relative">
                {/* Red accent bar */}
                <div className="w-1 bg-[#C25D4E] absolute left-0 top-0 bottom-0" />

                <div className="p-6 pl-8 flex-1 flex flex-col gap-6">
                  {/* Conflict Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start border-b border-border pb-4 gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h2 className="font-headline-md text-[14px] uppercase text-[#C25D4E] font-semibold">
                          Allocation Conflict
                        </h2>
                        <span className="bg-[#C25D4E] text-[#111316] font-label-sm text-[11px] px-2 py-0.5 uppercase tracking-wider font-semibold">
                          Already Allocated
                        </span>
                      </div>
                      <p className="font-data-mono text-[13px] text-neutral-muted">
                        Asset <span className="text-neutral-text">{searchTag.toUpperCase()}</span> (Precision Calibrator
                        X-4) is currently checked out.
                      </p>
                    </div>
                    {currentCustodian && (
                      <div className="bg-neutral-bg border border-border p-2 text-right shrink-0">
                        <div className="font-label-sm text-[11px] text-neutral-muted uppercase mb-1 tracking-wider">
                          Current Custodian
                        </div>
                        <div className="font-headline-md text-[16px] uppercase text-neutral-text">
                          {currentCustodian.name}
                        </div>
                        <div className="font-data-mono text-[11px] text-neutral-muted mt-1">
                          Loc: {currentCustodian.location}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transfer Request Form */}
                  <div className="bg-neutral-bg border border-border p-4 flex flex-col gap-4">
                    <h3 className="font-headline-md text-[16px] uppercase border-b border-border pb-2 text-neutral-text">
                      Initiate Transfer Request
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-label-sm text-[11px] text-neutral-muted mb-1 uppercase tracking-wider">
                          Transfer From
                        </label>
                        <input
                          type="text"
                          value={currentCustodian?.name || ''}
                          disabled
                          className="w-full bg-neutral-card border border-border text-neutral-muted font-data-mono text-[13px] px-3 py-2 rounded-none opacity-70 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block font-label-sm text-[11px] text-neutral-muted mb-1 uppercase tracking-wider">
                          Transfer To
                        </label>
                        <select
                          value={transferTo}
                          onChange={(e) => setTransferTo(e.target.value)}
                          className="w-full bg-neutral-bg border border-border text-neutral-text font-data-mono text-[13px] px-3 py-2 rounded-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                        >
                          {ASSIGNEE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block font-label-sm text-[11px] text-neutral-muted mb-1 uppercase tracking-wider">
                        Reason for Transfer
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter justification..."
                        className="w-full bg-neutral-bg border border-border text-neutral-text font-body-md text-sm px-3 py-2 rounded-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-20 resize-none"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mt-2 border-t border-border pt-4">
                      <button
                        onClick={handleSubmitTransfer}
                        className={`btn-primary-industrial font-headline-md text-[14px] px-6 py-2 uppercase flex-1 text-center font-bold tracking-wide transition-all ${
                          submitFlash ? 'ring-2 ring-primary ring-offset-1 ring-offset-neutral-bg' : ''
                        }`}
                      >
                        Submit Transfer Request
                      </button>
                      <button
                        onClick={handleMarkReturned}
                        className={`btn-secondary-industrial font-headline-md text-[14px] px-6 py-2 uppercase transition-all ${
                          returnFlash ? 'ring-2 ring-success ring-offset-1 ring-offset-neutral-bg' : ''
                        }`}
                      >
                        Mark As Returned
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* No-conflict state */}
            {!hasConflict && (
              <section className="bg-neutral-card border border-border p-6 flex flex-col items-center justify-center gap-3 min-h-[200px]">
                <span className="material-symbols-outlined text-success text-[40px]">check_circle</span>
                <p className="font-headline-md text-base uppercase text-success">Asset Available</p>
                <p className="font-data-mono text-[13px] text-neutral-muted">
                  {searchTag.toUpperCase()} is ready for allocation.
                </p>
              </section>
            )}
          </div>

          {/* ── RIGHT ZONE (40%) ── */}
          <div className="lg:w-[40%] flex flex-col gap-6">
            {/* Transfer Status Tracker */}
            <section className="bg-neutral-card border border-border p-4 flex flex-col gap-4">
              <h2 className="font-headline-md text-base uppercase border-b border-border pb-2 font-semibold text-neutral-text">
                Active Request Status
              </h2>
              <div className="flex flex-col gap-0 relative">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-border" />

                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start relative z-10 py-2">
                    {/* Step indicator */}
                    {step.state === 'done' ? (
                      <div className="w-6 h-6 rounded-none bg-primary flex items-center justify-center mt-0.5 outline outline-2 outline-neutral-bg">
                        <span className="material-symbols-outlined text-[#111316] text-[16px] font-bold">check</span>
                      </div>
                    ) : step.state === 'pending' ? (
                      <div className="w-6 h-6 rounded-none bg-neutral-card border border-border flex items-center justify-center mt-0.5 outline outline-2 outline-neutral-bg">
                        <span className="material-symbols-outlined text-neutral-muted text-[16px]">more_horiz</span>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-none bg-neutral-bg border border-border flex items-center justify-center mt-0.5 outline outline-2 outline-neutral-bg opacity-50" />
                    )}

                    {/* Step content */}
                    <div className={step.state === 'future' ? 'opacity-50' : ''}>
                      <div
                        className={`font-headline-md text-[14px] uppercase ${
                          step.state === 'done' ? 'text-primary' : 'text-neutral-muted'
                        }`}
                      >
                        {step.label}
                      </div>
                      {step.detail && (
                        <div className="font-data-mono text-[11px] text-neutral-muted">{step.detail}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Condition Check-in (disabled unless returned) */}
            <section
              className={`bg-neutral-card border border-border p-4 flex flex-col gap-4 transition-opacity ${
                hasConflict ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'
              }`}
            >
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h2 className="font-headline-md text-base uppercase font-semibold text-neutral-text">
                  Condition Check-in
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`flex items-center gap-2 p-2 border cursor-pointer transition-colors ${
                    conditionCheckin === 'nominal'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-neutral-bg'
                  } ${hasConflict ? 'cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="condition"
                    checked={conditionCheckin === 'nominal'}
                    onChange={() => setConditionCheckin('nominal')}
                    disabled={hasConflict}
                    className="accent-primary"
                  />
                  <span className="font-headline-md text-[14px] uppercase text-neutral-text">Nominal</span>
                </label>
                <label
                  className={`flex items-center gap-2 p-2 border cursor-pointer transition-colors ${
                    conditionCheckin === 'damaged'
                      ? 'border-[#C25D4E] bg-[#C25D4E]/10'
                      : 'border-border bg-neutral-bg'
                  } ${hasConflict ? 'cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="condition"
                    checked={conditionCheckin === 'damaged'}
                    onChange={() => setConditionCheckin('damaged')}
                    disabled={hasConflict}
                    className="accent-[#C25D4E]"
                  />
                  <span className="font-headline-md text-[14px] uppercase text-[#C25D4E]">Damaged</span>
                </label>
              </div>
            </section>
          </div>
        </div>

        {/* ═══ Bottom Section: Allocation History Ledger ═══ */}
        <section className="bg-neutral-card border border-border flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center bg-neutral-card/60">
            <h2 className="font-headline-md text-base uppercase font-semibold text-neutral-text">
              Allocation History Ledger
            </h2>
            <span className="font-data-mono text-[13px] text-neutral-muted">Last {history.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-bg border-b border-border">
                  <th className="font-label-sm text-[11px] text-neutral-muted uppercase py-2 px-4 w-[120px] tracking-wider">
                    Asset Tag
                  </th>
                  <th className="font-label-sm text-[11px] text-neutral-muted uppercase py-2 px-4 tracking-wider">
                    Assignee
                  </th>
                  <th className="font-label-sm text-[11px] text-neutral-muted uppercase py-2 px-4 tracking-wider">
                    Start Date
                  </th>
                  <th className="font-label-sm text-[11px] text-neutral-muted uppercase py-2 px-4 tracking-wider">
                    End Date
                  </th>
                  <th className="font-label-sm text-[11px] text-neutral-muted uppercase py-2 px-4 tracking-wider">
                    Status
                  </th>
                  <th className="font-label-sm text-[11px] text-neutral-muted uppercase py-2 px-4 tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="font-data-mono text-[13px]">
                {history.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border hover:bg-neutral-muted/10 transition-colors"
                  >
                    <td className="py-2 px-4 text-neutral-text">{row.assetTag}</td>
                    <td className="py-2 px-4 text-neutral-text">{row.assignee}</td>
                    <td className="py-2 px-4 text-neutral-text">{row.startDate}</td>
                    <td
                      className={`py-2 px-4 ${
                        row.status === 'OVERDUE' ? 'text-[#C25D4E] font-bold' : 'text-neutral-text'
                      }`}
                    >
                      {row.endDate}
                    </td>
                    <td className="py-2 px-4">
                      <span className={statusBadge(row.status)}>{row.status}</span>
                    </td>
                    <td className="py-2 px-4 text-neutral-muted text-[11px]">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
};
