import React from 'react';
import { Users, UserCheck, Trophy, GraduationCap, Plus, ArrowUpRight, Flame, Award, Crown, Medal, Star } from 'lucide-react';

export default function AdminDashboardView({ teams, managers, programs, participants, activities, markEntries, onNavigate }) {
  // Stat Card Counts matching screenshot
  const totalTeamsCount = teams.length;
  const totalManagersCount = managers.length;
  const totalCompetitionsCount = programs.length;
  const totalParticipantsCount = participants.length;

  // Sort teams by points
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);

  // Calculate top 5 participants ordered by total score
  const participantPerformances = participants.map((p) => {
    const pMarks = markEntries.filter((me) => me.participantId === p.id);
    const totalScore = pMarks.reduce((acc, me) => acc + (Number(me.totalScore) || 0), 0);
    const totalPoints = pMarks.reduce((acc, me) => acc + (Number(me.teamPoints) || 0), 0);
    const highestMarkEntry = pMarks.length > 0
      ? [...pMarks].sort((a, b) => b.totalScore - a.totalScore)[0]
      : null;
    const team = teams.find((t) => t.id === p.teamId);

    return {
      ...p,
      team,
      totalScore,
      totalPoints,
      highestScore: highestMarkEntry ? highestMarkEntry.totalScore : 0,
      latestGrade: highestMarkEntry ? highestMarkEntry.grade : 'N/A',
      evaluatedCount: pMarks.length,
    };
  });

  const sortedParticipants = [...participantPerformances].sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.highestScore - a.highestScore;
  });

  const top5Participants = sortedParticipants.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 4 STAT CARDS ROW matching top-right screenshot */}
      <div className="grid-responsive-sm">
        {/* Card 1: Total Teams (Blue) */}
        <div className="stat-card" style={{ background: 'var(--stat-blue-bg)' }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--stat-blue-icon)', color: 'var(--stat-blue-text)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--stat-blue-text)', lineHeight: 1 }}>
              {totalTeamsCount}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
              Total Teams
            </div>
          </div>
        </div>

        {/* Card 2: Team Managers (Green) */}
        <div className="stat-card" style={{ background: 'var(--stat-green-bg)' }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--stat-green-icon)', color: 'var(--stat-green-text)' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--stat-green-text)', lineHeight: 1 }}>
              {totalManagersCount}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
              Team Managers
            </div>
          </div>
        </div>

        {/* Card 3: Competitions (Yellow/Orange) */}
        <div className="stat-card" style={{ background: 'var(--stat-yellow-bg)' }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--stat-yellow-icon)', color: 'var(--stat-yellow-text)' }}>
            <Trophy size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--stat-yellow-text)', lineHeight: 1 }}>
              {totalCompetitionsCount}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
              Competitions
            </div>
          </div>
        </div>

        {/* Card 4: Total Participants (Purple) */}
        <div className="stat-card" style={{ background: 'var(--stat-purple-bg)' }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--stat-purple-icon)', color: 'var(--stat-purple-text)' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--stat-purple-text)', lineHeight: 1 }}>
              {totalParticipantsCount}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
              Total Participants
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: TEAM TOTAL MARKS BAR CHART & RECENT ACTIVITIES */}
      <div className="grid-responsive-md">
        {/* Team Total Marks Bar Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              Team Total Marks
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              All Competitions
            </span>
          </div>

          {(() => {
            // Compute total marks per team from markEntries
            const teamMarks = teams.map((team) => {
              const teamParticipantIds = participants
                .filter((p) => p.teamId === team.id)
                .map((p) => p.id);
              const total = markEntries
                .filter((me) => teamParticipantIds.includes(me.participantId))
                .reduce((acc, me) => acc + (Number(me.totalScore) || 0), 0);
              return { ...team, totalMarks: total };
            }).sort((a, b) => b.totalMarks - a.totalMarks);

            const maxMarks = Math.max(...teamMarks.map((t) => t.totalMarks), 1);

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {teamMarks.map((team, idx) => {
                  const pct = maxMarks > 0 ? (team.totalMarks / maxMarks) * 100 : 0;
                  const barColor = team.color || '#6366f1';
                  return (
                    <div key={team.id}>
                      {/* Label row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          <span>{team.icon || '🏳️'}</span>
                          <span>{team.name}</span>
                          {idx === 0 && team.totalMarks > 0 && (
                            <span style={{ fontSize: '0.65rem', background: '#fef08a', color: '#a16207', padding: '0.1rem 0.45rem', borderRadius: '999px', fontWeight: 800 }}>LEAD</span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: barColor }}>
                          {team.totalMarks} <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>pts</span>
                        </span>
                      </div>
                      {/* Bar */}
                      <div style={{ height: '10px', borderRadius: '999px', background: 'var(--bg-input)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            borderRadius: '999px',
                            background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                            transition: 'width 0.5s ease',
                            minWidth: team.totalMarks > 0 ? '4px' : '0',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                {teamMarks.every((t) => t.totalMarks === 0) && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                    No marks entered yet.
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Recent Activities Widget */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              Recent Activities
            </div>
            <button
              onClick={() => onNavigate && onNavigate('reports')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(activities || []).slice(0, 4).map((act) => (
              <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: `${act.color || '#3b82f6'}15`,
                    color: act.color || '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}>
                    ✦
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{act.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{act.subtitle}</div>
                  </div>
                </div>

                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                  {act.time}
                </span>
              </div>
            ))}
            {(!activities || activities.length === 0) && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '1rem 0', textAlign: 'center' }}>
                No recent activities.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOP 5 SCORE PARTICIPANTS BY ORDER */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.2rem 0.65rem',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)'
              }}>
                <Crown size={13} /> TOP SCORE LEADERBOARD
              </span>
            </div>
            <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
              Top 5 Score Participants (By Order)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Top overall individual performers ordered by competition evaluation marks
            </p>
          </div>
          <button className="btn btn-secondary" onClick={() => onNavigate('participants')}>
            View All Participants <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="table-container" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
          <table className="app-table">
            <thead>
              <tr>
                <th style={{ width: '90px', textAlign: 'center' }}>Rank</th>
                <th>Participant</th>
                <th>Chest No</th>
                <th>Team & Campus</th>
                <th>Category</th>
                <th>Evaluated</th>
                <th style={{ textAlign: 'right' }}>Total Score</th>
              </tr>
            </thead>
            <tbody>
              {top5Participants.map((p, idx) => {
                const rankBadges = [
                  { bg: '#fef3c7', text: '#9a3412', border: '#fde68a', label: '🥇 1 Gold' },
                  { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1', label: '🥈 2 Silver' },
                  { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5', label: '🥉 3 Bronze' },
                  { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', label: '4' },
                  { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', label: '5' },
                ];
                const rankInfo = rankBadges[idx] || { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', label: `${idx + 1}` };

                return (
                  <tr key={p.id}>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '12px',
                        background: rankInfo.bg,
                        color: rankInfo.text,
                        border: `1px solid ${rankInfo.border}`,
                        fontSize: '0.8rem',
                        fontWeight: 800
                      }}>
                        {rankInfo.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.8rem', flexShrink: 0 }}>
                          {p.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-main)' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Grade: <strong style={{ color: p.latestGrade !== 'N/A' ? '#16a34a' : 'var(--text-muted)' }}>{p.latestGrade}</strong>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.875rem', color: '#475569' }}>
                        #{p.chestNo}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: p.team?.color || 'var(--text-main)', fontSize: '0.85rem' }}>
                        <span>{p.team?.icon || '🚩'}</span>
                        <span>{p.team?.name || 'Unassigned'}</span>
                      </span>
                    </td>
                    <td>
                      <span className="status-pill" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                        {p.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {p.evaluatedCount} {p.evaluatedCount === 1 ? 'Event' : 'Events'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {p.totalScore} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>pts</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TEAM POINTS & CHAMPIONSHIP OVERVIEW */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
              Team Championship Standings & Points
            </h3>
            <p className="hide-on-mobile" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Cumulative team points calculated from evaluated competitions
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => onNavigate('reports')}>
            Reports & Results <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="grid-responsive-sm">
          {sortedTeams.map((team, idx) => (
            <div
              key={team.id}
              className="team-standing-card"
              style={{
                background: team.bgLight,
                border: `1px solid ${team.color}30`,
                borderRadius: 'var(--radius-sm)',
                padding: '1.15rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div className="team-standing-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{team.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {team.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {team.campus} Campus
                  </div>
                </div>
              </div>

              <div className="team-standing-right" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: team.color }}>
                  {team.points} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>pts</span>
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  Rank #{idx + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

