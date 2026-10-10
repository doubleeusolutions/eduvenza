import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateJudgeView from '../../components/CreateJudgeView';
import { useApp } from '../../context/AppContext';

export default function CreateJudgePage() {
  const { programs = [], addJudge } = useApp();
  const navigate = useNavigate();

  return (
    <CreateJudgeView
      programs={programs}
      onBack={() => navigate('/admin/judges')}
      onCreateJudge={addJudge}
    />
  );
}
