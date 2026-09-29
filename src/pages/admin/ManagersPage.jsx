import React from 'react';
import { useNavigate } from 'react-router-dom';
import ManagersListView from '../../components/ManagersListView';
import { useApp } from '../../context/AppContext';

export default function ManagersPage() {
  const { managers, teams, participants, updateManager, deleteManager } = useApp();
  const navigate = useNavigate();

  return (
    <ManagersListView
      managers={managers}
      teams={teams}
      participants={participants}
      onUpdateManager={updateManager}
      onDeleteManager={deleteManager}
      onCreateClick={() => navigate('/admin/managers/new')}
    />
  );
}

