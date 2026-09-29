import React, { useState } from 'react';
import { ClipboardEdit, Award, CheckCircle2, AlertCircle, Save, Trash2, Edit3, User, BookOpen, Star, FileText, Layers } from 'lucide-react';
import {
  MAX_ITEM_MARKS,
  calculateGrade,
  getGradePoints,
  getPositionPoints,
  autoRankAndCalculateEntries,
} from '../utils/evaluationRules';

export default function MarkEntry({ programs, participants, teams, markEntries, setMarkEntries, initialProgramId, hideHeader = false, onUpdateProgram }) {
  // State for evaluation form
  const [selectedProgramId, setSelectedProgramId] = useState(initialProgramId || programs[0]?.id || '');
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  
  React.useEffect(() => {
    if (initialProgramId) {
      setSelectedProgramId(initialProgramId);
    }
  }, [initialProgramId]);

  // Selected program object
  const currentProgram = programs.find((p) => p.id === selectedProgramId);
  const maxProgramMarks = currentProgram?.maxMarks || MAX_ITEM_MARKS;
  const programMemberCount = currentProgram?.memberCount || 1;
  
  // Participants enrolled in selected program
  const enrolledParticipants = participants.filter((p) => p.programs.includes(selectedProgramId));

  // Scores state: single Earned Mark (0 to 50)
  const [earnedMark, setEarnedMark] = useState(0);
  const [memberCount, setMemberCount] = useState(programMemberCount);
  const [judgeNotes, setJudgeNotes] = useState('');
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Keep memberCount synced with current program
  React.useEffect(() => {
    if (currentProgram?.memberCount) {
      setMemberCount(currentProgram.memberCount);
    } else {
      setMemberCount(1);
    }
  }, [selectedProgramId, currentProgram]);

  // Handle program change
  const handleProgramChange = (prgId) => {
    setSelectedProgramId(prgId);
    setSelectedParticipantId('');
    setEarnedMark(0);
    setJudgeNotes('');
    setEditingEntryId(null);
  };

  // Handle participant change
  const handleParticipantChange = (partId) => {
    setSelectedParticipantId(partId);
    // Check if an entry already exists for this participant in this program
    const existing = markEntries.find(
      (me) => me.programId === selectedProgramId && me.participantId === partId
    );

    if (existing) {
      setEditingEntryId(existing.id);
      const val = existing.totalScore !== undefined
        ? existing.totalScore
        : (existing.scores?.['Earned Mark'] || Object.values(existing.scores || {})[0] || 0);
      setEarnedMark(Math.min(50, Math.max(0, Number(val) || 0)));
      setJudgeNotes(existing.judgeNotes || '');
    } else {
      setEditingEntryId(null);
      setEarnedMark(40); // default starting mark
      setJudgeNotes('');
    }
  };

  // Total score strictly capped between 0 and 50
  const totalScore = Math.min(50, Math.max(0, Number(earnedMark) || 0));

  // Auto Grade & Grade Points calculation
  const currentGrade = calculateGrade(totalScore);
  const currentGradePoints = getGradePoints(currentGrade, memberCount);

  // Submit Mark Entry with auto-ranking across the program
  const handleSubmitMarkEntry = (e) => {
    e.preventDefault();
    if (!selectedProgramId || !selectedParticipantId) return;

    const entryData = {
      id: editingEntryId || `me-${Date.now()}`,
      programId: selectedProgramId,
      participantId: selectedParticipantId,
      scores: { 'Earned Mark': totalScore },
      totalScore,
      grade: currentGrade,
      memberCount,
      judgeNotes,
      enteredAt: new Date().toISOString(),
    };

    // Update mark entries list
    let updatedEntries;
    if (editingEntryId) {
      updatedEntries = markEntries.map((m) => (m.id === editingEntryId ? entryData : m));
    } else {
      updatedEntries = [...markEntries, entryData];
    }

    // Auto-rank entries in this program and assign 1st, 2nd, 3rd positions + points
    const finalRankedEntries = autoRankAndCalculateEntries(updatedEntries, selectedProgramId, memberCount);

    setMarkEntries(finalRankedEntries);

    // Auto-update program status based on evaluations
    if (onUpdateProgram && currentProgram && currentProgram.status !== 'Published') {
      const enrolledCount = participants.filter((p) => p.programs.includes(currentProgram.id)).length;
      const evaluatedCount = finalRankedEntries.filter((m) => m.programId === currentProgram.id).length;
      
      let newStatus = currentProgram.status;
      if (evaluatedCount >= enrolledCount && enrolledCount > 0) {
        newStatus = 'Completed';
      } else if (evaluatedCount > 0) {
        newStatus = 'In Progress';
      }

      if (newStatus !== currentProgram.status) {
        onUpdateProgram({ ...currentProgram, status: newStatus });
      }
    }

    setSuccessMessage(editingEntryId ? 'Mark entry updated & ranks recalculated!' : 'New mark entry saved & ranks updated!');

    setTimeout(() => setSuccessMessage(''), 4000);

    // Reset selection for next student
    setSelectedParticipantId('');
    setEarnedMark(0);
    setEditingEntryId(null);
  };

  // Edit existing entry from log table
  const handleEditExisting = (entry) => {
    setSelectedProgramId(entry.programId);
    setSelectedParticipantId(entry.participantId);
    const val = entry.totalScore !== undefined
      ? entry.totalScore
      : (entry.scores?.['Earned Mark'] || Object.values(entry.scores || {})[0] || 0);
    setEarnedMark(Math.min(50, Math.max(0, Number(val) || 0)));
    setJudgeNotes(entry.judgeNotes || '');
    setEditingEntryId(entry.id);
  };

  // Delete existing entry from log table and re-rank remaining
  const handleDeleteExisting = (entryId) => {
    const filtered = markEntries.filter((m) => m.id !== entryId);
    const reRanked = autoRankAndCalculateEntries(filtered, selectedProgramId, memberCount);
    setMarkEntries(reRanked);
  };

  // Marks logged for current program
  const currentProgramMarkEntries = markEntries
    .filter((me) => me.programId === selectedProgramId)
    .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header section */}
      {!hideHeader && (
        <div className="card" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ClipboardEdit style={{ color: 'var(--accent-emerald)' }} /> Official Judge Evaluation Sheet
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
              Record Earned Mark (0 – 50), auto-calculate performance grades & grade-based points, and auto-assign 1st/2nd/3rd rank points.
            </p>
          </div>

          {successMessage && (
            <div style={{
              background: '#dcfce7',
              border: '1px solid #86efac',
              color: '#166534',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'fadeIn 0.3s ease'
            }}>
              <CheckCircle2 size={18} /> {successMessage}
            </div>
          )}
        </div>
      )}

      {hideHeader && successMessage && (
        <div style={{
          background: '#dcfce7',
          border: '1px solid #86efac',
          color: '#166534',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.9rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} /> {successMessage}
        </div>
      )}

      {/* Main Grid: Form & Existing Entries Log */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
        gap: '1.75rem'
      }}>
        {/* EVALUATION FORM */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <Award size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Score Evaluation Sheet</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {editingEntryId ? '✏️ Editing Existing Score Record' : '➕ Record New Evaluation'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitMarkEntry} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Program & Members Count Selector */}
            {!hideHeader && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <BookOpen size={14} /> Select Program / Event *
                  </label>
                  <select
                    className="select-field"
                    value={selectedProgramId}
                    onChange={(e) => handleProgramChange(e.target.value)}
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.type || 'Individual'}) - Judge: {p.judge || 'Unassigned'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Layers size={14} /> Members
                  </label>
                  <select
                    className="select-field"
                    value={memberCount}
                    onChange={(e) => setMemberCount(Number(e.target.value))}
                  >
                    <option value={1}>1 Member</option>
                    <option value={2}>2 Members</option>
                    <option value={3}>3 Members</option>
                    <option value={4}>4 or 5 Members</option>
                  </select>
                </div>
              </div>
            )}

            {/* Participant Selection */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} /> Select Participant * ({enrolledParticipants.length} Enrolled)
              </label>
              <select
                className="select-field"
                value={selectedParticipantId}
                onChange={(e) => handleParticipantChange(e.target.value)}
                required
              >
                <option value="">-- Choose Participant from List --</option>
                {enrolledParticipants.map((part) => {
                  const team = teams.find((t) => t.id === part.teamId);
                  const evaluated = markEntries.some(
                    (me) => me.programId === selectedProgramId && me.participantId === part.id
                  );
                  return (
                    <option key={part.id} value={part.id}>
                      Chest #{part.chestNo} - {part.name} ({team?.name}) {evaluated ? '✅ [Evaluated]' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selected Participant Preview */}
            {selectedParticipantId && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-glow)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                {(() => {
                  const part = participants.find((p) => p.id === selectedParticipantId);
                  const team = teams.find((t) => t.id === part?.teamId);
                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.95rem', flexShrink: 0 }}>
                          {part?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{part?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: team?.color }}>{team?.icon} {team?.name} • Chest #{part?.chestNo}</div>
                        </div>
                      </div>
                      <span className={`badge badge-${part?.category.toLowerCase().replace('-', '')}`}>
                        {part?.category}
                      </span>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Single Earned Mark Input (0 to 50) */}
            {selectedParticipantId && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0, 0, 0, 0.2)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    Earned Mark * (0 – 50)
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    Max Allowed: 50 Marks
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={earnedMark}
                    onChange={(e) => setEarnedMark(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--accent-primary)', cursor: 'pointer', height: '8px' }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={earnedMark}
                    onChange={(e) => setEarnedMark(Math.min(50, Math.max(0, Number(e.target.value))))}
                    className="input-field"
                    style={{ width: '80px', padding: '0.5rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}
                    required
                  />
                </div>

                {/* Quick Preset Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
                  {[25, 30, 35, 40, 45, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEarnedMark(preset)}
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-light)',
                        background: earnedMark === preset ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                        color: earnedMark === preset ? '#fff' : 'var(--text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {preset} Marks
                    </button>
                  ))}
                </div>

                {/* Total Calculated Score Indicator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: '0.25rem'
                }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>TOTAL SCORE</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>
                    {totalScore} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 50</span>
                  </span>
                </div>
              </div>
            )}

            {/* Auto Grade & Points Calculation Display */}
            {selectedParticipantId && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Auto Performance Grade:
                  </span>
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    background: currentGrade === 'No Grade' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: currentGrade === 'No Grade' ? '#f87171' : '#34d399',
                    border: `1px solid ${currentGrade === 'No Grade' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                  }}>
                    {currentGrade === 'No Grade' ? 'No Grade (<25)' : `Grade ${currentGrade}`}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Grade Points ({memberCount} Member{memberCount > 1 ? 's' : ''}):
                  </span>
                  <span style={{ fontWeight: 700, color: '#34d399' }}>
                    +{currentGradePoints} pts
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Position Rank Points (Auto-identified):
                  </span>
                  <span style={{ fontWeight: 700, color: '#fbbf24' }}>
                    1st = +5 | 2nd = +3 | 3rd = +1
                  </span>
                </div>
              </div>
            )}

            {/* Judge Notes / Remarks */}
            {selectedParticipantId && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Judge Remarks / Feedback</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Optional notes regarding delivery, rhythm, or content..."
                  value={judgeNotes}
                  onChange={(e) => setJudgeNotes(e.target.value)}
                />
              </div>
            )}

            {/* Submit Button */}
            {selectedParticipantId && (
              <button
                type="submit"
                className="btn btn-primary btn-lg"
              >
                <Save size={18} /> {editingEntryId ? 'Update Score Record' : 'Save Mark Entry'}
              </button>
            )}
          </form>
        </div>

        {/* LOG TABLE FOR CURRENT PROGRAM */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-main)' }}>
                Evaluated Records ({currentProgramMarkEntries.length})
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Program: <strong style={{ color: 'var(--primary)' }}>{currentProgram?.name}</strong> ({memberCount} Member{memberCount > 1 ? 's' : ''})
              </div>
            </div>
            <span className={`badge badge-status-${currentProgram?.status.toLowerCase()}`}>
              {currentProgram?.status}
            </span>
          </div>

          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Chest</th>
                  <th>Participant</th>
                  <th>Score / 50</th>
                  <th>Grade</th>
                  <th>Rank & Pts</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProgramMarkEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No marks recorded yet for this program. Select a participant on the left to evaluate.
                    </td>
                  </tr>
                ) : (
                  currentProgramMarkEntries.map((me) => {
                    const part = participants.find((p) => p.id === me.participantId);
                    const team = teams.find((t) => t.id === part?.teamId);

                    return (
                      <tr key={me.id}>
                        <td style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>#{part?.chestNo}</td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem' }}>{part?.name}</div>
                          <div style={{ fontSize: '0.725rem', color: team?.color }}>{team?.icon} {team?.name}</div>
                        </td>
                        <td style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1rem' }}>
                          {me.totalScore} / 50
                        </td>
                        <td>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: me.grade === 'No Grade' ? '#fb7185' : '#34d399',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: me.grade === 'No Grade' ? 'rgba(251, 113, 133, 0.1)' : 'rgba(52, 211, 153, 0.1)'
                          }}>
                            {me.grade}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              {me.position === 1 && <span className="medal-icon medal-gold" style={{ width: '22px', height: '22px', fontSize: '0.7rem' }}>1</span>}
                              {me.position === 2 && <span className="medal-icon medal-silver" style={{ width: '22px', height: '22px', fontSize: '0.7rem' }}>2</span>}
                              {me.position === 3 && <span className="medal-icon medal-bronze" style={{ width: '22px', height: '22px', fontSize: '0.7rem' }}>3</span>}
                              {!me.position && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unranked</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 800 }}>
                              +{me.teamPoints || 0} pts ({me.gradePoints || 0}G + {me.positionPoints || 0}P)
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleEditExisting(me)}
                              title="Edit Entry"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDeleteExisting(me.id)}
                              style={{ color: '#fb7185' }}
                              title="Delete Entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

