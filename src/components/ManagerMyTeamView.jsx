import React from 'react';
import { Plus, Edit2, MoreVertical } from 'lucide-react';

export default function ManagerMyTeamView({ managerTeam, teamParticipants, onAddParticipant }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top action header button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={onAddParticipant}>
          <Plus size={18} /> Add Participant
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Left Team Information Card matching bottom-right screenshot */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Team Information
            </h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <Edit2 size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              🏛️
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                {managerTeam?.name || 'No Team Assigned'}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {managerTeam?.campus || 'Unassigned'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Team Manager</span>
              <strong style={{ color: 'var(--text-main)' }}>{managerTeam?.manager || 'Unassigned'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Participants</span>
              <strong style={{ color: 'var(--text-main)' }}>{teamParticipants.length}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Created On</span>
              <strong style={{ color: 'var(--text-main)' }}>{managerTeam?.createdOn || 'N/A'}</strong>
            </div>
          </div>
        </div>

        {/* Right Participants Table Card matching bottom-right screenshot */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
            Participants ({teamParticipants.length})
          </div>

          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Event</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {teamParticipants.map((p, idx) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
                      {idx + 1}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {p.name}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {p.programs[0] ? 'Qiraath / Speech' : 'General'}
                    </td>
                    <td>
                      <span className="status-pill status-pill-registered">
                        Registered
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
