import React from 'react';
import Result from '../../components/Result';
import { useApp } from '../../context/AppContext';
import { Crown } from 'lucide-react';

export default function ManagerResultsPage() {
  const { teams, participants, programs, markEntries } = useApp();

  // Only consider programs that have been explicitly published by the Admin
  const publishedPrograms = programs.filter(p => p.status === 'Published');
  const publishedProgramIds = new Set(publishedPrograms.map(p => p.id));
  
  // Only tally marks from published programs
  const publishedMarkEntries = markEntries.filter(m => publishedProgramIds.has(m.programId));

  if (publishedPrograms.length === 0) {
    return (
      <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <Crown size={32} />
        </div>
        <h2 style={{ margin: 0, color: 'var(--text-main)' }}>No Results Published Yet</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
          Official championship results and standings will appear here once the administrator publishes completed evaluations. Check back later!
        </p>
      </div>
    );
  }

  return (
    <Result
      teams={teams}
      participants={participants}
      programs={publishedPrograms}
      markEntries={publishedMarkEntries}
      setPrograms={() => {}} // Managers can't modify programs here
    />
  );
}
