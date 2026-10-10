import React from 'react';
import AdminReportsView from '../../components/AdminReportsView';
import { useApp } from '../../context/AppContext';

export default function ReportsPage() {
  const { teams, participants, programs, markEntries, managers, setPrograms } = useApp();

  return (
    <AdminReportsView
      teams={teams}
      participants={participants}
      programs={programs}
      markEntries={markEntries}
      managers={managers}
      setPrograms={setPrograms}
    />
  );
}
