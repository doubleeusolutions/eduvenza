import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Trophy,
  GraduationCap,
  Calendar,
  MapPin,
  FileBarChart,
  ClipboardList,
  Settings,
  Megaphone,
  Shield,
  Flame
} from 'lucide-react';

import EduvanzaLogoText from './EduvanzaLogoText';

import { useApp } from '../context/AppContext';

export default function Sidebar({ userRole, activePage, setActivePage }) {
  const { isSidebarOpen, setIsSidebarOpen } = useApp();
  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'team-managers', label: 'Team Managers', icon: UserCheck },
    { id: 'competitions', label: 'Competitions', icon: Trophy },
    { id: 'participants', label: 'Participants', icon: GraduationCap },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'marks', label: 'Marks Report', icon: ClipboardList },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const managerNav = [
    { id: 'manager-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-team', label: 'My Team', icon: Shield },
    { id: 'participants', label: 'Participants', icon: GraduationCap },
    { id: 'competitions', label: 'Competitions', icon: Trophy },
    { id: 'results', label: 'Results', icon: FileBarChart },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  const navItems = userRole === 'Admin' ? adminNav : managerNav;

  return (
    <aside className={`sidebar ${!isSidebarOpen ? 'collapsed' : 'sidebar-expanded'}`}>
      {/* Sidebar Logo Header */}
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '1.25rem 1rem', borderBottom: '1px solid var(--border-light)' }}>
        <img 
          src="/logo-icon.png" 
          alt="Eduvanza Icon" 
          style={{
            width: '32px',
            height: '32px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.08))'
          }} 
        />
        <div className="sidebar-logo-text" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <EduvanzaLogoText height={18} />
          {userRole === 'Manager' && (
            <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              TEAM MANAGER
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActivePage(item.id);
                if (window.innerWidth <= 1024) {
                  setIsSidebarOpen(false);
                }
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Role Pill Switcher Footer inside Sidebar */}
      <div className="sidebar-footer" style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border-light)' }}>
        <div style={{
          fontSize: '0.725rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          fontWeight: 700,
          marginBottom: '0.4rem',
          paddingLeft: '0.25rem'
        }}>
          Active Session
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: '#f8fafc',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-sm)'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: userRole === 'Admin' ? '#2563eb' : '#16a34a'
          }} />
          <span className="sidebar-session-text" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {userRole === 'Admin' ? 'Admin Portal' : 'Gujarat Manager'}
          </span>
        </div>
      </div>
    </aside>
  );
}
