/**
 * Evaluation and Marking Rules for Eduvenza Competitions
 * 
 * Max Marks per item: 50
 * Grade System:
 * - 45 to 50 -> A+
 * - 35 to 44 -> A
 * - 30 to 34 -> B
 * - 25 to 29 -> C
 * - Below 25  -> No Grade
 * 
 * Grade-Based Points Matrix:
 * Members Count | A+ | A  | B  | C
 * 1 member      | 6  | 5  | 3  | 1
 * 2 members     | 7  | 6  | 4  | 2
 * 3 members     | 10 | 9  | 6  | 3
 * 4, 5 members  | 18 | 15 | 10 | 5
 * 
 * Position-Based Points:
 * 1st -> 5 pts
 * 2nd -> 3 pts
 * 3rd -> 1 pt
 */

export const MAX_ITEM_MARKS = 50;

/**
 * Calculates grade based on total score (out of 50)
 * @param {number} mark - Total score out of 50
 * @returns {string} - 'A+' | 'A' | 'B' | 'C' | 'No Grade'
 */
export function calculateGrade(mark) {
  const score = Number(mark) || 0;
  if (score < 25) return 'No Grade';
  if (score >= 45) return 'A+';
  if (score >= 35) return 'A';
  if (score >= 30) return 'B';
  if (score >= 25) return 'C';
  return 'No Grade';
}

/**
 * Calculates grade-based points using member count and grade
 * @param {string} grade - Grade ('A+', 'A', 'B', 'C', 'No Grade')
 * @param {number} memberCount - Number of members in item (1, 2, 3, 4, 5)
 * @returns {number} - Points awarded
 */
export function getGradePoints(grade, memberCount = 1) {
  if (!grade || grade === 'No Grade') return 0;
  
  const count = Number(memberCount) || 1;

  if (count === 1) {
    switch (grade) {
      case 'A+': return 6;
      case 'A': return 5;
      case 'B': return 3;
      case 'C': return 1;
      default: return 0;
    }
  }

  if (count === 2) {
    switch (grade) {
      case 'A+': return 7;
      case 'A': return 6;
      case 'B': return 4;
      case 'C': return 2;
      default: return 0;
    }
  }

  if (count === 3) {
    switch (grade) {
      case 'A+': return 10;
      case 'A': return 9;
      case 'B': return 6;
      case 'C': return 3;
      default: return 0;
    }
  }

  // 4 or 5 members (or more)
  if (count >= 4) {
    switch (grade) {
      case 'A+': return 18;
      case 'A': return 15;
      case 'B': return 10;
      case 'C': return 5;
      default: return 0;
    }
  }

  return 0;
}

/**
 * Calculates position-based points
 * @param {number|string|null} position - Position (1, 2, 3)
 * @returns {number} - 5 for 1st, 3 for 2nd, 1 for 3rd, 0 otherwise
 */
export function getPositionPoints(position) {
  const pos = Number(position);
  if (pos === 1) return 5;
  if (pos === 2) return 3;
  if (pos === 3) return 1;
  return 0;
}

/**
 * Groups and aggregates all mark entries for a specific program,
 * supporting multiple judges per participant by calculating the average score,
 * ranking participants by average score, and collecting the individual judge breakdown.
 *
 * @param {Array} markEntries - List of all mark entries in state
 * @param {string} programId - ID of program to aggregate
 * @param {number} memberCount - Member count for this program
 * @returns {Array} - Aggregated student results with judgeBreakdown
 */
export function getAggregatedProgramResults(markEntries, programId, memberCount = 1) {
  const programEntries = markEntries.filter((me) => me.programId === programId);
  if (programEntries.length === 0) return [];

  // Group entries by participantId
  const byParticipant = {};
  programEntries.forEach((entry) => {
    const pId = entry.participantId;
    if (!pId) return;
    if (!byParticipant[pId]) {
      byParticipant[pId] = [];
    }
    byParticipant[pId].push(entry);
  });

  // Calculate average score and judge breakdowns for each participant
  const participantAggregates = Object.entries(byParticipant).map(([participantId, entries]) => {
    const judgeBreakdown = entries.map((e) => {
      const score = Number(e.totalScore) || 0;
      return {
        id: e.id,
        judgeName: e.judgeName || 'Judge',
        mark: score,
        grade: calculateGrade(score),
        notes: e.judgeNotes || '',
        enteredAt: e.enteredAt || '',
      };
    });

    const sumScore = judgeBreakdown.reduce((sum, j) => sum + j.mark, 0);
    const avgScore = judgeBreakdown.length > 0
      ? Math.round((sumScore / judgeBreakdown.length) * 10) / 10
      : 0;

    return {
      id: entries[0].id,
      programId,
      participantId,
      judgeBreakdown,
      judgeCount: judgeBreakdown.length,
      isMultiJudge: judgeBreakdown.length > 1,
      totalScore: avgScore,
      rawScoresSum: sumScore,
      enteredAt: entries[entries.length - 1].enteredAt,
    };
  });

  // Sort by average totalScore descending
  participantAggregates.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

  // Assign ranks, grades, and points based on average score
  return participantAggregates.map((item, index) => {
    let position = null;
    let positionText = null;
    if (item.totalScore > 0) {
      if (index === 0) { position = 1; positionText = '1st'; }
      else if (index === 1) { position = 2; positionText = '2nd'; }
      else if (index === 2) { position = 3; positionText = '3rd'; }
    }

    const calculatedGrade = calculateGrade(item.totalScore);
    const gradePts = getGradePoints(calculatedGrade, memberCount);
    const positionPts = getPositionPoints(position);
    const totalTeamPoints = gradePts + positionPts;

    return {
      ...item,
      grade: calculatedGrade,
      position: positionText,
      numericPosition: position,
      gradePoints: gradePts,
      positionPoints: positionPts,
      teamPoints: totalTeamPoints,
    };
  });
}

/**
 * Auto-ranks all mark entries for a specific program by total score (or average score if multi-judge),
 * assigning 1st, 2nd, 3rd positions and re-calculating points.
 * Ensures teamPoints are not double-counted when multiple judges evaluate the same participant.
 * 
 * @param {Array} markEntries - List of all mark entries in state
 * @param {string} programId - ID of program to rank
 * @param {number} memberCount - Member count for this program
 * @returns {Array} - Updated mark entries list with positions & recalculated teamPoints
 */
export function autoRankAndCalculateEntries(markEntries, programId, memberCount = 1) {
  const aggregatedResults = getAggregatedProgramResults(markEntries, programId, memberCount);
  const aggMap = new Map();
  aggregatedResults.forEach((agg) => {
    aggMap.set(agg.participantId, agg);
  });

  const otherEntries = markEntries.filter((me) => me.programId !== programId);
  const targetProgramEntries = markEntries.filter((me) => me.programId === programId);

  // Group entries of target program by participant to mark primary vs sub-judge
  const participantSeenCount = {};
  const updatedProgramEntries = targetProgramEntries.map((entry) => {
    const agg = aggMap.get(entry.participantId);
    if (!agg) return entry;

    const count = (participantSeenCount[entry.participantId] || 0) + 1;
    participantSeenCount[entry.participantId] = count;
    const isPrimary = count === 1;

    return {
      ...entry,
      finalScore: agg.totalScore,
      position: agg.position,
      numericPosition: agg.numericPosition,
      grade: agg.grade,
      // For leaderboard point summation, award points only on primary entry to prevent multi-judge inflation:
      gradePoints: isPrimary ? agg.gradePoints : 0,
      positionPoints: isPrimary ? agg.positionPoints : 0,
      teamPoints: isPrimary ? agg.teamPoints : 0,
      isSubJudge: !isPrimary,
      judgeGrade: calculateGrade(entry.totalScore),
    };
  });

  return [...otherEntries, ...updatedProgramEntries];
}

/**
 * Returns a sequential Code Letter (A, B, C... Z, AA, AB...).
 * @param {number} index - 0-indexed position
 * @returns {string} - Code letter (e.g. 'A', 'B', 'E'...)
 */
export function getSequentialCodeLetter(index) {
  const i = Math.max(0, Number(index) || 0);
  let letter = '';
  let temp = i;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

/**
 * Resolves the Code Letter for a participant in a program.
 * Prioritizes program.codeLetters[participantId], then localStorage cache, then sequential fallback.
 * @param {Object} program - Program object
 * @param {string} participantId - Participant ID
 * @param {number} fallbackIndex - Index for default A, B, C...
 * @returns {string} - Code letter
 */
export function getParticipantCodeLetter(program, participantId, fallbackIndex = 0) {
  if (!participantId) return getSequentialCodeLetter(fallbackIndex);

  if (program?.codeLetters && typeof program.codeLetters === 'object') {
    const val = program.codeLetters[participantId];
    if (val && typeof val === 'string' && val.trim()) {
      return val.trim().toUpperCase();
    }
  }

  if (program?.id) {
    try {
      const cached = localStorage.getItem(`eduvenza_code_letters_${program.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed[participantId] && typeof parsed[participantId] === 'string' && parsed[participantId].trim()) {
          return parsed[participantId].trim().toUpperCase();
        }
      }
    } catch {
      // ignore
    }
  }

  return getSequentialCodeLetter(fallbackIndex);
}
