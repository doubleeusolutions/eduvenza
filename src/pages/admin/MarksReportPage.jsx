import React from 'react';
import { useApp } from '../../context/AppContext';
import MarksReportView from '../../components/MarksReportView';

export default function MarksReportPage() {
  const { programs, participants, teams, markEntries } = useApp();

  return (
    <MarksReportView
      programs={programs}
      participants={participants}
      teams={teams}
      markEntries={markEntries}
    />
  );
}
