import React from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerDashboardView from '../../components/ManagerDashboardView';
import { useApp } from '../../context/AppContext';

export default function ManagerDashboardPage() {
  const { activeManagerTeam, participants, programs, markEntries } = useApp();
  const navigate = useNavigate();

  const teamParticipants = participants.filter((p) => p.teamId === activeManagerTeam?.id || p.team_id === activeManagerTeam?.id);

  const handleNavigate = (pageKey) => {
    if (pageKey === 'my-team') navigate('/manager/my-team');
    else if (pageKey === 'participants') navigate('/manager/participants');
    else if (pageKey === 'competitions') navigate('/manager/competitions');
    else if (pageKey === 'results') navigate('/manager/results');
    else if (pageKey === 'announcements') navigate('/manager/announcements');
    else navigate('/manager/dashboard');
  };

  return (
    <ManagerDashboardView
      managerTeam={activeManagerTeam}
      teamParticipants={teamParticipants}
      programs={programs}
      markEntries={markEntries}
      onNavigate={handleNavigate}
    />
  );
}
