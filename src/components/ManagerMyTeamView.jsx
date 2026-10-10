import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  Users,
  Award,
  BookOpen,
  Layers,
  Shield,
  Filter,
  Eye,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Tag,
} from 'lucide-react';

// Helper to determine if a program is an individual event
const isIndividualProgram = (prg) => {
  if (!prg) return true;
  if (prg.type && prg.type.toLowerCase() === 'group') return false;
  if (prg.memberCount && Number(prg.memberCount) > 1) return false;
  return true;
};

export default function ManagerMyTeamView({
  managerTeam,
  teamParticipants = [],
  programs = [],
  onAddParticipant,
  onUpdateParticipant,
  onDeleteParticipant,
}) {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [deletingParticipant, setDeletingParticipant] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Search & Filter state for team table
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [tableCategoryFilter, setTableCategoryFilter] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [chestNo, setChestNo] = useState('');
  const [category, setCategory] = useState('Senior');
  const [gender, setGender] = useState('Male');
  const [selectedProgramIds, setSelectedProgramIds] = useState([]);
  const [limitWarning, setLimitWarning] = useState('');
  const [formError, setFormError] = useState('');

  // Program filter inside the modal
  const [modalProgramSearch, setModalProgramSearch] = useState('');
  const [modalProgramFilter, setModalProgramFilter] = useState('all'); // 'all' | 'individual' | 'group' | 'matching'

  // Count individual and group programs currently selected in form
  const selectedIndividualCount = useMemo(() => {
    return selectedProgramIds.filter((id) => {
      const p = programs.find((item) => item.id === id);
      return isIndividualProgram(p);
    }).length;
  }, [selectedProgramIds, programs]);

  const selectedGroupCount = useMemo(() => {
    return selectedProgramIds.filter((id) => {
      const p = programs.find((item) => item.id === id);
      return !isIndividualProgram(p);
    }).length;
  }, [selectedProgramIds, programs]);

  // Open modal for Adding new participant
  const handleOpenAdd = () => {
    setEditingParticipant(null);
    setName('');
    // Auto-suggest next chest number if numerical
    const existingChests = teamParticipants
      .map((p) => parseInt(p.chestNo, 10))
      .filter((n) => !isNaN(n));
    const nextChest = existingChests.length > 0 ? Math.max(...existingChests) + 1 : 101;
    setChestNo(String(nextChest));
    setCategory('Senior');
    setGender('Male');
    setSelectedProgramIds([]);
    setLimitWarning('');
    setFormError('');
    setModalProgramSearch('');
    setModalProgramFilter('all');
    setIsModalOpen(true);
  };

  // Open modal for Editing participant
  const handleOpenEdit = (part) => {
    setEditingParticipant(part);
    setName(part.name || '');
    setChestNo(part.chestNo || '');
    setCategory(part.category || 'Senior');
    setGender(part.gender || 'Male');
    const existingPrograms = (part.programs || []).map((item) =>
      typeof item === 'string' ? item : item.id
    );
    setSelectedProgramIds(existingPrograms);
    setLimitWarning('');
    setFormError('');
    setModalProgramSearch('');
    setModalProgramFilter('all');
    setIsModalOpen(true);
  };

  // Toggle program selection with strict 4 individual programs rule
  const handleToggleProgram = (prgId) => {
    const targetProgram = programs.find((p) => p.id === prgId);
    const isSelected = selectedProgramIds.includes(prgId);

    if (isSelected) {
      // Deselect
      setSelectedProgramIds(selectedProgramIds.filter((id) => id !== prgId));
      setLimitWarning('');
    } else {
      // Check 4 individual programs limit
      if (isIndividualProgram(targetProgram)) {
        if (selectedIndividualCount >= 4) {
          setLimitWarning('⚠️ Maximum limit reached: One participant can select at most 4 individual programs.');
          return;
        }
      }
      setSelectedProgramIds([...selectedProgramIds, prgId]);
      setLimitWarning('');
    }
  };

  // Handle Form Submit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');
    setLimitWarning('');

    if (!name.trim()) {
      setFormError('Please enter participant full name.');
      return;
    }
    if (!chestNo.trim()) {
      setFormError('Please enter a chest number.');
      return;
    }

    // Verify limit one more time
    if (selectedIndividualCount > 4) {
      setFormError('Cannot save: A participant cannot have more than 4 individual programs.');
      return;
    }

    try {
      if (editingParticipant) {
        // Update existing participant
        const updated = {
          ...editingParticipant,
          name: name.trim(),
          chestNo: chestNo.trim(),
          category,
          gender,
          programs: selectedProgramIds,
        };
        if (onUpdateParticipant) {
          await onUpdateParticipant(updated);
        }
        setSuccessMessage(`Updated participant "${name.trim()}" successfully!`);
      } else {
        // Add new participant
        const newPart = {
          id: `p-${Date.now()}`,
          name: name.trim(),
          chestNo: chestNo.trim(),
          teamId: managerTeam?.id || 'team-default',
          category,
          gender,
          email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@eduvenza.com`,
          programs: selectedProgramIds,
          status: 'Registered',
          avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=150&auto=format&fit=crop&q=80`,
        };
        if (onAddParticipant) {
          await onAddParticipant(newPart);
        }
        setSuccessMessage(`Added participant "${name.trim()}" with ${selectedProgramIds.length} programs!`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error saving participant:', err);
      setFormError(err.message || 'Failed to save participant. Please try again.');
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingParticipant) return;
    try {
      if (onDeleteParticipant) {
        await onDeleteParticipant(deletingParticipant.id);
      }
      setSuccessMessage(`Removed participant "${deletingParticipant.name}".`);
      setDeletingParticipant(null);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error deleting participant:', err);
    }
  };

  // Filtered Programs list inside the modal
  const modalFilteredPrograms = useMemo(() => {
    return programs.filter((prg) => {
      // Search filter
      if (modalProgramSearch.trim()) {
        const q = modalProgramSearch.toLowerCase().trim();
        const matchCode = (prg.code || '').toLowerCase().includes(q);
        const matchName = (prg.name || '').toLowerCase().includes(q);
        if (!matchCode && !matchName) return false;
      }

      // Tab filter
      if (modalProgramFilter === 'individual') {
        if (!isIndividualProgram(prg)) return false;
      } else if (modalProgramFilter === 'group') {
        if (isIndividualProgram(prg)) return false;
      } else if (modalProgramFilter === 'matching') {
        if (prg.category && prg.category !== category && prg.category !== 'General') return false;
      }

      return true;
    });
  }, [programs, modalProgramSearch, modalProgramFilter, category]);

  // Filtered Participants table
  const filteredParticipants = useMemo(() => {
    return teamParticipants.filter((p) => {
      if (tableCategoryFilter && p.category !== tableCategoryFilter) return false;
      if (tableSearchQuery.trim()) {
        const q = tableSearchQuery.toLowerCase().trim();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchChest = (p.chestNo || '').toLowerCase().includes(q);
        if (!matchName && !matchChest) return false;
      }
      return true;
    });
  }, [teamParticipants, tableCategoryFilter, tableSearchQuery]);

  // Total Program Enrollments across team
  const totalEnrollments = useMemo(() => {
    return teamParticipants.reduce((sum, p) => sum + (p.programs?.length || 0), 0);
  }, [teamParticipants]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Success Notification */}
      {successMessage && (
        <div
          style={{
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#166534',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <CheckCircle2 size={18} /> {successMessage}
        </div>
      )}

      {/* Top Banner Card */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                background: '#eff6ff',
                color: '#2563eb',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                border: '1px solid #bfdbfe',
              }}
            >
              TEAM MANAGER PORTAL
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>•</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              {managerTeam?.campus || 'Main Campus'}
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.55rem',
              fontWeight: 800,
              margin: 0,
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <span style={{ fontSize: '1.6rem' }}>{managerTeam?.icon || '🏛️'}</span> {managerTeam?.name || 'My Team'} Roster
          </h1>

          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
            Register squad participants and assign competition events (strictly maximum 4 individual programs per student).
          </p>
        </div>

        {/* Action Button: Add Participant */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.7rem 1.4rem',
            fontSize: '0.925rem',
            fontWeight: 800,
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          }}
        >
          <Plus size={18} /> Add Participant
        </button>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="card" style={{ padding: '1.1rem 1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Total Participants
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
            {teamParticipants.length}
          </div>
        </div>

        <div className="card" style={{ padding: '1.1rem 1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
            Event Enrollments
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
            {totalEnrollments}
          </div>
        </div>

        <div className="card" style={{ padding: '1.1rem 1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
            Available Events
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>
            {programs.length}
          </div>
        </div>

        <div className="card" style={{ padding: '1.1rem 1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
            Max Indiv. Limit
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>
            4 <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>per student</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Team Info & Participants List */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 360px) 1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left: Team Information Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Shield size={18} style={{ color: '#2563eb' }} /> Team Information
            </h3>
            <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
              {managerTeam?.code || 'TEAM'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.85rem',
                flexShrink: 0,
              }}
            >
              {managerTeam?.icon || '🏛️'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {managerTeam?.name || 'No Team Assigned'}
              </h2>
              <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.2rem' }}>
                {managerTeam?.campus || 'Unassigned Campus'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Team Manager:</span>
              <strong style={{ color: 'var(--text-main)' }}>{managerTeam?.manager || 'You'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Registered Squad:</span>
              <strong style={{ color: 'var(--text-main)' }}>{teamParticipants.length} Students</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Total Events:</span>
              <strong style={{ color: '#2563eb' }}>{totalEnrollments} Entries</strong>
            </div>
          </div>

          {/* Rules Banner Box */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.9rem 1rem',
              fontSize: '0.8rem',
              color: '#334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            <div style={{ fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertCircle size={14} /> Official Festival Rule
            </div>
            <div>
              Each participant can participate in a <strong>maximum of 4 individual programs</strong>. Group programs do not consume individual quotas.
            </div>
          </div>
        </div>

        {/* Right: Team Participants Table Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Squad Members
              </h3>
              <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800 }}>
                {filteredParticipants.length} of {teamParticipants.length}
              </span>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '0.65rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search name or chest..."
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.65rem 0.4rem 2rem',
                    fontSize: '0.825rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                  }}
                />
              </div>

              <select
                value={tableCategoryFilter}
                onChange={(e) => setTableCategoryFilter(e.target.value)}
                style={{
                  padding: '0.4rem 0.65rem',
                  fontSize: '0.825rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                }}
              >
                <option value="">All Categories</option>
                <option value="Senior">Senior</option>
                <option value="Junior">Junior</option>
                <option value="Sub-Junior">Sub-Junior</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-wrapper" style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
            <table className="custom-table" style={{ margin: 0 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                  <th style={{ width: '85px' }}>Chest</th>
                  <th>Student Name</th>
                  <th>Category</th>
                  <th>Assigned Programs</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={32} style={{ color: '#cbd5e1' }} />
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>No participants found</div>
                        <div style={{ fontSize: '0.825rem' }}>
                          {teamParticipants.length === 0
                            ? 'Your team does not have any registered participants yet.'
                            : 'No squad members match your search filter.'}
                        </div>
                        {teamParticipants.length === 0 && (
                          <button
                            type="button"
                            onClick={handleOpenAdd}
                            className="btn btn-primary btn-sm"
                            style={{ marginTop: '0.5rem' }}
                          >
                            <Plus size={14} /> Add First Participant
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((part, idx) => {
                    const participantPrograms = (part.programs || []).map((item) => {
                      const pId = typeof item === 'string' ? item : item.id;
                      return programs.find((p) => p.id === pId) || { id: pId, name: pId, code: 'PRG' };
                    });

                    const indivCount = participantPrograms.filter(isIndividualProgram).length;

                    return (
                      <tr key={part.id}>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#94a3b8', fontSize: '0.8rem' }}>
                          {idx + 1}
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 800,
                              color: '#2563eb',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                            }}
                          >
                            #{part.chestNo}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                            {part.name}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                            {part.gender || 'Student'} • {managerTeam?.name}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              background: '#f1f5f9',
                              color: '#334155',
                            }}
                          >
                            {part.category || 'General'}
                          </span>
                        </td>
                        <td>
                          {participantPrograms.length === 0 ? (
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                              No programs assigned
                            </span>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                {participantPrograms.slice(0, 3).map((prg) => (
                                  <span
                                    key={prg.id}
                                    style={{
                                      fontSize: '0.725rem',
                                      fontWeight: 700,
                                      padding: '0.15rem 0.45rem',
                                      borderRadius: '4px',
                                      background: isIndividualProgram(prg) ? '#f0fdf4' : '#faf5ff',
                                      color: isIndividualProgram(prg) ? '#166534' : '#6b21a8',
                                      border: `1px solid ${isIndividualProgram(prg) ? '#bbf7d0' : '#e9d5ff'}`,
                                      whiteSpace: 'nowrap',
                                    }}
                                    title={prg.name}
                                  >
                                    {prg.code}: {prg.name}
                                  </span>
                                ))}
                                {participantPrograms.length > 3 && (
                                  <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 700 }}>
                                    +{participantPrograms.length - 3} more
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                {indivCount} / 4 Individual Events • {participantPrograms.length - indivCount} Group Events
                              </div>
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(part)}
                              className="btn btn-secondary btn-sm"
                              title="Edit Participant & Programs"
                              style={{ padding: '0.35rem 0.55rem' }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingParticipant(part)}
                              className="btn btn-secondary btn-sm"
                              title="Delete Participant"
                              style={{ color: '#ef4444', padding: '0.35rem 0.55rem' }}
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

      {/* ========================================================================= */}
      {/* ADD / EDIT PARTICIPANT MODAL WITH PROGRAM ASSIGNMENT & 4-LIMIT ENFORCEMENT */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div
          className="drawer-right-overlay"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: 'min(95vw, 760px)',
              maxHeight: '92vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.75rem',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {editingParticipant ? `Edit Participant: ${editingParticipant.name}` : 'Register New Participant'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Team: <strong>{managerTeam?.name}</strong> • Up to 4 Individual Programs Allowed
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '0.25rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Error Banner */}
                {formError && (
                  <div
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #fca5a5',
                      color: '#991b1b',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <AlertCircle size={16} /> {formError}
                  </div>
                )}

                {/* 1. Basic Information Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Full Student Name *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Aisha Rahman"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Chest Number *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 101"
                      required
                      value={chestNo}
                      onChange={(e) => setChestNo(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Category *
                    </label>
                    <select
                      className="select-field"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Senior">Senior</option>
                      <option value="Junior">Junior</option>
                      <option value="Sub-Junior">Sub-Junior</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Gender *
                    </label>
                    <select
                      className="select-field"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* 2. Program Assignment Section Header with Live Counter */}
                <div
                  style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BookOpen size={18} style={{ color: '#2563eb' }} />
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        Assign Competition Programs
                      </span>
                    </div>

                    {/* Live Counter Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.65rem',
                          borderRadius: '6px',
                          background: selectedIndividualCount >= 4 ? '#dcfce7' : '#eff6ff',
                          color: selectedIndividualCount >= 4 ? '#166534' : '#1d4ed8',
                          border: `1px solid ${selectedIndividualCount >= 4 ? '#86efac' : '#bfdbfe'}`,
                        }}
                      >
                        Individual Events: {selectedIndividualCount} / 4 {selectedIndividualCount >= 4 ? '(Max Reached)' : ''}
                      </span>
                      {selectedGroupCount > 0 && (
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            background: '#faf5ff',
                            color: '#6b21a8',
                            border: '1px solid #e9d5ff',
                          }}
                        >
                          Group Events: {selectedGroupCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Warning Alert if user tries to exceed 4 */}
                  {limitWarning && (
                    <div
                      style={{
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        color: '#92400e',
                        padding: '0.6rem 0.9rem',
                        borderRadius: '8px',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        animation: 'fadeIn 0.2s ease',
                      }}
                    >
                      <AlertCircle size={15} /> {limitWarning}
                    </div>
                  )}

                  {/* Filter & Search for Programs inside modal */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                      <Search
                        size={14}
                        style={{
                          position: 'absolute',
                          left: '0.65rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#94a3b8',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Search event name or code..."
                        value={modalProgramSearch}
                        onChange={(e) => setModalProgramSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.65rem 0.35rem 1.9rem',
                          fontSize: '0.8rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'individual', label: 'Individual Only' },
                        { id: 'group', label: 'Group Only' },
                        { id: 'matching', label: `${category} Only` },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setModalProgramFilter(tab.id)}
                          style={{
                            padding: '0.25rem 0.55rem',
                            borderRadius: '6px',
                            border: `1px solid ${modalProgramFilter === tab.id ? '#2563eb' : '#e2e8f0'}`,
                            background: modalProgramFilter === tab.id ? '#2563eb' : '#fff',
                            color: modalProgramFilter === tab.id ? '#fff' : '#475569',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Programs Checklist Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '0.65rem',
                      maxHeight: '260px',
                      overflowY: 'auto',
                      padding: '0.65rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      background: '#f8fafc',
                    }}
                  >
                    {modalFilteredPrograms.length === 0 ? (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.825rem' }}>
                        No competition events match this filter.
                      </div>
                    ) : (
                      modalFilteredPrograms.map((prg) => {
                        const isSelected = selectedProgramIds.includes(prg.id);
                        const isIndiv = isIndividualProgram(prg);
                        const isMaxIndividualReached = isIndiv && !isSelected && selectedIndividualCount >= 4;

                        return (
                          <div
                            key={prg.id}
                            onClick={() => !isMaxIndividualReached && handleToggleProgram(prg.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.6rem',
                              padding: '0.6rem 0.75rem',
                              borderRadius: '8px',
                              border: `1.5px solid ${
                                isSelected
                                  ? '#2563eb'
                                  : isMaxIndividualReached
                                  ? '#e2e8f0'
                                  : '#cbd5e1'
                              }`,
                              background: isSelected
                                ? '#eff6ff'
                                : isMaxIndividualReached
                                ? '#f1f5f9'
                                : '#ffffff',
                              opacity: isMaxIndividualReached ? 0.55 : 1,
                              cursor: isMaxIndividualReached ? 'not-allowed' : 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isMaxIndividualReached}
                              onChange={() => {}} // handled by parent div
                              style={{ marginTop: '0.2rem', accentColor: '#2563eb', cursor: isMaxIndividualReached ? 'not-allowed' : 'pointer' }}
                            />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    background: isSelected ? '#bfdbfe' : '#e2e8f0',
                                    color: isSelected ? '#1e3a8a' : '#475569',
                                    padding: '0.1rem 0.35rem',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {prg.code}
                                </span>
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    color: isIndiv ? '#15803d' : '#7e22ce',
                                    background: isIndiv ? '#dcfce7' : '#f3e8ff',
                                    padding: '0.1rem 0.35rem',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {isIndiv ? 'Individual' : 'Group'}
                                </span>
                              </div>

                              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.825rem', lineHeight: 1.25 }}>
                                {prg.name}
                              </div>

                              <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                                <span>{prg.category || 'General'}</span>
                                {isMaxIndividualReached && (
                                  <span style={{ color: '#b45309', fontWeight: 700 }}>• Max 4 reached</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: '1.25rem 1.75rem',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {selectedProgramIds.length} Total Events Assigned ({selectedIndividualCount} Individual, {selectedGroupCount} Group)
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
                  >
                    <Check size={16} /> {editingParticipant ? 'Save Changes' : 'Register Participant'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingParticipant && (
        <div
          className="drawer-right-overlay"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
          onClick={() => setDeletingParticipant(null)}
        >
          <div
            className="card"
            style={{
              width: 'min(95vw, 450px)',
              padding: '1.75rem',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#fee2e2',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Remove Participant
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  This action will remove the student from team roster
                </div>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
              Are you sure you want to remove <strong>"{deletingParticipant.name}"</strong> (Chest #{deletingParticipant.chestNo}) from <strong>{managerTeam?.name}</strong>?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setDeletingParticipant(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn btn-primary"
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
              >
                Yes, Remove Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
