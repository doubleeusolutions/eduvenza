import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboardView from '../../components/AdminDashboardView';
import { useApp } from '../../context/AppContext';

export default function AdminDashboardPage() {
  const { teams, managers, programs, participants, activities, markEntries } = useApp();
  const navigate = useNavigate();

  const handleNavigate = (pageKey) => {
    const routeMap = {
      reports: '/admin/reports',
      participants: '/admin/participants',
      teams: '/admin/teams',
    };
    navigate(routeMap[pageKey] || '/admin/dashboard');
  };

  return (
    <AdminDashboardView
      teams={teams}
      managers={managers}
      programs={programs}
      participants={participants}
      activities={activities}
      markEntries={markEntries}
      onNavigate={handleNavigate}
    />
  );
}
