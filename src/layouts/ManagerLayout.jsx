import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';

export default function ManagerLayout() {
  const { userRole, switchRole, logout, isSidebarOpen, setIsSidebarOpen } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  let activePage = 'manager-dashboard';
  if (currentPath.includes('/manager/my-team')) activePage = 'my-team';
  else if (currentPath.includes('/manager/participants')) activePage = 'participants';
  else if (currentPath.includes('/manager/competitions')) activePage = 'competitions';
  else if (currentPath.includes('/manager/results')) activePage = 'results';
  else if (currentPath.includes('/manager/announcements')) activePage = 'announcements';

  const handleSetActivePage = (pageId) => {
    const routeMap = {
      'manager-dashboard': '/manager/dashboard',
      'my-team': '/manager/my-team',
      participants: '/manager/participants',
      competitions: '/manager/competitions',
      results: '/manager/results',
      announcements: '/manager/announcements',
    };
    navigate(routeMap[pageId] || '/manager/dashboard');
  };

  const handleRoleChange = (role) => {
    switchRole(role);
    if (role === 'Admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/manager/dashboard');
    }
  };

  return (
    <div className="app-container">
      <div 
        className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      />
      <Sidebar
        userRole="Manager"
        activePage={activePage}
        setActivePage={handleSetActivePage}
      />
      <div className="main-wrapper">
        <Header
          userRole="Manager"
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
