import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTeamView from '../../components/CreateTeamView';
import { useApp } from '../../context/AppContext';

export default function CreateTeamPage() {
  const { addTeam } = useApp();
  const navigate = useNavigate();

  return (
    <CreateTeamView
      onBack={() => navigate('/admin/teams')}
      onCreateTeam={addTeam}
    />
  );
}
