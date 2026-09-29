import React, { useState } from 'react';
import { ChevronLeft, Upload, Image as ImageIcon } from 'lucide-react';

export default function CreateTeamView({ onBack, onCreateTeam }) {
  const [teamName, setTeamName] = useState('');
  const [campus, setCampus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName || !campus) return;

    onCreateTeam({
      id: `team-${Date.now()}`,
      name: teamName,
      campus: campus,
      code: teamName.substring(0, 3).toUpperCase(),
      color: '#2563eb',
      bgLight: '#eff6ff',
      icon: '🛡️',
      manager: 'Assigned Manager',
      participantCount: 0,
      createdOn: 'Sep 27, 2026',
      points: 0,
    });
    onBack();
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with back arrow matching middle-left screenshot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onBack}
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-heading)' }}>
          Create New Team
        </h2>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Team Name */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Team Name *</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </div>

          {/* Campus / State */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Campus / State *</label>
            <select
              className="select-field"
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              required
            >
              <option value="">Select campus</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Kerala">Kerala</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>
          </div>

          {/* Team Logo (Optional) Upload Box matching screenshot */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Team Logo (Optional)</label>
            <div style={{
              border: '2px dashed var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '2.5rem',
              textAlign: 'center',
              background: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                <ImageIcon size={24} />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>
                Click to upload logo
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                PNG, JPG (Max 2MB)
              </div>
            </div>
          </div>

          {/* Buttons: Cancel & Create Team */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onBack}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.7rem 1.75rem' }}>
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
