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
    <div className="flex h-screen overflow-hidden bg-neutral-bg text-neutral-text transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-outline-variant bg-surface-container flex items-center justify-between px-8 shrink-0 z-30 transition-colors duration-200">
          <h2 className="font-headline-md text-on-surface tracking-wide m-0">
            {title}
          </h2>
          <div className="flex items-center gap-4">
            {/* Theme Switch Control */}
            <button
              onClick={toggleTheme}
              className="p-2 text-outline hover:text-on-surface hover:bg-surface-bright/20 transition-all focus:outline-none w-9 h-9 flex items-center justify-center border border-transparent hover:border-outline-variant"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} className="text-primary" /> : <Moon size={18} />}
            </button>

            <div className="text-right hidden sm:block">
              <span className="text-xs font-medium text-neutral-text block leading-none">
                {userName}
              </span>
              <span className="text-[10px] text-neutral-muted uppercase tracking-wider font-semibold">
                {userRole.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/20">
              <span className="text-xs font-semibold text-primary">{initials}</span>
            </div>
          </div>
        </header>

        <main className="flex-grow p-8 bg-neutral-bg overflow-y-auto transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};
