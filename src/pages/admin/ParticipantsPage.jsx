import React from 'react';
import Participants from '../../components/Participants';
import { useApp } from '../../context/AppContext';

export default function ParticipantsPage() {
  const {
    teams,
    participants,
    setParticipants,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    programs,
    markEntries,
  } = useApp();

  return (
    <Participants
      teams={teams}
      participants={participants}
      setParticipants={setParticipants}
      onAddParticipant={addParticipant}
      onUpdateParticipant={updateParticipant}
      onDeleteParticipant={deleteParticipant}
      programs={programs}
      markEntries={markEntries}
    />
  );
}
