import React, { useState } from 'react';
import { ClipboardEdit, Award, CheckCircle2, AlertCircle, Save, Trash2, Edit3, User, BookOpen, Star, FileText, Layers, Scale, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  MAX_ITEM_MARKS,
  calculateGrade,
  getGradePoints,
  getPositionPoints,
  autoRankAndCalculateEntries,
  getParticipantCodeLetter,
  getSequentialCodeLetter,
} from '../utils/evaluationRules';

export default function MarkEntry({ programs, participants, teams, markEntries, setMarkEntries, initialProgramId, hideHeader = false, hideProgramSelect = false, isJudgeView = false, onUpdateProgram }) {
  const { judges = [], currentUser, saveMarkEntry, saveMarkEntries, deleteMarkEntry } = useApp();
  const isAnonymousJudging = isJudgeView || currentUser?.role === 'Judge';

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

  // Judges assigned to current program
  const assignedProgramJudges = React.useMemo(() => {
    if (!currentProgram?.judge) return [];
    return currentProgram.judge.split(',').map((j) => j.trim()).filter(Boolean);
  }, [currentProgram]);

  // Evaluator Judge state
  const [evaluatorJudge, setEvaluatorJudge] = useState('');

  // Default evaluator judge when program changes or currentUser changes
  React.useEffect(() => {
    if (assignedProgramJudges.length > 0) {
      setEvaluatorJudge(assignedProgramJudges[0]);
    } else if (judges.length > 0) {
      setEvaluatorJudge(judges[0].name);
    } else if (currentUser?.role === 'Judge' && currentUser?.name && currentUser?.name !== 'Judge') {
      setEvaluatorJudge(currentUser.name);
    } else {
      setEvaluatorJudge('Judge');
    }
  }, [selectedProgramId, assignedProgramJudges, judges]);

  // When evaluatorJudge changes and a participant is selected, reload that judge's mark
  React.useEffect(() => {
    if (selectedParticipantId) {
      const activeJudge = evaluatorJudge || currentProgram?.judge || 'Judge';
      const existing = markEntries.find(
        (me) =>
          me.programId === selectedProgramId &&
          me.participantId === selectedParticipantId &&
          (me.judgeName || '').trim().toLowerCase() === activeJudge.trim().toLowerCase()
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
        setEarnedMark(40);
        setJudgeNotes('');
      }
    }
  }, [evaluatorJudge]);
  
  // Safe helper to check if a participant is enrolled in a program
  const isEnrolledIn = (participant, programId) => {
    if (!participant || !participant.programs || !Array.isArray(participant.programs)) return false;
    return participant.programs.some((item) =>
      typeof item === 'string' ? item === programId : item?.id === programId
    );
  };

  // Participants enrolled in selected program
  const enrolledParticipants = participants.filter((p) => isEnrolledIn(p, selectedProgramId));

  // Resolved Code Letter map for enrolled participants in current program
  const participantCodeLetterMap = React.useMemo(() => {
    const map = {};
    enrolledParticipants.forEach((p, idx) => {
      map[p.id] = getParticipantCodeLetter(currentProgram, p.id, idx);
    });
    return map;
  }, [currentProgram, enrolledParticipants]);

  const getCodeLetter = (participantId, idx = 0) => {
    return participantCodeLetterMap[participantId] || getParticipantCodeLetter(currentProgram, participantId, idx);
  };

  // Scores state: single Earned Mark (0 to 50)
  const [earnedMark, setEarnedMark] = useState(0);
  const [memberCount, setMemberCount] = useState(programMemberCount);
  const [judgeNotes, setJudgeNotes] = useState('');
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [customCodeLetter, setCustomCodeLetter] = useState('');

  // Keep customCodeLetter synced when selected participant changes
  React.useEffect(() => {
    if (selectedParticipantId) {
      const idx = enrolledParticipants.findIndex((p) => p.id === selectedParticipantId);
      const letter = getCodeLetter(selectedParticipantId, idx >= 0 ? idx : 0);
      setCustomCodeLetter(letter);
    } else {
      setCustomCodeLetter('');
    }
  }, [selectedParticipantId, participantCodeLetterMap]);

  // Handler for admin to update code letter for selected participant
  const handleCustomCodeLetterChange = (newLetter) => {
    const formatted = newLetter.toUpperCase();
    setCustomCodeLetter(formatted);
    if (!selectedParticipantId || !currentProgram) return;

    const updatedLetters = {
      ...(currentProgram.codeLetters || {}),
      [selectedParticipantId]: formatted,
    };
    try {
      localStorage.setItem(`eduvenza_code_letters_${currentProgram.id}`, JSON.stringify(updatedLetters));
    } catch {
      // ignore
    }
    if (onUpdateProgram) {
      onUpdateProgram({
        ...currentProgram,
        codeLetters: updatedLetters,
      });
    }
  };

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
    setCustomCodeLetter('');
  };

  // Handle participant change
  const handleParticipantChange = (partId) => {
    setSelectedParticipantId(partId);
    const activeJudge = evaluatorJudge || currentProgram?.judge || 'Judge';
    const idx = enrolledParticipants.findIndex((p) => p.id === partId);
    const codeLtr = getCodeLetter(partId, idx >= 0 ? idx : 0);
    setCustomCodeLetter(codeLtr);

    // Check if an entry already exists for this participant evaluated by this specific judge
    const existing = markEntries.find(
      (me) =>
        me.programId === selectedProgramId &&
        me.participantId === partId &&
        (me.judgeName || '').trim().toLowerCase() === activeJudge.trim().toLowerCase()
    );

    if (existing) {
      setEditingEntryId(existing.id);
      const val = existing.totalScore !== undefined
        ? existing.totalScore
        : (existing.scores?.['Earned Mark'] || Object.values(existing.scores || {})[0] || 0);
      setEarnedMark(Math.min(50, Math.max(0, Number(val) || 0)));
      setJudgeNotes(existing.judgeNotes || '');
      if (existing.codeLetter || existing.scores?.codeLetter) {
        setCustomCodeLetter(existing.codeLetter || existing.scores?.codeLetter);
      }
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
  const handleSubmitMarkEntry = async (e) => {
    e.preventDefault();
    if (!selectedProgramId || !selectedParticipantId) return;

    const activeJudge = evaluatorJudge || currentProgram?.judge || 'Judge';
    const cleanJudgeSlug = activeJudge.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
    const entryId = editingEntryId || `me-${selectedProgramId}-${selectedParticipantId}-${cleanJudgeSlug}`;

    const idx = enrolledParticipants.findIndex((p) => p.id === selectedParticipantId);
    const activeCodeLetter = customCodeLetter || getCodeLetter(selectedParticipantId, idx >= 0 ? idx : 0);

    const entryData = {
      id: entryId,
      programId: selectedProgramId,
      participantId: selectedParticipantId,
      scores: { 'Earned Mark': totalScore, codeLetter: activeCodeLetter },
      totalScore,
      grade: currentGrade,
      memberCount,
      judgeNotes,
      judgeName: activeJudge,
      codeLetter: activeCodeLetter,
      enteredAt: new Date().toISOString(),
    };

    // Find if an entry for this (program, participant, judge) already exists
    const existingIndex = markEntries.findIndex(
      (m) =>
        m.id === entryId ||
        (m.programId === selectedProgramId &&
          m.participantId === selectedParticipantId &&
          (m.judgeName || '').trim().toLowerCase() === activeJudge.trim().toLowerCase())
    );

    let updatedEntries;
    if (existingIndex >= 0) {
      updatedEntries = markEntries.map((m, idx) => (idx === existingIndex ? { ...m, ...entryData } : m));
    } else {
      updatedEntries = [...markEntries, entryData];
    }

    // Auto-rank entries in this program using multi-judge average
    const finalRankedEntries = autoRankAndCalculateEntries(updatedEntries, selectedProgramId, memberCount);

    setMarkEntries(finalRankedEntries);

    // Auto-update program status based on evaluations
    if (onUpdateProgram && currentProgram && currentProgram.status !== 'Published') {
      const enrolledCount = participants.filter((p) => isEnrolledIn(p, currentProgram.id)).length;
      // Count unique evaluated participants
      const uniqueEvaluatedParticipants = new Set(
        finalRankedEntries.filter((m) => m.programId === currentProgram.id).map((m) => m.participantId)
      ).size;
      
      let newStatus = currentProgram.status;
      if (uniqueEvaluatedParticipants >= enrolledCount && enrolledCount > 0) {
        newStatus = 'Completed';
      } else if (uniqueEvaluatedParticipants > 0) {
        newStatus = 'In Progress';
      }

      if (newStatus !== currentProgram.status) {
        onUpdateProgram({ ...currentProgram, status: newStatus });
      }
    }

    setSuccessMessage(editingEntryId ? `Mark updated for ${activeJudge}!` : `Mark recorded for ${activeJudge}!`);
    setTimeout(() => setSuccessMessage(''), 4000);

    // Save ALL re-ranked entries to Supabase + localStorage (single batch)
    if (saveMarkEntries) await saveMarkEntries(finalRankedEntries);

    // Reset selection for next student
    setSelectedParticipantId('');
    setEarnedMark(0);
    setEditingEntryId(null);
  };

  // Edit existing entry from log table
  const handleEditExisting = (entry) => {
    setSelectedProgramId(entry.programId);
    if (entry.judgeName) {
      setEvaluatorJudge(entry.judgeName);
    }
    setSelectedParticipantId(entry.participantId);
    const val = entry.totalScore !== undefined
      ? entry.totalScore
      : (entry.scores?.['Earned Mark'] || Object.values(entry.scores || {})[0] || 0);
    setEarnedMark(Math.min(50, Math.max(0, Number(val) || 0)));
    setJudgeNotes(entry.judgeNotes || '');
    setEditingEntryId(entry.id);
    const idx = enrolledParticipants.findIndex((p) => p.id === entry.participantId);
    const letter = entry.codeLetter || entry.scores?.codeLetter || getCodeLetter(entry.participantId, idx >= 0 ? idx : 0);
    setCustomCodeLetter(letter);
  };

  // Delete existing entry from log table and re-rank remaining
  const handleDeleteExisting = (entryId) => {
    const filtered = markEntries.filter((m) => m.id !== entryId);
    const reRanked = autoRankAndCalculateEntries(filtered, selectedProgramId, memberCount);
    if (deleteMarkEntry) deleteMarkEntry(entryId);
    if (saveMarkEntries && reRanked.length > 0) saveMarkEntries(reRanked);
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
                {currentProgram && (
                  <span style={{ marginLeft: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                    • {currentProgram.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitMarkEntry} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Program & Members Count Selector - only shown when not locked to a specific program */}
            {!hideHeader && !hideProgramSelect && (
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

            {/* If program selector is hidden but this is a group event, allow adjusting member count */}
            {(hideProgramSelect || hideHeader) && (currentProgram?.type === 'Group' || (currentProgram?.memberCount || 1) > 1) && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Layers size={14} /> Group Members Count
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
            )}

            {/* ── Evaluating As (Judge Selector) – always visible at top ── */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Scale size={14} style={{ color: 'var(--primary)' }} /> Evaluating As (Judge Name) *
              </label>
              <select
                className="select-field"
                value={evaluatorJudge}
                onChange={(e) => setEvaluatorJudge(e.target.value)}
                required
              >
                <option value="">-- Select Your Name --</option>
                {assignedProgramJudges.length > 0 && (
                  <optgroup label="Assigned to This Event">
                    {assignedProgramJudges.map((jName, idx) => (
                      <option key={`assigned-${idx}`} value={jName}>
                        🎯 {jName}
                      </option>
                    ))}
                  </optgroup>
                )}
                {judges.length > 0 && (
                  <optgroup label="Created Judges">
                    {judges.map((j) => (
                      <option key={j.id} value={j.name}>
                        ⚖️ {j.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {currentUser?.name &&
                  !assignedProgramJudges.includes(currentUser.name) &&
                  !judges.some((j) => j.name === currentUser.name) && (
                    <optgroup label="Current Session">
                      <option value={currentUser.name}>👤 {currentUser.name}</option>
                    </optgroup>
                  )}
              </select>
              {evaluatorJudge && (
                <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: '#047857', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  ✅ Evaluating as: <strong>{evaluatorJudge}</strong>
                </div>
              )}
            </div>

            {/* Participant Selection */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} /> {isAnonymousJudging ? 'Select Participant by Kot Letter *' : 'Select Participant *'} ({enrolledParticipants.length} Enrolled)
              </label>
              <select
                className="select-field"
                value={selectedParticipantId}
                onChange={(e) => handleParticipantChange(e.target.value)}
                required
              >
                <option value="">
                  {isAnonymousJudging ? '-- Choose Participant by Kot Letter --' : '-- Choose Participant from List --'}
                </option>
                {enrolledParticipants.map((part, idx) => {
                  const codeLtr = getCodeLetter(part.id, idx);
                  const activeJudge = evaluatorJudge || currentProgram?.judge || 'Judge';
                  const evaluatedByMe = markEntries.some(
                    (me) =>
                      me.programId === selectedProgramId &&
                      me.participantId === part.id &&
                      (me.judgeName || '').trim().toLowerCase() === activeJudge.trim().toLowerCase()
                  );
                  const otherJudgesEntries = markEntries.filter(
                    (me) =>
                      me.programId === selectedProgramId &&
                      me.participantId === part.id &&
                      (me.judgeName || '').trim().toLowerCase() !== activeJudge.trim().toLowerCase()
                  );

                  let statusBadge = '';
                  if (evaluatedByMe) {
                    statusBadge = '✅ [Evaluated by you]';
                  } else if (otherJudgesEntries.length > 0) {
                    statusBadge = `⏳ [Pending you • ${otherJudgesEntries.length} judge done]`;
                  } else {
                    statusBadge = '⚪ [Pending]';
                  }

                  if (isAnonymousJudging) {
                    return (
                      <option key={part.id} value={part.id}>
                        Kot Letter: {codeLtr} {statusBadge}
                      </option>
                    );
                  }

                  const team = teams.find((t) => t.id === part.teamId);
                  return (
                    <option key={part.id} value={part.id}>
                      [{codeLtr}] Chest #{part.chestNo} - {part.name} ({team?.name}) {statusBadge}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Admin only: Quick Kot Letter Inline Editor */}
            {!isAnonymousJudging && selectedParticipantId && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', fontWeight: 700, color: '#1e40af' }}>
                  <Tag size={15} style={{ color: '#2563eb' }} /> Kot Letter:
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={customCodeLetter}
                    onChange={(e) => handleCustomCodeLetterChange(e.target.value)}
                    maxLength={4}
                    placeholder="e.g. A"
                    style={{
                      width: '60px',
                      padding: '0.25rem 0.4rem',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      borderRadius: '6px',
                      border: '1px solid #93c5fd',
                      textTransform: 'uppercase',
                      color: '#1e3a8a',
                      background: '#fff',
                    }}
                  />
                  <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                    (Anonymous code seen by Judges)
                  </span>
                </div>
              </div>
            )}

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
                  const idx = enrolledParticipants.findIndex((p) => p.id === selectedParticipantId);
                  const codeLtr = customCodeLetter || getCodeLetter(part?.id, idx >= 0 ? idx : 0);

                  if (isAnonymousJudging) {
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            color: '#fff',
                            fontSize: '1.25rem',
                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                          }}>
                            {codeLtr}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem', letterSpacing: '0.02em' }}>
                              Participant Kot Letter: {codeLtr}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Blind Judge Evaluation • {part?.category || 'General'}
                            </div>
                          </div>
                        </div>
                        <span style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                        }}>
                          KOT LETTER: {codeLtr}
                        </span>
                      </>
                    );
                  }

                  const team = teams.find((t) => t.id === part?.teamId);
                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.95rem', flexShrink: 0 }}>
                          {part?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span style={{ background: '#2563eb', color: '#fff', padding: '0.1rem 0.45rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                              Kot {codeLtr}
                            </span>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{part?.name}</div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: team?.color, marginTop: '0.15rem' }}>{team?.icon} {team?.name} • Chest #{part?.chestNo}</div>
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
                  <th style={{ width: '80px', textAlign: 'center' }}>Kot Letter</th>
                  {!isAnonymousJudging && <th>Chest</th>}
                  {!isAnonymousJudging && <th>Participant</th>}
                  <th>Score / 50</th>
                  <th>Grade</th>
                  <th>Rank & Pts</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProgramMarkEntries.length === 0 ? (
                  <tr>
                    <td colSpan={isAnonymousJudging ? 5 : 7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No marks recorded yet for this program. Select a participant on the left to evaluate.
                    </td>
                  </tr>
                ) : (
                  currentProgramMarkEntries.map((me) => {
                    const part = participants.find((p) => p.id === me.participantId);
                    const team = teams.find((t) => t.id === part?.teamId);
                    const enrolledIdx = enrolledParticipants.findIndex((p) => p.id === me.participantId);
                    const codeLtr = me.codeLetter || me.scores?.codeLetter || getCodeLetter(me.participantId, enrolledIdx >= 0 ? enrolledIdx : 0);

                    return (
                      <tr key={me.id}>
                        {/* Kot Letter Column */}
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: '#2563eb',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                          }}>
                            {codeLtr}
                          </span>
                        </td>

                        {!isAnonymousJudging && (
                          <td style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>#{part?.chestNo}</td>
                        )}

                        {!isAnonymousJudging && (
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem' }}>{part?.name}</div>
                            <div style={{ fontSize: '0.725rem', color: team?.color }}>{team?.icon} {team?.name}</div>
                            {me.judgeName && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                ⚖️ Judge: <strong style={{ color: 'var(--text-main)' }}>{me.judgeName}</strong>
                              </div>
                            )}
                          </td>
                        )}

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

