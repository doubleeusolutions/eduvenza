import React, { useState } from 'react';
import { ChevronLeft, Award, Scale } from 'lucide-react';

export default function CreateJudgeView({ programs = [], onBack, onCreateJudge }) {
  const [judgeName, setJudgeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!judgeName.trim()) return;

    setIsSubmitting(true);
    try {
      const cleanName = judgeName.trim();
      const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
      await onCreateJudge({
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
      onBack();
    } catch (err) {
      console.error('Error creating judge:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with back button */}
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
            color: 'var(--text-muted)',
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-heading)' }}>
            Add Judge
          </h2>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Register judge name to make them selectable inside the Judge Account
          </div>
        </div>
      </div>

      {/* Shared Judge Account Info Notice */}
      <div
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          padding: '0.9rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Scale size={20} style={{ color: '#2563eb', flexShrink: 0 }} />
        <div style={{ fontSize: '0.84rem', color: '#1e3a8a', lineHeight: 1.45 }}>
          All judges sign in via the shared Judge Account (<strong>Eduvanza.juges@gmail.in</strong>). Once added here, this judge can be selected for each competition event directly inside the Judge Account.
        </div>
      </div>

      {/* Form Card: Only Name Needed */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              Judge Name *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Shaikh Usama, Qari Bilal, etc."
              value={judgeName}
              onChange={(e) => setJudgeName(e.target.value)}
              required
              autoFocus
              style={{ fontSize: '1rem', padding: '0.65rem 0.85rem' }}
            />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Only the judge's name is needed.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={onBack}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={isSubmitting || !judgeName.trim()}
            >
              {isSubmitting ? 'Adding...' : 'Add Judge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
