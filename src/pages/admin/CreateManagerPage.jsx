import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateManagerView from '../../components/CreateManagerView';
import { useApp } from '../../context/AppContext';

export default function CreateManagerPage() {
  const { teams, addManager } = useApp();
  const navigate = useNavigate();

  return (
    <CreateManagerView
      teams={teams}
      onBack={() => navigate('/admin/managers')}
      onCreateManager={addManager}
    />
  );
}
