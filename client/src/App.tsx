import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotifyProvider } from './context/NotifyContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';

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
    <ThemeProvider>
      <NotifyProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public authentication portal */}
              <Route path="/login" element={<LoginSignup />} />

              {/* Protected dashboard and operations portals */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organization"
                element={
                  <ProtectedRoute>
                    <OrganizationSetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assets"
                element={
                  <ProtectedRoute>
                    <AssetRegistration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/allocations"
                element={
                  <ProtectedRoute>
                    <AssetAllocation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <ResourceBooking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/maintenance"
                element={
                  <ProtectedRoute>
                    <MaintenanceManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit"
                element={
                  <ProtectedRoute>
                    <AssetAudit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <ReportsAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity"
                element={
                  <ProtectedRoute>
                    <ActivityLogs />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback redirecting to Dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </NotifyProvider>
    </ThemeProvider>
  );
};

export default App;
