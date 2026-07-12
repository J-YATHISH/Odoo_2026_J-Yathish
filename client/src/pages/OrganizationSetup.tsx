import React, { useState } from 'react';
import { Layout } from '../components/Layout';

type Tab = 'departments' | 'categories' | 'employees';

export const OrganizationSetup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('departments');

  return (
    <Layout title="Organization Setup">
      <div className="space-y-6">
        {/* Tabs Control */}
        <div className="flex border-b border-border gap-2">
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'departments'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-muted hover:text-neutral-text'
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'categories'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-muted hover:text-neutral-text'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'employees'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-muted hover:text-neutral-text'
            }`}
          >
            Employees
          </button>
        </div>

        {/* Dynamic Tab Panel */}
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center border border-dashed border-border rounded-2xl p-12 bg-neutral-card/25">
          {activeTab === 'departments' && (
            <p className="text-neutral-muted text-sm font-medium tracking-wide">
              Coming in Organization Setup build (Departments Tab).
            </p>
          )}
          {activeTab === 'categories' && (
            <p className="text-neutral-muted text-sm font-medium tracking-wide">
              Coming in Organization Setup build (Categories Tab).
            </p>
          )}
          {activeTab === 'employees' && (
            <p className="text-neutral-muted text-sm font-medium tracking-wide">
              Coming in Organization Setup build (Employees Tab).
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};
