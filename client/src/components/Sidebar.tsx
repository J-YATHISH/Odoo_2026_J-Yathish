import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchOrganizationInfo } from '../api/organization';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const [orgName, setOrgName] = useState<string>('Enterprise Ledger');

  useEffect(() => {
    fetchOrganizationInfo()
      .then((info) => {
        setOrgName(info.name);
      })
      .catch((err) => {
        console.error('Failed to fetch organization info:', err);
      });
  }, []);

  const menuItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/', icon: <span className="material-symbols-outlined text-[16px]">dashboard</span> },
    { name: 'Organization Setup', path: '/organization', icon: <span className="material-symbols-outlined text-[16px]">corporate_fare</span> },
    { name: 'Asset Directory', path: '/assets', icon: <span className="material-symbols-outlined text-[16px]">inventory_2</span> },
    { name: 'Asset Allocation', path: '/allocations', icon: <span className="material-symbols-outlined text-[16px]">swap_horiz</span> },
    { name: 'Resource Booking', path: '/bookings', icon: <span className="material-symbols-outlined text-[16px]">calendar_today</span> },
    { name: 'Maintenance', path: '/maintenance', icon: <span className="material-symbols-outlined text-[16px]">build</span> },
    { name: 'Asset Audit', path: '/audit', icon: <span className="material-symbols-outlined text-[16px]">fact_check</span> },
    { name: 'Reports & Analytics', path: '/reports', icon: <span className="material-symbols-outlined text-[16px]">analytics</span> },
    { name: 'Activity Logs', path: '/activity', icon: <span className="material-symbols-outlined text-[16px]">history</span> },
  ];

  return (
    <aside className="w-[240px] bg-surface border-r border-outline-variant h-screen flex flex-col shrink-0 transition-colors duration-200 z-30">
      {/* Brand Header */}
      <div className="px-4 py-4 border-b border-outline-variant flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 border border-outline-variant bg-surface-container flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[16px]">precision_manufacturing</span>
        </div>
        <div>
          <h1 className="font-headline-md text-[14px] font-bold text-primary-container uppercase m-0 p-0 leading-none tracking-wide">
            AssetFlow
          </h1>
          <span className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant truncate block max-w-[150px] mt-0.5" title={orgName}>
            {orgName}
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-grow py-4 flex flex-col gap-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 font-label-sm text-[11px] uppercase tracking-wider transition-colors duration-150 border-l-[3px] ${
                isActive
                  ? 'bg-surface-container-high text-primary border-primary'
                  : 'border-transparent text-on-surface-variant hover:bg-surface-container-low'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Action at the very bottom */}
      <div className="p-4 border-t border-outline-variant shrink-0">
        <button
          onClick={logout}
          className="w-full bg-primary-container text-on-primary-container font-label-sm text-[10px] uppercase tracking-wider py-1.5 flex items-center justify-center gap-1.5 hover:bg-primary-fixed-dim transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
