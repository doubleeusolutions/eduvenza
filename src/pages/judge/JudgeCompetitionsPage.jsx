import React, { useState } from 'react';
import {
  Trophy,
  ClipboardEdit,
  Search,
  X,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Users,
  Eye,
  Filter,
  Layers,
  Sparkles,
  Award,
  MoreVertical,
  Scale,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import MarkEntry from '../../components/MarkEntry';
import { getParticipantCodeLetter } from '../../utils/evaluationRules';

export default function JudgeCompetitionsPage() {
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

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedJudgeFilter, setSelectedJudgeFilter] = useState(''); // '' = All, 'me' = Assigned to Me, or judge name
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isJudgeDropdownOpen, setIsJudgeDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Modal / Drawer States
  const [evaluatingProgram, setEvaluatingProgram] = useState(null);
  const [viewingProgram, setViewingProgram] = useState(null);
  const [assignmentNotice, setAssignmentNotice] = useState('');

  // Add judge to program
  const handleAddJudgeToProgram = (prg, judgeToAdd) => {
    if (!prg || !judgeToAdd) return;
    const existing = (prg.judge || '')
      .split(',')
      .map((j) => j.trim())
      .filter(Boolean);
    if (!existing.includes(judgeToAdd)) {
      const updatedList = [...existing, judgeToAdd];
      const updated = { ...prg, judge: updatedList.join(', ') };
      if (updateProgram) updateProgram(updated);
      if (evaluatingProgram && evaluatingProgram.id === prg.id) setEvaluatingProgram(updated);
      setAssignmentNotice(`⚖️ Added ${judgeToAdd} to ${prg.name}`);
      setTimeout(() => setAssignmentNotice(''), 3500);
    }
  };

  // Remove judge from program
  const handleRemoveJudgeFromProgram = (prg, judgeToRemove) => {
    if (!prg) return;
    const existing = (prg.judge || '')
      .split(',')
      .map((j) => j.trim())
      .filter(Boolean);
    const updatedList = existing.filter((j) => j !== judgeToRemove);
    const updated = { ...prg, judge: updatedList.join(', ') };
    if (updateProgram) updateProgram(updated);
    if (evaluatingProgram && evaluatingProgram.id === prg.id) setEvaluatingProgram(updated);
    setAssignmentNotice(`Judge ${judgeToRemove} removed from ${prg.name}`);
    setTimeout(() => setAssignmentNotice(''), 3500);
  };

  // Select or change single assigned judge for a program
  const handleProgramJudgeSelect = (prg, newJudgeName) => {
    if (!prg) return;
    const updated = { ...prg, judge: newJudgeName };
    if (updateProgram) updateProgram(updated);
    if (evaluatingProgram && evaluatingProgram.id === prg.id) setEvaluatingProgram(updated);
    setAssignmentNotice(
      newJudgeName
        ? `⚖️ ${newJudgeName} assigned as judge for ${prg.name}`
        : `Judge unassigned for ${prg.name}`
    );
    setTimeout(() => setAssignmentNotice(''), 3500);
  };

  // Safe helper to check if a participant is enrolled in a program
  const isEnrolledIn = (participant, programId) => {
    if (!participant || !participant.programs || !Array.isArray(participant.programs)) return false;
    return participant.programs.some((item) =>
      typeof item === 'string' ? item === programId : item?.id === programId
    );
  };

  // Compute evaluation statistics
  const stats = React.useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let pending = 0;

    programs.forEach((p) => {
      const enrolledCount = participants.filter((part) => isEnrolledIn(part, p.id)).length;
      const evaluatedCount = new Set(
        markEntries.filter((m) => m.programId === p.id).map((m) => m.participantId)
      ).size;

      if (evaluatedCount >= enrolledCount && enrolledCount > 0) {
        completed++;
      } else if (evaluatedCount > 0) {
        inProgress++;
      } else {
        pending++;
      }
    });

    return {
      total: programs.length,
      completed,
      inProgress,
      pending,
    };
  }, [programs, participants, markEntries]);

  // Number of programs assigned to current logged-in judge
  const myProgramsCount = React.useMemo(() => {
    if (!currentUser?.name) return 0;
    const myName = currentUser.name.toLowerCase();
    return programs.filter((p) => (p.judge || '').toLowerCase().includes(myName)).length;
  }, [programs, currentUser]);

  // Filter programs for the evaluation sheet table
  const filteredPrograms = programs.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;

    // Filter by selected judge
    if (selectedJudgeFilter) {
      const targetJudgeName = selectedJudgeFilter === 'me' ? (currentUser?.name || '') : selectedJudgeFilter;
      if (targetJudgeName) {
        const qJudge = targetJudgeName.toLowerCase();
        const pJudge = (p.judge || '').toLowerCase();
        if (!pJudge.includes(qJudge)) return false;
      }
    }

    const enrolledCount = participants.filter((part) => isEnrolledIn(part, p.id)).length;
    const evaluatedCount = markEntries.filter((m) => m.programId === p.id).length;

    let evalStatus = 'Pending';
    if (evaluatedCount >= enrolledCount && enrolledCount > 0) {
      evalStatus = 'Completed';
    } else if (evaluatedCount > 0) {
      evalStatus = 'In Progress';
    }

    if (selectedStatus && selectedStatus !== evalStatus) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchCode = (p.code || '').toLowerCase().includes(q);
      const matchJudge = (p.judge || '').toLowerCase().includes(q);
      const matchVenue = (p.venue || '').toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchJudge && !matchVenue) return false;
    }

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* HEADER & QUICK STATS BANNER */}
      <div className="card" style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '1px solid #fcd34d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b45309',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                }}
              >
                <ClipboardEdit size={22} />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    margin: 0,
                    color: 'var(--text-main)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Competitions Evaluation Sheet
                </h1>
                <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0 0', fontSize: '0.875rem' }}>
                  Official Judge assessment portal — Select an event to score participants, calculate performance grades, and auto-award rank points.
                </p>
              </div>
            </div>
          </div>

          {/* Shared Judge Account Info & Notification */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.5rem 0.9rem',
                background: '#f8fafc',
                border: '1px solid var(--border-light)',
                borderRadius: '9999px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#d97706',
                  boxShadow: '0 0 0 3px rgba(217, 119, 6, 0.2)',
                }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Official Judge Session
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#b45309',
                  background: '#fef3c7',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                }}
              >
                Shared Judge Account
              </span>
            </div>

            {selectedJudgeFilter && (
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: '#eff6ff',
                  borderColor: '#bfdbfe',
                  color: '#1d4ed8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
                onClick={() => setSelectedJudgeFilter('')}
              >
                <span>⚖️ Showing: {selectedJudgeFilter}</span>
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Real-time Judge Assignment Toast Notice */}
        {assignmentNotice && (
          <div
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{assignmentNotice}</span>
          </div>
        )}

        {/* STATS CHIPS ROW */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#f8fafc',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Competitions
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {stats.total}
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#ecfdf5',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #a7f3d0',
              cursor: 'pointer',
            }}
            onClick={() => setSelectedStatus(selectedStatus === 'Completed' ? '' : 'Completed')}
          >
            <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>
              Completed
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#065f46', marginTop: '0.2rem' }}>
              {stats.completed}
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#fefce8',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #fef08a',
              cursor: 'pointer',
            }}
            onClick={() => setSelectedStatus(selectedStatus === 'In Progress' ? '' : 'In Progress')}
          >
            <div style={{ fontSize: '0.75rem', color: '#a16207', fontWeight: 700, textTransform: 'uppercase' }}>
              In Progress
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#854d0e', marginTop: '0.2rem' }}>
              {stats.inProgress}
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#f1f5f9',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
            }}
            onClick={() => setSelectedStatus(selectedStatus === 'Pending' ? '' : 'Pending')}
          >
            <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>
              Pending
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#334155', marginTop: '0.2rem' }}>
              {stats.pending}
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH, STATUS FILTER & CATEGORIES */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Custom Status Dropdown */}
          <div className="campus-dropdown-container" style={{ flex: 1, minWidth: '170px', position: 'relative' }}>
            <div
              className="input-field"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none',
                background: isStatusDropdownOpen ? '#ffffff' : 'var(--bg-input)',
                borderColor: isStatusDropdownOpen ? 'var(--primary)' : 'var(--border-light)',
              }}
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: selectedStatus ? 'var(--primary)' : 'var(--text-muted)' }} />
                <span style={{ color: selectedStatus ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: selectedStatus ? 700 : 500 }}>
                  {selectedStatus ? selectedStatus : 'All Eval Statuses'}
                </span>
              </div>
              <MoreVertical size={14} style={{ color: 'var(--text-muted)', transform: isStatusDropdownOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>

            {isStatusDropdownOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsStatusDropdownOpen(false)} />
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    left: 0,
                    right: 0,
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    zIndex: 50,
                    padding: '0.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                  }}
                >
                  {[
                    { value: '', label: 'All Eval Statuses', icon: '📋' },
                    { value: 'Completed', label: 'Completed', icon: '✅' },
                    { value: 'In Progress', label: 'In Progress', icon: '🔄' },
                    { value: 'Pending', label: 'Pending', icon: '⏳' },
                  ].map((option) => (
                    <div
                      key={option.value}
                      onClick={() => {
                        setSelectedStatus(option.value);
                        setIsStatusDropdownOpen(false);
                      }}
                      style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        background: selectedStatus === option.value ? '#eff6ff' : 'transparent',
                        color: selectedStatus === option.value ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: selectedStatus === option.value ? 700 : 500,
                        fontSize: '0.85rem',
                      }}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                      {selectedStatus === option.value && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Custom Judge Filter Dropdown */}
          <div className="campus-dropdown-container" style={{ flex: 1, minWidth: '190px', position: 'relative' }}>
            <div
              className="input-field"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none',
                background: isJudgeDropdownOpen ? '#ffffff' : 'var(--bg-input)',
                borderColor: isJudgeDropdownOpen ? 'var(--primary)' : selectedJudgeFilter ? 'var(--primary)' : 'var(--border-light)',
              }}
              onClick={() => setIsJudgeDropdownOpen(!isJudgeDropdownOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                <Scale size={16} style={{ color: selectedJudgeFilter ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                <span style={{ color: selectedJudgeFilter ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: selectedJudgeFilter ? 700 : 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {selectedJudgeFilter === 'me'
                    ? `🎯 My Events (${currentUser?.name || 'Me'})`
                    : selectedJudgeFilter
                    ? `⚖️ ${selectedJudgeFilter}`
                    : 'All Judges / Events'}
                </span>
              </div>
              <MoreVertical size={14} style={{ color: 'var(--text-muted)', transform: isJudgeDropdownOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </div>

            {isJudgeDropdownOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsJudgeDropdownOpen(false)} />
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    left: 0,
                    right: 0,
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    zIndex: 50,
                    padding: '0.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    maxHeight: '260px',
                    overflowY: 'auto',
                  }}
                >
                  <div
                    onClick={() => { setSelectedJudgeFilter(''); setIsJudgeDropdownOpen(false); }}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      background: selectedJudgeFilter === '' ? '#eff6ff' : 'transparent',
                      color: selectedJudgeFilter === '' ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: selectedJudgeFilter === '' ? 700 : 500,
                      fontSize: '0.85rem',
                    }}
                  >
                    <span>🌐</span>
                    <span>All Competitions ({programs.length})</span>
                    {selectedJudgeFilter === '' && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />}
                  </div>

                  {currentUser?.name && (
                    <div
                      onClick={() => { setSelectedJudgeFilter('me'); setIsJudgeDropdownOpen(false); }}
                      style={{
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        background: selectedJudgeFilter === 'me' ? '#eff6ff' : 'transparent',
                        color: selectedJudgeFilter === 'me' ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: selectedJudgeFilter === 'me' ? 700 : 500,
                        fontSize: '0.85rem',
                      }}
                    >
                      <span>🎯</span>
                      <span>Assigned to Me ({currentUser.name})</span>
                      {selectedJudgeFilter === 'me' && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />}
                    </div>
                  )}

                  {judges.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-light)', margin: '0.25rem 0', paddingTop: '0.25rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, padding: '0.25rem 0.75rem', textTransform: 'uppercase' }}>
                        Created Judges
                      </div>
                      {judges.map((j) => {
                        const count = programs.filter((p) => (p.judge || '').toLowerCase().includes((j.name || '').toLowerCase())).length;
                        const isSel = selectedJudgeFilter === j.name;
                        return (
                          <div
                            key={j.id}
                            onClick={() => { setSelectedJudgeFilter(j.name); setIsJudgeDropdownOpen(false); }}
                            style={{
                              padding: '0.55rem 0.75rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              background: isSel ? '#eff6ff' : 'transparent',
                              color: isSel ? 'var(--primary)' : 'var(--text-main)',
                              fontWeight: isSel ? 700 : 500,
                              fontSize: '0.85rem',
                            }}
                          >
                            <span>⚖️</span>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <span>{j.name}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {j.specialization || 'Judge'} • {count} Event{count !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {isSel && <Check size={14} style={{ color: 'var(--primary)' }} />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Search Input */}
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Search by event name, code, venue, judge..."
              style={{ paddingLeft: '2.4rem', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                onClick={() => setSearchQuery('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {(searchQuery || selectedCategory || selectedStatus || selectedJudgeFilter) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedStatus('');
                setSelectedJudgeFilter('');
              }}
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>

        {/* Category Pills Bar */}
        <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', padding: '0.2rem 0' }} className="hide-scrollbar">
          {['', 'Individual On Stage', 'Individual Off Stage', 'General On Stage', 'General Off Stage'].map((cat) => {
            const count = cat === '' ? programs.length : programs.filter((p) => p.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat || 'all'}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: `1px solid ${isSelected ? 'var(--primary, #2563eb)' : 'var(--border-light, #e2e8f0)'}`,
                  background: isSelected ? 'var(--primary, #2563eb)' : '#ffffff',
                  color: isSelected ? '#ffffff' : 'var(--text-muted, #64748b)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat === '' ? `All Categories (${count})` : `${cat} (${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* EVALUATION SHEET TABLE */}
      <div className="table-container">
        <table className="app-table">
          <thead>
            <tr>
              <th>Competition Event</th>
              <th>Venue & Schedule</th>
              <th>Assigned Judge</th>
              <th>Evaluation Progress</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                    <ClipboardEdit size={36} style={{ opacity: 0.3 }} />
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      No competition events match your criteria.
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      Try adjusting your search terms or clearing active filters.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPrograms.map((prg) => {
                const enrolledCount = participants.filter((p) => isEnrolledIn(p, prg.id)).length;
                const evaluatedCount = new Set(
                  markEntries.filter((m) => m.programId === prg.id).map((m) => m.participantId)
                ).size;
                const pct = enrolledCount > 0 ? Math.min(100, Math.round((evaluatedCount / enrolledCount) * 100)) : 0;

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
                  <tr key={prg.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '0.12rem 0.45rem',
                            borderRadius: '4px',
                            background: '#f1f5f9',
                            color: '#334155',
                          }}
                        >
                          {prg.code}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: prg.category?.includes('On Stage') ? '#b45309' : '#2563eb',
                            background: prg.category?.includes('On Stage') ? '#fef3c7' : '#eff6ff',
                            padding: '0.12rem 0.45rem',
                            borderRadius: '4px',
                          }}
                        >
                          {prg.category || 'General'}
                        </span>
                      </div>
                      <div
                        onClick={() => setViewingProgram(prg)}
                        style={{
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          fontSize: '0.96rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                        title="Click to view full event details and enrolled students"
                      >
                        <span>{prg.name}</span>
                        <Eye size={13} style={{ color: 'var(--primary)', opacity: 0.7 }} />
                      </div>
                      <div className="hide-on-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {prg.memberCount > 1 ? `👥 ${prg.memberCount} Contestants/Group` : '👤 Individual'} • Max {prg.maxMarks || 50} pts
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                        <Clock size={14} style={{ color: 'var(--primary)' }} /> {prg.date || 'Not Assigned'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: prg.time && prg.time !== 'Not Assigned' ? '#0f766e' : 'var(--text-muted)', fontWeight: 600, marginTop: '0.15rem' }}>
                        ⏱️ {prg.time || 'Not Assigned'} • <MapPin size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> {prg.venue || 'Main Hall A'}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', minWidth: '160px' }}>
                        {(() => {
                          const assignedList = (prg.judge || '')
                            .split(',')
                            .map((j) => j.trim())
                            .filter(Boolean);

                          const evaluatedJudgeNames = [
                            ...new Set(
                              markEntries
                                .filter((m) => m.programId === prg.id && m.judgeName)
                                .map((m) => m.judgeName.trim())
                                .filter(Boolean)
                            ),
                          ];

                          const allJudges = [...new Set([...assignedList, ...evaluatedJudgeNames])];

                          if (allJudges.length === 0) {
                            return (
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                No judge assigned
                              </span>
                            );
                          }

                          return allJudges.map((jName, idx) => {
                            const hasEvaluated = evaluatedJudgeNames.includes(jName);
                            return (
                              <span
                                key={`${jName}-${idx}`}
                                style={{
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '6px',
                                  background: hasEvaluated ? '#dcfce7' : '#eff6ff',
                                  color: hasEvaluated ? '#166534' : '#1d4ed8',
                                  border: `1px solid ${hasEvaluated ? '#86efac' : '#bfdbfe'}`,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  whiteSpace: 'nowrap',
                                }}
                                title={hasEvaluated ? `${jName} — has submitted marks` : `${jName} — assigned`}
                              >
                                {hasEvaluated ? '✅' : '⚖️'} {jName}
                              </span>
                            );
                          });
                        })()}
                      </div>
                    </td>

                    <td style={{ minWidth: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)', whiteSpace: 'nowrap', gap: '0.5rem' }}>
                        <span>{evaluatedCount} of {enrolledCount} Evaluated</span>
                        <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: evaluatedCount === enrolledCount && enrolledCount > 0 ? '#10b981' : 'var(--primary)',
                            borderRadius: '3px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </td>

                    <td>
                      <span className="status-pill" style={{ background: statusBg, color: statusColor, fontWeight: 700 }}>
                        {statusLabel}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setViewingProgram(prg)}
                          title="View Details"
                          style={{ padding: '0.45rem 0.65rem' }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setEvaluatingProgram(prg)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            fontWeight: 700,
                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                          }}
                        >
                          <ClipboardEdit size={15} /> Evaluate Marks
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

      {/* MODAL 1: VIEW COMPETITION DETAILS & ENROLLED STUDENTS */}
      {viewingProgram && (() => {
        const enrolledStudents = participants.filter((p) => isEnrolledIn(p, viewingProgram.id));
        const evaluatedCount = markEntries.filter((m) => m.programId === viewingProgram.id).length;

        return (
          <div className="modal-overlay" onClick={() => setViewingProgram(null)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
                      border: '1px solid #bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      flexShrink: 0,
                    }}
                  >
                    <Trophy size={22} style={{ color: '#d97706' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '4px', background: '#f1f5f9', color: '#334155' }}>
                        {viewingProgram.code}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: viewingProgram.category?.includes('On Stage') ? '#d97706' : '#2563eb', background: viewingProgram.category?.includes('On Stage') ? '#fef3c7' : '#eff6ff', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                        {viewingProgram.category || 'General'}
                      </span>
                      <span className="status-pill" style={{
                        fontSize: '0.7rem',
                        padding: '0.1rem 0.45rem',
                        background: viewingProgram.status === 'Completed' ? '#dcfce7' : '#eff6ff',
                        color: viewingProgram.status === 'Completed' ? '#166534' : '#1e40af',
                      }}>
                        {viewingProgram.status || 'Upcoming'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)', fontWeight: 800 }}>
                      {viewingProgram.name}
                    </h3>
                  </div>
                </div>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                  onClick={() => setViewingProgram(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body hide-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                {/* Event summary cards grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                    background: '#f8fafc',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} style={{ color: 'var(--primary)' }} /> Schedule
                    </span>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                      {viewingProgram.date || 'Not Assigned'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: viewingProgram.time && viewingProgram.time !== 'Not Assigned' ? '#0f766e' : 'var(--text-muted)', fontWeight: 600 }}>
                      ⏱️ {viewingProgram.time || 'Not Assigned'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={12} style={{ color: '#ef4444' }} /> Stage / Venue
                    </span>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                      {viewingProgram.venue || 'Main Hall A'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {viewingProgram.type || 'Individual'} ({viewingProgram.memberCount || 1} {viewingProgram.memberCount > 1 ? 'Contestants' : 'Contestant'})
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <User size={12} style={{ color: 'var(--primary)' }} /> Assigned Judge(s)
                    </span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                      {viewingProgram.judge || 'Unassigned'}
                    </div>
                  </div>
                </div>

                {/* Enrolled Students Table */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Users size={16} style={{ color: 'var(--primary)' }} /> Enrolled Participants ({enrolledStudents.length})
                    </h4>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: evaluatedCount > 0 ? '#16a34a' : 'var(--text-muted)' }}>
                      {evaluatedCount} of {enrolledStudents.length} Evaluated
                    </span>
                  </div>

                  {enrolledStudents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}>
                      No participants registered for this event yet.
                    </div>
                  ) : (
                    <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <table className="app-table" style={{ margin: 0 }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            <th style={{ width: '120px' }}>Kot Letter</th>
                            <th>Event Participant</th>
                            <th style={{ textAlign: 'right' }}>Eval Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrolledStudents.map((st, idx) => {
                            const codeLtr = getParticipantCodeLetter(viewingProgram, st.id, idx);
                            const entry = markEntries.find((m) => m.programId === viewingProgram.id && m.participantId === st.id);
                            return (
                              <tr key={st.id}>
                                <td>
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
                                <td>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                                    Participant Kot Letter: {codeLtr}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Blind Evaluation • {viewingProgram.category || 'General'}
                                  </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  {entry ? (
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '0.15rem 0.55rem', borderRadius: '4px' }}>
                                      ✅ {entry.totalScore}/50 ({entry.grade})
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '0.15rem 0.55rem', borderRadius: '4px' }}>
                                      Pending
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setViewingProgram(null)}>
                  Close
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const prg = viewingProgram;
                    setViewingProgram(null);
                    setEvaluatingProgram(prg);
                  }}
                >
                  <ClipboardEdit size={16} /> Evaluate Marks Now
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 2: EVALUATE MARKS MODAL (RIGHT DRAWER) */}
      {evaluatingProgram && (
        <div className="drawer-right-overlay" onClick={() => setEvaluatingProgram(null)}>
          <div className="drawer-right-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8' }}>
                    {evaluatingProgram.code}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                    {evaluatingProgram.category}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                  <ClipboardEdit size={20} style={{ color: 'var(--primary)' }} /> Evaluate Marks: {evaluatingProgram.name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Max {evaluatingProgram.maxMarks || 50} Marks • Venue: {evaluatingProgram.venue || 'Main Hall A'}
                </div>
                <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#eff6ff', padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #bfdbfe', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1d4ed8', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Scale size={14} /> Assigned Judges:
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {evaluatingProgram.judge || 'Open to all judges'}
                  </span>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.35rem' }}
                onClick={() => setEvaluatingProgram(null)}
              >
                <X size={22} />
              </button>
            </div>

            <div className="drawer-right-body">
              <MarkEntry
                programs={programs}
                participants={participants}
                teams={teams}
                markEntries={markEntries}
                initialProgramId={evaluatingProgram.id}
                hideHeader={true}
                isJudgeView={true}
                onUpdateProgram={updateProgram}
                setMarkEntries={(entriesOrFn) => {
                  if (typeof entriesOrFn === 'function') {
                    const next = entriesOrFn(markEntries);
                    if (Array.isArray(next)) next.forEach((e) => saveMarkEntry && saveMarkEntry(e));
                  } else if (Array.isArray(entriesOrFn)) {
                    entriesOrFn.forEach((e) => saveMarkEntry && saveMarkEntry(e));
                  }
                }}
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid var(--border-light)' }}>
              <button className="btn btn-secondary" onClick={() => setEvaluatingProgram(null)}>
                Done & Close Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
