import React from 'react';
import { useNavigate } from 'react-router-dom';
import JudgesListView from '../../components/JudgesListView';
import { useApp } from '../../context/AppContext';

export default function JudgesPage() {
  const { judges = [], programs = [], addJudge, updateJudge, deleteJudge } = useApp();
  const navigate = useNavigate();

  return (
    <JudgesListView
      judges={judges}
      programs={programs}
      onAddJudge={addJudge}
      onUpdateJudge={updateJudge}
      onDeleteJudge={deleteJudge}
      onCreateClick={() => navigate('/admin/judges/new')}
    />
  );
}
