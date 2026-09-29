import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Sparkles, Filter, Share2, CheckCircle2, ChevronRight, Crown, Medal } from 'lucide-react';

export default function Result({ teams, participants, programs, markEntries, setPrograms }) {
  // Trigger Confetti Effect
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#fbbf24', '#10b981', '#ef4444'],
    });
  };

  useEffect(() => {
    triggerConfetti();
  }, []);

  // 1. Calculate Team Standings
  const teamStandings = teams.map((team) => {
    const teamPartIds = new Set(participants.filter((p) => p.teamId === team.id).map((p) => p.id));
    const teamMarks = markEntries.filter((me) => teamPartIds.has(me.participantId));
    const totalPoints = teamMarks.reduce((acc, me) => acc + (me.teamPoints || 0), 0);
    const gold = teamMarks.filter((me) => me.position === 1).length;
    const silver = teamMarks.filter((me) => me.position === 2).length;
    const bronze = teamMarks.filter((me) => me.position === 3).length;

    return {
      ...team,
      totalPoints,
      gold,
      silver,
      bronze,
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner / Celebration Header */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
        borderColor: 'rgba(245, 158, 11, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '1.5rem 2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge" style={{ background: 'var(--gradient-gold)', color: '#fff' }}>
                <Crown size={14} /> Official Results Center
              </span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Trophy style={{ color: '#d97706' }} /> Results
            </h1>
            <p className="hide-on-mobile" style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
              Official overall team standings and medals tally.
            </p>
          </div>

          <button className="btn btn-outline-gold" onClick={triggerConfetti}>
            <Sparkles size={18} /> <span className="hide-on-mobile">Celebrate Winners</span><span className="mobile-only-inline" style={{ display: 'none' }}>Celebrate</span> 🎉
          </button>
        </div>
      </div>

      {/* SECTION 1: TEAM CHAMPIONSHIP PODIUM */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            OVERALL TEAM STANDINGS
          </span>
          <h2 style={{ fontSize: '1.75rem', marginTop: '0.2rem', color: 'var(--text-main)' }}>
            Championship Team Tally & Medals
          </h2>
        </div>

        {/* Podium Layout: 2nd Place (Left), 1st Place (Center - Elevated), 3rd Place (Right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          alignItems: 'end',
          paddingTop: '1rem'
        }}>
          {/* 2ND PLACE PODIUM */}
          {teamStandings[1] && (
            <div style={{
              background: '#ffffff',
              border: `1px solid ${teamStandings[1].color || 'var(--border-light)'}40`,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              position: 'relative'
            }}>
              <div className="medal-icon medal-silver" style={{ width: '48px', height: '48px', fontSize: '1.3rem' }}>
                2
              </div>
              <div style={{ fontSize: '2rem' }}>{teamStandings[1].icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>{teamStandings[1].name}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: teamStandings[1].color }}>
                {teamStandings[1].totalPoints} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>pts</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                🥇 {teamStandings[1].gold} Gold • 🥈 {teamStandings[1].silver} Silver • 🥉 {teamStandings[1].bronze} Bronze
              </div>
            </div>
          )}

          {/* 1ST PLACE PODIUM (CHAMPION) */}
          {teamStandings[0] && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)',
              border: '2px solid #fbbf24',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)',
              transform: 'scale(1.04)',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                position: 'absolute',
                top: '-16px',
                background: 'var(--gradient-gold)',
                color: '#fff',
                padding: '0.3rem 1rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                👑 overall champion
              </div>

              <div className="medal-icon medal-gold" style={{ width: '56px', height: '56px', fontSize: '1.5rem', marginTop: '0.5rem' }}>
                1
              </div>
              <div style={{ fontSize: '2.5rem' }}>{teamStandings[0].icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-main)' }}>{teamStandings[0].name}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
                {teamStandings[0].totalPoints} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>pts</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                🥇 {teamStandings[0].gold} Gold • 🥈 {teamStandings[0].silver} Silver • 🥉 {teamStandings[0].bronze} Bronze
              </div>
            </div>
          )}

          {/* 3RD PLACE PODIUM */}
          {teamStandings[2] && (
            <div style={{
              background: '#ffffff',
              border: `1px solid ${teamStandings[2].color || 'var(--border-light)'}40`,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div className="medal-icon medal-bronze" style={{ width: '48px', height: '48px', fontSize: '1.3rem' }}>
                3
              </div>
              <div style={{ fontSize: '2rem' }}>{teamStandings[2].icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>{teamStandings[2].name}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: teamStandings[2].color }}>
                {teamStandings[2].totalPoints} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>pts</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                🥇 {teamStandings[2].gold} Gold • 🥈 {teamStandings[2].silver} Silver • 🥉 {teamStandings[2].bronze} Bronze
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
