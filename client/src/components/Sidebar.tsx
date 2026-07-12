import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  LogIn,
  Users,
  Package,
  ArrowLeftRight,
  Calendar,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  Cpu,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const menuItems: SidebarItem[] = [
    { name: 'Login / Signup', path: '/login', icon: <LogIn size={18} /> },
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
    <aside className="w-64 bg-neutral-card border-r border-border min-h-screen flex flex-col">
      {/* Brand Header */}
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <Cpu size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-neutral-text tracking-wide m-0 p-0 leading-none">
            AssetFlow
          </h1>
          <span className="text-[10px] text-neutral-muted uppercase tracking-wider font-semibold">
            Enterprise Asset
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-neutral-text shadow-md shadow-primary/20'
                  : 'text-neutral-muted hover:text-neutral-text hover:bg-slate-800/40'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-border bg-slate-950/20 text-center">
        <span className="text-[10px] text-neutral-muted block">
          AssetFlow Scaffold v1.0.0
        </span>
      </div>
    </aside>
  );
};
