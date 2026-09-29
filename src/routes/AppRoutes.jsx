import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import ManagerLayout from '../layouts/ManagerLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import TeamsPage from '../pages/admin/TeamsPage';
import CreateTeamPage from '../pages/admin/CreateTeamPage';
import ManagersPage from '../pages/admin/ManagersPage';
import CreateManagerPage from '../pages/admin/CreateManagerPage';
import CompetitionsPage from '../pages/admin/CompetitionsPage';
import ParticipantsPage from '../pages/admin/ParticipantsPage';
import ReportsPage from '../pages/admin/ReportsPage';
import MarksReportPage from '../pages/admin/MarksReportPage';

// Shared Pages
import AnnouncementsPage from '../pages/shared/AnnouncementsPage';

// Manager Pages
import ManagerDashboardPage from '../pages/manager/ManagerDashboardPage';
import MyTeamPage from '../pages/manager/MyTeamPage';
import ManagerResultsPage from '../pages/manager/ManagerResultsPage';

export default function AppRoutes() {
  const { isAuthenticated, userRole } = useApp();

  return (
    <Routes>
      {/* Public Auth Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={userRole === 'Admin' ? '/admin/dashboard' : '/manager/dashboard'} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          isAuthenticated ? (
            <AdminLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="teams/new" element={<CreateTeamPage />} />
        <Route path="managers" element={<ManagersPage />} />
        <Route path="managers/new" element={<CreateManagerPage />} />
        <Route path="competitions" element={<CompetitionsPage />} />
        <Route path="participants" element={<ParticipantsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="marks" element={<MarksReportPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route
          path="settings"
          element={
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <h3>Portal System Settings</h3>
              <p style={{ color: 'var(--text-muted)' }}>Fest preferences and account scope settings.</p>
            </div>
          }
        />
      </Route>

      {/* Manager Protected Routes */}
      <Route
        path="/manager"
        element={
          isAuthenticated ? (
            <ManagerLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="/manager/dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboardPage />} />
        <Route path="my-team" element={<MyTeamPage />} />
        <Route path="participants" element={<ParticipantsPage />} />
        <Route path="competitions" element={<CompetitionsPage />} />
        <Route path="results" element={<ManagerResultsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
      </Route>

      {/* Root Fallback */}
      <Route
        path="/"
        element={
          <Navigate
            to={
              !isAuthenticated
                ? '/login'
                : userRole === 'Admin'
                ? '/admin/dashboard'
                : '/manager/dashboard'
            }
            replace
          />
        }
      />

      {/* Catch-all Wildcard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
