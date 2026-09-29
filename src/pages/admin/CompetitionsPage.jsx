import React from 'react';
import CompetitionsListView from '../../components/CompetitionsListView';
import { useApp } from '../../context/AppContext';

export default function CompetitionsPage() {
  const {
    programs,
    participants,
    teams,
    markEntries,
    addProgram,
    updateProgram,
    deleteProgram,
    toggleProgramPublish,
    saveMarkEntry,
    deleteMarkEntry,
  } = useApp();

  return (
    <CompetitionsListView
      programs={programs}
      participants={participants}
      teams={teams}
      markEntries={markEntries}
      onAddProgram={addProgram}
      onUpdateProgram={updateProgram}
      onDeleteProgram={deleteProgram}
      onTogglePublish={toggleProgramPublish}
      onSaveMarkEntry={saveMarkEntry}
      onDeleteMarkEntry={deleteMarkEntry}
    />
  );
}

