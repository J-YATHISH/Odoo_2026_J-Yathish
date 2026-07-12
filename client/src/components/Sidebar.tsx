import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchOrganizationInfo } from '../api/organization';
import {
  LayoutDashboard,
  Users,
  Package,
  ArrowLeftRight,
  Calendar,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  Cpu,
  LogOut,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const [orgName, setOrgName] = useState<string>('Enterprise Asset');

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
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Organization Setup', path: '/organization', icon: <Users size={18} /> },
    { name: 'Asset Directory', path: '/assets', icon: <Package size={18} /> },
    { name: 'Asset Allocation', path: '/allocations', icon: <ArrowLeftRight size={18} /> },
    { name: 'Resource Booking', path: '/bookings', icon: <Calendar size={18} /> },
    { name: 'Maintenance', path: '/maintenance', icon: <Wrench size={18} /> },
    { name: 'Asset Audit', path: '/audit', icon: <ClipboardCheck size={18} /> },
    { name: 'Reports & Analytics', path: '/reports', icon: <BarChart3 size={18} /> },
    { name: 'Activity Logs', path: '/activity', icon: <Bell size={18} /> },
  ];

  return (
    <aside className="w-[240px] bg-surface-container border-r border-outline-variant h-screen flex flex-col shrink-0 transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-outline-variant flex items-center gap-3 shrink-0">
        <div className="bg-primary/10 p-2 text-primary transition-colors duration-200 border border-primary/20">
          <Cpu size={24} />
        </div>
        <div>
          <h1 className="font-headline-lg text-on-surface tracking-wide m-0 p-0 leading-none">
            AssetFlow
          </h1>
          <span className="text-[10px] text-neutral-muted uppercase tracking-wider font-semibold truncate block max-w-[150px]" title={orgName}>
            {orgName}
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 font-headline-md text-sm transition-all duration-200 border-l-4 ${
                isActive
                  ? 'bg-surface text-on-surface border-primary-container'
                  : 'border-transparent text-outline hover:text-on-surface hover:bg-surface-bright/20'
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
          className="flex items-center gap-3 px-4 py-3 font-headline-md text-sm w-full text-error hover:bg-error/10 hover:text-error transition-all duration-200 focus:outline-none border-l-4 border-transparent hover:border-error"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
