import React, { useState } from 'react';
import { Bell, ChevronDown, User, LogOut, ShieldCheck, UserCheck, Menu } from 'lucide-react';
import EduvanzaLogoText from './EduvanzaLogoText';
import { useApp } from '../context/AppContext';

export default function Header({ userRole, setUserRole, activePage, onLogout }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { currentUser, isSidebarOpen, setIsSidebarOpen } = useApp();

  const displayName = currentUser?.name || (userRole === 'Admin' ? 'Admin Administrator' : userRole === 'Judge' ? 'Judge' : 'Team Manager');
  const initialLetter = (displayName || 'U').charAt(0).toUpperCase();

  // Page titles map
  const pageTitles = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview of Eduvanza Competition Fest' },
    teams: { title: 'Teams', subtitle: 'Manage competition teams and campuses' },
    'create-team': { title: 'Create New Team', subtitle: 'Add a new team to Eduvanza Competition Fest' },
    'team-managers': { title: 'Team Managers', subtitle: 'Manage team manager access and credentials' },
    'create-manager': { title: 'Create Team Manager', subtitle: 'Assign manager credentials and team permissions' },
    judges: { title: 'Judges', subtitle: 'Manage competition judges and assignment credentials' },
    'create-judge': { title: 'Create Official Judge', subtitle: 'Add a new evaluator and assign judge credentials' },
    competitions: { 
      title: userRole === 'Judge' ? 'Evaluation Sheet' : 'Competitions', 
      subtitle: userRole === 'Judge' ? 'Evaluate assigned competitions and enter official scores' : 'Manage contest programs and criteria' 
    },
    'mark-entry': { title: 'Mark Entry', subtitle: 'Official evaluation sheet and scoring portal' },
    participants: { title: 'Participants', subtitle: 'View registered students and assigned events' },
    reports: { title: 'Reports', subtitle: 'Sequential team rosters, program reports, and PDF exports' },
    marks: { title: 'Marks Report', subtitle: 'Official evaluated mark sheets and published standings' },
    settings: { title: 'Settings', subtitle: 'System preferences and portal configuration' },
    'manager-dashboard': { title: 'Dashboard', subtitle: `Welcome back, ${displayName}` },
    'my-team': { title: 'My Team', subtitle: 'Manage your team details and participants' },
    results: { title: 'Results & Standings', subtitle: 'Official championship standings and published scores' },
    announcements: { title: 'Announcements', subtitle: 'Official notices and fest broadcasts' },
  };

  const currentInfo = pageTitles[activePage] || { title: 'Eduvanza Fest', subtitle: 'Competition Portal' };

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.25rem',
          }}
        >
          <Menu size={24} />
        </button>
        <div className="header-brand-mobile" style={{ display: 'none', alignItems: 'center', gap: '0.4rem' }}>
          <img src="/logo-icon.png" alt="Eduvanza" style={{ width: 24, height: 24, objectFit: 'contain' }} />
          <EduvanzaLogoText height={14} />
        </div>
        <div className="header-page-title">
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-heading)' }}>
            {currentInfo.title}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Notifications Icon with Red Badge */}
        <div className="header-notifications" style={{ position: 'relative', cursor: 'pointer' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)'
          }}>
            <Bell size={18} />
          </div>
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ef4444'
          }} />
        </div>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: userRole === 'Admin' ? '#2563eb' : userRole === 'Judge' ? '#d97706' : '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              {initialLetter}
            </div>
            <div className="header-profile-text" style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                @{currentUser?.username || (userRole === 'Admin' ? 'admin' : 'manager')}
              </div>
            </div>
            <ChevronDown className="header-profile-chevron" size={16} color="var(--text-muted)" />
          </button>

          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '110%',
              width: '220px',
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 50,
              overflow: 'hidden',
              padding: '0.5rem 0'
            }}>
              <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div>Logged in as: <strong>{displayName}</strong></div>
                <div>Role: <strong>{userRole}</strong></div>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.65rem 1rem',
                  border: 'none',
                  background: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
