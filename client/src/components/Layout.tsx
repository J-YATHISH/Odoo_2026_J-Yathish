import React from 'react';
import { Sidebar } from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  const { theme, toggleTheme } = useTheme();

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
              <span className="font-headline-md text-xs text-on-surface block leading-none">
                System Admin
              </span>
              <span className="font-label-sm text-outline uppercase">
                Superuser
              </span>
            </div>
            <div className="w-9 h-9 bg-primary-container/10 flex items-center justify-center border border-primary-container/30">
              <span className="font-headline-md text-xs text-primary">SA</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-grow p-8 bg-neutral-bg overflow-y-auto transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};
