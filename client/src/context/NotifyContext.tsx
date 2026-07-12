/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/purity */
import React, { createContext, useContext, useState } from 'react';

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  message: string;
}

interface NotifyContextType {
  notifications: NotificationItem[];
  notify: (message: string, type?: NotificationItem['type']) => void;
  dismiss: (id: string) => void;
}

const NotifyContext = createContext<NotifyContextType | undefined>(undefined);

export const NotifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const notify = (message: string, type: NotificationItem['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Auto-dismiss notification after 5 seconds
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotifyContext.Provider value={{ notifications, notify, dismiss }}>
      {children}
      {/* Toast notifications container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => dismiss(n.id)}
            className={`p-4 rounded border cursor-pointer shadow-lg transition-all duration-300 transform hover:scale-102 flex items-center justify-between ${
              n.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
                : n.type === 'warning'
                  ? 'bg-amber-950/80 border-amber-500/30 text-amber-200'
                  : n.type === 'danger'
                    ? 'bg-rose-950/80 border-rose-500/30 text-rose-200'
                    : 'bg-slate-900/80 border-slate-700/30 text-slate-200'
            }`}
          >
            <span className="text-sm font-medium">{n.message}</span>
            <span className="text-xs opacity-50 ml-2">×</span>
          </div>
        ))}
      </div>
    </NotifyContext.Provider>
  );
};

export const useNotify = () => {
  const context = useContext(NotifyContext);
  if (context === undefined) {
    throw new Error('useNotify must be used within a NotifyProvider');
  }
  return context;
};
