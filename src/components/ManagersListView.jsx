import React, { useState } from 'react';
import { Plus, UserCheck, Shield, Key, Eye, Edit, Trash2, Search, X, Check, Mail, MapPin, Users, MoreVertical } from 'lucide-react';

export default function ManagersListView({
  managers = [],
  teams = [],
  participants = [],
  onUpdateManager,
  onDeleteManager,
  onCreateClick,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [isCampusDropdownOpen, setIsCampusDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewingManager, setViewingManager] = useState(null);
  const [editingManager, setEditingManager] = useState(null);
  const [deletingManager, setDeletingManager] = useState(null);
  const [resetModalManager, setResetModalManager] = useState(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // Edit Manager Form State
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    username: '',
    email: '',
    teamId: '',
    teamName: '',
    campus: 'Kerala',
    role: 'Team Manager',
    avatar: '',
  });

  // Filter Managers
  const filteredManagers = managers.filter((m) => {
    if (selectedCampus && m.campus !== selectedCampus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (m.name || '').toLowerCase().includes(q);
      const matchUsername = (m.username || '').toLowerCase().includes(q);
      const matchEmail = (m.email || '').toLowerCase().includes(q);
      const matchTeam = (m.teamName || '').toLowerCase().includes(q);
      const matchCampus = (m.campus || '').toLowerCase().includes(q);
      if (!matchName && !matchUsername && !matchEmail && !matchTeam && !matchCampus) return false;
    }
    return true;
  });

  // Open Edit Modal
  const handleOpenEdit = (mgr) => {
    setEditFormData({
      id: mgr.id,
      name: mgr.name || '',
      username: mgr.username || '',
      email: mgr.email || '',
      teamId: mgr.teamId || '',
      teamName: mgr.teamName || '',
      campus: mgr.campus || 'Kerala',
      role: mgr.role || 'Team Manager',
      avatar: mgr.avatar || '',
    });
    setEditingManager(mgr);
  };

  // Submit Edit Manager Form
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editFormData.name || !editFormData.username) return;
    if (onUpdateManager) {
      onUpdateManager(editFormData);
    }
    setEditingManager(null);
  };

  // Handle Team Selection in Edit Form
  const handleTeamSelect = (teamId) => {
    const selectedTeam = teams.find((t) => t.id === teamId);
    if (selectedTeam) {
      setEditFormData({
        ...editFormData,
        teamId: selectedTeam.id,
        teamName: selectedTeam.name,
        campus: selectedTeam.campus,
      });
    }
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingManager && onDeleteManager) {
      onDeleteManager(deletingManager.id);
    }
    setDeletingManager(null);
  };

  // Trigger Password Reset
  const handleResetPassword = () => {
    if (resetModalManager) {
      setResetSuccessMessage(`Password reset link and temporary login key sent to ${resetModalManager.email}`);
      setTimeout(() => {
        setResetSuccessMessage('');
        setResetModalManager(null);
      }, 2500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Team Managers ({managers.length})
            </h2>
            <p className="hide-on-mobile" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Manage regional team leader accounts, scope permissions, and credentials
            </p>
          </div>

          <button className="btn btn-primary" onClick={onCreateClick}>
            <Plus size={18} /> <span className="hide-on-mobile">Create Team Manager</span><span className="mobile-only-inline" style={{ display: 'none' }}>New Manager</span>
          </button>
        </div>
      </div>

      {/* SEARCH & CAMPUS FILTER BAR */}
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
              placeholder="Search managers by name, @username, email..."
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

      {/* MANAGERS TABLE WITH ACTIONS */}
      <div className="table-container">
        <table className="app-table">
          <thead>
            <tr>
              <th>Manager Name</th>
              <th>Username</th>
              <th>Assigned Team</th>
              <th>Campus</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredManagers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No team managers match your search criteria.
                </td>
              </tr>
            ) : (
              filteredManagers.map((m) => {
                const assignedTeamObj = teams.find((t) => t.id === m.teamId || t.name === m.teamName);

                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          flexShrink: 0
                        }}>
                          {(m.name || m.username || 'M').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.925rem' }}>{m.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem' }}>
                      @{m.username}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: assignedTeamObj?.color || 'var(--text-main)', fontSize: '0.85rem' }}>
                        <span>{assignedTeamObj?.icon || '🚩'}</span>
                        <span>{m.teamName}</span>
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {m.campus}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {/* DIRECT VISIBLE ACTION BUTTONS */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.45rem 0.6rem', borderRadius: '6px', color: '#475569', background: '#f8fafc' }}
                          title="View Profile"
                          onClick={() => setViewingManager(m)}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.45rem 0.6rem', borderRadius: '6px', color: '#2563eb', background: '#eff6ff', borderColor: '#bfdbfe' }}
                          title="Edit Details"
                          onClick={() => handleOpenEdit(m)}
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.45rem 0.6rem', borderRadius: '6px', color: '#d97706', background: '#fffbe6', borderColor: '#fef3c7' }}
                          title="Reset Credentials"
                          onClick={() => setResetModalManager(m)}
                        >
                          <Key size={15} />
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.45rem 0.6rem', borderRadius: '6px', color: '#ef4444', background: '#fef2f2', borderColor: '#fecaca' }}
                          title="Delete Account"
                          onClick={() => setDeletingManager(m)}
                        >
                          <Trash2 size={15} />
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

      {/* MODAL 1: VIEW MANAGER PROFILE */}
      {viewingManager && (
        <div className="modal-overlay" onClick={() => setViewingManager(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  flexShrink: 0
                }}>
                  {(viewingManager.name || viewingManager.username || 'M').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>
                    {viewingManager.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>
                    @{viewingManager.username} • {viewingManager.role}
                  </div>
                </div>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setViewingManager(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {viewingManager.email}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Campus</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {viewingManager.campus} Campus
                  </div>
                </div>
              </div>

              <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #dbeafe' }}>
                <span style={{ fontSize: '0.725rem', color: '#1e40af', textTransform: 'uppercase', fontWeight: 800 }}>Assigned Team Scope</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e40af', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{teams.find((t) => t.id === viewingManager.teamId)?.icon || '🏛️'}</span>
                  <span>{viewingManager.teamName}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '0.35rem' }}>
                  Total Participants Managed: <strong>{participants.filter((p) => p.teamId === viewingManager.teamId).length} Students</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingManager(null)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT MANAGER */}
      {editingManager && (
        <div className="modal-overlay" onClick={() => setEditingManager(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-header">
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>Edit Team Manager</h3>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setEditingManager(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="grid-2col">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Username *</label>
                    <input
                      type="text"
                      className="input-field"
                      required
                      value={editFormData.username}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="input-field"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  />
                </div>

                <div className="grid-2col">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Assign Team *</label>
                    <select
                      className="select-field"
                      value={editFormData.teamId}
                      onChange={(e) => handleTeamSelect(e.target.value)}
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.icon} {t.name} ({t.campus})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Role Scope</label>
                    <input
                      type="text"
                      className="input-field"
                      readOnly
                      value={editFormData.role}
                      style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingManager(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Manager Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET CREDENTIALS */}
      {resetModalManager && (
        <div className="modal-overlay" onClick={() => setResetModalManager(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={20} /> Reset Credentials
              </h3>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setResetModalManager(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {resetSuccessMessage ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '1rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}>
                  <Check size={20} style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                  {resetSuccessMessage}
                </div>
              ) : (
                <>
                  <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    Reset login password for <strong>{resetModalManager.name}</strong> (@{resetModalManager.username})?
                  </p>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    A temporary login password key will be dispatched to <strong>{resetModalManager.email}</strong>.
                  </p>
                </>
              )}
            </div>

            {!resetSuccessMessage && (
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setResetModalManager(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary" style={{ background: '#d97706', borderColor: '#d97706' }} onClick={handleResetPassword}>
                  Reset & Send Key
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE MANAGER CONFIRMATION */}
      {deletingManager && (
        <div className="modal-overlay" onClick={() => setDeletingManager(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottom: 'none' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trash2 size={20} /> Delete Manager Account
              </h3>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setDeletingManager(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: 0 }}>
              <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                Are you sure you want to delete <strong>{deletingManager.name}</strong> (@{deletingManager.username})?
              </p>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                This will revoke manager login permissions for {deletingManager.teamName}.
              </p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingManager(null)}>
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

