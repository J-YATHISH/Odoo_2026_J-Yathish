import React from 'react';
import { Layout } from '../components/Layout';

export const MaintenanceManagement: React.FC = () => {
  return (
    <Layout title="Maintenance Management">
      <div className="flex flex-col items-center justify-center min-h-[42vh] text-center border border-dashed border-border rounded-lg p-6 bg-neutral-card/20">
        <p className="text-neutral-muted text-sm font-medium tracking-wide">
          Coming in Maintenance Management build.
        </p>
      </div>
    </Layout>
  );
};
