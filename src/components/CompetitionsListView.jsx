import React, { useState } from 'react';
import { Plus, Trophy, Calendar, MapPin, Award, Eye, Edit, Trash2, Search, X, Check, BookOpen, Clock, User, ClipboardEdit, MoreVertical, CheckCircle2 } from 'lucide-react';
import MarkEntry from './MarkEntry';
import { useApp } from '../context/AppContext';

export default function CompetitionsListView({
  programs = [],
  participants = [],
  teams = [],
  markEntries = [],
  onAddProgram,
  onUpdateProgram,
  onDeleteProgram,
  onTogglePublish,
  onSaveMarkEntry,
  onDeleteMarkEntry,
}) {
  const { userRole } = useApp();
  const [activeTab, setActiveTab] = useState('competitions'); // 'competitions' | 'evaluation'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Evaluation Sheet Tab Filters & Modal
  const [evalSearchQuery, setEvalSearchQuery] = useState('');
  const [evalStatusFilter, setEvalStatusFilter] = useState('');
  const [evaluatingProgram, setEvaluatingProgram] = useState(null);

  // Modal States
  const [viewingProgram, setViewingProgram] = useState(null);
  const [editingProgram, setEditingProgram] = useState(null);
  const [deletingProgram, setDeletingProgram] = useState(null);
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);

  // Form State for Create/Edit
  const [programForm, setProgramForm] = useState({
    id: '',
    code: '',
    name: '',
    category: 'Senior',
    type: 'Individual',
    venue: 'Main Hall A',
    date: 'Oct 10, 2026',
    time: '10:00 AM',
    maxMarks: 100,
    judge: 'Shaikh Usama',
    status: 'Upcoming',
  });

  // Filter Programs for All Competitions
  const filteredPrograms = programs.filter((p) => {
    if (selectedStatus && p.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchJudge = (p.judge || '').toLowerCase().includes(q);
      if (!matchName && !matchJudge) return false;
    }
    return true;
  });

  // Filter Programs for Evaluation Sheet Tab
  const filteredEvaluationPrograms = programs.filter((p) => {
    const enrolledCount = participants.filter((part) => part.programs.includes(p.id)).length;
    const evaluatedCount = markEntries.filter((m) => m.programId === p.id).length;

    let evalStatus = 'Pending';
    if (evaluatedCount >= enrolledCount && enrolledCount > 0) {
      evalStatus = 'Completed';
    } else if (evaluatedCount > 0) {
      evalStatus = 'In Progress';
    }

    if (evalStatusFilter && evalStatusFilter !== evalStatus) return false;
    if (evalSearchQuery) {
      const q = evalSearchQuery.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchJudge = (p.judge || '').toLowerCase().includes(q);
      if (!matchName && !matchJudge) return false;
    }
    return true;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setProgramForm({
      id: `prg-${Date.now()}`,
      code: `EVT-0${programs.length + 1}`,
      name: '',
      category: 'Senior',
      type: 'Individual',
      memberCount: 1,
      venue: 'Main Hall A',
      date: 'Oct 15, 2026',
      time: '10:00 AM',
      maxMarks: 50,
      judge: 'Shaikh Usama',
      status: 'Upcoming',
      criteria: [
        { name: 'Earned Mark', max: 50 },
      ],
    });
    setIsAddProgramOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (prg) => {
    setProgramForm({
      id: prg.id,
      code: prg.code || '',
      name: prg.name || '',
      category: prg.category || 'Senior',
      type: prg.type || 'Individual',
      memberCount: prg.memberCount || 1,
      venue: prg.venue || 'Main Hall A',
      date: prg.date || 'Oct 10, 2026',
      time: prg.time || '10:00 AM',
      maxMarks: prg.maxMarks || 50,
      judge: prg.judge || '',
      status: prg.status || 'Upcoming',
      criteria: prg.criteria || [
        { name: 'Earned Mark', max: 50 },
      ],
    });
    setEditingProgram(prg);
  };

  // Submit Create Form
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!programForm.name) return;
    if (onAddProgram) {
      onAddProgram({
        ...programForm,
        code: programForm.code || `EVT-${Date.now().toString().slice(-4)}`,
      });
    }
    setIsAddProgramOpen(false);
  };

  // Submit Edit Form
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!programForm.name) return;
    if (onUpdateProgram) {
      onUpdateProgram(programForm);
    }
    setEditingProgram(null);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingProgram && onDeleteProgram) {
      onDeleteProgram(deletingProgram.id);
    }
    setDeletingProgram(null);
  };

  // Shortcut to jump to Evaluation sheet modal
  const handleEvaluateProgram = (prg) => {
    setOpenMenuId(null);
    setEvaluatingProgram(prg);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* TOP TAB SWITCHER & HEADER */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem 2rem' }}>
        {/* HEADER TOP ROW */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Trophy style={{ color: '#d97706' }} /> Competitions
            </h1>
            <p className="hide-on-mobile" style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
              Configure fest programs, judge evaluations, venues, and publish competition results.
            </p>
          </div>

          {activeTab === 'competitions' && (
            <button className="btn btn-primary" onClick={handleOpenCreate}>
              <Plus size={18} /> <span className="hide-on-mobile">Add Competition</span><span className="mobile-only-inline" style={{ display: 'none' }}>Add</span>
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="hide-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-input)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            whiteSpace: 'nowrap'
          }}>
            <button
              onClick={() => setActiveTab('competitions')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'competitions' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'competitions' ? '#ffffff' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: activeTab === 'competitions' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <BookOpen size={16} /> All Competitions ({programs.length})
            </button>
            {userRole === 'Admin' && (
              <button
                onClick={() => setActiveTab('evaluation')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'evaluation' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'evaluation' ? '#ffffff' : 'var(--text-muted)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: activeTab === 'evaluation' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <ClipboardEdit size={16} /> Evaluation Sheet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: COMPETITIONS & EVENTS MANAGEMENT LIST */}
      {activeTab === 'competitions' && (
        <>
          {/* SEARCH & FILTERS BAR */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', padding: '1rem' }}>
            
            {/* CUSTOM STATUS DROPDOWN (BEST UI) */}
            <div className={`campus-dropdown-container ${isSearchExpanded ? 'mobile-hidden' : ''}`} style={{ flex: 1, minWidth: '160px', position: 'relative' }}>
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
                  boxShadow: isStatusDropdownOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none'
                }}
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} style={{ color: selectedStatus ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <span style={{ color: selectedStatus ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: selectedStatus ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedStatus ? selectedStatus : 'All Statuses'}
                  </span>
                </div>
                <MoreVertical size={14} style={{ color: 'var(--text-muted)', transform: isStatusDropdownOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
              </div>

              {isStatusDropdownOpen && (
                <>
                  <div 
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                    onClick={() => setIsStatusDropdownOpen(false)}
                  />
                  <div style={{
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
                    gap: '0.2rem'
                  }}>
                    {[
                      { value: '', label: 'All Statuses', icon: '📋' },
                      { value: 'Completed', label: 'Completed', icon: '✅' },
                      { value: 'Upcoming', label: 'Upcoming', icon: '⏳' },
                      { value: 'Published', label: 'Published', icon: '🏆' },
                      { value: 'Draft', label: 'Draft', icon: '📝' }
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
                          transition: 'background 0.15s ease',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedStatus !== option.value) e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          if (selectedStatus !== option.value) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                        {selectedStatus === option.value && (
                          <Check size={14} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* SEARCH BAR OR ICON */}
            <div style={{ flex: isSearchExpanded ? 1 : 'none', minWidth: isSearchExpanded ? '200px' : 'auto', position: 'relative' }}>
              
              {/* Mobile Collapsed Search Icon Button */}
              <button 
                className={`btn btn-secondary search-icon-only-btn ${isSearchExpanded ? 'mobile-hidden' : ''}`}
                style={{ padding: '0.7rem', height: '100%', borderRadius: 'var(--radius-sm)' }}
                onClick={() => setIsSearchExpanded(true)}
                aria-label="Open Search"
              >
                <Search size={18} style={{ color: 'var(--text-main)' }} />
              </button>

              {/* Desktop Search / Expanded Mobile Search Input */}
              <div className={`search-input-wrapper ${!isSearchExpanded ? 'mobile-hidden' : ''}`} style={{ position: 'relative', width: '100%' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search by competition name, judge..."
                  style={{ paddingLeft: '2.4rem', paddingRight: isSearchExpanded ? '2.4rem' : '1rem', width: '100%' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* Close button for expanded mobile search */}
                <button 
                  className="close-search-btn"
                  style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)' }}
                  onClick={() => {
                    setIsSearchExpanded(false);
                    setSearchQuery('');
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {(searchQuery || selectedStatus) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('');
                }}
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>

          {/* COMPETITIONS TABLE */}
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Competition Name</th>
                  <th>Schedule</th>
                  <th>Judge</th>
                  <th>Status</th>
                  <th>Enrolled</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No competitions match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPrograms.map((prg) => {
                    const enrolledCount = participants.filter((p) => p.programs.includes(prg.id)).length;
                    const evaluatedCount = markEntries.filter((m) => m.programId === prg.id).length;

                    // Dynamic status computation
                    let displayStatus = prg.status || 'Upcoming';
                    if (displayStatus !== 'Published') {
                      if (evaluatedCount >= enrolledCount && enrolledCount > 0) {
                        displayStatus = 'Completed';
                      } else if (evaluatedCount > 0) {
                        displayStatus = 'In Progress';
                      }
                    }

                    return (
                      <tr key={prg.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{prg.name}</div>
                          <div className="hide-on-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Max: {prg.maxMarks} pts • {prg.type || 'Individual'} Event
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                            <Clock size={14} style={{ color: 'var(--primary)' }} /> {prg.date || 'Oct 10, 2026'} ({prg.time})
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                            {prg.judge || 'Unassigned'}
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${displayStatus === 'Completed' || displayStatus === 'Published' ? 'status-pill-registered' : ''}`} style={{ background: displayStatus === 'Completed' ? '#dcfce7' : displayStatus === 'Published' ? '#fef3c7' : displayStatus === 'In Progress' ? '#dbeafe' : '#f1f5f9', color: displayStatus === 'Completed' ? '#166534' : displayStatus === 'Published' ? '#9a3412' : displayStatus === 'In Progress' ? '#1e40af' : '#475569' }}>
                            {displayStatus}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                            {enrolledCount} Students
                          </div>
                          <div className="hide-on-mobile" style={{ fontSize: '0.725rem', color: evaluatedCount > 0 ? '#16a34a' : 'var(--text-muted)' }}>
                            {evaluatedCount} Evaluated
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', position: 'relative' }}>
                          {/* 3-DOTS ACTION BUTTON */}
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.4rem 0.6rem', borderRadius: '8px' }}
                            title="Actions Menu"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === prg.id ? null : prg.id);
                            }}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {/* FLOATING ACTION DROPDOWN MENU */}
                          {openMenuId === prg.id && (
                            <>
                              <div
                                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div style={{
                                position: 'absolute',
                                right: '0.5rem',
                                top: '2.5rem',
                                zIndex: 50,
                                background: '#ffffff',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-sm)',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                                minWidth: '175px',
                                padding: '0.35rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.2rem',
                                textAlign: 'left'
                              }}>
                                <button
                                  onClick={() => {
                                    setViewingProgram(prg);
                                    setOpenMenuId(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'var(--text-main)',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    width: '100%',
                                    textAlign: 'left'
                                  }}
                                >
                                  <Eye size={14} style={{ color: 'var(--text-muted)' }} /> View Details
                                </button>

                                {userRole === 'Admin' && (
                                  <>
                                    <button
                                      onClick={() => handleEvaluateProgram(prg)}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'transparent',
                                        color: '#16a34a',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        width: '100%',
                                        textAlign: 'left'
                                      }}
                                    >
                                      <ClipboardEdit size={14} /> Evaluate Marks
                                    </button>

                                    <button
                                      onClick={() => {
                                        handleOpenEdit(prg);
                                        setOpenMenuId(null);
                                      }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'transparent',
                                        color: 'var(--primary)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        width: '100%',
                                        textAlign: 'left'
                                      }}
                                    >
                                      <Edit size={14} /> Edit Competition
                                    </button>

                                    {onTogglePublish && (
                                      <button
                                        onClick={() => {
                                          onTogglePublish(prg.id);
                                          setOpenMenuId(null);
                                        }}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.6rem',
                                          padding: '0.5rem 0.75rem',
                                          borderRadius: '6px',
                                          border: 'none',
                                          background: 'transparent',
                                          color: prg.status === 'Published' ? '#d97706' : '#2563eb',
                                          fontSize: '0.85rem',
                                          fontWeight: 600,
                                          cursor: 'pointer',
                                          width: '100%',
                                          textAlign: 'left'
                                        }}
                                      >
                                        <CheckCircle2 size={14} /> {prg.status === 'Published' ? 'Unpublish Result' : 'Publish Result'}
                                      </button>
                                    )}

                                    <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.2rem 0' }} />

                                    <button
                                      onClick={() => {
                                        setDeletingProgram(prg);
                                        setOpenMenuId(null);
                                      }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'transparent',
                                        color: '#ef4444',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        width: '100%',
                                        textAlign: 'left'
                                      }}
                                    >
                                      <Trash2 size={14} /> Delete Event
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TAB 2: JUDGE EVALUATION / MARK ENTRY TABLE */}
      {activeTab === 'evaluation' && (
        <>
          {/* SEARCH & FILTERS BAR */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', padding: '1rem' }}>
            
            {/* CUSTOM STATUS DROPDOWN (BEST UI) */}
            <div className={`campus-dropdown-container ${isSearchExpanded ? 'mobile-hidden' : ''}`} style={{ flex: 1, minWidth: '160px', position: 'relative' }}>
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
                  boxShadow: isStatusDropdownOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none'
                }}
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} style={{ color: evalStatusFilter ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <span style={{ color: evalStatusFilter ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: evalStatusFilter ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {evalStatusFilter ? evalStatusFilter : 'All Eval Statuses'}
                  </span>
                </div>
                <MoreVertical size={14} style={{ color: 'var(--text-muted)', transform: isStatusDropdownOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
              </div>

              {isStatusDropdownOpen && (
                <>
                  <div 
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                    onClick={() => setIsStatusDropdownOpen(false)}
                  />
                  <div style={{
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
                    gap: '0.2rem'
                  }}>
                    {[
                      { value: '', label: 'All Eval Statuses', icon: '📋' },
                      { value: 'Completed', label: 'Completed', icon: '✅' },
                      { value: 'In Progress', label: 'In Progress', icon: '🔄' },
                      { value: 'Pending', label: 'Pending', icon: '⏳' }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => {
                          setEvalStatusFilter(option.value);
                          setIsStatusDropdownOpen(false);
                        }}
                        style={{
                          padding: '0.6rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          background: evalStatusFilter === option.value ? '#eff6ff' : 'transparent',
                          color: evalStatusFilter === option.value ? 'var(--primary)' : 'var(--text-main)',
                          fontWeight: evalStatusFilter === option.value ? 700 : 500,
                          transition: 'background 0.15s ease',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          if (evalStatusFilter !== option.value) e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          if (evalStatusFilter !== option.value) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                        {evalStatusFilter === option.value && (
                          <Check size={14} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* SEARCH BAR OR ICON */}
            <div style={{ flex: isSearchExpanded ? 1 : 'none', minWidth: isSearchExpanded ? '200px' : 'auto', position: 'relative' }}>
              
              {/* Mobile Collapsed Search Icon Button */}
              <button 
                className={`btn btn-secondary search-icon-only-btn ${isSearchExpanded ? 'mobile-hidden' : ''}`}
                style={{ padding: '0.7rem', height: '100%', borderRadius: 'var(--radius-sm)' }}
                onClick={() => setIsSearchExpanded(true)}
                aria-label="Open Search"
              >
                <Search size={18} style={{ color: 'var(--text-main)' }} />
              </button>

              {/* Desktop Search / Expanded Mobile Search Input */}
              <div className={`search-input-wrapper ${!isSearchExpanded ? 'mobile-hidden' : ''}`} style={{ position: 'relative', width: '100%' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search evaluation sheet by competition name, judge..."
                  style={{ paddingLeft: '2.4rem', paddingRight: isSearchExpanded ? '2.4rem' : '1rem', width: '100%' }}
                  value={evalSearchQuery}
                  onChange={(e) => setEvalSearchQuery(e.target.value)}
                />
                {/* Close button for expanded mobile search */}
                <button 
                  className="close-search-btn"
                  style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)' }}
                  onClick={() => {
                    setIsSearchExpanded(false);
                    setEvalSearchQuery('');
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {(evalSearchQuery || evalStatusFilter) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEvalSearchQuery('');
                  setEvalStatusFilter('');
                }}
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>

          {/* EVALUATION SHEET TABLE */}
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Competition Name</th>
                  <th>Schedule</th>
                  <th>Judge</th>
                  <th>Evaluation Progress</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvaluationPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No competition evaluation sheets match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEvaluationPrograms.map((prg) => {
                    const enrolledCount = participants.filter((p) => p.programs.includes(prg.id)).length;
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
                      <tr key={prg.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{prg.name}</div>
                          <div className="hide-on-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Max: {prg.maxMarks} pts • {prg.type || 'Individual'} Event
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                            <Clock size={14} style={{ color: 'var(--primary)' }} /> {prg.date || 'Oct 10, 2026'} ({prg.time})
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                            {prg.judge || 'Unassigned'}
                          </div>
                        </td>
                        <td style={{ minWidth: '180px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)', whiteSpace: 'nowrap', gap: '0.5rem' }}>
                            <span>{evaluatedCount} of {enrolledCount} Evaluated</span>
                            <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: evaluatedCount === enrolledCount && enrolledCount > 0 ? '#10b981' : 'var(--primary)', borderRadius: '3px' }} />
                          </div>
                        </td>
                        <td>
                          <span className="status-pill" style={{ background: statusBg, color: statusColor }}>
                            {statusLabel}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setEvaluatingProgram(prg)}
                          >
                            <ClipboardEdit size={15} /> Evaluate Marks
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MODAL 1: VIEW COMPETITION DETAILS & ENROLLED STUDENTS */}
      {viewingProgram && (
        <div className="modal-overlay" onClick={() => setViewingProgram(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>
                  {viewingProgram.name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {viewingProgram.type || 'Individual'} Event • Max {viewingProgram.maxMarks} Marks
                </div>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setViewingProgram(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Date & Time</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{viewingProgram.date || 'Oct 10, 2026'} ({viewingProgram.time})</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Judge</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{viewingProgram.judge}</div>
                </div>
              </div>

              {/* Criteria List */}
              {viewingProgram.criteria && viewingProgram.criteria.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.875rem', margin: '0 0 0.5rem 0', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Evaluation Criteria Breakdown (Max: {viewingProgram.maxMarks} pts)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                    {viewingProgram.criteria.map((c) => (
                      <div key={c.name} style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '0.65rem 0.85rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</span>
                        <strong style={{ color: 'var(--primary)' }}>{c.max} pts</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enrolled Students List */}
              <h4 style={{ fontSize: '0.875rem', margin: 0, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Enrolled Students ({participants.filter((p) => p.programs.includes(viewingProgram.id)).length})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '220px', overflowY: 'auto' }}>
                {participants.filter((p) => p.programs.includes(viewingProgram.id)).length === 0 ? (
                  <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                    No students currently enrolled in this competition.
                  </div>
                ) : (
                  participants.filter((p) => p.programs.includes(viewingProgram.id)).map((p) => {
                    const team = teams.find((t) => t.id === p.teamId);
                    const mark = markEntries.find((m) => m.programId === viewingProgram.id && m.participantId === p.id);

                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.8rem', flexShrink: 0 }}>
                            {p.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: team?.color }}>{team?.icon} {team?.name} • Chest #{p.chestNo}</div>
                          </div>
                        </div>

                        {mark ? (
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 800, color: '#d97706', fontSize: '0.9rem' }}>{mark.totalScore} pts</span>
                            <div style={{ fontSize: '0.725rem', color: '#16a34a', fontWeight: 700 }}>Grade {mark.grade}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending Evaluation</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingProgram(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE / EDIT COMPETITION */}
      {(isAddProgramOpen || editingProgram) && (
        <div className="modal-overlay" onClick={() => { setIsAddProgramOpen(false); setEditingProgram(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <form onSubmit={editingProgram ? handleEditSubmit : handleCreateSubmit}>
              <div className="modal-header">
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>
                  {editingProgram ? 'Edit Competition Details' : 'Create New Competition Event'}
                </h3>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => { setIsAddProgramOpen(false); setEditingProgram(null); }}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Competition Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    placeholder="e.g. Qiraath Competition"
                    value={programForm.name}
                    onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                  />
                </div>

                <div className="grid-3col">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Event Type</label>
                    <select
                      className="select-field"
                      value={programForm.type}
                      onChange={(e) => setProgramForm({ ...programForm, type: e.target.value })}
                    >
                      <option value="Individual">Individual</option>
                      <option value="Group">Group</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Members Count</label>
                    <select
                      className="select-field"
                      value={programForm.memberCount || 1}
                      onChange={(e) => setProgramForm({ ...programForm, memberCount: Number(e.target.value) })}
                    >
                      <option value={1}>1 Member</option>
                      <option value={2}>2 Members</option>
                      <option value={3}>3 Members</option>
                      <option value={4}>4 or 5 Members</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Schedule Time</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 10:00 AM"
                      value={programForm.time}
                      onChange={(e) => setProgramForm({ ...programForm, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2col">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Assigned Judge</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Judge Name"
                      value={programForm.judge}
                      onChange={(e) => setProgramForm({ ...programForm, judge: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Max Marks (Default 50)</label>
                    <input
                      type="number"
                      className="input-field"
                      min={1}
                      max={50}
                      value={programForm.maxMarks || 50}
                      onChange={(e) => setProgramForm({ ...programForm, maxMarks: Math.min(50, Math.max(1, Number(e.target.value) || 50)) })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setIsAddProgramOpen(false); setEditingProgram(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProgram ? 'Save Changes' : 'Create Competition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deletingProgram && (
        <div className="modal-overlay" onClick={() => setDeletingProgram(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottom: 'none' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trash2 size={20} /> Delete Competition Event
              </h3>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setDeletingProgram(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: 0 }}>
              <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                Are you sure you want to delete <strong>"{deletingProgram.name}"</strong>?
              </p>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                This action will remove the competition event. Any recorded mark entries may be orphaned.
              </p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingProgram(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }} onClick={handleConfirmDelete}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EVALUATE MARKS MODAL FOR SELECTED PROGRAM (FULL HEIGHT RIGHT DRAWER) */}
      {evaluatingProgram && (
        <div className="drawer-right-overlay" onClick={() => setEvaluatingProgram(null)}>
          <div className="drawer-right-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ClipboardEdit size={20} style={{ color: 'var(--primary)' }} /> Evaluate Marks: {evaluatingProgram.name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Judge: {evaluatingProgram.judge || 'Unassigned'} • Max {evaluatingProgram.maxMarks || 50} Marks • Time: {evaluatingProgram.time}
                </div>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setEvaluatingProgram(null)}>
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
                onUpdateProgram={onUpdateProgram}
                setMarkEntries={(entriesOrFn) => {
                  if (typeof entriesOrFn === 'function') {
                    const next = entriesOrFn(markEntries);
                    if (Array.isArray(next)) next.forEach((e) => onSaveMarkEntry && onSaveMarkEntry(e));
                  } else if (Array.isArray(entriesOrFn)) {
                    entriesOrFn.forEach((e) => onSaveMarkEntry && onSaveMarkEntry(e));
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
