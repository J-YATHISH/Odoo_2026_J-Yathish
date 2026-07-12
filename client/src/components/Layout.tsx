import React from 'react';
import { Sidebar } from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon } from 'lucide-react';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const userName = user?.name || user?.email || 'System Admin';
  const userRole = user?.role || 'Superuser';

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (email) {
      const namePart = email.split('@')[0];
      return namePart.slice(0, 2).toUpperCase();
    }
    return 'SA';
  };

  const initials = getInitials(user?.name, user?.email);

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-200"
      style={{ backgroundColor: 'rgb(var(--color-surface))', color: 'rgb(var(--color-on-surface))' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header — exact match to reference: h-12, px-4, border-b, bg-surface-container */}
        <header className="h-12 border-b border-outline-variant bg-surface-container flex items-center justify-between px-4 shrink-0 z-20 transition-colors duration-200">
          <h2 className="font-headline-md text-[13px] font-semibold text-on-surface uppercase tracking-wider m-0 leading-none">
            {title}
          </h2>
          <div className="flex items-center gap-4">
            {/* Theme Switch Control */}
            <button
              onClick={toggleTheme}
              className="text-on-surface-variant hover:text-primary-container transition-colors focus:outline-none"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User info — matches reference top-right */}
            <div className="text-right hidden sm:block">
              <span className="font-data-mono text-[12px] text-on-surface block leading-none">
                {userName}
              </span>
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider block mt-0.5">
                {userRole.replace(/_/g, ' ')}
              </span>
            </div>
            {/* Avatar square — matches reference small square */}
            <div className="w-6 h-6 border border-outline-variant bg-surface-container-high flex items-center justify-center shrink-0">
              <span className="font-data-mono text-[10px] font-bold text-primary-container">{initials}</span>
            </div>
          </div>
        </header>

        <main className="flex-grow p-margin-page overflow-y-auto transition-colors duration-200"
          style={{ backgroundColor: 'rgb(var(--color-surface))' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
