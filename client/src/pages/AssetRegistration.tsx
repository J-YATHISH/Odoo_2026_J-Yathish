import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Search, ChevronDown, CheckSquare, Square, X, FileText, Download } from 'lucide-react';

type AssetStatus = 'OPERATIONAL' | 'MAINTENANCE';

interface Asset {
  id: string;
  tag: string;
  name: string;
  category: string;
  status: AssetStatus;
  description: string;
  serialNumber: string;
  acquisitionDate: string;
  currentValue: string;
  nextCalibration: string;
}

const mockAssets: Asset[] = [
  {
    id: '1',
    tag: 'AST-8492-X',
    name: 'Hydraulic Press 50T',
    category: 'Machinery',
    status: 'OPERATIONAL',
    description: 'Heavy-duty hydraulic press for metal stamping and forming. Mfr: Atlas Industrial.',
    serialNumber: 'SN-992-881A',
    acquisitionDate: '2021-11-04',
    currentValue: '$45,000.00',
    nextCalibration: '2024-03-15',
  },
  {
    id: '2',
    tag: 'AST-8493-X',
    name: 'CNC Milling Machine',
    category: 'Machinery',
    status: 'MAINTENANCE',
    description: 'High-precision 5-axis CNC mill for custom part fabrication.',
    serialNumber: 'SN-402-992B',
    acquisitionDate: '2022-01-15',
    currentValue: '$85,500.00',
    nextCalibration: '2023-12-01',
  },
  {
    id: '3',
    tag: 'AST-9102-Y',
    name: 'Industrial Forklift',
    category: 'Vehicles',
    status: 'OPERATIONAL',
    description: 'Electric counter-balance forklift for warehouse logistics.',
    serialNumber: 'FL-220-410C',
    acquisitionDate: '2020-05-20',
    currentValue: '$22,000.00',
    nextCalibration: '2024-06-10',
  }
];

export const AssetRegistration: React.FC = () => {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>('1');

  const selectedAsset = mockAssets.find(a => a.id === selectedAssetId);

  return (
    <Layout title="Asset Master Ledger">
      <div className="flex h-full w-full -mt-2">
        {/* Left Area: Main Table */}
        <div className="flex-1 flex flex-col min-w-0 pr-6 transition-all duration-300">

          {/* Toolbar */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-outline">
                <Search size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Tag, Serial, QR..." 
                className="w-full bg-surface-container border border-outline-variant rounded-none text-sm px-10 py-2 text-on-surface font-data-mono placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="relative w-48">
              <select className="w-full appearance-none bg-surface-container border border-outline-variant rounded-none text-sm font-data-mono px-4 py-2 pr-10 text-on-surface focus:outline-none focus:border-primary cursor-pointer">
                <option>Category: All</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-outline">
                <ChevronDown size={16} />
              </div>
            </div>

            <div className="relative w-48">
              <select className="w-full appearance-none bg-surface-container border border-outline-variant rounded-none text-sm font-data-mono px-4 py-2 pr-10 text-on-surface focus:outline-none focus:border-primary cursor-pointer">
                <option>Status: All</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-outline">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="border border-outline-variant rounded-none overflow-hidden bg-surface">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low font-label-sm uppercase tracking-widest text-outline">
                  <th className="px-4 py-3 w-12 border-r border-outline-variant"></th>
                  <th className="px-4 py-3 border-r border-outline-variant">Asset Tag</th>
                  <th className="px-4 py-3 border-r border-outline-variant">Name</th>
                  <th className="px-4 py-3 border-r border-outline-variant">Category</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {mockAssets.map((asset) => {
                  const isSelected = asset.id === selectedAssetId;
                  return (
                    <tr 
                      key={asset.id}
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`cursor-pointer transition-colors group ${
                        isSelected ? 'bg-surface-container-highest border-l-4 border-primary' : 'hover:bg-surface-container-high border-l-4 border-transparent'
                      }`}
                    >
                      <td className="px-4 py-3 text-outline border-r border-outline-variant">
                        {isSelected ? (
                          <CheckSquare size={18} className="text-primary" />
                        ) : (
                          <Square size={18} className="group-hover:text-primary/50" />
                        )}
                      </td>
                      <td className="px-4 py-3 border-r border-outline-variant">
                        <span className={`font-data-mono text-sm px-2 py-0.5 rounded-none border ${
                          isSelected 
                            ? 'bg-primary-container/10 border-primary text-primary' 
                            : 'bg-surface-container border-outline-variant text-on-surface'
                        }`}>
                          {asset.tag}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-headline-md text-sm text-on-surface border-r border-outline-variant">
                        {asset.name}
                      </td>
                      <td className="px-4 py-3 text-sm font-data-mono text-outline border-r border-outline-variant">
                        {asset.category}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-label-sm text-[10px] uppercase tracking-wider px-2 py-1 rounded-none border ${
                          asset.status === 'OPERATIONAL' 
                            ? 'text-tertiary border-tertiary/30 bg-tertiary/5' 
                            : 'text-error border-error/30 bg-error/5'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Area: Asset Details Panel */}
        {selectedAsset && (
          <div className="w-[380px] shrink-0 border-l border-outline-variant pl-6 flex flex-col h-full overflow-y-auto custom-scrollbar">
            
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-6">
              <span className="font-label-sm text-[10px] uppercase tracking-widest text-on-surface">
                Asset Details
              </span>
              <button 
                onClick={() => setSelectedAssetId(null)}
                className="text-outline hover:text-on-surface transition-colors focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            {/* Asset Badges & Title */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-data-mono text-xs px-2 py-0.5 bg-surface-container border border-outline-variant rounded-none text-on-surface">
                {selectedAsset.tag}
              </span>
              <span className={`font-label-sm text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-none border ${
                selectedAsset.status === 'OPERATIONAL' 
                  ? 'text-tertiary border-tertiary/30 bg-tertiary/5' 
                  : 'text-error border-error/30 bg-error/5'
              }`}>
                {selectedAsset.status}
              </span>
            </div>

            <h2 className="font-headline-md text-[14px] font-semibold text-on-surface mb-2">
              {selectedAsset.name}
            </h2>
            <p className="font-body-md text-sm text-outline mb-6 leading-relaxed">
              {selectedAsset.description}
            </p>

            {/* Document Card */}
            <div className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-none mb-8 group hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <FileText size={24} className="text-outline group-hover:text-on-surface transition-colors" />
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface font-data-mono tracking-wide">
                    MANUAL_V2.PDF
                  </span>
                  <span className="text-[10px] text-outline font-data-mono">
                    1.2 MB
                  </span>
                </div>
              </div>
              <Download size={16} className="text-outline group-hover:text-primary transition-colors" />
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 pb-6 border-b border-outline-variant mb-6">
              <div>
                <span className="block font-label-sm text-[10px] uppercase tracking-widest text-outline mb-1">
                  Serial Number
                </span>
                <span className="font-data-mono text-sm text-on-surface">
                  {selectedAsset.serialNumber}
                </span>
              </div>
              <div>
                <span className="block font-label-sm text-[10px] uppercase tracking-widest text-outline mb-1">
                  Acquisition Date
                </span>
                <span className="font-data-mono text-sm text-on-surface">
                  {selectedAsset.acquisitionDate}
                </span>
              </div>
              <div>
                <span className="block font-label-sm text-[10px] uppercase tracking-widest text-outline mb-1">
                  Current Value
                </span>
                <span className="font-data-mono text-sm text-on-surface">
                  {selectedAsset.currentValue}
                </span>
              </div>
              <div>
                <span className="block font-label-sm text-[10px] uppercase tracking-widest text-outline mb-1">
                  Next Calibration
                </span>
                <span className="font-data-mono text-sm text-primary">
                  {selectedAsset.nextCalibration}
                </span>
              </div>
            </div>

            {/* History Lists */}
            <div className="mb-6">
              <span className="block font-label-sm text-[10px] uppercase tracking-widest text-on-surface mb-4">
                Allocation History
              </span>
              <ul className="space-y-3 border-b border-outline-variant pb-6">
                <li className="flex justify-between items-center text-xs">
                  <span className="text-on-surface font-data-mono">Zone 4, Sec B</span>
                  <span className="text-outline font-data-mono">2023-01-10</span>
                </li>
                <li className="flex justify-between items-center text-xs">
                  <span className="text-on-surface font-data-mono">Zone 1, Sec A</span>
                  <span className="text-outline font-data-mono">2021-11-05</span>
                </li>
              </ul>
            </div>

            <div className="mb-8 flex-grow">
              <span className="block font-label-sm text-[10px] uppercase tracking-widest text-on-surface mb-4">
                Maintenance History
              </span>
              <ul className="space-y-4">
                <li className="flex justify-between items-start text-xs">
                  <div className="flex flex-col">
                    <span className="text-on-surface font-data-mono mb-1">Fluid Replacement</span>
                    <span className="text-[10px] text-outline font-data-mono">Tech: R. Davies</span>
                  </div>
                  <span className="text-outline font-data-mono pt-0.5">2023-08-22</span>
                </li>
                <li className="flex justify-between items-start text-xs">
                  <div className="flex flex-col">
                    <span className="text-on-surface font-data-mono mb-1">Annual Calibration</span>
                    <span className="text-[10px] text-outline font-data-mono">Vendor: Atlas</span>
                  </div>
                  <span className="text-outline font-data-mono pt-0.5">2023-03-14</span>
                </li>
              </ul>
            </div>

            {/* Action Button */}
            <button className="w-full py-3 bg-surface border border-outline-variant hover:bg-surface-container-high hover:border-primary font-label-sm text-[10px] uppercase tracking-widest text-on-surface transition-colors mt-auto mb-4">
              View Full Log
            </button>

          </div>
        )}

      </div>
    </Layout>
  );
};
