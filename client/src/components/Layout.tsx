import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  return (
    <div className="flex min-h-screen bg-neutral-bg text-neutral-text">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-neutral-card/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
          <h2 className="text-md font-semibold text-neutral-text tracking-wide m-0">
            {title}
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-medium text-neutral-text block leading-none">
                System Admin
              </span>
              <span className="text-[10px] text-neutral-muted uppercase tracking-wider font-semibold">
                Superuser
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/20">
              <span className="text-xs font-semibold text-primary">SA</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 bg-neutral-bg overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
