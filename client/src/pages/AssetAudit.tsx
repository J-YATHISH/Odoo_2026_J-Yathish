import React from 'react';
import { Layout } from '../components/Layout';

export const AssetAudit: React.FC = () => {
  return (
    <Layout title="Asset Audit">
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center border border-dashed border-border rounded-2xl p-12 bg-neutral-card/20">
        <p className="text-neutral-muted text-sm font-medium tracking-wide">
          Coming in Asset Audit build.
        </p>
      </div>
    </Layout>
  );
};
