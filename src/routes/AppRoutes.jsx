import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import ManagerLayout from '../layouts/ManagerLayout';
import JudgeLayout from '../layouts/JudgeLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/shared/NotFoundPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import TeamsPage from '../pages/admin/TeamsPage';
import CreateTeamPage from '../pages/admin/CreateTeamPage';
import ManagersPage from '../pages/admin/ManagersPage';
import CreateManagerPage from '../pages/admin/CreateManagerPage';
import JudgesPage from '../pages/admin/JudgesPage';
import CreateJudgePage from '../pages/admin/CreateJudgePage';
import CompetitionsPage from '../pages/admin/CompetitionsPage';
import MarkEntryPage from '../pages/admin/MarkEntryPage';
import ParticipantsPage from '../pages/admin/ParticipantsPage';
import ReportsPage from '../pages/admin/ReportsPage';
import MarksReportPage from '../pages/admin/MarksReportPage';

// Shared Pages
import AnnouncementsPage from '../pages/shared/AnnouncementsPage';

// Manager Pages
import ManagerDashboardPage from '../pages/manager/ManagerDashboardPage';
import MyTeamPage from '../pages/manager/MyTeamPage';
import ManagerResultsPage from '../pages/manager/ManagerResultsPage';

// Judge Pages
import JudgeCompetitionsPage from '../pages/judge/JudgeCompetitionsPage';

export default function AppRoutes() {
  const { isAuthenticated, userRole } = useApp();

  const isManager = userRole === 'Manager' || userRole === 'Team Manager';

  const getDashboardRedirect = () => {
    if (userRole === 'Admin') return '/admin/dashboard';
    if (isManager) return '/manager/dashboard';
    if (userRole === 'Judge') return '/judge/competitions';
    return '/login';
  };

  return (
    <Routes>

      {/* Public Auth Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={getDashboardRedirect()} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          isAuthenticated && userRole === 'Admin' ? (
            <AdminLayout />
          ) : (
            <Navigate to={!isAuthenticated ? '/login' : getDashboardRedirect()} replace />
          )
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="teams/new" element={<CreateTeamPage />} />
        <Route path="managers" element={<ManagersPage />} />
        <Route path="managers/new" element={<CreateManagerPage />} />
        <Route path="judges" element={<JudgesPage />} />
        <Route path="judges/new" element={<CreateJudgePage />} />
        <Route path="competitions" element={<CompetitionsPage />} />
        <Route path="mark-entry" element={<MarkEntryPage />} />
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
          isAuthenticated && isManager ? (
            <ManagerLayout />
          ) : (
            <Navigate to={!isAuthenticated ? '/login' : getDashboardRedirect()} replace />
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

      {/* Judge Protected Routes */}
      <Route
        path="/judge"
        element={
          isAuthenticated && userRole === 'Judge' ? (
            <JudgeLayout />
          ) : (
            <Navigate to={!isAuthenticated ? '/login' : getDashboardRedirect()} replace />
          )
        }
      >
        <Route index element={<Navigate to="/judge/competitions" replace />} />
        <Route path="dashboard" element={<Navigate to="/judge/competitions" replace />} />
        <Route path="competitions" element={<JudgeCompetitionsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
      </Route>

      {/* Direct /dashboard Redirect based on role */}
      <Route
        path="/dashboard"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <Navigate to={getDashboardRedirect()} replace />
          )
        }
      />

      {/* Role-based Smart /competitions Redirect */}
      <Route
        path="/competitions"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : userRole === 'Judge' ? (
            <Navigate to="/judge/competitions" replace />
          ) : isManager ? (
            <Navigate to="/manager/competitions" replace />
          ) : (
            <Navigate to="/admin/competitions" replace />
          )
        }
      />

      {/* Role-based Smart /participants Redirect */}
      <Route
        path="/participants"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : isManager ? (
            <Navigate to="/manager/participants" replace />
          ) : (
            <Navigate to="/admin/participants" replace />
          )
        }
      />

      {/* Role-based Smart /my-team Redirect */}
      <Route
        path="/my-team"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : isManager ? (
            <Navigate to="/manager/my-team" replace />
          ) : (
            <Navigate to="/admin/teams" replace />
          )
        }
      />

      {/* Role-based Smart /results Redirect */}
      <Route
        path="/results"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : isManager ? (
            <Navigate to="/manager/results" replace />
          ) : (
            <Navigate to="/admin/marks" replace />
          )
        }
      />

      {/* Role-based Smart /announcements Redirect */}
      <Route
        path="/announcements"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : isManager ? (
            <Navigate to="/manager/announcements" replace />
          ) : userRole === 'Judge' ? (
            <Navigate to="/judge/announcements" replace />
          ) : (
            <Navigate to="/admin/announcements" replace />
          )
        }
      />

      {/* Role-based Smart /judges Redirect */}
      <Route
        path="/judges"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : userRole === 'Admin' ? (
            <Navigate to="/admin/judges" replace />
          ) : userRole === 'Judge' ? (
            <Navigate to="/judge/competitions" replace />
          ) : (
            <Navigate to="/manager/dashboard" replace />
          )
        }
      />

      {/* Role-based Smart /mark-entry Redirect */}
      <Route
        path="/mark-entry"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : userRole === 'Admin' ? (
            <Navigate to="/admin/mark-entry" replace />
          ) : userRole === 'Judge' ? (
            <Navigate to="/judge/competitions" replace />
          ) : (
            <Navigate to="/manager/dashboard" replace />
          )
        }
      />

      {/* Explicit 404 Route */}
      <Route path="/404" element={<NotFoundPage />} />

      {/* Root Fallback */}
      <Route
        path="/"
        element={
          <Navigate
            to={
              !isAuthenticated
                ? '/login'
                : getDashboardRedirect()
            }
            replace
          />
        }
      />

      {/* Catch-all Wildcard -> 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
