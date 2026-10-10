import { supabase, isSupabaseConfigured } from '../lib/supabase';

// --- DATA TRANSFORMERS ---

const mapProfileToJS = (row) => ({
  id: row.id,
  username: row.username,
  password: row.password,
  name: row.name,
  role: row.role,
  email: row.email,
  avatar: row.avatar,
  teamId: row.team_id || row.teamId,
  teamName: row.team_name || row.teamName,
  campus: row.campus,
  lastLogin: row.last_login || row.lastLogin,
  createdAt: row.created_at || row.createdAt,
});

const mapProfileToDB = (prof) => ({
  id: prof.id || `prof-${prof.username}`,
  username: prof.username,
  password: prof.password || null,
  name: prof.name,
  role: prof.role || 'Manager',
  email: prof.email || `${prof.username}@eduvenza.org`,
  avatar: prof.avatar || '',
  team_id: prof.teamId || null,
  team_name: prof.teamName || null,
  campus: prof.campus || null,
  last_login: prof.lastLogin || new Date().toISOString(),
});

const mapTeamToJS = (row) => ({
  id: row.id,
  name: row.name,
  campus: row.campus,
  code: row.code,
  color: row.color,
  bgLight: row.bg_light || row.bgLight,
  icon: row.icon,
  manager: row.manager,
  createdOn: row.created_on || row.createdOn,
  points: row.points || 0,
  gold: row.gold || 0,
  silver: row.silver || 0,
  bronze: row.bronze || 0,
});

const mapTeamToDB = (team) => ({
  id: team.id,
  name: team.name,
  campus: team.campus,
  code: team.code,
  color: team.color,
  bg_light: team.bgLight,
  icon: team.icon,
  manager: team.manager,
  created_on: team.createdOn,
  points: team.points || 0,
  gold: team.gold || 0,
  silver: team.silver || 0,
  bronze: team.bronze || 0,
});

const mapManagerToJS = (row) => ({
  id: row.id,
  name: row.name,
  username: row.username,
  password: row.password,
  teamId: row.team_id || row.teamId,
  teamName: row.team_name || row.teamName,
  campus: row.campus,
  role: row.role,
  email: row.email,
  avatar: row.avatar,
});

const mapManagerToDB = (mgr) => ({
  id: mgr.id,
  name: mgr.name,
  username: mgr.username,
  password: mgr.password || null,
  team_id: mgr.teamId,
  team_name: mgr.teamName,
  campus: mgr.campus,
  role: mgr.role,
  email: mgr.email,
  avatar: mgr.avatar,
});

const mapParticipantToJS = (row) => ({
  id: row.id,
  chestNo: row.chest_no || row.chestNo,
  name: row.name,
  teamId: row.team_id || row.teamId,
  category: row.category,
  gender: row.gender,
  email: row.email,
  programs: row.programs || [],
  status: row.status,
  avatar: row.avatar,
});

const mapParticipantToDB = (p) => ({
  id: p.id,
  chest_no: p.chestNo,
  name: p.name,
  team_id: p.teamId,
  category: p.category,
  gender: p.gender,
  email: p.email,
  programs: p.programs || [],
  status: p.status,
  avatar: p.avatar,
});

const mapProgramToJS = (row) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  category: row.category,
  type: row.type,
  memberCount: row.member_count ?? row.memberCount ?? 1,
  venue: row.venue,
  date: row.date,
  time: row.time,
  maxMarks: row.max_marks ?? row.maxMarks ?? 50,
  status: row.status,
  judge: row.judge,
  criteria: row.criteria || [{ name: 'Earned Mark', max: 50 }],
  codeLetters: row.code_letters || row.codeLetters || {},
});

const mapProgramToDB = (prg) => {
  const payload = {
    id: prg.id,
    code: prg.code,
    name: prg.name,
    category: prg.category,
    type: prg.type,
    member_count: prg.memberCount,
    venue: prg.venue,
    date: prg.date,
    time: prg.time,
    max_marks: prg.maxMarks,
    status: prg.status,
    judge: prg.judge,
    criteria: prg.criteria,
  };
  if (prg.codeLetters !== undefined) {
    payload.code_letters = prg.codeLetters;
  }
  return payload;
};

const mapActivityToJS = (row) => ({
  id: row.id,
  title: row.title,
  subtitle: row.subtitle,
  time: row.time,
  color: row.color,
  icon: row.icon,
});

const mapActivityToDB = (act) => ({
  id: act.id,
  title: act.title,
  subtitle: act.subtitle,
  time: act.time,
  color: act.color,
  icon: act.icon,
});

const mapMarkEntryToJS = (row) => ({
  id: row.id,
  programId: row.program_id || row.programId,
  participantId: row.participant_id || row.participantId,
  scores: row.scores || {},
  totalScore: row.total_score ?? row.totalScore ?? 0,
  grade: row.grade,
  position: row.position,
  gradePoints: row.grade_points ?? row.gradePoints ?? 0,
  positionPoints: row.position_points ?? row.positionPoints ?? 0,
  teamPoints: row.team_points ?? row.teamPoints ?? 0,
  enteredAt: row.entered_at || row.enteredAt,
  judgeName: row.judge_name || row.judgeName,
  judgeNotes: row.judge_notes || row.judgeNotes,
  codeLetter: row.code_letter || row.codeLetter || row.scores?.codeLetter || '',
});

const mapMarkEntryToDB = (me) => ({
  id: me.id,
  program_id: me.programId,
  participant_id: me.participantId,
  scores: {
    ...(me.scores || {}),
    codeLetter: me.codeLetter || me.scores?.codeLetter || '',
  },
  total_score: me.totalScore,
  grade: me.grade,
  position: me.position,
  grade_points: me.gradePoints,
  position_points: me.positionPoints,
  team_points: me.teamPoints,
  entered_at: me.enteredAt,
  judge_name: me.judgeName,
  judge_notes: me.judgeNotes,
});

const mapAnnouncementToJS = (row) => ({
  id: row.id,
  title: row.title,
  content: row.content,
  date: row.date,
  time: row.time,
  author: row.author,
});

const mapAnnouncementToDB = (ann) => ({
  id: ann.id,
  title: ann.title,
  content: ann.content,
  date: ann.date,
  time: ann.time,
  author: ann.author,
});

const mapJudgeToJS = (row) => ({
  id: row.id,
  name: row.name,
  username: row.username,
  password: row.password,
  email: row.email || `${row.username}@eduvenza.com`,
  phone: row.phone || '',
  specialization: row.specialization || 'General Competitions',
  role: 'Judge',
  avatar: row.avatar || '',
  status: row.status || 'Active',
  assignedPrograms: Array.isArray(row.assigned_programs)
    ? row.assigned_programs
    : Array.isArray(row.assignedPrograms)
    ? row.assignedPrograms
    : [],
  createdOn: row.created_at || row.createdOn || new Date().toISOString().split('T')[0],
});

const mapJudgeToDB = (j) => ({
  id: j.id,
  name: j.name,
  username: j.username,
  password: j.password,
  email: j.email,
  phone: j.phone,
  specialization: j.specialization,
  role: 'Judge',
  avatar: j.avatar,
  status: j.status || 'Active',
  assigned_programs: j.assignedPrograms || [],
});

// --- SERVICE METHODS (Supabase only — no localStorage) ---

export const dbService = {

  // --- PROFILES ---
  async fetchProfiles() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) { console.error('fetchProfiles error:', error); return []; }
    return data.map(mapProfileToJS);
  },

  async fetchProfileByUsername(username) {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('profiles').select('*').eq('username', username).single();
    if (error) return null;
    return mapProfileToJS(data);
  },

  async upsertProfile(prof) {
    if (!isSupabaseConfigured) return mapProfileToJS(mapProfileToDB(prof));
    const dbProfile = mapProfileToDB(prof);
    const { data, error } = await supabase
      .from('profiles').upsert(dbProfile, { onConflict: 'username' }).select();
    if (error) { console.error('upsertProfile error:', error); }
    return data?.[0] ? mapProfileToJS(data[0]) : mapProfileToJS(dbProfile);
  },

  // --- TEAMS ---
  async fetchTeams() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('teams').select('*');
    if (error) { console.error('fetchTeams error:', error); return []; }
    return data.map(mapTeamToJS);
  },

  async insertTeam(team) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('teams').insert([mapTeamToDB(team)]);
    if (error) console.error('insertTeam error:', error);
  },

  async updateTeam(team) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('teams').update(mapTeamToDB(team)).eq('id', team.id);
    if (error) console.error('updateTeam error:', error);
  },

  async deleteTeam(id) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) console.error('deleteTeam error:', error);
  },

  // --- MANAGERS ---
  async fetchManagers() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('managers').select('*');
    if (error) { console.error('fetchManagers error:', error); return []; }
    return data.map(mapManagerToJS);
  },

  async insertManager(mgr) {
    if (!isSupabaseConfigured) return;
    const payload = mapManagerToDB(mgr);
    let { error } = await supabase.from('managers').upsert([payload], { onConflict: 'id' });

    if (error && (error.code === 'PGRST204' || error.message?.includes('password'))) {
      const { password, ...safe } = payload;
      const res = await supabase.from('managers').upsert([safe], { onConflict: 'id' });
      error = res.error;
    }
    if (error && error.code === '23503') {
      const { password, ...safe } = payload;
      safe.team_id = null;
      const res = await supabase.from('managers').upsert([safe], { onConflict: 'id' });
      error = res.error;
    }
    if (error) console.error('insertManager error:', error);
  },

  async updateManager(mgr) {
    if (!isSupabaseConfigured) return;
    const payload = mapManagerToDB(mgr);
    let { error } = await supabase.from('managers').upsert([payload], { onConflict: 'id' });

    if (error && (error.code === 'PGRST204' || error.message?.includes('password'))) {
      const { password, ...safe } = payload;
      const res = await supabase.from('managers').upsert([safe], { onConflict: 'id' });
      error = res.error;
    }
    if (error) console.error('updateManager error:', error);
  },

  async deleteManager(id) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('managers').delete().eq('id', id);
    if (error) console.error('deleteManager error:', error);
  },

  // --- PARTICIPANTS ---
  async fetchParticipants() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('participants').select('*');
    if (error) { console.error('fetchParticipants error:', error); return []; }
    return data.map(mapParticipantToJS);
  },

  async insertParticipant(p) {
    if (!isSupabaseConfigured) return;
    const payload = mapParticipantToDB(p);
    let { error } = await supabase.from('participants').upsert([payload], { onConflict: 'id' });
    if (error && error.code === '23503') {
      payload.team_id = null;
      const res = await supabase.from('participants').upsert([payload], { onConflict: 'id' });
      error = res.error;
    }
    if (error) console.error('insertParticipant error:', error);
  },

  async updateParticipant(p) {
    if (!isSupabaseConfigured) return;
    const payload = mapParticipantToDB(p);
    let { error } = await supabase.from('participants').upsert([payload], { onConflict: 'id' });
    if (error && error.code === '23503') {
      payload.team_id = null;
      const res = await supabase.from('participants').upsert([payload], { onConflict: 'id' });
      error = res.error;
    }
    if (error) console.error('updateParticipant error:', error);
  },

  async deleteParticipant(id) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('participants').delete().eq('id', id);
    if (error) console.error('deleteParticipant error:', error);
  },

  // --- PROGRAMS ---
  async fetchPrograms() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('programs').select('*');
    if (error) { console.error('fetchPrograms error:', error); return []; }
    return data.map(mapProgramToJS);
  },

  async insertProgram(prg) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('programs').insert([mapProgramToDB(prg)]);
    if (error) console.error('insertProgram error:', error);
  },

  async updateProgram(prg) {
    if (!isSupabaseConfigured) return;
    const payload = mapProgramToDB(prg);
    let { error } = await supabase.from('programs').update(payload).eq('id', prg.id);
    if (error && (error.code === 'PGRST204' || error.message?.includes('code_letters'))) {
      const { code_letters, ...safe } = payload;
      const res = await supabase.from('programs').update(safe).eq('id', prg.id);
      error = res.error;
    }
    if (error) console.error('updateProgram error:', error);
  },

  async deleteProgram(id) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('programs').delete().eq('id', id);
    if (error) console.error('deleteProgram error:', error);
  },

  // --- ACTIVITIES ---
  async fetchActivities() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('activities').select('*').order('id', { ascending: false });
    if (error) { console.error('fetchActivities error:', error); return []; }
    return data.map(mapActivityToJS);
  },

  async insertActivity(act) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('activities').insert([mapActivityToDB(act)]);
    if (error) console.error('insertActivity error:', error);
  },

  // --- MARK ENTRIES ---
  async fetchMarkEntries() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('mark_entries').select('*');
    if (error) { console.error('fetchMarkEntries error:', error); return []; }
    return data.map(mapMarkEntryToJS);
  },

  async upsertMarkEntry(me) {
    if (!isSupabaseConfigured) return;
    const dbEntry = mapMarkEntryToDB(me);
    let { error } = await supabase.from('mark_entries').upsert(dbEntry, { onConflict: 'id' });

    // Fallback if judge_name/judge_notes columns don't exist yet — run supabase_update.sql!
    if (error && (error.code === 'PGRST204' ||
      error.message?.includes('judge_name') || error.message?.includes('judge_notes'))) {
      console.warn('judge_name/judge_notes columns missing — run supabase_update.sql');
      const { judge_name, judge_notes, ...safe } = dbEntry;
      const res = await supabase.from('mark_entries').upsert(safe, { onConflict: 'id' });
      error = res.error;
    }

    if (error) {
      console.error('upsertMarkEntry error:', error);
    } else {
      console.log('✅ Mark entry saved → Supabase | ID:', me.id, '| Judge:', me.judgeName);
    }
  },

  async deleteMarkEntry(id) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('mark_entries').delete().eq('id', id);
    if (error) console.error('deleteMarkEntry error:', error);
  },

  // --- ANNOUNCEMENTS ---
  async fetchAnnouncements() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('announcements').select('*').order('created_at', { ascending: false });
    if (error) { console.error('fetchAnnouncements error:', error); return []; }
    return data.map(mapAnnouncementToJS);
  },

  async insertAnnouncement(ann) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('announcements').insert([mapAnnouncementToDB(ann)]);
    if (error) console.error('insertAnnouncement error:', error);
  },

  async deleteAnnouncement(id) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) console.error('deleteAnnouncement error:', error);
  },

  // --- JUDGES ---
  async fetchJudges() {
    if (!isSupabaseConfigured) return [];

    // Primary: judges table
    const { data, error } = await supabase.from('judges').select('*');
    if (!error && data && data.length > 0) return data.map(mapJudgeToJS);

    // Fallback: profiles table with role = 'Judge'
    const { data: profData } = await supabase.from('profiles').select('*').eq('role', 'Judge');
    if (profData && profData.length > 0) {
      return profData.map((p) => ({
        id: p.id,
        name: p.name,
        username: p.username,
        password: p.password,
        email: p.email || p.username,
        phone: p.phone || '',
        specialization: p.specialization || 'General Competitions',
        role: 'Judge',
        status: 'Active',
        avatar: p.avatar || '',
        assignedPrograms: [],
        createdOn: p.created_at || new Date().toISOString().split('T')[0],
      }));
    }
    return [];
  },

  async insertJudge(judge) {
    // Sync to profiles for login
    await this.upsertProfile({
      id: judge.id,
      username: judge.username,
      password: judge.password,
      name: judge.name,
      role: 'Judge',
      email: judge.email,
    });

    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('judges').insert([mapJudgeToDB(judge)]);
      if (error) console.warn('insertJudge error:', error);
    } catch (e) {
      console.warn('insertJudge exception:', e);
    }
  },

  async updateJudge(judge) {
    // Sync to profiles
    await this.upsertProfile({
      id: judge.id,
      username: judge.username,
      password: judge.password,
      name: judge.name,
      role: 'Judge',
      email: judge.email,
    });

    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('judges').update(mapJudgeToDB(judge)).eq('id', judge.id);
    } catch (e) {
      console.warn('updateJudge error:', e);
    }
  },

  async deleteJudge(id) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('judges').delete().eq('id', id);
      await supabase.from('profiles').delete().eq('id', id);
    } catch (e) {
      console.warn('deleteJudge error:', e);
    }
  },
};
