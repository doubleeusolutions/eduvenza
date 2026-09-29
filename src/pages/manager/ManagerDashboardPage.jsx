import React from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerDashboardView from '../../components/ManagerDashboardView';
import { useApp } from '../../context/AppContext';

export default function ManagerDashboardPage() {
  const { activeManagerTeam, participants, programs, markEntries } = useApp();
  const navigate = useNavigate();

  const teamParticipants = participants.filter((p) => p.teamId === activeManagerTeam?.id);

  const handleNavigate = (pageKey) => {
    if (pageKey === 'my-team') navigate('/manager/my-team');
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
