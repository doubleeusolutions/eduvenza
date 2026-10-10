import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';

export default function JudgeLayout() {
  const { userRole, logout, isSidebarOpen, setIsSidebarOpen } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  let activePage = 'competitions';
  if (currentPath.includes('/judge/announcements')) activePage = 'announcements';
  else if (currentPath.includes('/judge/competitions')) activePage = 'competitions';

  const handleSetActivePage = (pageId) => {
    const routeMap = {
      competitions: '/judge/competitions',
      announcements: '/judge/announcements',
    };
    navigate(routeMap[pageId] || '/judge/competitions');
  };

  return (
    <div className="app-container">
      <div 
        className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      />
      <Sidebar
        userRole="Judge"
        activePage={activePage}
        setActivePage={handleSetActivePage}
      />
      <div className="main-wrapper">
        <Header
          userRole="Judge"
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
