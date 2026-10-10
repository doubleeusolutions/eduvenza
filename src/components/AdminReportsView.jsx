import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Filter,
  Search,
  Users,
  Trophy,
  Medal,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Award,
  Sparkles,
  RefreshCw,
  X,
  Layers,
  GraduationCap,
  Shield,
  Eye,
  SlidersHorizontal,
  FolderDown,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Result from './Result';

export default function AdminReportsView({
  teams = [],
  participants = [],
  programs = [],
  markEntries = [],
  managers = [],
  setPrograms,
}) {
  // View mode tab: 'teams-report' (default) | 'podium-standings'
  const [activeTab, setActiveTab] = useState('teams-report');

  // Filters State
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [searchMember, setSearchMember] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default'); // 'default' (1st, 2nd.. team) | 'points' | 'name'

  // Expanded State for each Team Section
  const [expandedTeams, setExpandedTeams] = useState(() => {
    // By default all teams are expanded
    const initial = {};
    teams.forEach((t) => {
      initial[t.id] = true;
    });
    return initial;
  });

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Helper to extract program IDs safely
  const getParticipantProgramIds = (p) => {
    if (!p || !p.programs) return [];
    if (Array.isArray(p.programs)) {
      return p.programs.map((item) => (typeof item === 'object' && item !== null ? item.id : item));
    }
    return [];
  };

  // Build Enriched Teams with their computed standings and member data
  const enrichedTeams = useMemo(() => {
    return teams.map((team, index) => {
      // Find all participants belonging to this team
      const teamParticipants = participants.filter(
        (p) => (p.teamId || p.team_id) === team.id
      );

      const teamPartIdSet = new Set(teamParticipants.map((p) => p.id));
      const teamMarks = markEntries.filter((me) =>
        teamPartIdSet.has(me.participantId || me.participant_id)
      );

      const computedTotalPoints = teamMarks.reduce(
        (acc, me) => acc + (Number(me.teamPoints || me.team_points) || 0),
        0
      );
      const gold = teamMarks.filter((me) => Number(me.position) === 1).length;
      const silver = teamMarks.filter((me) => Number(me.position) === 2).length;
      const bronze = teamMarks.filter((me) => Number(me.position) === 3).length;

      // Find matching manager
      const managerObj = managers.find(
        (m) => (m.teamId || m.team_id) === team.id || m.teamName === team.name
      );

      // Map each participant with their programs and mark details
      const enrichedMembers = teamParticipants.map((part) => {
        const progIds = getParticipantProgramIds(part);
        const memberPrograms = progIds
          .map((id) => programs.find((prg) => prg.id === id))
          .filter(Boolean);

        const memberMarks = markEntries.filter(
          (me) => (me.participantId || me.participant_id) === part.id
        );

        const memberTotalPoints = memberMarks.reduce(
          (acc, me) => acc + (Number(me.teamPoints || me.team_points) || 0),
          0
        );

        const memberPositions = memberMarks
          .map((me) => {
            const pos = Number(me.position);
            const prg = programs.find((pr) => pr.id === (me.programId || me.program_id));
            if (pos === 1) return { pos: '1st', label: '1st Place', prgName: prg?.name || 'Event' };
            if (pos === 2) return { pos: '2nd', label: '2nd Place', prgName: prg?.name || 'Event' };
            if (pos === 3) return { pos: '3rd', label: '3rd Place', prgName: prg?.name || 'Event' };
            return null;
          })
          .filter(Boolean);

        return {
          ...part,
          memberPrograms,
          memberMarks,
          memberTotalPoints,
          memberPositions,
        };
      });

      return {
        ...team,
        index: index + 1,
        managerName: managerObj?.name || team.manager || 'Assigned Manager',
        totalPoints: computedTotalPoints > 0 ? computedTotalPoints : (team.points || 0),
        gold: gold || team.gold || 0,
        silver: silver || team.silver || 0,
        bronze: bronze || team.bronze || 0,
        members: enrichedMembers,
      };
    });
  }, [teams, participants, programs, markEntries, managers]);

  // Apply Filters to Teams and Members
  const filteredTeams = useMemo(() => {
    let result = enrichedTeams.map((team) => {
      // Filter members inside the team
      const filteredMembers = team.members.filter((member) => {
        // Filter by Program
        if (selectedProgram !== 'all') {
          const progIds = getParticipantProgramIds(member);
          if (!progIds.includes(selectedProgram)) {
            return false;
          }
        }

        // Filter by Member Search Query (name or chest number)
        if (searchMember.trim()) {
          const q = searchMember.toLowerCase().trim();
          const matchName = (member.name || '').toLowerCase().includes(q);
          const matchChest = (member.chestNo || member.chest_no || '').toLowerCase().includes(q);
          if (!matchName && !matchChest) {
            return false;
          }
        }

        // Filter by Category
        if (selectedCategory !== 'all') {
          if (member.category !== selectedCategory) {
            return false;
          }
        }

        return true;
      });

      return {
        ...team,
        filteredMembers,
      };
    });

    // Filter by Team selection
    if (selectedTeam !== 'all') {
      result = result.filter((t) => t.id === selectedTeam);
    } else {
      // If a member search or program filter is active and "all" teams is selected,
      // optionally keep all teams or only teams that have matching members
      if (searchMember.trim() || selectedProgram !== 'all' || selectedCategory !== 'all') {
        result = result.filter((t) => t.filteredMembers.length > 0);
      }
    }

    // Apply Sorting
    if (sortBy === 'points') {
      result.sort((a, b) => b.totalPoints - a.totalPoints);
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [enrichedTeams, selectedTeam, selectedProgram, searchMember, selectedCategory, sortBy]);

  // Overall statistics for the report banner
  const stats = useMemo(() => {
    const totalContestants = participants.length;
    const totalCompetitions = programs.length;
    const totalAwardedPoints = markEntries.reduce(
      (acc, me) => acc + (Number(me.teamPoints || me.team_points) || 0),
      0
    );
    const visibleMembersCount = filteredTeams.reduce(
      (acc, t) => acc + (t.filteredMembers?.length || 0),
      0
    );

    return {
      totalTeams: teams.length,
      totalContestants,
      totalCompetitions,
      totalAwardedPoints,
      visibleMembersCount,
    };
  }, [teams, participants, programs, markEntries, filteredTeams]);

  // Toggle Collapse / Expand
  const toggleExpand = (teamId) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  const expandAll = () => {
    const next = {};
    teams.forEach((t) => {
      next[t.id] = true;
    });
    setExpandedTeams(next);
  };

  const collapseAll = () => {
    const next = {};
    teams.forEach((t) => {
      next[t.id] = false;
    });
    setExpandedTeams(next);
  };

  const resetAllFilters = () => {
    setSelectedTeam('all');
    setSelectedProgram('all');
    setSearchMember('');
    setSelectedCategory('all');
    setSortBy('default');
  };

  const isAnyFilterActive =
    selectedTeam !== 'all' ||
    selectedProgram !== 'all' ||
    searchMember.trim() !== '' ||
    selectedCategory !== 'all' ||
    sortBy !== 'default';

  // -------------------------------------------------------------
  // PDF EXPORT HANDLER (Using jsPDF & jspdf-autotable)
  // -------------------------------------------------------------
  const handleDownloadPDF = () => {
    setIsExportingPdf(true);
    setDownloadSuccess(false);

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // 1. Cover / Top Header Banner
      doc.setFillColor(37, 99, 235); // #2563eb
      doc.rect(0, 0, pageWidth, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('EDUVANZA FESTIVAL - OFFICIAL TEAMS & PARTICIPATION REPORT', 14, 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(
        `Generated on: ${currentDate} at ${currentTime}  |  Official Fest Record`,
        14,
        18
      );

      // Filter summary on PDF
      let filterSummary = 'Filter: All Teams';
      if (selectedTeam !== 'all') {
        const tObj = teams.find((t) => t.id === selectedTeam);
        filterSummary = `Filter Team: ${tObj?.name || selectedTeam}`;
      }
      if (selectedProgram !== 'all') {
        const pObj = programs.find((p) => p.id === selectedProgram);
        filterSummary += ` | Program: [${pObj?.code || ''}] ${pObj?.name || selectedProgram}`;
      }
      if (searchMember.trim()) {
        filterSummary += ` | Search: "${searchMember}"`;
      }
      if (selectedCategory !== 'all') {
        filterSummary += ` | Category: ${selectedCategory}`;
      }

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.text(filterSummary, pageWidth - 14, 18, { align: 'right' });

      let currentY = 32;

      // Iterate through each filtered team
      filteredTeams.forEach((team, teamIdx) => {
        // Check if we need a new page for team header
        if (currentY > pageHeight - 45) {
          doc.addPage();
          currentY = 20;
        }

        // Team Header Box
        doc.setFillColor(248, 250, 252); // #f8fafc
        doc.setDrawColor(226, 232, 240); // #e2e8f0
        doc.rect(14, currentY, pageWidth - 28, 14, 'FD');

        // Team Number & Name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42); // #0f172a
        doc.text(
          `${team.index || teamIdx + 1}. TEAM: ${team.name.toUpperCase()} (${team.campus || 'Main Campus'})`,
          18,
          currentY + 6.5
        );

        // Manager & Standings summary on right
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(
          `Manager: ${team.managerName}  |  Contestants: ${team.filteredMembers.length}  |  Gold: ${team.gold}  Silver: ${team.silver}  Bronze: ${team.bronze}  |  Total Score: ${team.totalPoints} pts`,
          18,
          currentY + 11
        );

        currentY += 17;

        // Prepare table data for this team's members
        const tableBody = team.filteredMembers.map((member, mIdx) => {
          const chestNo = member.chestNo || member.chest_no || '-';
          const name = member.name || 'Contestant';
          const cat = member.category || 'General';

          // Program list string
          const progStr =
            member.memberPrograms && member.memberPrograms.length > 0
              ? member.memberPrograms.map((pr) => `[${pr.code}] ${pr.name}`).join('\n')
              : 'No enrolled events';

          // Results string
          let resultsStr = 'Pending';
          if (member.memberPositions && member.memberPositions.length > 0) {
            resultsStr = member.memberPositions
              .map((pos) => `${pos.pos} (${pos.prgName})`)
              .join(', ');
          } else if (member.memberMarks && member.memberMarks.length > 0) {
            resultsStr = member.memberMarks
              .map((me) => `${me.grade ? `Grade ${me.grade}` : `${me.totalScore} pts`}`)
              .join(', ');
          }

          const points = member.memberTotalPoints > 0 ? `${member.memberTotalPoints} pts` : '0';

          return [
            String(mIdx + 1),
            chestNo,
            name,
            cat,
            progStr,
            resultsStr,
            points,
          ];
        });

        if (tableBody.length === 0) {
          tableBody.push(['-', '-', 'No contestants match the current filter', '-', '-', '-', '-']);
        }

        // Render table
        autoTable(doc, {
          startY: currentY,
          margin: { left: 14, right: 14 },
          head: [['#', 'Chest No', 'Contestant Name', 'Category', 'Enrolled Competitions / Programs', 'Awards / Position', 'Points']],
          body: tableBody,
          theme: 'striped',
          headStyles: {
            fillColor: [30, 41, 59], // #1e293b
            textColor: 255,
            fontSize: 8.5,
            fontStyle: 'bold',
            halign: 'left',
          },
          styles: {
            fontSize: 8,
            cellPadding: 2.5,
            textColor: [30, 41, 59],
            valign: 'middle',
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 22, fontStyle: 'bold' },
            2: { cellWidth: 46, fontStyle: 'bold' },
            3: { cellWidth: 24 },
            4: { cellWidth: 95 },
            5: { cellWidth: 45 },
            6: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
          },
          didDrawPage: (data) => {
            // Footer on each page
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(148, 163, 184);
            doc.text(
              `Eduvanza Fest Official System Record — Page ${doc.internal.getNumberOfPages()}`,
              pageWidth / 2,
              pageHeight - 8,
              { align: 'center' }
            );
          },
        });

        // Update currentY for next team
        currentY = doc.lastAutoTable.finalY + 12;
      });

      // Save PDF
      const filename = `Eduvanza_Teams_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('An error occurred while generating the PDF. Please try printing via browser.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Browser Print handler
  const handlePrint = () => {
    // Open all teams before printing so all lists print cleanly
    expandAll();
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Print-only CSS styling */}
      <style>{`
        @media print {
          .no-print, .sidebar, header, nav, button {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .glass-card, .card {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            page-break-inside: avoid;
          }
          .table-container {
            max-height: none !important;
            overflow: visible !important;
          }
          .print-header {
            display: block !important;
          }
        }
        @media screen {
          .print-header {
            display: none;
          }
        }
      `}</style>

      {/* Top Banner / Celebration & View Mode Switcher */}
      <div
        className="card no-print"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
          padding: '1.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
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
                ADMIN REPORTING SUITE
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <FileText style={{ color: '#2563eb' }} /> Fest Reports & Rosters
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.35rem 0 0', fontSize: '0.875rem' }}>
              Sequential team rosters, program participant lists, and formal PDF generation.
            </p>
          </div>

          {/* Action Buttons: PDF Download & Print */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPdf}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                border: 'none',
              }}
            >
              <Download size={18} />
              {isExportingPdf ? 'Generating PDF...' : 'Download PDF'}
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
          <button
            onClick={() => setActiveTab('teams-report')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: activeTab === 'teams-report' ? '1px solid #2563eb' : '1px solid #e2e8f0',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: activeTab === 'teams-report' ? '#2563eb' : '#f8fafc',
              color: activeTab === 'teams-report' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s',
            }}
          >
            <Users size={16} /> Teams & Contestants Roster
          </button>
          <button
            onClick={() => setActiveTab('podium-standings')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: activeTab === 'podium-standings' ? '1px solid #2563eb' : '1px solid #e2e8f0',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: activeTab === 'podium-standings' ? '#2563eb' : '#f8fafc',
              color: activeTab === 'podium-standings' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s',
            }}
          >
            <Trophy size={16} /> Championship Podium & Standings
          </button>
        </div>
      </div>

      {/* Download Success Alert */}
      {downloadSuccess && (
        <div
          className="no-print"
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '10px',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#10b981' }} />
          <span>Official PDF report has been downloaded successfully!</span>
        </div>
      )}

      {/* TAB 2: PODIUM / STANDINGS CELEBRATION VIEW */}
      {activeTab === 'podium-standings' && (
        <Result
          teams={teams}
          participants={participants}
          programs={programs}
          markEntries={markEntries}
          setPrograms={setPrograms}
        />
      )}

      {/* TAB 1: TEAMS & PARTICIPANTS COMPREHENSIVE REPORT */}
      {activeTab === 'teams-report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Metrics Bar */}
          <div
            className="no-print"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            <div className="card" style={{ padding: '1rem 1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Total Teams
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {stats.totalTeams}
              </div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Total Contestants
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
                {stats.totalContestants}
              </div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Active Programs
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0d9488', marginTop: '0.2rem' }}>
                {stats.totalCompetitions}
              </div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Total Points Awarded
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>
                {stats.totalAwardedPoints} pts
              </div>
            </div>
          </div>

          {/* FILTER CONTROLS CARD */}
          <div
            className="card no-print"
            style={{
              padding: '1.25rem 1.5rem',
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SlidersHorizontal size={18} style={{ color: '#2563eb' }} />
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Filter Reports
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  ({stats.visibleMembersCount} contestants shown)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={expandAll}
                  style={{
                    background: 'none',
                    border: '1px solid #e2e8f0',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  style={{
                    background: 'none',
                    border: '1px solid #e2e8f0',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Collapse All
                </button>
                {isAnyFilterActive && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#dc2626',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={14} /> Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Filter Input Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}
            >
              {/* 1. Filter by Team */}
              <div>
                <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Filter by Team:
                </label>
                <select
                  className="select-field"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    padding: '0 0.75rem',
                    background: '#f8fafc',
                  }}
                >
                  <option value="all">All Teams ({teams.length})</option>
                  {teams.map((t, idx) => (
                    <option key={t.id} value={t.id}>
                      {idx + 1}. {t.name} ({t.campus || 'Main Campus'})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Filter by Program */}
              <div>
                <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Filter by Program:
                </label>
                <select
                  className="select-field"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    padding: '0 0.75rem',
                    background: '#f8fafc',
                  }}
                >
                  <option value="all">All Programs ({programs.length})</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Filter by Team Member (Search) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Filter by Team Member:
                </label>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search contestant by name or chest #..."
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      paddingLeft: '2.4rem',
                      paddingRight: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.85rem',
                      background: '#f8fafc',
                      outline: 'none',
                    }}
                  />
                  {searchMember && (
                    <button
                      type="button"
                      onClick={() => setSearchMember('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* 4. Filter by Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Category Filter:
                </label>
                <select
                  className="select-field"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    padding: '0 0.75rem',
                    background: '#f8fafc',
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="Senior">Senior</option>
                  <option value="Junior">Junior</option>
                  <option value="Sub-Junior">Sub-Junior</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            {/* Active Filters Summary Badges */}
            {isAnyFilterActive && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f1f5f9',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Active Filters:</span>
                {selectedTeam !== 'all' && (
                  <span
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    Team: {teams.find((t) => t.id === selectedTeam)?.name}
                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedTeam('all')} />
                  </span>
                )}
                {selectedProgram !== 'all' && (
                  <span
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    Program: {programs.find((p) => p.id === selectedProgram)?.name}
                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedProgram('all')} />
                  </span>
                )}
                {searchMember && (
                  <span
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    Contestant: "{searchMember}"
                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSearchMember('')} />
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    Category: {selectedCategory}
                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('all')} />
                  </span>
                )}
              </div>
            )}
          </div>

          {/* TEAMS LIST (NORMAL TIME: 1st Team List, 2nd Team List... etc.) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredTeams.length === 0 ? (
              <div
                className="card"
                style={{
                  padding: '3.5rem',
                  textAlign: 'center',
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Users size={42} style={{ color: '#94a3b8', margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
                  No teams or contestants match the active filter
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1rem' }}>
                  Try resetting the team, program, or contestant search filters.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                >
                  <RefreshCw size={14} /> Reset All Filters
                </button>
              </div>
            ) : (
              filteredTeams.map((team, idx) => {
                const isExpanded = Boolean(expandedTeams[team.id]);
                const membersCount = team.filteredMembers.length;

                return (
                  <div
                    key={team.id}
                    className="card"
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Team Header Strip */}
                    <div
                      onClick={() => toggleExpand(team.id)}
                      style={{
                        padding: '1.25rem 1.5rem',
                        background: '#ffffff',
                        borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        userSelect: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                        {/* Team Sequence Number & Icon */}
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: team.bgLight || '#eff6ff',
                            color: team.color || '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.4rem',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                          }}
                        >
                          {team.icon || '🏛️'}
                        </div>

                        {/* Team Info */}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '0.725rem',
                                fontWeight: 800,
                                background: '#f1f5f9',
                                color: '#475569',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                              }}
                            >
                              Team {team.index || idx + 1}
                            </span>
                            <h3
                              style={{
                                margin: 0,
                                fontSize: '1.15rem',
                                fontWeight: 800,
                                color: 'var(--text-main)',
                              }}
                            >
                              {team.name}
                            </h3>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              ({team.campus || 'Main Campus'})
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.25rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                            <span>
                              Manager: <strong style={{ color: 'var(--text-main)' }}>{team.managerName}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Contestants: <strong style={{ color: '#2563eb' }}>{membersCount}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Standings, Medals & Expand/Collapse */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                        {/* Medals Tally */}
                        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            title="Gold Medals"
                            style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            🥇 {team.gold}
                          </span>
                          <span
                            title="Silver Medals"
                            style={{
                              background: '#f1f5f9',
                              color: '#334155',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            🥈 {team.silver}
                          </span>
                          <span
                            title="Bronze Medals"
                            style={{
                              background: '#ffedd5',
                              color: '#9a3412',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            🥉 {team.bronze}
                          </span>
                        </div>

                        {/* Total Score Badge */}
                        <div
                          style={{
                            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                            color: '#1e40af',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '8px',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            border: '1px solid #bfdbfe',
                          }}
                        >
                          {team.totalPoints} pts
                        </div>

                        {/* Chevron */}
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748b',
                          }}
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </div>

                    {/* Team Members List Content (when expanded) */}
                    {isExpanded && (
                      <div>
                        {membersCount === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                            No contestants in this team match the current program or search query.
                          </div>
                        ) : (
                          <div className="table-container" style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                              <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  <th style={{ padding: '0.75rem 1rem', width: '45px', textAlign: 'center' }}>#</th>
                                  <th style={{ padding: '0.75rem 1rem', width: '100px' }}>Chest No</th>
                                  <th style={{ padding: '0.75rem 1rem', minWidth: '160px' }}>Contestant Name</th>
                                  <th style={{ padding: '0.75rem 1rem', width: '110px' }}>Category</th>
                                  <th style={{ padding: '0.75rem 1rem', minWidth: '240px' }}>Enrolled Competitions / Programs</th>
                                  <th style={{ padding: '0.75rem 1rem', minWidth: '150px' }}>Results & Awards</th>
                                  <th style={{ padding: '0.75rem 1rem', width: '100px', textAlign: 'right' }}>Points</th>
                                </tr>
                              </thead>
                              <tbody>
                                {team.filteredMembers.map((member, mIdx) => {
                                  const isMatchedProgram =
                                    selectedProgram !== 'all' &&
                                    getParticipantProgramIds(member).includes(selectedProgram);

                                  return (
                                    <tr
                                      key={member.id}
                                      style={{
                                        borderBottom: '1px solid #f1f5f9',
                                        background: isMatchedProgram ? 'rgba(37, 99, 235, 0.03)' : '#ffffff',
                                        transition: 'background 0.15s ease',
                                      }}
                                    >
                                      {/* Sl No */}
                                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                                        {mIdx + 1}
                                      </td>

                                      {/* Chest No */}
                                      <td style={{ padding: '0.85rem 1rem' }}>
                                        <span
                                          style={{
                                            fontFamily: 'monospace',
                                            fontWeight: 700,
                                            background: '#f1f5f9',
                                            color: '#1e293b',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                          }}
                                        >
                                          {member.chestNo || member.chest_no || '-'}
                                        </span>
                                      </td>

                                      {/* Contestant Name */}
                                      <td style={{ padding: '0.85rem 1rem' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                          {member.name}
                                        </div>
                                        {member.gender && (
                                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                                            {member.gender}
                                          </div>
                                        )}
                                      </td>

                                      {/* Category */}
                                      <td style={{ padding: '0.85rem 1rem' }}>
                                        <span
                                          style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            padding: '0.15rem 0.5rem',
                                            borderRadius: '4px',
                                            background:
                                              member.category === 'Senior'
                                                ? '#ede9fe'
                                                : member.category === 'Junior'
                                                ? '#dbeafe'
                                                : '#f1f5f9',
                                            color:
                                              member.category === 'Senior'
                                                ? '#6d28d9'
                                                : member.category === 'Junior'
                                                ? '#1d4ed8'
                                                : '#475569',
                                          }}
                                        >
                                          {member.category || 'General'}
                                        </span>
                                      </td>

                                      {/* Enrolled Competitions */}
                                      <td style={{ padding: '0.85rem 1rem' }}>
                                        {member.memberPrograms && member.memberPrograms.length > 0 ? (
                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                            {member.memberPrograms.map((prg) => {
                                              const isHighlight = selectedProgram === prg.id;
                                              return (
                                                <span
                                                  key={prg.id}
                                                  style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '6px',
                                                    background: isHighlight
                                                      ? '#2563eb'
                                                      : '#f8fafc',
                                                    color: isHighlight ? '#ffffff' : '#334155',
                                                    border: `1px solid ${isHighlight ? '#2563eb' : '#e2e8f0'}`,
                                                    whiteSpace: 'nowrap',
                                                  }}
                                                >
                                                  <strong>{prg.code}</strong> {prg.name}
                                                </span>
                                              );
                                            })}
                                          </div>
                                        ) : (
                                          <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                            None assigned
                                          </span>
                                        )}
                                      </td>

                                      {/* Results & Awards */}
                                      <td style={{ padding: '0.85rem 1rem' }}>
                                        {member.memberPositions && member.memberPositions.length > 0 ? (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            {member.memberPositions.map((pos, pIdx) => (
                                              <span
                                                key={pIdx}
                                                style={{
                                                  fontSize: '0.75rem',
                                                  fontWeight: 700,
                                                  color: pos.pos === '1st' ? '#d97706' : pos.pos === '2nd' ? '#475569' : '#b45309',
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '0.3rem',
                                                }}
                                              >
                                                {pos.pos === '1st' ? '🥇' : pos.pos === '2nd' ? '🥈' : '🥉'} {pos.label} ({pos.prgName})
                                              </span>
                                            ))}
                                          </div>
                                        ) : member.memberMarks && member.memberMarks.length > 0 ? (
                                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            Evaluated ({member.memberMarks.length} item{member.memberMarks.length > 1 ? 's' : ''})
                                          </div>
                                        ) : (
                                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                            Pending
                                          </span>
                                        )}
                                      </td>

                                      {/* Points */}
                                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                        <span
                                          style={{
                                            fontWeight: 800,
                                            fontSize: '0.9rem',
                                            color: member.memberTotalPoints > 0 ? '#10b981' : '#94a3b8',
                                          }}
                                        >
                                          {member.memberTotalPoints > 0 ? `+${member.memberTotalPoints} pts` : '0 pts'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Team Footer Note */}
                        <div
                          style={{
                            padding: '0.75rem 1.25rem',
                            background: '#f8fafc',
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.785rem',
                            color: '#64748b',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          <span>
                            Showing <strong>{membersCount}</strong> member{membersCount === 1 ? '' : 's'} in {team.name}
                          </span>
                          <span>
                            Team Cumulative Score: <strong style={{ color: '#2563eb' }}>{team.totalPoints} Points</strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
