import React, { useState } from 'react';
import { Users, BookOpen, Search, Filter, Eye, Plus, X, UserCheck, Calendar, Award, CheckCircle, Clock, Shield, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Participants({
  teams = [],
  participants = [],
  setParticipants,
  onAddParticipant,
  onUpdateParticipant,
  onDeleteParticipant,
  programs = [],
  markEntries = [],
}) {
  const { userRole } = useApp();
  // Navigation tab between "Participants List" and "Programs List"
  const [viewMode, setViewMode] = useState('participants'); // 'participants' | 'programs'

  // Filter States
  const [selectedNameFilter, setSelectedNameFilter] = useState('');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [viewingParticipantModal, setViewingParticipantModal] = useState(null); // Participant object
  const [viewingProgramModal, setViewingProgramModal] = useState(null); // Program object
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // New Participant Form State
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    chestNo: '',
    teamId: teams[0]?.id || 'team-gujarat',
    category: 'Senior',
    gender: 'Male',
    email: '',
    selectedPrograms: [],
  });

  // Filtered Participants List
  const filteredParticipants = participants.filter((p) => {
    // Filter by name dropdown
    if (selectedNameFilter && p.id !== selectedNameFilter) return false;
    // Filter by team
    if (selectedTeamFilter && p.teamId !== selectedTeamFilter) return false;
    // Filter by category
    if (selectedCategoryFilter && p.category !== selectedCategoryFilter) return false;
    // Filter by program assignment
    if (selectedProgramFilter && !(p.programs || []).includes(selectedProgramFilter)) return false;
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchChest = (p.chestNo || '').toLowerCase().includes(q);
      if (!matchName && !matchChest) return false;
    }
    return true;
  });

  // Filtered Programs List
  const filteredPrograms = programs.filter((prg) => {
    if (selectedProgramFilter && prg.id !== selectedProgramFilter) return false;
    if (selectedCategoryFilter && prg.category !== selectedCategoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCode = (prg.code || '').toLowerCase().includes(q);
      const matchName = (prg.name || '').toLowerCase().includes(q);
      if (!matchCode && !matchName) return false;
    }
    return true;
  });

  // Helper to handle Add Participant
  const handleAddParticipantSubmit = async (e) => {
    e.preventDefault();
    if (!newParticipant.name || !newParticipant.chestNo) return;

    const created = {
      id: `p-${Date.now()}`,
      chestNo: newParticipant.chestNo,
      name: newParticipant.name,
      teamId: newParticipant.teamId,
      category: newParticipant.category,
      gender: newParticipant.gender,
      email: newParticipant.email || `${newParticipant.name.toLowerCase().replace(/\s+/g, '.')}@eduvenza.com`,
      programs: newParticipant.selectedPrograms,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=150&auto=format&fit=crop&q=80`
    };

    if (onAddParticipant) {
      await onAddParticipant(created);
    } else if (setParticipants) {
      setParticipants((prev) => [...prev, created]);
    }

    setIsAddParticipantOpen(false);
    setNewParticipant({
      name: '',
      chestNo: '',
      teamId: teams[0]?.id || 'team-gujarat',
      category: 'Senior',
      gender: 'Male',
      email: '',
      selectedPrograms: [],
    });
  };

  // Helper to toggle program selection in new participant form
  const toggleProgramInForm = (prgId) => {
    setNewParticipant((prev) => {
      const exists = prev.selectedPrograms.includes(prgId);
      if (exists) {
        return { ...prev, selectedPrograms: prev.selectedPrograms.filter((id) => id !== prgId) };
      } else {
        return { ...prev, selectedPrograms: [...prev.selectedPrograms, prgId] };
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header section */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Users style={{ color: 'var(--accent-primary)' }} /> Participants
            </h1>
            <p className="hide-on-mobile" style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
              Manage student registrations, filter assigned events, and view detailed program schedules.
            </p>
          </div>

          {userRole === 'Admin' && (
            <button className="btn btn-primary" onClick={() => setIsAddParticipantOpen(true)}>
              <Plus size={18} /> <span className="hide-on-mobile">Add Participant</span><span className="mobile-only-inline" style={{ display: 'none' }}>Add</span>
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="hide-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          {/* Toggle View Mode */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-input)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setViewMode('participants')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'participants' ? 'var(--gradient-primary)' : 'transparent',
                color: viewMode === 'participants' ? '#fff' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Users size={16} /> Participants ({filteredParticipants.length})
            </button>
            <button
              onClick={() => setViewMode('programs')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'programs' ? 'var(--gradient-primary)' : 'transparent',
                color: viewMode === 'programs' ? '#fff' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <BookOpen size={16} /> Programs ({filteredPrograms.length})
            </button>
          </div>
        </div>
      </div>

      {/* FILTER BAR (Name Filter, Program Filter, Team, Category, Search) */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Filter size={16} style={{ color: 'var(--accent-cyan)' }} /> Interactive Filters & Search
        </div>

        <div className="grid-responsive-sm" style={{ gap: '1rem' }}>
          {/* Filter 1: Name Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Filter by Name</label>
            <select
              className="select-field"
              value={selectedNameFilter}
              onChange={(e) => {
                setSelectedNameFilter(e.target.value);
                // If a participant is selected directly from dropdown, open their view modal immediately
                if (e.target.value) {
                  const found = participants.find((p) => p.id === e.target.value);
                  if (found) setViewingParticipantModal(found);
                }
              }}
            >
              <option value="">All Participants ({participants.length})</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.chestNo} - {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: Program Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Filter by Program</label>
            <select
              className="select-field"
              value={selectedProgramFilter}
              onChange={(e) => {
                setSelectedProgramFilter(e.target.value);
                // If a program is selected directly from dropdown, open program students modal
                if (e.target.value) {
                  const found = programs.find((prg) => prg.id === e.target.value);
                  if (found) setViewingProgramModal(found);
                }
              }}
            >
              <option value="">All Programs ({programs.length})</option>
              {programs.map((prg) => (
                <option key={prg.id} value={prg.id}>
                  [{prg.code}] {prg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: Team Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Filter by Team</label>
            <select
              className="select-field"
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
            >
              <option value="">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 4: Category Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Filter by Category</label>
            <select
              className="select-field"
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Senior">Senior</option>
              <option value="Junior">Junior</option>
              <option value="Sub-Junior">Sub-Junior</option>
            </select>
          </div>

          {/* Search Query Input */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Search Query</label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Chest #, name, program..."
                style={{ paddingLeft: '2.4rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Clear Filters indicator */}
        {(selectedNameFilter || selectedProgramFilter || selectedTeamFilter || selectedCategoryFilter || searchQuery) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Showing filtered results ({viewMode === 'participants' ? filteredParticipants.length : filteredPrograms.length})
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSelectedNameFilter('');
                setSelectedProgramFilter('');
                setSelectedTeamFilter('');
                setSelectedCategoryFilter('');
                setSearchQuery('');
              }}
            >
              <X size={14} /> Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: PARTICIPANTS TABLE */}
      {viewMode === 'participants' && (
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Chest No</th>
                <th>Participant Name</th>
                <th>Team</th>
                <th>Category</th>
                <th>Gender</th>
                <th>Assigned Programs</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No participants match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => {
                  const team = teams.find((t) => t.id === p.teamId);
                  const assignedProgramObjs = programs.filter((prg) => p.programs.includes(prg.id));

                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '1rem' }}>
                        #{p.chestNo}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.925rem' }}>{p.name}</div>
                            <div className="hide-on-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {p.email || `${p.name.toLowerCase().replace(/\s+/g, '.')}@eduvenza.com`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '8px',
                          background: team?.bgLight || '#eff6ff',
                          border: `1px solid ${team?.color ? team.color + '33' : '#bfdbfe'}`,
                          color: team?.color || 'var(--accent-primary)',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}>
                          {team?.icon} {team?.name}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${p.category.toLowerCase().replace('-', '')}`}>
                          {p.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                        {p.gender || 'Male'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                            {assignedProgramObjs.length} {assignedProgramObjs.length === 1 ? 'Event' : 'Events'}
                          </span>
                          {assignedProgramObjs.length > 0 && (
                            <span className="hide-on-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              ({assignedProgramObjs.map((prg) => prg.code).join(', ')})
                            </span>
                          )}
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
                            setOpenMenuId(openMenuId === p.id ? null : p.id);
                          }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* FLOATING ACTION DROPDOWN MENU */}
                        {openMenuId === p.id && (
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
                                  setViewingParticipantModal(p);
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
                                <Eye size={14} style={{ color: 'var(--text-muted)' }} /> View Programs
                              </button>

                              {userRole === 'Admin' && (
                                <>
                                  <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.2rem 0' }} />

                                  <button
                                    onClick={() => {
                                      setParticipants((prev) => prev.filter((item) => item.id !== p.id));
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
                                    <Trash2 size={14} /> Delete Participant
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
      )}

      {/* VIEW MODE 2: PROGRAMS TABLE */}
      {viewMode === 'programs' && (
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Program Name</th>
                <th>Category</th>
                <th>Stage & Time</th>
                <th>Status</th>
                <th>Assigned Students</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No programs match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((prg) => {
                  const assignedStudents = participants.filter((p) => p.programs.includes(prg.id));
                  const evaluatedCount = markEntries.filter((m) => m.programId === prg.id).length;
                  let displayStatus = prg.status || 'Upcoming';
                  if (displayStatus !== 'Published') {
                    if (evaluatedCount >= assignedStudents.length && assignedStudents.length > 0) {
                      displayStatus = 'Completed';
                    } else if (evaluatedCount > 0) {
                      displayStatus = 'In Progress';
                    }
                  }

                  return (
                    <tr key={prg.id}>
                      <td style={{ fontWeight: 800, color: '#c084fc', fontSize: '0.95rem' }}>
                        {prg.code}
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{prg.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Judge: {prg.judge} • {prg.type} Event
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${prg.category.toLowerCase().replace('-', '')}`}>
                          {prg.category}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{prg.stage}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Clock size={12} /> {prg.time}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-status-${displayStatus.toLowerCase().replace(' ', '-')}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            {assignedStudents.length} Students
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {/* REQUIRED ACTION: View Students Button */}
                        <button
                          className="btn btn-cyan btn-sm"
                          onClick={() => setViewingProgramModal(prg)}
                        >
                          <Eye size={14} /> View Students
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: VIEW PARTICIPANT ASSIGNED PROGRAMS */}
      {viewingParticipantModal && (
        <div className="modal-overlay" onClick={() => setViewingParticipantModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '1.2rem', flexShrink: 0 }}>
                  {viewingParticipantModal.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>
                    {viewingParticipantModal.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Chest #{viewingParticipantModal.chestNo} • {viewingParticipantModal.category} Category
                  </div>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setViewingParticipantModal(null)}
              >
                <X size={22} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Assigned Team</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: teams.find((t) => t.id === viewingParticipantModal.teamId)?.color }}>
                    {teams.find((t) => t.id === viewingParticipantModal.teamId)?.icon} {teams.find((t) => t.id === viewingParticipantModal.teamId)?.name}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Programs</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {viewingParticipantModal.programs.length} Assigned
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Assigned Programs Breakdown
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {viewingParticipantModal.programs.map((prgId) => {
                  const prg = programs.find((p) => p.id === prgId);
                  if (!prg) return null;

                  // Find if mark entry exists for this participant in this program
                  const me = markEntries.find((m) => m.programId === prg.id && m.participantId === viewingParticipantModal.id);

                  const assignedStudentsCount = participants.filter((p) => p.programs.includes(prg.id)).length;
                  const evaluatedCount = markEntries.filter((m) => m.programId === prg.id).length;
                  let displayStatus = prg.status || 'Upcoming';
                  if (displayStatus !== 'Published') {
                    if (evaluatedCount >= assignedStudentsCount && assignedStudentsCount > 0) {
                      displayStatus = 'Completed';
                    } else if (evaluatedCount > 0) {
                      displayStatus = 'In Progress';
                    }
                  }

                  return (
                    <div
                      key={prg.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.025)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, color: '#c084fc', fontSize: '0.85rem' }}>[{prg.code}]</span>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{prg.name}</strong>
                          <span className={`badge badge-status-${displayStatus.toLowerCase().replace(' ', '-')}`}>
                            {displayStatus}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                          Stage: {prg.stage} • Time: {prg.time} • Judge: {prg.judge}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        {me && (prg.status === 'Published' || userRole === 'Admin') ? (
                          <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24' }}>
                              {me.totalScore} / 50
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                              Grade {me.grade} {me.position ? `(${me.position} Position)` : ''}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            {me ? 'Marks Hidden' : 'Evaluation Pending'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingParticipantModal(null)}>
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW PROGRAM ASSIGNED STUDENTS */}
      {viewingProgramModal && (
        <div className="modal-overlay" onClick={() => setViewingProgramModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className={`badge badge-${viewingProgramModal.category.toLowerCase().replace('-', '')}`} style={{ marginBottom: '0.3rem' }}>
                  {viewingProgramModal.code} • {viewingProgramModal.category}
                </span>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>
                  {viewingProgramModal.name}
                </h3>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setViewingProgramModal(null)}
              >
                <X size={22} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                fontSize: '0.85rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>STAGE LOCATION</span>
                  <strong style={{ color: 'var(--text-main)' }}>{viewingProgramModal.stage}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>SCHEDULED TIME</span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{viewingProgramModal.time}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>ASSIGNED JUDGE</span>
                  <strong style={{ color: 'var(--text-main)' }}>{viewingProgramModal.judge}</strong>
                </div>
              </div>

              <h4 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Assigned Students List ({participants.filter((p) => p.programs.includes(viewingProgramModal.id)).length} Participants)
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {participants.filter((p) => p.programs.includes(viewingProgramModal.id)).map((student) => {
                  const team = teams.find((t) => t.id === student.teamId);
                  const me = markEntries.find((m) => m.programId === viewingProgramModal.id && m.participantId === student.id);

                  return (
                    <div
                      key={student.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.025)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', width: '38px' }}>
                          #{student.chestNo}
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.8rem', flexShrink: 0 }}>
                          {student.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{student.name}</div>
                          <div style={{ fontSize: '0.75rem', color: team?.color }}>{team?.icon} {team?.name}</div>
                        </div>
                      </div>

                      <div>
                        {me && (viewingProgramModal.status === 'Published' || userRole === 'Admin') ? (
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.95rem' }}>
                              {me.totalScore} Pts
                            </span>
                            <div style={{ fontSize: '0.725rem', color: '#34d399' }}>Grade {me.grade}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                            {me ? 'Marks Hidden' : 'Not Evaluated'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingProgramModal(null)}>
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW PARTICIPANT */}
      {isAddParticipantOpen && (
        <div className="modal-overlay" onClick={() => setIsAddParticipantOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleAddParticipantSubmit}>
              <div className="modal-header">
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>Register New Participant</h3>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  onClick={() => setIsAddParticipantOpen(false)}
                >
                  <X size={22} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="grid-2col">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Chest Number *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 115"
                      required
                      value={newParticipant.chestNo}
                      onChange={(e) => setNewParticipant({ ...newParticipant, chestNo: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Student Name"
                      required
                      value={newParticipant.name}
                      onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2col">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Assign Team *</label>
                    <select
                      className="select-field"
                      value={newParticipant.teamId}
                      onChange={(e) => setNewParticipant({ ...newParticipant, teamId: e.target.value })}
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Category *</label>
                    <select
                      className="select-field"
                      value={newParticipant.category}
                      onChange={(e) => setNewParticipant({ ...newParticipant, category: e.target.value })}
                    >
                      <option value="Senior">Senior</option>
                      <option value="Junior">Junior</option>
                      <option value="Sub-Junior">Sub-Junior</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Select Programs to Assign</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}>
                    {programs.map((prg) => {
                      const isSelected = newParticipant.selectedPrograms.includes(prg.id);
                      return (
                        <button
                          type="button"
                          key={prg.id}
                          onClick={() => toggleProgramInForm(prg.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'transparent'}`,
                            background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.03)',
                            color: isSelected ? '#fff' : 'var(--text-secondary)',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <input type="checkbox" checked={isSelected} readOnly />
                          <div>
                            <strong>{prg.code}</strong> - {prg.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddParticipantOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
