import React, { useState } from 'react';
import { Plus, Users, MapPin, Trophy, Eye, Edit, Trash2, Search, X, Check, Award, GraduationCap, MoreVertical } from 'lucide-react';

export default function TeamsListView({
  teams = [],
  participants = [],
  managers = [],
  onUpdateTeam,
  onDeleteTeam,
  onCreateClick,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [isCampusDropdownOpen, setIsCampusDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewingTeam, setViewingTeam] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    code: '',
    campus: 'Kerala',
    manager: '',
    color: '#2563eb',
    icon: '🏛️',
    points: 0,
  });

  // Filter Teams
  const filteredTeams = teams.filter((t) => {
    if (selectedCampus && t.campus !== selectedCampus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchCampus = t.campus.toLowerCase().includes(q);
      const matchCode = (t.code || '').toLowerCase().includes(q);
      const matchManager = (t.manager || '').toLowerCase().includes(q);
      if (!matchName && !matchCampus && !matchCode && !matchManager) return false;
    }
    return true;
  });

  // Open Edit Modal
  const handleOpenEdit = (team) => {
    setEditFormData({
      id: team.id,
      name: team.name || '',
      code: team.code || '',
      campus: team.campus || 'Kerala',
      manager: team.manager || '',
      color: team.color || '#2563eb',
      icon: team.icon || '🏛️',
      points: team.points || 0,
      gold: team.gold || 0,
      silver: team.silver || 0,
      bronze: team.bronze || 0,
      bgLight: team.bgLight || '#eff6ff',
    });
    setEditingTeam(team);
  };

  // Submit Edit Form
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editFormData.name) return;
    if (onUpdateTeam) {
      onUpdateTeam(editFormData);
    }
    setEditingTeam(null);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingTeam && onDeleteTeam) {
      onDeleteTeam(deletingTeam.id);
    }
    setDeletingTeam(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Eduvanza Teams ({teams.length})
            </h2>
            <p className="hide-on-mobile" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Manage regional campus teams, managers, point tallies, and participants roster
            </p>
          </div>

          <button className="btn btn-primary" onClick={onCreateClick}>
            <Plus size={18} /> <span className="hide-on-mobile">Create New Team</span><span className="mobile-only-inline" style={{ display: 'none' }}>New Team</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', padding: '1rem' }}>
        
        {/* CUSTOM CAMPUS DROPDOWN (BEST UI) */}
        <div className={`campus-dropdown-container ${isSearchExpanded ? 'mobile-hidden' : ''}`} style={{ flex: 1, minWidth: '160px', position: 'relative' }}>
          <div 
            className="input-field" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              cursor: 'pointer',
              userSelect: 'none',
              background: isCampusDropdownOpen ? '#ffffff' : 'var(--bg-input)',
              borderColor: isCampusDropdownOpen ? 'var(--primary)' : 'var(--border-light)',
              boxShadow: isCampusDropdownOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none'
            }}
            onClick={() => setIsCampusDropdownOpen(!isCampusDropdownOpen)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} style={{ color: selectedCampus ? 'var(--primary)' : 'var(--text-muted)' }} />
              <span style={{ color: selectedCampus ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: selectedCampus ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedCampus ? `${selectedCampus} Campus` : 'All Campuses'}
              </span>
            </div>
            <MoreVertical size={14} style={{ color: 'var(--text-muted)', transform: isCampusDropdownOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
          </div>

          {isCampusDropdownOpen && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                onClick={() => setIsCampusDropdownOpen(false)}
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
                  { value: '', label: 'All Campuses', icon: '🌍' },
                  { value: 'Kerala', label: 'Kerala Campus', icon: '🌴' },
                  { value: 'Gujarat', label: 'Gujarat Campus', icon: '🦁' },
                  { value: 'Maharashtra', label: 'Maharashtra Campus', icon: '🏛️' },
                  { value: 'Uttar Pradesh', label: 'Uttar Pradesh Campus', icon: '🕌' }
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      setSelectedCampus(option.value);
                      setIsCampusDropdownOpen(false);
                    }}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      background: selectedCampus === option.value ? '#eff6ff' : 'transparent',
                      color: selectedCampus === option.value ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: selectedCampus === option.value ? 700 : 500,
                      transition: 'background 0.15s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCampus !== option.value) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCampus !== option.value) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                    {selectedCampus === option.value && (
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
              placeholder="Search teams by name, code..."
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

        {(searchQuery || selectedCampus) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCampus('');
            }}
          >
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>

      {/* TEAMS CARDS GRID */}
      {filteredTeams.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No teams match your search or filter criteria.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredTeams.map((t) => {
            const teamParticipants = participants.filter((p) => p.teamId === t.id);

            return (
              <div key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Top Header Row with Icon & Badges */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '14px',
                        background: t.bgLight || '#eff6ff',
                        border: `1px solid ${t.color || '#2563eb'}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem'
                      }}>
                        {t.icon || '🏛️'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                          {t.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: t.color || 'var(--primary)', background: `${t.color || '#2563eb'}15`, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            {t.code || 'TEAM'}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <MapPin size={13} /> {t.campus} Campus
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: t.color || 'var(--primary)', lineHeight: 1 }}>
                        {t.points || 0} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>pts</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600 }}>
                        {teamParticipants.length} Participants
                      </div>
                    </div>
                  </div>

                  {/* Manager & Medals Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Manager: <strong style={{ color: 'var(--text-main)' }}>{t.manager || 'Unassigned'}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                      <span>🥇 {t.gold || 0}</span>
                      <span>🥈 {t.silver || 0}</span>
                      <span>🥉 {t.bronze || 0}</span>
                    </div>
                  </div>
                </div>

                {/* TEAM ACTIONS BUTTONS BAR WITH 3-DOTS DROPDOWN */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem', position: 'relative' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setViewingTeam(t)}
                  >
                    <Eye size={14} /> View Roster
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.4rem 0.6rem', borderRadius: '8px' }}
                    title="More Actions"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === t.id ? null : t.id);
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* FLOATING ACTION DROPDOWN MENU */}
                  {openMenuId === t.id && (
                    <>
                      <div
                        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        bottom: '2.5rem',
                        zIndex: 50,
                        background: '#ffffff',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                        minWidth: '165px',
                        padding: '0.35rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                        textAlign: 'left'
                      }}>
                        <button
                          onClick={() => {
                            setViewingTeam(t);
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
                          <Eye size={14} style={{ color: 'var(--text-muted)' }} /> View Roster
                        </button>

                        <button
                          onClick={() => {
                            handleOpenEdit(t);
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
                          <Edit size={14} /> Edit Team Details
                        </button>

                        <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.2rem 0' }} />

                        <button
                          onClick={() => {
                            setDeletingTeam(t);
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
                          <Trash2 size={14} /> Delete Team
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: VIEW TEAM DETAILS & ROSTER */}
      {viewingTeam && (
        <div className="modal-overlay" onClick={() => setViewingTeam(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: viewingTeam.bgLight || '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  {viewingTeam.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>
                    {viewingTeam.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Code: <strong>{viewingTeam.code}</strong> • Campus: <strong>{viewingTeam.campus}</strong>
                  </div>
                </div>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setViewingTeam(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Points</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: viewingTeam.color || 'var(--primary)' }}>
                    {viewingTeam.points || 0} pts
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Manager</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {viewingTeam.manager || 'N/A'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Medals Tally</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                    🥇 {viewingTeam.gold || 0} • 🥈 {viewingTeam.silver || 0} • 🥉 {viewingTeam.bronze || 0}
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Enrolled Participants ({participants.filter((p) => p.teamId === viewingTeam.id).length})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '250px', overflowY: 'auto' }}>
                {participants.filter((p) => p.teamId === viewingTeam.id).length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                    No participants currently registered under this team.
                  </div>
                ) : (
                  participants.filter((p) => p.teamId === viewingTeam.id).map((p) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.8rem', flexShrink: 0 }}>
                          {p.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chest #{p.chestNo} • {p.category}</div>
                        </div>
                      </div>
                      <span className="status-pill status-pill-registered">
                        {p.programs?.length || 0} Events
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingTeam(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT TEAM */}
      {editingTeam && (
        <div className="modal-overlay" onClick={() => setEditingTeam(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-header">
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>Edit Team Details</h3>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setEditingTeam(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="grid-2col">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Team Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Team Code *</label>
                    <input
                      type="text"
                      className="input-field"
                      required
                      placeholder="e.g. GUJ"
                      value={editFormData.code}
                      onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2col">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Campus Location *</label>
                    <select
                      className="select-field"
                      value={editFormData.campus}
                      onChange={(e) => setEditFormData({ ...editFormData, campus: e.target.value })}
                    >
                      <option value="Kerala">Kerala</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Assign Manager</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Manager Name"
                      value={editFormData.manager}
                      onChange={(e) => setEditFormData({ ...editFormData, manager: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2col">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Team Icon Emoji</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 🏛️, 🌴, 🏰, 🕌"
                      value={editFormData.icon}
                      onChange={(e) => setEditFormData({ ...editFormData, icon: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Current Points</label>
                    <input
                      type="number"
                      className="input-field"
                      value={editFormData.points}
                      onChange={(e) => setEditFormData({ ...editFormData, points: Number(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingTeam(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Team Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deletingTeam && (
        <div className="modal-overlay" onClick={() => setDeletingTeam(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottom: 'none' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trash2 size={20} /> Delete Team
              </h3>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setDeletingTeam(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: 0 }}>
              <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                Are you sure you want to delete <strong>{deletingTeam.name}</strong>?
              </p>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                This action will remove the team from campus standings. Participants registered under this team may need reassignment.
              </p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingTeam(null)}>
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

