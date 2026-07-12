import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotifyProvider } from './context/NotifyContext';

// Import Pages
import { LoginSignup } from './pages/LoginSignup';
import { Dashboard } from './pages/Dashboard';
import { OrganizationSetup } from './pages/OrganizationSetup';
import { AssetRegistration } from './pages/AssetRegistration';
import { AssetAllocation } from './pages/AssetAllocation';
import { ResourceBooking } from './pages/ResourceBooking';
import { MaintenanceManagement } from './pages/MaintenanceManagement';
import { AssetAudit } from './pages/AssetAudit';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { ActivityLogs } from './pages/ActivityLogs';

const App: React.FC = () => {
  return (
    <NotifyProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginSignup />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/organization" element={<OrganizationSetup />} />
            <Route path="/assets" element={<AssetRegistration />} />
            <Route path="/allocations" element={<AssetAllocation />} />
            <Route path="/bookings" element={<ResourceBooking />} />
            <Route path="/maintenance" element={<MaintenanceManagement />} />
            <Route path="/audit" element={<AssetAudit />} />
            <Route path="/reports" element={<ReportsAnalytics />} />
            <Route path="/activity" element={<ActivityLogs />} />
            {/* Catch-all fallback redirecting to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </NotifyProvider>
  );
};

export default App;
