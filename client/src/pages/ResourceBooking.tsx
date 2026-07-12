import React, { useEffect, useState, useRef } from 'react';
import { Layout } from '../components/Layout';
import { fetchBookings } from '../api/bookings';
import type { Booking } from '../api/bookings';

// ---------- Types ----------
type BookingStatus = 'completed' | 'ongoing' | 'upcoming' | 'conflict' | 'new-request';

interface TimeSlotBooking {
  id: string;
  code: string;
  description: string;
  startHour: number;   // e.g. 9.0 = 09:00, 10.5 = 10:30
  endHour: number;
  status: BookingStatus;
}

interface AssetOption {
  value: string;
  label: string;
}

interface AssetDetail {
  code: string;
  name: string;
  capacity: string;
  eqpStatus: string;
  inventory: string[];
}

interface ConflictInfo {
  conflictSlot: string;
  overlapsWithCode: string;
  alternatives: { slot: string; status: string }[];
}

// ---------- Mock Data (matches the HTML mockup exactly) ----------
const ASSET_OPTIONS: AssetOption[] = [
  { value: 'CR-B2', label: 'Conference Room B2' },
  { value: 'LAB-01', label: 'Testing Lab 01' },
  { value: 'VEH-HVY-3', label: 'Heavy Vehicle 3' },
];

const MOCK_ASSET_DETAIL: AssetDetail = {
  code: 'CR-B2',
  name: 'Main Operations Conference Room',
  capacity: '12 PAX',
  eqpStatus: 'ONLINE',
  inventory: ['PROJECTOR', 'WHITEBOARD', 'VC_SYS'],
};

const MOCK_BOOKINGS: TimeSlotBooking[] = [
  {
    id: 'bk-1',
    code: 'SYS_MAINT_01',
    description: 'M. Chen - Routine Check',
    startHour: 9,
    endHour: 10,
    status: 'completed',
  },
  {
    id: 'bk-2',
    code: 'ENG_MEET_A',
    description: 'S. Rogers - Project Alpha Alignment',
    startHour: 10.5,
    endHour: 12.5,
    status: 'ongoing',
  },
  {
    id: 'bk-3',
    code: 'EXT_VND_04',
    description: 'Vendor Presentation - Acme Corp',
    startHour: 13,
    endHour: 14,
    status: 'upcoming',
  },
];

const MOCK_CONFLICT: ConflictInfo = {
  conflictSlot: '10:30 - 12:00',
  overlapsWithCode: 'ENG_MEET_A',
  alternatives: [
    { slot: '08:00 - 09:00', status: 'AVAILABLE' },
    { slot: '12:00 - 13:00', status: 'AVAILABLE' },
    { slot: '14:00 - 15:30', status: 'AVAILABLE' },
  ],
};

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const HOUR_HEIGHT = 60; // px per hour row

// ---------- Helpers ----------

// ---------- Component ----------
export const ResourceBooking: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState('CR-B2');
  const [selectedDate, setSelectedDate] = useState('2024-05-15');
  const [bookings, setBookings] = useState<TimeSlotBooking[]>(MOCK_BOOKINGS);
  const [assetDetail] = useState<AssetDetail>(MOCK_ASSET_DETAIL);
  const [conflict] = useState<ConflictInfo | null>(MOCK_CONFLICT);
  const scheduleRef = useRef<HTMLDivElement>(null);

  // Current time indicator position (mock at ~13:30 for visual match)
  const [currentTimeOffset, setCurrentTimeOffset] = useState(330);

  useEffect(() => {
    // Calculate real current time position
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    if (currentHour >= 8 && currentHour <= 18) {
      setCurrentTimeOffset((currentHour - 8) * HOUR_HEIGHT);
    }
  }, []);

  // Scroll to ~09:00 on mount
  useEffect(() => {
    if (scheduleRef.current) {
      scheduleRef.current.scrollTop = 30;
    }
  }, []);

  // Try fetching real bookings from the backend on mount
  useEffect(() => {
    let cancelled = false;

    const loadFromBackend = async () => {
      try {
        const dbBookings: Booking[] = await fetchBookings();
        if (cancelled || dbBookings.length === 0) return;

        const mapped: TimeSlotBooking[] = dbBookings.slice(0, 5).map((b) => {
          const start = new Date(b.startTime);
          const end = new Date(b.endTime);
          const startH = start.getHours() + start.getMinutes() / 60;
          const endH = end.getHours() + end.getMinutes() / 60;

          let status: BookingStatus = 'upcoming';
          if (b.status === 'COMPLETED' || b.status === 'completed') status = 'completed';
          else if (b.status === 'ACTIVE' || b.status === 'active' || b.status === 'ongoing') status = 'ongoing';

          return {
            id: `db-${b.id}`,
            code: `BK-${b.id.toString().padStart(3, '0')}`,
            description: `Booked by Employee #${b.bookedById}`,
            startHour: startH >= 8 ? startH : 9,
            endHour: endH <= 18 ? endH : 10,
            status,
          };
        });

        if (!cancelled && mapped.length > 0) {
          setBookings([...mapped, ...MOCK_BOOKINGS]);
        }
      } catch {
        // Backend unavailable — keep mock data
      }
    };

    loadFromBackend();
    return () => { cancelled = true; };
  }, []);

  // Status style helpers
  const getBookingBlockStyle = (status: BookingStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-neutral-bg border-l-4 border-l-success border border-border opacity-70';
      case 'ongoing':
        return 'bg-[#024a79] border-l-4 border-l-[#87b9ef] border border-border';
      case 'upcoming':
        return 'bg-neutral-card border-l-4 border-l-primary border border-border';
      default:
        return 'bg-neutral-card border border-border';
    }
  };

  const getStatusTagStyle = (status: BookingStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-neutral-bg text-success';
      case 'ongoing':
        return 'bg-[#003355] text-[#87b9ef]';
      case 'upcoming':
        return 'bg-neutral-card text-primary';
      default:
        return 'bg-neutral-card text-neutral-muted';
    }
  };

  const getCodeColor = (status: BookingStatus) => {
    switch (status) {
      case 'completed':
        return 'text-neutral-text';
      case 'ongoing':
        return 'text-[#d0e4ff]';
      case 'upcoming':
        return 'text-primary';
      default:
        return 'text-neutral-text';
    }
  };

  const getDescColor = (status: BookingStatus) => {
    switch (status) {
      case 'ongoing':
        return 'text-[#9acbff]';
      default:
        return 'text-neutral-muted';
    }
  };

  return (
    <Layout title="Resource Booking">
      <div className="flex flex-col gap-0 -m-8 h-[calc(100vh-4rem)]">
        {/* ── Control Strip ── */}
        <div className="bg-neutral-card border-b border-border p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Resource Selector */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-[11px] text-neutral-muted uppercase tracking-wider">
                Target Asset
              </label>
              <div className="flex items-center bg-neutral-bg border border-border focus-within:border-primary px-3 py-1.5 w-64">
                <span className="material-symbols-outlined text-neutral-muted mr-2">meeting_room</span>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="bg-transparent text-neutral-text font-data-mono text-[13px] w-full focus:outline-none appearance-none cursor-pointer"
                >
                  {ASSET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-neutral-muted ml-2 pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>

            {/* Date Picker */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-[11px] text-neutral-muted uppercase tracking-wider">Date</label>
              <div className="flex items-center bg-neutral-bg border border-border focus-within:border-primary px-3 py-1.5 w-48">
                <span className="material-symbols-outlined text-neutral-muted mr-2">calendar_today</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-neutral-text font-data-mono text-[13px] w-full focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button className="btn-primary-industrial font-headline-md text-sm font-bold px-4 py-2 flex items-center gap-2 border border-primary/30 shrink-0">
            <span className="material-symbols-outlined">add</span>
            Book Slot
          </button>
        </div>

        {/* ── Schedule Board Layout ── */}
        <div className="flex-1 flex overflow-hidden">
          {/* ── Timeline Grid ── */}
          <div
            ref={scheduleRef}
            className="flex-1 overflow-y-auto relative bg-neutral-bg"
            style={{ scrollbarWidth: 'none' }}
          >
            {/* Current Time Indicator */}
            <div
              className="absolute w-full h-[1px] bg-danger z-30"
              style={{ top: `${currentTimeOffset}px` }}
            >
              <div className="absolute -left-2 -top-1.5 w-3 h-3 bg-danger rounded-full" />
            </div>

            {/* Grid Rows */}
            <div className="relative min-h-max w-full">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex border-t border-border first:border-t-0 relative"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                >
                  {/* Time label */}
                  <div className="w-[60px] flex-shrink-0 flex items-start justify-end pr-2 pt-1 border-r border-border bg-neutral-card z-20">
                    <span className="font-data-mono text-xs text-neutral-muted">
                      {String(hour).padStart(2, '0')}:00
                    </span>
                  </div>
                  {/* Grid cell with tech-grid pattern */}
                  <div
                    className="flex-1"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, rgb(var(--color-border) / 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--color-border) / 0.3) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                  {/* Half-hour dashed line */}
                  <div
                    className="absolute border-t border-dashed border-border"
                    style={{ top: '50%', left: '60px', right: 0, zIndex: 0 }}
                  />
                </div>
              ))}

              {/* ── Booking Blocks ── */}
              {bookings.map((bk) => {
                const topPx = (bk.startHour - 8) * HOUR_HEIGHT;
                const heightPx = (bk.endHour - bk.startHour) * HOUR_HEIGHT;

                return (
                  <div
                    key={bk.id}
                    className={`absolute z-10 group ${getBookingBlockStyle(bk.status)}`}
                    style={{
                      top: `${topPx}px`,
                      height: `${heightPx}px`,
                      left: '60px',
                      right: 0,
                      padding: '4px 8px',
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`font-data-mono text-xs ${getCodeColor(bk.status)}`}>{bk.code}</span>
                      <span
                        className={`font-label-sm text-[11px] uppercase tracking-wider px-1 py-0.5 ${getStatusTagStyle(
                          bk.status
                        )}`}
                      >
                        {bk.status === 'completed'
                          ? 'Completed'
                          : bk.status === 'ongoing'
                          ? 'Ongoing'
                          : 'Upcoming'}
                      </span>
                    </div>
                    <span className={`font-body-md text-sm mt-1 truncate block ${getDescColor(bk.status)}`}>
                      {bk.description}
                    </span>

                    {/* Hover Actions */}
                    {bk.status !== 'completed' && (
                      <div className="absolute bottom-1 right-1 hidden group-hover:flex gap-1 bg-neutral-card p-0.5 border border-border">
                        <button className="p-1 hover:bg-neutral-muted/15 text-neutral-text" title="Reschedule">
                          <span className="material-symbols-outlined text-xs">edit_calendar</span>
                        </button>
                        <button className="p-1 hover:bg-danger/15 hover:text-danger text-neutral-text" title="Cancel">
                          <span className="material-symbols-outlined text-xs">cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ── Conflict overlay (10:30 - 12:00) ── */}
              {conflict && (
                <div
                  className="absolute z-20 border border-dashed border-danger flex flex-col justify-center items-center pointer-events-none"
                  style={{
                    top: `${(10.5 - 8) * HOUR_HEIGHT}px`,
                    height: `${1.5 * HOUR_HEIGHT}px`,
                    left: '60px',
                    right: 0,
                    backgroundColor: 'rgba(147, 0, 10, 0.1)',
                    padding: '4px 8px',
                  }}
                >
                  <div className="flex items-center gap-2 text-danger bg-neutral-bg px-2 py-1 border border-danger/30">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    <span className="font-data-mono text-xs">CONFLICT: {conflict.conflictSlot}</span>
                  </div>
                </div>
              )}

              {/* ── New Request overlay (15:30 - 16:30) ── */}
              <div
                className="absolute z-20 border border-dashed border-primary/50 flex justify-center items-center pointer-events-none"
                style={{
                  top: `${(15.5 - 8) * HOUR_HEIGHT}px`,
                  height: `${1 * HOUR_HEIGHT}px`,
                  left: '60px',
                  right: 0,
                  backgroundColor: 'rgba(255, 185, 97, 0.05)',
                  padding: '4px 8px',
                }}
              >
                <span className="font-data-mono text-xs text-primary bg-neutral-bg px-2 border border-primary/40">
                  NEW REQUEST
                </span>
              </div>
            </div>
          </div>

          {/* ── Context Panel (Right Side) ── */}
          <div className="w-80 border-l border-border bg-neutral-card flex flex-col flex-shrink-0 hidden lg:flex">
            <div className="p-4 border-b border-border">
              <h2 className="font-headline-md text-sm font-bold text-neutral-text uppercase tracking-wider">
                Asset Details
              </h2>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {/* Asset info */}
              <div className="mb-6">
                <div className="font-data-mono text-lg text-primary mb-1">{assetDetail.code}</div>
                <div className="font-body-md text-sm text-neutral-muted">{assetDetail.name}</div>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6 border border-border p-3 bg-neutral-bg">
                <div>
                  <div className="font-label-sm text-[11px] text-neutral-muted mb-1 uppercase tracking-wider">
                    Capacity
                  </div>
                  <div className="font-data-mono text-sm text-neutral-text">{assetDetail.capacity}</div>
                </div>
                <div>
                  <div className="font-label-sm text-[11px] text-neutral-muted mb-1 uppercase tracking-wider">
                    Eqp Status
                  </div>
                  <div className="font-data-mono text-sm text-success">{assetDetail.eqpStatus}</div>
                </div>
                <div className="col-span-2 border-t border-border pt-2 mt-1">
                  <div className="font-label-sm text-[11px] text-neutral-muted mb-1 uppercase tracking-wider">
                    Inventory
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {assetDetail.inventory.map((item) => (
                      <span
                        key={item}
                        className="bg-neutral-card border border-border px-1.5 py-0.5 font-data-mono text-[10px] text-neutral-muted"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Conflict Resolution Panel */}
              {conflict && (
                <div className="border border-danger/30 bg-danger/5 p-3 mb-6 relative">
                  <div className="absolute -top-2.5 left-3 bg-neutral-card px-1 font-label-sm text-[11px] text-danger uppercase tracking-wider">
                    Resolution Req
                  </div>
                  <p className="font-body-md text-sm text-neutral-text mt-2 mb-3">
                    Requested slot {conflict.conflictSlot} overlaps with{' '}
                    <span className="font-data-mono text-[#d0e4ff]">{conflict.overlapsWithCode}</span>.
                  </p>
                  <div className="font-label-sm text-[11px] text-neutral-muted mb-2 uppercase tracking-wider">
                    Suggested Alternatives
                  </div>
                  <div className="flex flex-col gap-2">
                    {conflict.alternatives.map((alt) => (
                      <button
                        key={alt.slot}
                        className="flex justify-between items-center bg-neutral-bg border border-border p-2 hover:border-success group text-left cursor-pointer transition-colors"
                      >
                        <span className="font-data-mono text-sm text-neutral-text">{alt.slot}</span>
                        <span className="font-label-sm text-[10px] bg-neutral-card px-1 text-success group-hover:bg-success/20">
                          {alt.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
