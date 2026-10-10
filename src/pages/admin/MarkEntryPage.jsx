import React, { useState, useMemo } from 'react';
import {
  ClipboardEdit,
  Search,
  CheckCircle2,
  Clock,
  User,
  Users,
  Eye,
  X,
  Check,
  Award,
  Layers,
  ChevronRight,
  ArrowLeft,
  Trophy,
  Filter,
  Tag,
  Sparkles,
  Shuffle,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import MarkEntry from '../../components/MarkEntry';
import { getParticipantCodeLetter, getSequentialCodeLetter } from '../../utils/evaluationRules';

export default function MarkEntryPage() {
  const {
    programs = [],
    participants = [],
    teams = [],
    markEntries = [],
    judges = [],
    currentUser,
    updateProgram,
    saveMarkEntry,
    deleteMarkEntry,
  } = useApp();

  // Selected program for active evaluation sheet
  const [activeProgram, setActiveProgram] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [judgeFilter, setJudgeFilter] = useState('');

  // Safe helper to check if a participant is enrolled in a program
  const isEnrolledIn = (participant, programId) => {
    if (!participant || !participant.programs || !Array.isArray(participant.programs)) return false;
    return participant.programs.some((item) =>
      typeof item === 'string' ? item === programId : item?.id === programId
    );
  };

  // Enrolled participants for active program
  const activeEnrolledParticipants = useMemo(() => {
    if (!activeProgram) return [];
    return participants.filter((p) => isEnrolledIn(p, activeProgram.id));
  }, [activeProgram, participants]);

  // Kot Letters modal state
  const [isKotModalOpen, setIsKotModalOpen] = useState(false);
  const [kotLettersDraft, setKotLettersDraft] = useState({});

  const openKotModal = () => {
    const draft = {};
    activeEnrolledParticipants.forEach((p, idx) => {
      draft[p.id] = getParticipantCodeLetter(activeProgram, p.id, idx);
    });
    setKotLettersDraft(draft);
    setIsKotModalOpen(true);
  };

  const handleAutoAssignKotLetters = () => {
    const draft = {};
    activeEnrolledParticipants.forEach((p, idx) => {
      draft[p.id] = getSequentialCodeLetter(idx);
    });
    setKotLettersDraft(draft);
  };

  const handleShuffleKotLetters = () => {
    const letters = activeEnrolledParticipants.map((_, idx) => getSequentialCodeLetter(idx));
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    const draft = {};
    activeEnrolledParticipants.forEach((p, idx) => {
      draft[p.id] = letters[idx];
    });
    setKotLettersDraft(draft);
  };

  const handleSaveKotLetters = async () => {
    const updated = {
      ...activeProgram,
      codeLetters: kotLettersDraft,
    };
    try {
      localStorage.setItem(`eduvenza_code_letters_${activeProgram.id}`, JSON.stringify(kotLettersDraft));
    } catch {
      // ignore
    }
    setActiveProgram(updated);
    if (updateProgram) {
      await updateProgram(updated);
    }
    setIsKotModalOpen(false);
  };

  // Filtered Programs for Evaluation Sheets list
  const filteredPrograms = useMemo(() => {
    return programs.filter((prg) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (prg.name || '').toLowerCase().includes(q);
        const matchCode = (prg.code || '').toLowerCase().includes(q);
        const matchJudge = (prg.judge || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchJudge) return false;
      }

      // Judge filter
      if (judgeFilter) {
        const judgesList = (prg.judge || '')
          .split(',')
          .map((j) => j.trim().toLowerCase());
        if (!judgesList.includes(judgeFilter.toLowerCase())) return false;
      }

      // Status filter (based on evaluated progress)
      if (statusFilter) {
        const enrolledCount = participants.filter((p) => isEnrolledIn(p, prg.id)).length;
        const evaluatedCount = markEntries.filter((m) => m.programId === prg.id).length;

        if (statusFilter === 'Completed') {
          if (!(evaluatedCount >= enrolledCount && enrolledCount > 0)) return false;
        } else if (statusFilter === 'In Progress') {
          if (!(evaluatedCount > 0 && evaluatedCount < enrolledCount)) return false;
        } else if (statusFilter === 'Pending') {
          if (evaluatedCount > 0) return false;
        }
      }

      return true;
    });
  }, [programs, participants, markEntries, searchQuery, statusFilter, judgeFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    let completedCount = 0;
    let inProgressCount = 0;
    let pendingCount = 0;

    programs.forEach((prg) => {
      const enrolled = participants.filter((p) => isEnrolledIn(p, prg.id)).length;
      const evaluated = markEntries.filter((m) => m.programId === prg.id).length;

      if (evaluated >= enrolled && enrolled > 0) {
        completedCount++;
      } else if (evaluated > 0) {
        inProgressCount++;
      } else {
        pendingCount++;
      }
    });

    return {
      total: programs.length,
      completed: completedCount,
      inProgress: inProgressCount,
      pending: pendingCount,
      totalEntries: markEntries.length,
    };
  }, [programs, participants, markEntries]);

  // Unique list of judges
  const uniqueJudges = useMemo(() => {
    const set = new Set();
    programs.forEach((p) => {
      if (p.judge) {
        p.judge.split(',').forEach((j) => {
          const trimmed = j.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set);
  }, [programs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* If an active program is selected for evaluation, show the full Evaluation Sheet Workspace */}
      {activeProgram ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Back Navigation Bar */}
          <div
            className="card"
            style={{
              padding: '1rem 1.5rem',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setActiveProgram(null)}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                <ArrowLeft size={16} /> All Evaluation Sheets
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                  }}
                >
                  {activeProgram.code}
                </span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {activeProgram.name}
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={openKotModal}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  background: '#2563eb',
                  color: '#fff',
                  borderRadius: '8px',
                }}
              >
                <Tag size={15} /> Kot Letters ({activeEnrolledParticipants.length})
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                <span>
                  Judge: <strong style={{ color: 'var(--text-main)' }}>{activeProgram.judge || 'Unassigned'}</strong>
                </span>
                <span>•</span>
                <span>
                  Max Marks: <strong>{activeProgram.maxMarks || 50} pts</strong>
                </span>
                <span>•</span>
                <span>
                  Schedule: <strong>{activeProgram.time || 'Not Assigned'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Kot Letters Assignment Modal */}
          {isKotModalOpen && (
            <div className="drawer-right-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
              <div
                className="card"
                style={{
                  width: 'min(95vw, 680px)',
                  maxHeight: '90vh',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 0,
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Tag size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Assign Kot Letters (Lots)
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {activeProgram.name} • {activeEnrolledParticipants.length} Enrolled Participants
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsKotModalOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ padding: '1rem 1.5rem', background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.825rem', color: '#475569', maxWidth: '360px' }}>
                    Judges will <strong>only see these Kot letters (A, B, E...)</strong> during mark entry for impartial evaluation.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={handleAutoAssignKotLetters}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
                    >
                      <Sparkles size={14} style={{ color: '#2563eb' }} /> Auto (A, B, C...)
                    </button>
                    <button
                      type="button"
                      onClick={handleShuffleKotLetters}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
                    >
                      <Shuffle size={14} style={{ color: '#7c3aed' }} /> Shuffle Lots
                    </button>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
                  {activeEnrolledParticipants.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                      No participants enrolled in this competition event yet.
                    </div>
                  ) : (
                    <table className="custom-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: '80px' }}>Chest</th>
                          <th>Participant</th>
                          <th>Team</th>
                          <th style={{ width: '130px', textAlign: 'center' }}>Kot Letter</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeEnrolledParticipants.map((p) => {
                          const team = teams.find((t) => t.id === p.teamId);
                          const currentVal = kotLettersDraft[p.id] || '';
                          return (
                            <tr key={p.id}>
                              <td style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>#{p.chestNo}</td>
                              <td style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem' }}>{p.name}</td>
                              <td>
                                <span style={{ fontSize: '0.78rem', color: team?.color || '#64748b', fontWeight: 600 }}>
                                  {team?.icon} {team?.name || 'Unassigned'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="text"
                                  value={currentVal}
                                  onChange={(e) => setKotLettersDraft({ ...kotLettersDraft, [p.id]: e.target.value.toUpperCase() })}
                                  maxLength={4}
                                  placeholder="e.g. A"
                                  style={{
                                    width: '65px',
                                    padding: '0.35rem',
                                    textAlign: 'center',
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    border: '1px solid #93c5fd',
                                    borderRadius: '6px',
                                    textTransform: 'uppercase',
                                    background: '#eff6ff',
                                    color: '#1e3a8a',
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsKotModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveKotLetters}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Save size={16} /> Save Kot Letters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Standalone Evaluation Sheet Component */}
          <MarkEntry
            key={activeProgram.id}
            programs={programs}
            participants={participants}
            teams={teams}
            markEntries={markEntries}
            initialProgramId={activeProgram.id}
            hideHeader={true}
            hideProgramSelect={true}
            onUpdateProgram={updateProgram}
          />
        </div>
      ) : (
        /* Evaluation Sheets Directory & Progress Table */
        <>
          {/* Header Banner */}
          <div
            className="card"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
              padding: '1.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  background: '#eff6ff',
                  color: '#2563eb',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  border: '1px solid #bfdbfe',
                }}
              >
                OFFICIAL SCORING PORTAL
              </span>
            </div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                margin: 0,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
              }}
            >
              <ClipboardEdit style={{ color: '#2563eb' }} /> Mark Entry & Evaluation Sheets
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
              Official competition evaluation sheets, progress tracking, and judge scoring records.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            <div className="card" style={{ padding: '1.1rem 1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Total Competitions
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {stats.total}
              </div>
            </div>

            <div className="card" style={{ padding: '1.1rem 1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                Completed Evaluations
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>
                {stats.completed}
              </div>
            </div>

            <div className="card" style={{ padding: '1.1rem 1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                In Progress
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
                {stats.inProgress}
              </div>
            </div>

            <div className="card" style={{ padding: '1.1rem 1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
                Pending Evaluation
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>
                {stats.pending}
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div
            className="card"
            style={{
              padding: '1.25rem 1.5rem',
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Search Input */}
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                type="text"
                placeholder="Search evaluation sheet by program name, code, or judge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  paddingLeft: '2.4rem',
                  paddingRight: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.85rem',
                  background: '#f8fafc',
                  outline: 'none',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div style={{ width: '180px' }}>
              <select
                className="select-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0 0.75rem',
                  background: '#f8fafc',
                }}
              >
                <option value="">All Eval Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Judge Filter */}
            {uniqueJudges.length > 0 && (
              <div style={{ width: '180px' }}>
                <select
                  className="select-field"
                  value={judgeFilter}
                  onChange={(e) => setJudgeFilter(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    padding: '0 0.75rem',
                    background: '#f8fafc',
                  }}
                >
                  <option value="">All Judges</option>
                  {uniqueJudges.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters */}
            {(searchQuery || statusFilter || judgeFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setJudgeFilter('');
                }}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.8rem',
                  height: '40px',
                }}
              >
                <X size={14} /> Reset
              </button>
            )}
          </div>

          {/* EVALUATION SHEETS TABLE */}
          <div
            className="card"
            style={{
              padding: 0,
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            }}
          >
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr
                    style={{
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      color: '#64748b',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <th style={{ padding: '0.85rem 1.25rem' }}>Competition / Event</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Schedule</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Assigned Judge</th>
                    <th style={{ padding: '0.85rem 1.25rem', minWidth: '180px' }}>Evaluation Progress</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrograms.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3.5rem', textAlign: 'center', color: '#94a3b8' }}>
                        <ClipboardEdit size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.6 }} />
                        <div style={{ fontWeight: 600 }}>No evaluation sheets match your filter criteria.</div>
                      </td>
                    </tr>
                  ) : (
                    filteredPrograms.map((prg) => {
                      const enrolledCount = participants.filter((p) => isEnrolledIn(p, prg.id)).length;
                      const evaluatedCount = markEntries.filter((m) => m.programId === prg.id).length;
                      const pct = enrolledCount > 0 ? Math.round((evaluatedCount / enrolledCount) * 100) : 0;

                      let statusLabel = 'Pending';
                      let statusBg = '#f1f5f9';
                      let statusColor = '#475569';
                      if (evaluatedCount >= enrolledCount && enrolledCount > 0) {
                        statusLabel = 'Completed';
                        statusBg = '#dcfce7';
                        statusColor = '#166534';
                      } else if (evaluatedCount > 0) {
                        statusLabel = 'In Progress';
                        statusBg = '#dbeafe';
                        statusColor = '#1e40af';
                      }

                      return (
                        <tr
                          key={prg.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          {/* Program Name & Code */}
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span
                                style={{
                                  fontSize: '0.725rem',
                                  fontWeight: 700,
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '4px',
                                }}
                              >
                                {prg.code}
                              </span>
                              <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.925rem' }}>
                                {prg.name}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                              Max {prg.maxMarks || 50} pts • {prg.type || 'Individual'} • {prg.category || 'Event'}
                            </div>
                          </td>

                          {/* Schedule */}
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                              <Clock size={14} style={{ color: '#2563eb' }} />
                              {prg.time && prg.time !== 'Not Assigned' ? prg.time : 'Not Assigned'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                              {prg.venue || 'Main Stage'}
                            </div>
                          </td>

                          {/* Judge */}
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                              {prg.judge || 'Unassigned'}
                            </div>
                          </td>

                          {/* Progress */}
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                              <span>
                                {evaluatedCount} of {enrolledCount} Evaluated
                              </span>
                              <span style={{ color: '#64748b' }}>{pct}%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${pct}%`,
                                  height: '100%',
                                  background: evaluatedCount === enrolledCount && enrolledCount > 0 ? '#10b981' : '#2563eb',
                                  borderRadius: '3px',
                                  transition: 'width 0.3s ease',
                                }}
                              />
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <span
                              style={{
                                background: statusBg,
                                color: statusColor,
                                padding: '0.2rem 0.6rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              {statusLabel}
                            </span>
                          </td>

                          {/* Action Button */}
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => setActiveProgram(prg)}
                              className="btn btn-primary btn-sm"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.45rem 0.85rem',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                              }}
                            >
                              <ClipboardEdit size={14} /> Open Sheet
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
