import React from 'react';
import { Trophy, Award, Flame, Users, Calendar, CheckCircle2, TrendingUp, Star, Crown, Zap, ArrowUpRight } from 'lucide-react';

export default function Dashboard({ teams, participants, programs, markEntries, onNavigate }) {
  // 1. Calculate Team Points Tally
  const teamStats = teams.map((team) => {
    // Get all participants of this team
    const teamParticipants = participants.filter((p) => p.teamId === team.id);
    const teamPartIds = new Set(teamParticipants.map((p) => p.id));

    // Get all mark entries for this team's participants
    const teamMarks = markEntries.filter((me) => teamPartIds.has(me.participantId));

    // Calculate total points
    const totalPoints = teamMarks.reduce((acc, curr) => acc + (curr.teamPoints || 0), 0);

    // Count positions
    const goldCount = teamMarks.filter((me) => me.position === 1).length;
    const silverCount = teamMarks.filter((me) => me.position === 2).length;
    const bronzeCount = teamMarks.filter((me) => me.position === 3).length;

    // Find top scorer in team
    let maxParticipantScore = 0;
    let topScorerName = 'N/A';
    teamParticipants.forEach((p) => {
      const pMarks = markEntries.filter((me) => me.participantId === p.id);
      const pTotalPoints = pMarks.reduce((acc, me) => acc + (me.teamPoints || 0), 0);
      if (pTotalPoints > maxParticipantScore) {
        maxParticipantScore = pTotalPoints;
        topScorerName = p.name;
      }
    });

    return {
      ...team,
      totalPoints,
      goldCount,
      silverCount,
      bronzeCount,
      memberCount: teamParticipants.length,
      topScorerName,
    };
  });

  // Sort teams by total points descending
  const sortedTeams = [...teamStats].sort((a, b) => b.totalPoints - a.totalPoints);
  const maxTeamPoints = Math.max(...sortedTeams.map((t) => t.totalPoints), 1);

  // 2. Calculate Top Score & Performers
  // Find highest single program mark entry
  const highestMarkEntry = [...markEntries].sort((a, b) => b.totalScore - a.totalScore)[0];
  let topOverallScorer = null;
  let topProgram = null;
  let topTeam = null;

  if (highestMarkEntry) {
    topOverallScorer = participants.find((p) => p.id === highestMarkEntry.participantId);
    topProgram = programs.find((prg) => prg.id === highestMarkEntry.programId);
    topTeam = teams.find((t) => t.id === topOverallScorer?.teamId);
  }

  // Calculate Top Performers List (Total accumulated points per student)
  const participantPerformances = participants.map((p) => {
    const pMarks = markEntries.filter((me) => me.participantId === p.id);
    const totalPoints = pMarks.reduce((acc, me) => acc + (me.teamPoints || 0), 0);
    const avgScore = pMarks.length > 0
      ? (pMarks.reduce((acc, me) => acc + me.totalScore, 0) / pMarks.length).toFixed(1)
      : 0;
    const pTeam = teams.find((t) => t.id === p.teamId);
    return {
      ...p,
      team: pTeam,
      totalPoints,
      avgScore,
      entriesCount: pMarks.length,
    };
  });

  const sortedParticipants = [...participantPerformances]
    .filter((p) => p.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints || b.avgScore - a.avgScore);

  const topScorerSenior = sortedParticipants.find((p) => p.category === 'Senior');
  const topScorerJunior = sortedParticipants.find((p) => p.category === 'Junior');
  const topScorerSubJunior = sortedParticipants.find((p) => p.category === 'Sub-Junior');

  // Overview Metrics
  const totalParticipantsCount = participants.length;
  const completedProgramsCount = programs.filter((p) => p.status === 'Published').length;
  const evaluatedEntriesCount = markEntries.length;
  const grandTotalPoints = sortedTeams.reduce((acc, t) => acc + t.totalPoints, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner Overview Header */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '2rem',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }}>
              <Zap size={14} /> Admin Overview
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>Eduvanza Live Championship Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.95rem' }}>
            Real-time team standings, top scorers tally, mark entries & event analytics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('mark-entry')}>
            <Award size={18} /> Enter Marks
          </button>
          <button className="btn btn-cyan" onClick={() => onNavigate('result')}>
            <Trophy size={18} /> View Results
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-responsive-sm">
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <Users size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Total Participants
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalParticipantsCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <TrendingUp size={12} /> Registered across 4 teams
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
            <Calendar size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Completed Events
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {completedProgramsCount} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {programs.length}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
              {programs.length - completedProgramsCount} in progress/draft
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Evaluated Sheets
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{evaluatedEntriesCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Verified by Judges</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
            <Trophy size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Grand Total Points
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>{grandTotalPoints} pts</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Leader: {sortedTeams[0]?.name}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: 1. Team Points Leaderboard & 2. Top Score Highlights */}
      <div className="grid-responsive-lg">
        {/* SECTION 1: TEAM POINTS STANDINGS */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                <Trophy size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Team Points Leaderboard</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current ranking by team scores</div>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('result')}>
              Full Results <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {sortedTeams.map((team, idx) => {
              const percentage = Math.round((team.totalPoints / maxTeamPoints) * 100);
              return (
                <div
                  key={team.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.025)',
                    border: `1px solid ${idx === 0 ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '1.15rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Background accent bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: `${percentage}%`,
                      background: team.bgSoft,
                      opacity: 0.6,
                      zIndex: 0,
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          fontSize: '1.4rem',
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: team.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }}>
                          {team.icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {team.name}
                            {idx === 0 && (
                              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: 'var(--gradient-gold)', color: '#fff', fontWeight: 800 }}>
                                👑 #1 LEAD
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                            Manager: {team.manager} • {team.memberCount} Participants
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: team.color }}>
                          {team.totalPoints} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>pts</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Top: {team.topScorerName}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: team.gradient, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                    </div>

                    {/* Medals tally pill list */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        🥇 <strong>{team.goldCount}</strong> Gold
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        🥈 <strong>{team.silverCount}</strong> Silver
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        🥉 <strong>{team.bronzeCount}</strong> Bronze
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: TOP SCORE & INDIVIDUAL CHAMPIONS */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                <Crown size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Top Scorers & Champions</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Highest performance records</div>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('participants')}>
              View Participants <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Featured Highest Single Score Card */}
          {highestMarkEntry && topOverallScorer && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '1.5rem', border: '3px solid #fbbf24', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', flexShrink: 0 }}>
                {topOverallScorer.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Flame size={14} /> HIGHEST SINGLE PROGRAM SCORE
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {topOverallScorer.name} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>(Chest #{topOverallScorer.chestNo})</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Program: <strong style={{ color: 'var(--text-main)' }}>{topProgram?.name}</strong> • Team: <strong style={{ color: topTeam?.color }}>{topTeam?.name}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right', paddingLeft: '0.5rem' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
                  {highestMarkEntry.totalScore}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/100</span>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', marginTop: '0.2rem' }}>
                  Grade {highestMarkEntry.grade} (1st Place)
                </div>
              </div>
            </div>
          )}

          {/* Category Individual Champions Cards */}
          <div className="grid-responsive-sm" style={{ gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                Senior Champ
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {topScorerSenior ? topScorerSenior.name : 'N/A'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {topScorerSenior ? `${topScorerSenior.totalPoints} pts` : '-'}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                Junior Champ
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {topScorerJunior ? topScorerJunior.name : 'N/A'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {topScorerJunior ? `${topScorerJunior.totalPoints} pts` : '-'}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                Sub-Junior Champ
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {topScorerSubJunior ? topScorerSubJunior.name : 'N/A'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {topScorerSubJunior ? `${topScorerSubJunior.totalPoints} pts` : '-'}
              </div>
            </div>
          </div>

          {/* Top 5 Scorers Table */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Overall Top Performers Leaderboard
            </div>
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Participant</th>
                    <th>Team</th>
                    <th>Category</th>
                    <th>Total Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedParticipants.slice(0, 5).map((p, idx) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 800, color: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#f97316' : 'var(--text-secondary)' }}>
                        #{idx + 1}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.75rem', flexShrink: 0 }}>
                            {p.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>{p.name}</div>
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Chest #{p.chestNo}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: p.team?.color }}>
                          {p.team?.icon} {p.team?.code}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${p.category.toLowerCase().replace('-', '')}`}>
                          {p.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>
                        {p.totalPoints} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
