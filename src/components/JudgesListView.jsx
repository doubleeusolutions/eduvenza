import React, { useState } from 'react';
import {
  Plus,
  Scale,
  Award,
  Eye,
  Edit,
  Trash2,
  Search,
  X,
  CheckCircle2,
  MoreVertical,
  BookOpen,
  Calendar,
  Check,
} from 'lucide-react';

export default function JudgesListView({
  judges = [],
  programs = [],
  onAddJudge,
  onUpdateJudge,
  onDeleteJudge,
  onCreateClick,
}) {
  const [quickJudgeName, setQuickJudgeName] = useState('');
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewingJudge, setViewingJudge] = useState(null);
  const [editingJudge, setEditingJudge] = useState(null);
  const [editJudgeName, setEditJudgeName] = useState('');
  const [editJudgeStatus, setEditJudgeStatus] = useState('Active');
  const [deletingJudge, setDeletingJudge] = useState(null);

  // Quick Add Judge (Only Name Required)
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickJudgeName.trim()) return;
    setIsQuickAdding(true);
    try {
      const cleanName = quickJudgeName.trim();
      const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
      if (onAddJudge) {
        await onAddJudge({
          id: `judge-${Date.now()}`,
          name: cleanName,
          username: `judge_${slug || Date.now().toString().slice(-4)}`,
          password: 'judges@#345',
          email: 'Eduvanza.juges@gmail.in',
          phone: '',
          specialization: 'Judge',
          role: 'Judge',
          status: 'Active',
          avatar: '',
          assignedPrograms: [],
          createdOn: new Date().toISOString().split('T')[0],
        });
      }
      setQuickJudgeName('');
    } catch (err) {
      console.error('Error adding judge:', err);
    } finally {
      setIsQuickAdding(false);
    }
  };

  // Helper: Get programs assigned to this judge
  const getAssignedPrograms = (judge) => {
    if (!judge || !judge.name) return [];
    const jName = judge.name.toLowerCase().trim();
    return programs.filter((prg) => {
      if (!prg.judge) return false;
      const judgeList = prg.judge
        .split(',')
        .map((s) => s.trim().toLowerCase());
      return judgeList.includes(jName);
    });
  };

  // Filter Judges
  const filteredJudges = judges.filter((j) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (j.name || '').toLowerCase().includes(q);
      if (!matchName) return false;
    }
    if (statusFilter !== 'All') {
      if ((j.status || 'Active') !== statusFilter) return false;
    }
    return true;
  });

  // Open Edit Modal
  const handleOpenEdit = (judge) => {
    setEditingJudge(judge);
    setEditJudgeName(judge.name || '');
    setEditJudgeStatus(judge.status || 'Active');
  };

  // Submit Edit Judge Form (Only Name & Status)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editJudgeName.trim() || !editingJudge) return;
    if (onUpdateJudge) {
      await onUpdateJudge({
        ...editingJudge,
        name: editJudgeName.trim(),
        status: editJudgeStatus || 'Active',
      });
    }
    setEditingJudge(null);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (deletingJudge && onDeleteJudge) {
      await onDeleteJudge(deletingJudge.id);
    }
    setDeletingJudge(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* SHARED JUDGE ACCOUNT INFO BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Scale size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a8a' }}>
              Single Shared Judge Login Account
            </div>
            <div style={{ fontSize: '0.84rem', color: '#1e40af', marginTop: '0.2rem', lineHeight: 1.45 }}>
              All fest judges sign in using: <strong>Eduvanza.juges@gmail.in</strong> (Password: <strong>judges@#345</strong>).
              Judges only require their name. Once registered, judges can be selected for each competition program.
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={onCreateClick}
          style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.1rem' }}
        >
          <Plus size={16} /> Add Judge
        </button>
      </div>

      {/* QUICK ADD JUDGE BAR (ONLY NAME REQUIRED) */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>⚡ Quick Add Judge</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              (Only name required)
            </span>
          </label>
        </div>
        <form
          onSubmit={handleQuickAdd}
          style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Enter Judge Name (e.g. Shaikh Usama, Qari Bilal)..."
              value={quickJudgeName}
              onChange={(e) => setQuickJudgeName(e.target.value)}
              style={{ padding: '0.65rem 0.85rem', fontSize: '0.92rem' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isQuickAdding || !quickJudgeName.trim()}
            style={{ padding: '0.65rem 1.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
          >
            <Plus size={18} />
            <span>{isQuickAdding ? 'Adding...' : 'Add Judge'}</span>
          </button>
        </form>
      </div>

      {/* 4 STAT CARDS ROW */}
      <div className="grid-responsive-sm">
        {/* Card 1: Total Judges */}
        <div className="stat-card" style={{ background: 'var(--stat-blue-bg)' }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--stat-blue-icon)', color: 'var(--stat-blue-text)' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--stat-blue-text)', lineHeight: 1 }}>
              {judges.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
              Total Judges
            </div>
          </div>
        </div>

        {/* Card 2: Active Judges */}
        <div className="stat-card" style={{ background: 'var(--stat-green-bg)' }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--stat-green-icon)', color: 'var(--stat-green-text)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--stat-green-text)', lineHeight: 1 }}>
              {judges.filter((j) => (j.status || 'Active') === 'Active').length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
              Active Officials
            </div>
          </div>
        </div>

        {/* Card 3: Assigned Programs */}
        <div className="stat-card" style={{ background: 'var(--stat-yellow-bg)' }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--stat-yellow-icon)', color: 'var(--stat-yellow-text)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--stat-yellow-text)', lineHeight: 1 }}>
              {programs.filter((p) => p.judge).length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
              Assigned Programs
            </div>
          </div>
        </div>

        {/* Card 4: Total Programs */}
        <div className="stat-card" style={{ background: 'var(--stat-purple-bg)' }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--stat-purple-icon)', color: 'var(--stat-purple-text)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--stat-purple-text)', lineHeight: 1 }}>
              {programs.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
              Total Events
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & ACTIONS BAR */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
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
              placeholder="Search by judge name..."
              style={{ paddingLeft: '2.4rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Right action group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="select-field"
              style={{ width: 'auto', minWidth: '140px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>

            <button className="btn btn-primary" onClick={onCreateClick}>
              <Plus size={18} /> Add Judge
            </button>
          </div>
        </div>
      </div>

      {/* JUDGES TABLE VIEW */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="custom-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Judge Name</th>
                <th style={{ width: '40%' }}>Assigned Competitions</th>
                <th style={{ textAlign: 'center', width: '12%' }}>Status</th>
                <th style={{ textAlign: 'right', width: '13%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJudges.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚖️</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.25rem' }}>
                      No Judges Found
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      {searchQuery
                        ? 'No judges matched your search.'
                        : 'No judges added yet. Type a name above and click "Add Judge" to register the first one.'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJudges.map((judge) => {
                  const assigned = getAssignedPrograms(judge);
                  return (
                    <tr key={judge.id}>
                      {/* Name & Avatar */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1rem',
                              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                              flexShrink: 0,
                            }}
                          >
                            {judge.name?.charAt(0).toUpperCase() || 'J'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                              {judge.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Official Fest Judge
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Events */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {assigned.length === 0 ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Not assigned yet
                            </span>
                          ) : (
                            assigned.map((prg) => (
                              <span
                                key={prg.id}
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '6px',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe',
                                }}
                                title={`${prg.code}: ${prg.name}`}
                              >
                                {prg.name}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '999px',
                            background: (judge.status || 'Active') === 'Active' ? '#dcfce7' : '#f1f5f9',
                            color: (judge.status || 'Active') === 'Active' ? '#15803d' : '#64748b',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: (judge.status || 'Active') === 'Active' ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: (judge.status || 'Active') === 'Active' ? '#16a34a' : '#94a3b8',
                            }}
                          />
                          {judge.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right', position: 'relative' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.6rem' }}
                            title="Edit Judge Name"
                            onClick={() => handleOpenEdit(judge)}
                          >
                            <Edit size={14} color="#d97706" />
                            <span>Edit</span>
                          </button>

                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.6rem' }}
                            title="Actions Menu"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === judge.id ? null : judge.id);
                            }}
                          >
                            <MoreVertical size={15} />
                          </button>
                        </div>

                        {/* Floating Action Menu */}
                        {openMenuId === judge.id && (
                          <>
                            <div
                              style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                right: '0.5rem',
                                top: '2.5rem',
                                zIndex: 50,
                                background: '#ffffff',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-sm)',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                                minWidth: '160px',
                                padding: '0.35rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.2rem',
                              }}
                            >
                              {/* View Details */}
                              <button
                                onClick={() => {
                                  setViewingJudge(judge);
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
                                  textAlign: 'left',
                                }}
                              >
                                <Eye size={14} color="var(--primary)" /> View Details
                              </button>

                              {/* Edit Judge */}
                              <button
                                onClick={() => {
                                  handleOpenEdit(judge);
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
                                  textAlign: 'left',
                                }}
                              >
                                <Edit size={14} color="#d97706" /> Edit Name
                              </button>

                              <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.2rem 0' }} />

                              {/* Delete Judge */}
                              <button
                                onClick={() => {
                                  setDeletingJudge(judge);
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
                                  color: '#dc2626',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  width: '100%',
                                  textAlign: 'left',
                                }}
                              >
                                <Trash2 size={14} /> Remove Judge
                              </button>
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
      </div>

      {/* MODAL 1: VIEW JUDGE DETAILS */}
      {viewingJudge && (() => {
        const assigned = getAssignedPrograms(viewingJudge);
        return (
          <div className="modal-overlay" onClick={() => setViewingJudge(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                      fontWeight: 800,
                    }}
                  >
                    ⚖️
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-main)', fontWeight: 800 }}>
                      {viewingJudge.name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Official Fest Judge • Shared Account User
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setViewingJudge(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>JUDGE NAME</div>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                        {viewingJudge.name}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>STATUS</div>
                      <div style={{ fontWeight: 700, color: (viewingJudge.status || 'Active') === 'Active' ? '#16a34a' : '#64748b', marginTop: '0.15rem' }}>
                        {viewingJudge.status || 'Active'}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-light)', fontSize: '0.8rem', color: '#1e40af', background: '#eff6ff', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                    Logged in via shared Judge Account: <strong>Eduvanza.juges@gmail.in</strong>
                  </div>
                </div>

                {/* Assigned Competitions Section */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.65rem' }}>
                    Assigned Competitions ({assigned.length})
                  </h4>
                  {assigned.length === 0 ? (
                    <div style={{ padding: '1.25rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No competitions currently assigned to this judge.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                      {assigned.map((p) => (
                        <div
                          key={p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.6rem 0.85rem',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            border: '1px solid var(--border-light)',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                              [{p.code}] {p.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {p.category} • {p.venue || 'Main Hall A'}
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              background: '#eff6ff',
                              color: 'var(--primary)',
                            }}
                          >
                            {p.status || 'Upcoming'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const j = viewingJudge;
                    setViewingJudge(null);
                    handleOpenEdit(j);
                  }}
                >
                  <Edit size={14} /> Edit Name
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setViewingJudge(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 2: EDIT JUDGE (ONLY NAME & STATUS) */}
      {editingJudge && (
        <div className="modal-overlay" onClick={() => setEditingJudge(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-header">
                <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-main)', fontWeight: 800 }}>
                  Edit Judge
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingJudge(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Judge Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editJudgeName}
                    onChange={(e) => setEditJudgeName(e.target.value)}
                    placeholder="Enter judge's full name"
                    required
                    autoFocus
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Only judge name is required.
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Status</label>
                  <select
                    className="select-field"
                    value={editJudgeStatus}
                    onChange={(e) => setEditJudgeStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingJudge(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!editJudgeName.trim()}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM DELETE */}
      {deletingJudge && (
        <div className="modal-overlay" onClick={() => setDeletingJudge(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', margin: 0, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                <Trash2 size={18} /> Remove Judge
              </h3>
              <button
                onClick={() => setDeletingJudge(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to remove judge <strong>{deletingJudge.name}</strong>?
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setDeletingJudge(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                onClick={handleConfirmDelete}
              >
                Yes, Remove Judge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
