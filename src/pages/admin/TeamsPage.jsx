import React from 'react';
import { useNavigate } from 'react-router-dom';
import TeamsListView from '../../components/TeamsListView';
import { useApp } from '../../context/AppContext';

export default function TeamsPage() {
  const { teams, participants, managers, updateTeam, deleteTeam } = useApp();
  const navigate = useNavigate();

  return (
    <TeamsListView
      teams={teams}
      participants={participants}
      managers={managers}
      onUpdateTeam={updateTeam}
      onDeleteTeam={deleteTeam}
      onCreateClick={() => navigate('/admin/teams/new')}
    />
  );
}

