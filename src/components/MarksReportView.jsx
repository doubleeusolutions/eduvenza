import React, { useState, useMemo } from 'react';
import {
  ClipboardList, Search, Trophy, ChevronDown, ChevronUp,
  Star, Award, Filter, X, Scale
} from 'lucide-react';
import { getAggregatedProgramResults } from '../utils/evaluationRules';

const GRADE_COLORS = {
  'A+': { bg: '#fef3c7', color: '#92400e' },
  A: { bg: '#fef3c7', color: '#92400e' },
  'B+': { bg: '#eff6ff', color: '#1e40af' },
  B: { bg: '#eff6ff', color: '#1e40af' },
  C: { bg: '#f0fdf4', color: '#166534' },
  D: { bg: '#fff7ed', color: '#9a3412' },
  F: { bg: '#fef2f2', color: '#991b1b' },
};

const POSITION_BADGES = {
  '1st': { emoji: '🥇', bg: '#fef08a', color: '#a16207' },
  '2nd': { emoji: '🥈', bg: '#e5e7eb', color: '#374151' },
  '3rd': { emoji: '🥉', bg: '#fed7aa', color: '#9a3412' },
};

export default function MarksReportView({
  programs = [],
  participants = [],
  teams = [],
  markEntries = [],
  onTogglePublish,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'position', direction: 'asc' });
  const [searchOpen, setSearchOpen] = useState(false);

  const completedPrograms = useMemo(
    () => programs.filter((p) => p.status === 'Completed' || p.status === 'Published'),
    [programs]
  );

  const toggleExpand = (prgId) => {
    setExpandedPrograms((prev) => ({ ...prev, [prgId]: !prev[prgId] }));
  };

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const SortIcon = ({ col }) =>
    sortConfig.key === col
      ? sortConfig.direction === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
      : null;

  const getEnrichedEntries = (prgId) => {
    const prg = programs.find((p) => p.id === prgId);
    const aggregated = getAggregatedProgramResults(markEntries, prgId, prg?.memberCount || 1);
    return aggregated
      .map((agg) => {
        const participant = participants.find((p) => p.id === agg.participantId);
        const team = teams.find((t) => t.id === participant?.teamId);
        return { ...agg, participant, team };
      })
      .filter((e) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const matchPart = e.participant?.name?.toLowerCase().includes(q);
        const matchTeam = e.team?.name?.toLowerCase().includes(q);
        const matchJudge = e.judgeBreakdown?.some((j) => (j.judgeName || '').toLowerCase().includes(q));
        return matchPart || matchTeam || matchJudge;
      })
      .sort((a, b) => {
        const dir = sortConfig.direction === 'asc' ? 1 : -1;
        if (sortConfig.key === 'position') {
          const posOrder = { '1st': 1, '2nd': 2, '3rd': 3 };
          const pa = posOrder[a.position] || 99;
          const pb = posOrder[b.position] || 99;
          return (pa - pb) * dir;
        }
        if (sortConfig.key === 'mark') return (b.totalScore - a.totalScore) * dir;
        if (sortConfig.key === 'teamPoints') return (b.teamPoints - a.teamPoints) * dir;
        return 0;
      });
  };

  const filteredPrograms =
    selectedProgram === 'all'
      ? completedPrograms
      : completedPrograms.filter((p) => p.id === selectedProgram);

  const totalEntries = markEntries.filter((me) =>
    completedPrograms.some((p) => p.id === me.programId)
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* PAGE HEADER */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* TOP ROW: title + stat pills + filter controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Title */}
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ClipboardList style={{ color: 'var(--primary)' }} size={26} />
              Marks Report
            </h1>
            {/* Hidden on mobile & tablet portrait */}
            <p className="hide-on-mobile" style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
              Evaluated marks for all completed competitions — sorted by position and score.
            </p>
          </div>

          {/* Right side: pills + filter icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* Stat pills — hidden on mobile to save space */}
            <span className="hide-on-mobile" style={{ fontSize: '0.8rem', background: '#f0fdf4', color: '#166534', padding: '0.3rem 0.75rem', borderRadius: '999px', fontWeight: 700, border: '1px solid #bbf7d0', whiteSpace: 'nowrap' }}>
              {completedPrograms.length} Programs
            </span>
            <span className="hide-on-mobile" style={{ fontSize: '0.8rem', background: '#eff6ff', color: '#1e40af', padding: '0.3rem 0.75rem', borderRadius: '999px', fontWeight: 700, border: '1px solid #bfdbfe', whiteSpace: 'nowrap' }}>
              {totalEntries} Entries
            </span>

            {/* Search icon button — icon only on mobile, expands to input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Mobile: toggle search open */}
              <button
                className="btn btn-secondary btn-sm search-icon-only-btn"
                style={{ display: 'none', padding: '0.45rem 0.6rem' }}
                onClick={() => setSearchOpen((v) => !v)}
                title="Search"
              >
                {searchOpen && searchQuery ? <X size={16} /> : <Search size={16} />}
              </button>

              {/* Desktop: always-visible full search input */}
              <div className="hide-on-mobile" style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search student or team..."
                  style={{ paddingLeft: '2.2rem', minWidth: '200px', height: '38px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Dropdown: icon-only on mobile, full on desktop */}
              <div style={{ position: 'relative' }}>
                <Filter size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <select
                  className="select-field"
                  style={{ paddingLeft: '2.1rem', height: '38px', minWidth: 'unset' }}
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  title="Filter by program"
                >
                  <option value="all">All Programs</option>
                  {completedPrograms.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {(searchQuery || selectedProgram !== 'all') && (
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.45rem 0.6rem', whiteSpace: 'nowrap' }}
                  onClick={() => { setSearchQuery(''); setSelectedProgram('all'); setSearchOpen(false); }}
                  title="Clear filters"
                >
                  <X size={14} />
                  <span className="hide-on-mobile"> Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile expandable search bar */}
        {searchOpen && (
          <div style={{ display: 'flex' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search student or team..."
                style={{ paddingLeft: '2.2rem', width: '100%' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* PROGRAM SECTIONS */}
      {filteredPrograms.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Trophy size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Completed Programs</div>
          <div style={{ fontSize: '0.875rem' }}>Programs will appear here once they are marked as Completed or Published.</div>
        </div>
      ) : (
        filteredPrograms.map((prg) => {
          const entries = getEnrichedEntries(prg.id);
          const isExpanded = expandedPrograms[prg.id] !== false;

          return (
            <div key={prg.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
              {/* PROGRAM HEADER */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem',
                  cursor: 'pointer',
                  borderBottom: isExpanded ? '1px solid var(--border-light)' : 'none',
                  background: 'linear-gradient(90deg, var(--bg-card) 0%, rgba(99,102,241,0.03) 100%)',
                }}
                onClick={() => toggleExpand(prg.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Trophy size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {prg.name}
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700,
                        background: prg.status === 'Published' ? '#fef3c7' : '#f1f5f9',
                        color: prg.status === 'Published' ? '#92400e' : '#475569',
                        padding: '0.2rem 0.65rem', borderRadius: '999px',
                        border: `1px solid ${prg.status === 'Published' ? '#fde68a' : '#e2e8f0'}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        {prg.status === 'Published' ? '📢 Published (Visible to All)' : '🔒 Unpublished (Admin Only)'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Judges: <strong style={{ color: 'var(--text-main)' }}>{prg.judge || 'Unassigned'}</strong> &nbsp;•&nbsp; Max: {prg.maxMarks || 50} marks &nbsp;•&nbsp; {prg.type || 'Individual'} &nbsp;•&nbsp; {entries.length} student{entries.length === 1 ? '' : 's'} evaluated {entries.some(e => e.isMultiJudge) ? '• (Multi-Judge Averaged)' : ''}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {onTogglePublish && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePublish(prg.id);
                      }}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.3rem 0.65rem',
                        fontWeight: 700,
                        background: prg.status === 'Published' ? '#fef3c7' : 'var(--primary)',
                        color: prg.status === 'Published' ? '#92400e' : '#ffffff',
                        border: `1px solid ${prg.status === 'Published' ? '#fde68a' : 'transparent'}`,
                      }}
                    >
                      {prg.status === 'Published' ? 'Unpublish' : 'Publish Result'}
                    </button>
                  )}
                  {entries.length > 0 && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{entries.length} entries</span>
                  )}
                  {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>
              </div>

              {/* ENTRIES TABLE */}
              {isExpanded && (
                entries.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No mark entries found for this program.
                  </div>
                ) : (
                  <div className="table-wrapper" style={{ margin: 0, borderRadius: 0 }}>
                    <table className="custom-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: '60px', textAlign: 'center' }}>Position</th>
                          <th>Student</th>
                          <th>Team</th>
                          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('mark')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Mark <SortIcon col="mark" /></div>
                          </th>
                          <th>Grade</th>
                          <th>Grade Pts</th>
                          <th>Position Pts</th>
                          <th style={{ cursor: 'pointer' }} onClick={() => handleSort('teamPoints')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Team Points <SortIcon col="teamPoints" /></div>
                          </th>
                          <th style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('position')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}>Rank <SortIcon col="position" /></div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry, idx) => {
                          const gradeStyle = GRADE_COLORS[entry.grade] || { bg: '#f1f5f9', color: '#475569' };
                          const posStyle = POSITION_BADGES[entry.position];
                          const judgesList = entry.judgeBreakdown || [];

                          return (
                            <React.Fragment key={entry.id || idx}>
                              {/* Main Student Row */}
                              <tr style={{ background: entry.isMultiJudge ? '#ffffff' : '#ffffff', borderTop: idx > 0 ? '1px solid var(--border-light)' : 'none' }}>
                                <td style={{ textAlign: 'center' }}>
                                  {posStyle ? (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: posStyle.bg, fontSize: '1.1rem' }}>
                                      {posStyle.emoji}
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{entry.position || '—'}</span>
                                  )}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.8rem', flexShrink: 0 }}>
                                      {entry.participant?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span>{entry.participant?.name || 'Unknown'}</span>
                                        {entry.isMultiJudge && (
                                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1d4ed8', background: '#eff6ff', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                                            {entry.judgeCount} Judges
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chest #{entry.participant?.chestNo} &nbsp;•&nbsp; {entry.participant?.category}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>{entry.team?.name || '—'}</div>
                                  {entry.team?.campus && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{entry.team.campus}</div>}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    <Star size={13} fill="#eab308" color="#eab308" />
                                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{entry.totalScore}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {prg.maxMarks || 50}</span>
                                    {entry.isMultiJudge && (
                                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                        (Avg)
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <span style={{ background: gradeStyle.bg, color: gradeStyle.color, padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.85rem', border: `1px solid ${gradeStyle.color}33` }}>
                                    {entry.grade || '—'}
                                  </span>
                                </td>
                                {/* Grade Points */}
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span style={{
                                      background: '#fef3c7', color: '#92400e',
                                      padding: '0.2rem 0.6rem', borderRadius: '999px',
                                      fontWeight: 700, fontSize: '0.85rem',
                                      border: '1px solid #fde68a'
                                    }}>
                                      {entry.gradePoints ?? 0} pts
                                    </span>
                                  </div>
                                </td>
                                {/* Position Points */}
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span style={{
                                      background: entry.positionPoints > 0 ? '#eff6ff' : '#f1f5f9',
                                      color: entry.positionPoints > 0 ? '#1e40af' : '#94a3b8',
                                      padding: '0.2rem 0.6rem', borderRadius: '999px',
                                      fontWeight: 700, fontSize: '0.85rem',
                                      border: `1px solid ${entry.positionPoints > 0 ? '#bfdbfe' : '#e2e8f0'}`
                                    }}>
                                      {entry.positionPoints ?? 0} pts
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <Award size={14} color="#8b5cf6" />
                                    <span style={{ fontWeight: 700, color: '#8b5cf6', fontSize: '0.95rem' }}>{entry.teamPoints ?? '—'}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>pts</span>
                                  </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {entry.position || '—'}
                                  </span>
                                </td>
                              </tr>

                              {/* Judge Rows: Give rows for judges name-mark */}
                              {judgesList.map((j, jIdx) => {
                                const jGradeStyle = GRADE_COLORS[j.grade] || { bg: '#f1f5f9', color: '#475569' };
                                const isLastJudge = jIdx === judgesList.length - 1;
                                return (
                                  <tr
                                    key={`${entry.id}-judge-${jIdx}`}
                                    style={{
                                      background: '#f8fafc',
                                      borderBottom: isLastJudge ? '2px solid #e2e8f0' : '1px dashed #e2e8f0',
                                    }}
                                  >
                                    <td style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                                      ↳
                                    </td>
                                    <td colSpan={2}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.75rem' }}>
                                        <span style={{ fontSize: '0.85rem' }}>⚖️</span>
                                        <span style={{ fontWeight: 800, fontSize: '0.825rem', color: 'var(--text-main)' }}>
                                          {j.judgeName}
                                        </span>
                                        {j.notes && (
                                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                            — "{j.notes}"
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#b45309' }}>
                                          {j.mark}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {prg.maxMarks || 50}</span>
                                      </div>
                                    </td>
                                    <td>
                                      <span style={{ background: jGradeStyle.bg, color: jGradeStyle.color, padding: '0.15rem 0.55rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.75rem', border: `1px solid ${jGradeStyle.color}33` }}>
                                        {j.grade || '—'}
                                      </span>
                                    </td>
                                    <td colSpan={4}>
                                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                        Individual Judge Mark
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
