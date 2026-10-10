import React from 'react';
import { Shield, Users, Trophy, Calendar, ChevronRight, Medal, Star } from 'lucide-react';

export default function ManagerDashboardView({ managerTeam, teamParticipants, programs, markEntries = [], onNavigate }) {
  const upcomingEvents = programs.filter((p) => p.status === 'Upcoming' || p.status === 'In Progress').slice(0, 3);
  const completedEvents = programs.filter((p) => p.status === 'Completed' || p.status === 'Published').slice(0, 3);

  // Only tally marks from competitions officially published by Admin
  const publishedProgramIds = new Set(
    programs.filter((p) => p.status === 'Published').map((p) => p.id)
  );
  const publishedMarkEntries = markEntries.filter((me) => publishedProgramIds.has(me.programId));

  // Calculate top scores for the team (only published scores are visible to team managers)
  const participantPerformances = teamParticipants.map((p) => {
    const pMarks = publishedMarkEntries.filter((me) => me.participantId === p.id);
    const totalScore = pMarks.reduce((acc, me) => acc + (Number(me.totalScore) || 0), 0);
    return { ...p, totalScore, evaluatedCount: pMarks.length };
  });
  const hasPublishedScores = participantPerformances.some((p) => p.totalScore > 0 || p.evaluatedCount > 0);
  const topTeamScorers = [...participantPerformances]
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 4 STAT CARDS ROW matching bottom-left screenshot */}
      <div className="grid-responsive-sm">
        {/* Card 1: My Team (1) */}
        <div
          className="stat-card"
          style={{ background: 'var(--stat-blue-bg)', cursor: 'pointer' }}
          onClick={() => onNavigate && onNavigate('my-team')}
        >
          <div className="stat-icon-wrapper" style={{ background: 'var(--stat-blue-icon)', color: 'var(--stat-blue-text)' }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--stat-blue-text)', lineHeight: 1 }}>
              1
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
              My Team
            </div>
          </div>
        </div>

        {/* Card 2: Participants */}
        <div
          className="stat-card"
          style={{ background: 'var(--stat-green-bg)', cursor: 'pointer' }}
          onClick={() => onNavigate && onNavigate('participants')}
        >
          <div className="stat-icon-wrapper" style={{ background: 'var(--stat-green-icon)', color: 'var(--stat-green-text)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--stat-green-text)', lineHeight: 1 }}>
              {teamParticipants.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
              Participants
            </div>
          </div>
        </div>

        {/* Card 3: Competitions */}
        <div
          className="stat-card"
          style={{ background: 'var(--stat-yellow-bg)', cursor: 'pointer' }}
          onClick={() => onNavigate && onNavigate('competitions')}
        >
          <div className="stat-icon-wrapper" style={{ background: 'var(--stat-yellow-icon)', color: 'var(--stat-yellow-text)' }}>
            <Trophy size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--stat-yellow-text)', lineHeight: 1 }}>
              {programs.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
              Competitions
            </div>
          </div>
        </div>

        {/* Card 4: Upcoming Events */}
        <div
          className="stat-card"
          style={{ background: 'var(--stat-purple-bg)', cursor: 'pointer' }}
          onClick={() => onNavigate && onNavigate('competitions')}
        >
          <div className="stat-icon-wrapper" style={{ background: 'var(--stat-purple-icon)', color: 'var(--stat-purple-text)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--stat-purple-text)', lineHeight: 1 }}>
              {upcomingEvents.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
              Upcoming Events
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: MY TEAM CARD & UPCOMING/COMPLETED EVENTS */}
      <div className="grid-responsive-md" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* My Team Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
            My Team
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem'
              }}>
                🏛️
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)' }}>
                  {managerTeam?.name || 'No Assigned Team'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {managerTeam?.campus || 'Unassigned'}
                </div>
              </div>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => onNavigate('my-team')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              View Team
            </button>
          </div>
        </div>

        {/* Upcoming Events Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              Upcoming Events
            </div>
            <button
              onClick={() => onNavigate && onNavigate('competitions')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {upcomingEvents.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>No upcoming events.</div>
            ) : upcomingEvents.map((prg) => (
              <div
                key={prg.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Calendar size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {prg.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {prg.date || 'Not Assigned'} • {prg.time || 'Not Assigned'}
                    </div>
                  </div>
                </div>

                <ChevronRight size={18} color="var(--text-subtle)" />
              </div>
            ))}
          </div>
        </div>

        {/* Completed Events Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              Completed Events
            </div>
            <button
              onClick={() => onNavigate && onNavigate('results')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {completedEvents.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>No completed events yet.</div>
            ) : completedEvents.map((prg) => (
              <div
                key={prg.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Trophy size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {prg.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {prg.date || 'Not Assigned'} • {prg.time || 'Not Assigned'}
                    </div>
                  </div>
                </div>

                <ChevronRight size={18} color="var(--text-subtle)" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOP SCORERS / LEADERBOARD */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Medal style={{ color: '#eab308' }} size={22} />
            Team Leaderboard
          </h2>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
            onClick={() => onNavigate('my-team')}
          >
            View All
          </button>
        </div>

        <div className="table-wrapper">
          <table className="custom-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                <th>Participant</th>
                <th>Category</th>
                <th style={{ textAlign: 'center' }}>Evaluated</th>
                <th style={{ textAlign: 'right' }}>Total Score</th>
              </tr>
            </thead>
            <tbody>
              {!hasPublishedScores ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                      No Published Scores Yet
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
                      Participant marks, scores, and team leaderboard ranks will appear here once official competition results are published by the administrator.
                    </div>
                  </td>
                </tr>
              ) : (
                topTeamScorers.map((participant, index) => (
                  <tr key={participant.id} style={{ background: index < 3 ? 'rgba(250, 250, 250, 0.5)' : 'transparent' }}>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: index === 0 ? '#fef08a' : index === 1 ? '#e5e7eb' : index === 2 ? '#fed7aa' : '#f1f5f9',
                        color: index === 0 ? '#a16207' : index === 1 ? '#4b5563' : index === 2 ? '#9a3412' : '#64748b',
                        fontWeight: 800,
                        fontSize: '0.85rem'
                      }}>
                        {index + 1}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.85rem', flexShrink: 0 }}>
                        {participant.name?.charAt(0).toUpperCase()}
                      </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                            {participant.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Chest: {participant.chestNo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${participant.category.toLowerCase().replace('-', '')}`}>
                        {participant.category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {participant.evaluatedCount} / {participant.programs.length}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <Star size={14} fill="#eab308" color="#eab308" />
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {participant.totalScore}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
