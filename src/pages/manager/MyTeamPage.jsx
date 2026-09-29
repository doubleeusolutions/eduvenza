import React from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerMyTeamView from '../../components/ManagerMyTeamView';
import { useApp } from '../../context/AppContext';

export default function MyTeamPage() {
  const { activeManagerTeam, participants } = useApp();
  const navigate = useNavigate();

  const teamParticipants = participants.filter((p) => p.teamId === activeManagerTeam?.id);

  return (
    <ManagerMyTeamView
      managerTeam={activeManagerTeam}
      teamParticipants={teamParticipants}
      onAddParticipant={() => navigate('/manager/participants')}
    />
  );
}
