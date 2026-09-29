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
 * Auto-ranks all mark entries for a specific program by total score,
 * assigning 1st, 2nd, 3rd positions and re-calculating points.
 * 
 * @param {Array} markEntries - List of all mark entries in state
 * @param {string} programId - ID of program to rank
 * @param {number} memberCount - Member count for this program
 * @returns {Array} - Updated mark entries list with positions & recalculated teamPoints
 */
export function autoRankAndCalculateEntries(markEntries, programId, memberCount = 1) {
  // Extract entries for target program
  const programEntries = markEntries.filter((me) => me.programId === programId);
  const otherEntries = markEntries.filter((me) => me.programId !== programId);

  // Sort program entries by totalScore descending
  const sortedProgramEntries = [...programEntries].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

  // Determine positions & total points for each entry
  const updatedProgramEntries = sortedProgramEntries.map((entry, index) => {
    // Determine position based on rank (handling 0 score case if needed)
    let position = null;
    if (entry.totalScore > 0) {
      if (index === 0) position = 1;
      else if (index === 1) position = 2;
      else if (index === 2) position = 3;
    }

    const calculatedGrade = calculateGrade(entry.totalScore);
    const gradePts = getGradePoints(calculatedGrade, memberCount);
    const positionPts = getPositionPoints(position);
    const totalTeamPoints = gradePts + positionPts;

    return {
      ...entry,
      grade: calculatedGrade,
      position,
      gradePoints: gradePts,
      positionPoints: positionPts,
      teamPoints: totalTeamPoints,
    };
  });

  return [...otherEntries, ...updatedProgramEntries];
}
