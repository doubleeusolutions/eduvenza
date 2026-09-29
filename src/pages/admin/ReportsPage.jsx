import React from 'react';
import Result from '../../components/Result';
import { useApp } from '../../context/AppContext';

export default function ReportsPage() {
  const { teams, participants, programs, markEntries, setPrograms } = useApp();

  return (
    <Result
      teams={teams}
      participants={participants}
      programs={programs}
      markEntries={markEntries}
      setPrograms={setPrograms}
    />
  );
}
