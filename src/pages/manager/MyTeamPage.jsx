import React from 'react';
import ManagerMyTeamView from '../../components/ManagerMyTeamView';
import { useApp } from '../../context/AppContext';

export default function MyTeamPage() {
  const {
    activeManagerTeam,
    participants,
    programs,
    addParticipant,
    updateParticipant,
    deleteParticipant,
  } = useApp();

  const teamParticipants = participants.filter(
    (p) => p.teamId === activeManagerTeam?.id || p.team_id === activeManagerTeam?.id
  );

  return (
    <ManagerMyTeamView
      managerTeam={activeManagerTeam}
      teamParticipants={teamParticipants}
      programs={programs}
      onAddParticipant={addParticipant}
      onUpdateParticipant={updateParticipant}
      onDeleteParticipant={deleteParticipant}
    />
  );
}
