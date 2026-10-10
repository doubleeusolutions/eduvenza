import React, { useState } from 'react';
import { Plus, Trophy, Calendar, MapPin, Award, Eye, Edit, Trash2, Search, X, Check, BookOpen, Clock, User, Users, ClipboardEdit, MoreVertical, CheckCircle2 } from 'lucide-react';
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
  const { userRole, judges = [] } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Safe helper to check if a participant is enrolled in a given program
  const isEnrolledIn = (participant, programId) => {
    if (!participant || !participant.programs || !Array.isArray(participant.programs)) return false;
    return participant.programs.some((item) => (typeof item === 'string' ? item === programId : item?.id === programId));
  };

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
    date: 'Not Assigned',
    time: 'Not Assigned',
    maxMarks: 50,
    judge: '',
    judges: [''],
    status: 'Upcoming',
  });

  // Filter Programs for All Competitions
  const filteredPrograms = programs.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (selectedStatus && p.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchCode = (p.code || '').toLowerCase().includes(q);
      const matchCategory = (p.category || '').toLowerCase().includes(q);
      const matchJudge = (p.judge || '').toLowerCase().includes(q);
      if (!matchName && !matchJudge && !matchCode && !matchCategory) return false;
    }
    return true;
  });


  // Dynamic Judge Fields Handlers
  const handleAddJudgeField = () => {
    setProgramForm((prev) => ({
      ...prev,
      judges: [...(prev.judges && prev.judges.length > 0 ? prev.judges : [prev.judge || '']), ''],
    }));
  };

  const handleJudgeChange = (index, value) => {
    setProgramForm((prev) => {
      const updatedJudges = [...(prev.judges && prev.judges.length > 0 ? prev.judges : [prev.judge || ''])];
      updatedJudges[index] = value;
      return {
        ...prev,
        judges: updatedJudges,
        judge: updatedJudges.map((j) => j.trim()).filter(Boolean).join(', '),
      };
    });
  };

  const handleRemoveJudgeField = (index) => {
    setProgramForm((prev) => {
      const currentJudges = prev.judges && prev.judges.length > 0 ? prev.judges : [prev.judge || ''];
      if (currentJudges.length <= 1) {
        return {
          ...prev,
          judges: [''],
          judge: '',
        };
      }
      const updatedJudges = currentJudges.filter((_, i) => i !== index);
      return {
        ...prev,
        judges: updatedJudges,
        judge: updatedJudges.map((j) => j.trim()).filter(Boolean).join(', '),
      };
    });
  };

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
      date: 'Not Assigned',
      time: 'Not Assigned',
      maxMarks: 50,
      judge: '',
      judges: [''],
      status: 'Upcoming',
      criteria: [
        { name: 'Earned Mark', max: 50 },
      ],
    });
    setIsAddProgramOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (prg) => {
    const parsedJudges = prg.judge
      ? prg.judge.split(',').map((j) => j.trim()).filter(Boolean)
      : [];
    setProgramForm({
      id: prg.id,
      code: prg.code || '',
      name: prg.name || '',
      category: prg.category || 'Senior',
      type: prg.type || 'Individual',
      memberCount: prg.memberCount || 1,
      venue: prg.venue || 'Main Hall A',
      date: prg.date || 'Not Assigned',
      time: prg.time || 'Not Assigned',
      maxMarks: prg.maxMarks || 50,
      judge: prg.judge || '',
      judges: parsedJudges.length > 0 ? parsedJudges : [''],
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
    const finalJudge = (programForm.judges && programForm.judges.length > 0 ? programForm.judges : [programForm.judge || ''])
      .map((j) => j.trim())
      .filter(Boolean)
      .join(', ');
    if (onAddProgram) {
      onAddProgram({
        ...programForm,
        judge: finalJudge,
        code: programForm.code || `EVT-${Date.now().toString().slice(-4)}`,
      });
    }
    setIsAddProgramOpen(false);
  };

  // Submit Edit Form
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!programForm.name) return;
    const finalJudge = (programForm.judges && programForm.judges.length > 0 ? programForm.judges : [programForm.judge || ''])
      .map((j) => j.trim())
      .filter(Boolean)
      .join(', ');
    if (onUpdateProgram) {
      onUpdateProgram({
        ...programForm,
        judge: finalJudge,
      });
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


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* TOP HEADER */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Trophy style={{ color: '#d97706' }} /> Competitions
          </h1>
          <p className="hide-on-mobile" style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
            Configure fest programs, judge evaluations, venues, and competition criteria.
          </p>
        </div>

        {userRole === 'Admin' && (
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} /> <span className="hide-on-mobile">Add Competition</span><span className="mobile-only-inline" style={{ display: 'none' }}>Add</span>
          </button>
        )}
      </div>

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

            {(searchQuery || selectedStatus || selectedCategory) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('');
                  setSelectedCategory('');
                }}
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', padding: '0.25rem 0', margin: '0.65rem 0' }}>
            {['', 'Individual On Stage', 'Individual Off Stage', 'General On Stage', 'General Off Stage'].map((cat) => {
              const count = cat === '' ? programs.length : programs.filter((p) => p.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat || 'all'}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.35rem 0.8rem',
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

          {/* COMPETITIONS TABLE */}
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Competition Name</th>
                  <th>Schedule & Time</th>
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
                    const enrolledCount = participants.filter((p) => isEnrolledIn(p, prg.id)).length;
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }}>
                              {prg.code}
                            </span>
                            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: prg.category?.includes('On Stage') ? '#d97706' : '#2563eb', background: prg.category?.includes('On Stage') ? '#fef3c7' : '#eff6ff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              {prg.category || 'General'}
                            </span>
                          </div>
                          <div
                            onClick={() => setViewingProgram(prg)}
                            style={{
                              fontWeight: 700,
                              color: 'var(--text-main)',
                              fontSize: '0.95rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = 'var(--text-main)';
                            }}
                            title="Click to view full competition details and enrolled students"
                          >
                            <span>{prg.name}</span>
                            <Eye size={14} style={{ color: 'var(--primary)', opacity: 0.8 }} />
                          </div>
                          <div className="hide-on-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            {prg.memberCount > 1 ? `👥 ${prg.memberCount} Contestants/Group` : '👤 Individual'} • Max: {prg.maxMarks} pts
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                            <Clock size={14} style={{ color: 'var(--primary)' }} /> {prg.date || 'Not Assigned'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: prg.time && prg.time !== 'Not Assigned' ? '#0f766e' : 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
                            ⏱️ {prg.time || 'Not Assigned'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <span>{prg.judge || 'Unassigned'}</span>
                            {prg.judge && judges.some((j) => (prg.judge || '').toLowerCase().includes((j.name || '').toLowerCase())) && (
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                                ⚖️ Registered
                              </span>
                            )}
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
                                    background: '#eff6ff',
                                    color: 'var(--primary)',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    width: '100%',
                                    textAlign: 'left'
                                  }}
                                >
                                  <Eye size={15} style={{ color: 'var(--primary)' }} /> View Details
                                </button>

                                {userRole === 'Admin' && (
                                  <>
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

      {/* MODAL 1: VIEW COMPETITION DETAILS & ENROLLED STUDENTS */}
      {viewingProgram && (() => {
        const enrolledStudents = participants.filter((p) => isEnrolledIn(p, viewingProgram.id));
        const evaluatedCount = markEntries.filter((m) => m.programId === viewingProgram.id).length;

        return (
          <div className="modal-overlay" onClick={() => setViewingProgram(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    flexShrink: 0
                  }}>
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
                        background: viewingProgram.status === 'Completed' ? '#dcfce7' : viewingProgram.status === 'Published' ? '#fef3c7' : '#eff6ff',
                        color: viewingProgram.status === 'Completed' ? '#166534' : viewingProgram.status === 'Published' ? '#9a3412' : '#1e40af'
                      }}>
                        {viewingProgram.status || 'Upcoming'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)', fontWeight: 800 }}>
                      {viewingProgram.name}
                    </h3>
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }} onClick={() => setViewingProgram(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body hide-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                {/* Key Details Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} style={{ color: 'var(--primary)' }} /> Date & Time
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

                {/* Criteria Breakdown */}
                {viewingProgram.criteria && viewingProgram.criteria.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.8rem', margin: 0, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Evaluation Criteria Breakdown
                      </h4>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: '#eff6ff', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        Max Total: {viewingProgram.maxMarks || 50} pts
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                      {viewingProgram.criteria.map((c, idx) => (
                        <div key={idx} style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '0.6rem 0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</span>
                          <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>{c.max} pts</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enrolled Students List */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <h4 style={{ fontSize: '0.8rem', margin: 0, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Enrolled Students ({enrolledStudents.length})
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: evaluatedCount > 0 ? '#16a34a' : 'var(--text-muted)', fontWeight: 600 }}>
                      {evaluatedCount} of {enrolledStudents.length} Evaluated
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                    {enrolledStudents.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-light)' }}>
                        <Users size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 0.5rem', opacity: 0.6 }} />
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>No Students Enrolled Yet</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Participants assigned to this program by team managers will appear here.
                        </div>
                      </div>
                    ) : (
                      enrolledStudents.map((p) => {
                        const team = teams.find((t) => t.id === p.teamId);
                        const mark = markEntries.find((m) => m.programId === viewingProgram.id && m.participantId === p.id);
                        const canViewMarks = viewingProgram.status === 'Published' || userRole === 'Admin' || userRole === 'Judge';

                        return (
                          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.85rem', flexShrink: 0 }}>
                                {p.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{p.name}</div>
                                <div style={{ fontSize: '0.75rem', color: team?.color || 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <span>{team?.icon} {team?.name || 'Independent'}</span>
                                  <span>•</span>
                                  <span style={{ fontWeight: 700 }}>Chest #{p.chestNo}</span>
                                </div>
                              </div>
                            </div>

                            {mark && canViewMarks ? (
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontWeight: 800, color: '#d97706', fontSize: '0.9rem' }}>{mark.totalScore} pts</span>
                                <div style={{ fontSize: '0.725rem', color: '#16a34a', fontWeight: 700 }}>Grade {mark.grade} {mark.position ? `(${mark.position})` : ''}</div>
                              </div>
                            ) : mark && !canViewMarks ? (
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.75rem', color: '#d97706', background: '#fef3c7', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 700, border: '1px solid #fde68a' }}>
                                  Result Pending
                                </span>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Awaiting Admin Release</div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                                Pending Evaluation
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {userRole === 'Admin' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          const prg = viewingProgram;
                          setViewingProgram(null);
                          handleOpenEdit(prg);
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Edit size={14} /> Edit Competition
                      </button>
                      {onTogglePublish && (
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            onTogglePublish(viewingProgram.id);
                            setViewingProgram((prev) => prev ? ({ ...prev, status: prev.status === 'Published' ? 'Completed' : 'Published' }) : null);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: viewingProgram.status === 'Published' ? '#fef3c7' : 'var(--primary)',
                            color: viewingProgram.status === 'Published' ? '#92400e' : '#ffffff',
                            border: `1px solid ${viewingProgram.status === 'Published' ? '#fde68a' : 'transparent'}`,
                            fontWeight: 700,
                          }}
                        >
                          <CheckCircle2 size={14} /> {viewingProgram.status === 'Published' ? 'Unpublish Result' : 'Publish Result'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" onClick={() => setViewingProgram(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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

                {/* Dynamic Assigned Judges Section */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  background: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <User size={16} style={{ color: 'var(--primary)' }} />
                      <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem' }}>
                        Assigned Judges ({(programForm.judges || ['']).length})
                      </label>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: '0.3rem 0.7rem',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        borderRadius: '6px',
                        background: '#eff6ff',
                        borderColor: '#bfdbfe',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      onClick={handleAddJudgeField}
                    >
                      <Plus size={14} /> Add Judge
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {(programForm.judges || ['']).map((judgeName, idx) => {
                      const matchedJudge = judges.find(
                        (j) => j.name?.toLowerCase() === judgeName?.trim()?.toLowerCase()
                      );

                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '0.65rem 0.85rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <div
                                style={{
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '50%',
                                  background: idx === 0 ? 'var(--primary)' : '#e2e8f0',
                                  color: idx === 0 ? '#ffffff' : '#475569',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  flexShrink: 0,
                                }}
                              >
                                {idx + 1}
                              </div>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                {idx === 0 ? 'Primary Program Judge' : `Judge #${idx + 1}`}
                              </span>
                              {matchedJudge && (
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    color: '#065f46',
                                    background: '#ecfdf5',
                                    padding: '0.12rem 0.5rem',
                                    borderRadius: '9999px',
                                    border: '1px solid #a7f3d0',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                  }}
                                >
                                  ✓ Registered Account (@{matchedJudge.username})
                                </span>
                              )}
                            </div>

                            {(programForm.judges || []).length > 1 && (
                              <button
                                type="button"
                                title="Remove this judge"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  borderRadius: '4px',
                                  padding: '0.2rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleRemoveJudgeField(idx)}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: judges.length > 0 ? '1fr 1fr' : '1fr', gap: '0.5rem' }}>
                            {judges.length > 0 && (
                              <select
                                className="select-field"
                                style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                                value={matchedJudge ? matchedJudge.name : ''}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleJudgeChange(idx, e.target.value);
                                  }
                                }}
                              >
                                <option value="">-- Pick from Created Judges --</option>
                                {judges.map((j) => (
                                  <option key={j.id} value={j.name}>
                                    ⚖️ {j.name}
                                  </option>
                                ))}
                              </select>
                            )}

                            <input
                              type="text"
                              className="input-field"
                              style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                              placeholder={
                                idx === 0
                                  ? 'Enter or edit judge name...'
                                  : `Judge ${idx + 1} name...`
                              }
                              value={judgeName}
                              onChange={(e) => handleJudgeChange(idx, e.target.value)}
                            />
                          </div>
                        </div>
                      );
                    })}
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


    </div>
  );
}
