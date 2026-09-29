import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';

export default function AdminLayout() {
  const { userRole, switchRole, logout, isSidebarOpen, setIsSidebarOpen } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract page ID from pathname e.g. /admin/dashboard -> dashboard
  const currentPath = location.pathname;
  let activePage = 'dashboard';
  if (currentPath.includes('/admin/teams/new')) activePage = 'create-team';
  else if (currentPath.includes('/admin/teams')) activePage = 'teams';
  else if (currentPath.includes('/admin/managers/new')) activePage = 'create-manager';
  else if (currentPath.includes('/admin/managers')) activePage = 'team-managers';
  else if (currentPath.includes('/admin/competitions')) activePage = 'competitions';
  else if (currentPath.includes('/admin/participants')) activePage = 'participants';
  else if (currentPath.includes('/admin/reports')) activePage = 'reports';
  else if (currentPath.includes('/admin/marks')) activePage = 'marks';
  else if (currentPath.includes('/admin/announcements')) activePage = 'announcements';
  else if (currentPath.includes('/admin/settings')) activePage = 'settings';

  const handleSetActivePage = (pageId) => {
    const routeMap = {
      dashboard: '/admin/dashboard',
      teams: '/admin/teams',
      'create-team': '/admin/teams/new',
      'team-managers': '/admin/managers',
      'create-manager': '/admin/managers/new',
      competitions: '/admin/competitions',
      participants: '/admin/participants',
      reports: '/admin/reports',
      marks: '/admin/marks',
      announcements: '/admin/announcements',
      settings: '/admin/settings',
    };
    navigate(routeMap[pageId] || '/admin/dashboard');
  };

  const handleRoleChange = (role) => {
    switchRole(role);
    if (role === 'Manager') {
      navigate('/manager/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="app-container">
      <div 
        className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      />
      <Sidebar
        userRole="Admin"
        activePage={activePage}
        setActivePage={handleSetActivePage}
      />
      <div className="main-wrapper">
        <Header
          userRole="Admin"
          setUserRole={handleRoleChange}
          activePage={activePage}
          onLogout={() => {
            logout();
            navigate('/login');
          }}
        />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
