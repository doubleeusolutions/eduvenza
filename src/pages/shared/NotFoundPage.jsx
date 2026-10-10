import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, LogOut, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, userRole, logout } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main, #f8fafc)',
        padding: '1.5rem',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          borderRadius: '1.25rem',
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
          }}
        >
          <AlertCircle size={38} />
        </div>

        <div>
          <div
            style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              lineHeight: 1,
              color: 'var(--primary, #2563eb)',
              letterSpacing: '-0.05em',
            }}
          >
            404
          </div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              marginTop: '0.75rem',
              color: 'var(--text-main, #0f172a)',
            }}
          >
            {userRole === 'Judge'
              ? 'Judge Portal Under Construction'
              : userRole === 'Participant'
              ? 'Participant Dashboard Under Construction'
              : userRole === 'Teacher'
              ? 'Teacher Portal Under Construction'
              : 'Page Not Found'}
          </h2>
          <p
            style={{
              color: 'var(--text-muted, #64748b)',
              fontSize: '0.95rem',
              marginTop: '0.5rem',
              lineHeight: 1.6,
            }}
          >
            {userRole === 'Judge'
              ? 'Your Judge account has been created successfully, but judging pages and dashboards have not been created yet.'
              : userRole === 'Participant'
              ? 'Your registration as a Participant was successful! Participant dashboards and competition schedules are currently under construction.'
              : userRole === 'Teacher'
              ? 'Your registration as a Teacher was successful! Teacher portal and management dashboards are currently under construction.'
              : "The page you are looking for doesn't exist or has been moved."}
          </p>
        </div>

        {isAuthenticated && currentUser && (
          <div
            style={{
              background: 'var(--bg-muted, #f1f5f9)',
              padding: '0.75rem 1.25rem',
              borderRadius: '0.75rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted, #475569)',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            <div>
              <strong>Logged in as:</strong> {currentUser.username || currentUser.email}
            </div>
            <div>
              <strong>Role:</strong>{' '}
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(37, 99, 235, 0.12)',
                  color: 'var(--primary, #2563eb)',
                  padding: '0.15rem 0.6rem',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                }}
              >
                {userRole || 'User'}
              </span>
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            width: '100%',
            justifyContent: 'center',
            marginTop: '0.5rem',
          }}
        >
          {isAuthenticated ? (
            <button
              className="btn btn-secondary"
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} /> Go to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
