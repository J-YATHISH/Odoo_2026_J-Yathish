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
    <aside className="w-64 bg-neutral-card border-r border-border h-screen flex flex-col shrink-0 transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-border flex items-center gap-3 shrink-0">
        <div className="bg-primary/10 p-2 rounded-lg text-primary transition-colors duration-200">
          <Cpu size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-neutral-text tracking-wide m-0 p-0 leading-none">
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
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[rgb(var(--color-btn-primary-bg))] text-[rgb(var(--color-btn-primary-text))] shadow-md shadow-primary/5'
                  : 'text-neutral-muted hover:text-neutral-text hover:bg-neutral-muted/10'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Action at the very bottom */}
      <div className="p-4 border-t border-border shrink-0">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full text-danger hover:bg-danger/10 hover:text-danger transition-all duration-200 focus:outline-none"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
