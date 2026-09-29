import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Local storage helper fallback keys
const STORAGE_KEYS = {
  teams: 'eduvenza_teams',
  managers: 'eduvenza_managers',
  participants: 'eduvenza_participants',
  programs: 'eduvenza_programs',
  activities: 'eduvenza_activities',
  markEntries: 'eduvenza_mark_entries',
  profiles: 'eduvenza_profiles',
  announcements: 'eduvenza_announcements',
};

// Helper: load from localStorage
const getLocal = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return [];
  }
};

// Helper: save to localStorage
const setLocal = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
};

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
});

const mapProgramToDB = (prg) => ({
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
});

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
});

const mapMarkEntryToDB = (me) => ({
  id: me.id,
  program_id: me.programId,
  participant_id: me.participantId,
  scores: me.scores,
  total_score: me.totalScore,
  grade: me.grade,
  position: me.position,
  grade_points: me.gradePoints,
  position_points: me.positionPoints,
  team_points: me.teamPoints,
  entered_at: me.enteredAt,
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

// --- SERVICE METHODS ---

export const dbService = {
  // --- PROFILES ---
  async fetchProfiles() {
    const local = getLocal(STORAGE_KEYS.profiles);
    let remote = [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) {
        remote = data.map(mapProfileToJS);
      } else if (error) {
        console.error('Supabase fetchProfiles error:', error);
      }
    }

    const map = new Map();
    local.forEach((p) => {
      const key = p.username || p.id;
      if (key) map.set(key, p);
    });
    remote.forEach((p) => {
      const key = p.username || p.id;
      if (key) {
        const existing = map.get(key) || {};
        map.set(key, { ...existing, ...p });
      }
    });

    const result = Array.from(map.values());
    if (result.length > 0) {
      setLocal(STORAGE_KEYS.profiles, result);
    }
    return result;
  },

  async fetchProfileByUsername(username) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      if (!error && data) return mapProfileToJS(data);
    }
    const localProfiles = getLocal(STORAGE_KEYS.profiles);
    return localProfiles.find((p) => p.username === username) || null;
  },

  async upsertProfile(prof) {
    const dbProfile = mapProfileToDB(prof);
    const jsProfile = mapProfileToJS(dbProfile);

    // 1. Immediately sync to LocalStorage
    const localProfiles = getLocal(STORAGE_KEYS.profiles);
    const existingIdx = localProfiles.findIndex(
      (p) => p.username === prof.username || (p.id && p.id === prof.id)
    );
    if (existingIdx >= 0) {
      localProfiles[existingIdx] = { ...localProfiles[existingIdx], ...jsProfile };
    } else {
      localProfiles.push(jsProfile);
    }
    setLocal(STORAGE_KEYS.profiles, localProfiles);

    // 2. Sync to Supabase DB
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(dbProfile, { onConflict: 'username' })
        .select();
      if (error) {
        console.error('Supabase upsertProfile error:', error);
      } else if (data && data[0]) {
        return mapProfileToJS(data[0]);
      }
    }

    return jsProfile;
  },

  // --- TEAMS ---
  async fetchTeams() {
    const local = getLocal(STORAGE_KEYS.teams);
    let remote = [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('teams').select('*');
      if (!error && data) {
        remote = data.map(mapTeamToJS);
      } else if (error) {
        console.error('Supabase fetchTeams error:', error);
      }
    }

    const map = new Map();
    local.forEach((t) => {
      if (t.id) map.set(t.id, t);
    });
    remote.forEach((t) => {
      if (t.id) {
        const existing = map.get(t.id) || {};
        map.set(t.id, { ...existing, ...t });
      }
    });

    const result = Array.from(map.values());
    if (result.length > 0) {
      setLocal(STORAGE_KEYS.teams, result);
    }
    return result;
  },

  async insertTeam(team) {
    const local = getLocal(STORAGE_KEYS.teams);
    local.push(team);
    setLocal(STORAGE_KEYS.teams, local);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('teams').insert([mapTeamToDB(team)]);
      if (error) console.error('Supabase insertTeam error:', error);
    }
  },

  async updateTeam(team) {
    const local = getLocal(STORAGE_KEYS.teams);
    const idx = local.findIndex((t) => t.id === team.id);
    if (idx >= 0) local[idx] = { ...local[idx], ...team };
    setLocal(STORAGE_KEYS.teams, local);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('teams').update(mapTeamToDB(team)).eq('id', team.id);
      if (error) console.error('Supabase updateTeam error:', error);
    }
  },

  async deleteTeam(id) {
    const local = getLocal(STORAGE_KEYS.teams);
    const filtered = local.filter((t) => t.id !== id);
    setLocal(STORAGE_KEYS.teams, filtered);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('teams').delete().eq('id', id);
      if (error) console.error('Supabase deleteTeam error:', error);
    }
  },

  // --- MANAGERS ---
  async fetchManagers() {
    const local = getLocal(STORAGE_KEYS.managers);
    let remote = [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('managers').select('*');
      if (!error && data) {
        remote = data.map(mapManagerToJS);
      } else if (error) {
        console.error('Supabase fetchManagers error:', error);
      }
    }

    const map = new Map();
    local.forEach((m) => {
      const key = m.id || m.username;
      if (key) map.set(key, m);
    });
    remote.forEach((m) => {
      const key = m.id || m.username;
      if (key) {
        const existing = map.get(key) || {};
        map.set(key, { ...existing, ...m });
      }
    });

    const result = Array.from(map.values());
    if (result.length > 0) {
      setLocal(STORAGE_KEYS.managers, result);
    }
    return result;
  },

  async insertManager(mgr) {
    // 1. Save to LocalStorage immediately
    const local = getLocal(STORAGE_KEYS.managers);
    const existingIdx = local.findIndex(
      (m) => m.id === mgr.id || (m.username && m.username === mgr.username)
    );
    if (existingIdx >= 0) {
      local[existingIdx] = { ...local[existingIdx], ...mgr };
    } else {
      local.push(mgr);
    }
    setLocal(STORAGE_KEYS.managers, local);

    // 2. Save to Supabase DB
    if (isSupabaseConfigured) {
      const dbMgr = mapManagerToDB(mgr);
      let payload = { ...dbMgr };

      let { data, error } = await supabase
        .from('managers')
        .upsert([payload], { onConflict: 'id' })
        .select();

      // Fallback 1: If remote schema cache doesn't have 'password' column (PGRST204)
      if (error && (error.code === 'PGRST204' || (error.message && error.message.includes('password')))) {
        console.warn("Supabase 'managers' table missing 'password' column, retrying without password column...");
        delete payload.password;
        const res = await supabase
          .from('managers')
          .upsert([payload], { onConflict: 'id' })
          .select();
        error = res.error;
        data = res.data;
      }

      // Fallback 2: If team_id foreign key constraint fails (23503)
      if (error && error.code === '23503') {
        console.warn('Team foreign key missing in Supabase. Upserting manager with team_id=null');
        payload.team_id = null;
        delete payload.password;
        const res = await supabase
          .from('managers')
          .upsert([payload], { onConflict: 'id' })
          .select();
        error = res.error;
        data = res.data;
      }

      if (error) {
        console.error('Supabase insertManager error:', error);
      } else {
        console.log('Manager saved to Supabase successfully:', data);
      }
    }
  },

  async updateManager(mgr) {
    const local = getLocal(STORAGE_KEYS.managers);
    const idx = local.findIndex((m) => m.id === mgr.id || m.username === mgr.username);
    if (idx >= 0) {
      local[idx] = { ...local[idx], ...mgr };
    } else {
      local.push(mgr);
    }
    setLocal(STORAGE_KEYS.managers, local);

    if (isSupabaseConfigured) {
      const dbMgr = mapManagerToDB(mgr);
      let payload = { ...dbMgr };

      let { data, error } = await supabase
        .from('managers')
        .upsert([payload], { onConflict: 'id' })
        .select();

      if (error && (error.code === 'PGRST204' || (error.message && error.message.includes('password')))) {
        delete payload.password;
        const res = await supabase
          .from('managers')
          .upsert([payload], { onConflict: 'id' })
          .select();
        error = res.error;
        data = res.data;
      }

      if (error && error.code === '23503') {
        payload.team_id = null;
        delete payload.password;
        const res = await supabase
          .from('managers')
          .upsert([payload], { onConflict: 'id' })
          .select();
        error = res.error;
        data = res.data;
      }

      if (error) {
        console.error('Supabase updateManager error:', error);
      } else {
        console.log('Manager updated in Supabase successfully:', data);
      }
    }
  },

  async deleteManager(id) {
    const local = getLocal(STORAGE_KEYS.managers);
    const filtered = local.filter((m) => m.id !== id && m.username !== id);
    setLocal(STORAGE_KEYS.managers, filtered);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('managers').delete().eq('id', id);
      if (error) console.error('Supabase deleteManager error:', error);
    }
  },

  // --- PARTICIPANTS ---
  async fetchParticipants() {
    const local = getLocal(STORAGE_KEYS.participants);
    let remote = [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('participants').select('*');
      if (!error && data) {
        remote = data.map(mapParticipantToJS);
      } else if (error) {
        console.error('Supabase fetchParticipants error:', error);
      }
    }

    const map = new Map();
    local.forEach((p) => {
      const key = p.id || p.chestNo;
      if (key) map.set(key, p);
    });
    remote.forEach((p) => {
      const key = p.id || p.chestNo;
      if (key) {
        const existing = map.get(key) || {};
        map.set(key, { ...existing, ...p });
      }
    });

    const result = Array.from(map.values());
    if (result.length > 0) {
      setLocal(STORAGE_KEYS.participants, result);
    }
    return result;
  },

  async insertParticipant(p) {
    const local = getLocal(STORAGE_KEYS.participants);
    const existingIdx = local.findIndex((item) => item.id === p.id);
    if (existingIdx >= 0) {
      local[existingIdx] = { ...local[existingIdx], ...p };
    } else {
      local.push(p);
    }
    setLocal(STORAGE_KEYS.participants, local);

    if (isSupabaseConfigured) {
      const dbP = mapParticipantToDB(p);
      let payload = { ...dbP };

      let { data, error } = await supabase
        .from('participants')
        .upsert([payload], { onConflict: 'id' })
        .select();

      if (error && error.code === '23503') {
        console.warn('Team foreign key missing in Supabase. Upserting participant with team_id=null');
        payload.team_id = null;
        const res = await supabase
          .from('participants')
          .upsert([payload], { onConflict: 'id' })
          .select();
        error = res.error;
        data = res.data;
      }

      if (error) {
        console.error('Supabase insertParticipant error:', error);
      } else {
        console.log('Participant saved to Supabase successfully:', data);
      }
    }
  },

  async updateParticipant(p) {
    const local = getLocal(STORAGE_KEYS.participants);
    const idx = local.findIndex((item) => item.id === p.id);
    if (idx >= 0) {
      local[idx] = { ...local[idx], ...p };
    } else {
      local.push(p);
    }
    setLocal(STORAGE_KEYS.participants, local);

    if (isSupabaseConfigured) {
      const dbP = mapParticipantToDB(p);
      let payload = { ...dbP };

      let { data, error } = await supabase
        .from('participants')
        .upsert([payload], { onConflict: 'id' })
        .select();

      if (error && error.code === '23503') {
        payload.team_id = null;
        const res = await supabase
          .from('participants')
          .upsert([payload], { onConflict: 'id' })
          .select();
        error = res.error;
        data = res.data;
      }

      if (error) {
        console.error('Supabase updateParticipant error:', error);
      } else {
        console.log('Participant updated in Supabase successfully:', data);
      }
    }
  },

  async deleteParticipant(id) {
    const local = getLocal(STORAGE_KEYS.participants);
    const filtered = local.filter((p) => p.id !== id);
    setLocal(STORAGE_KEYS.participants, filtered);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('participants').delete().eq('id', id);
      if (error) console.error('Supabase deleteParticipant error:', error);
    }
  },

  // --- PROGRAMS / COMPETITIONS ---
  async fetchPrograms() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('programs').select('*');
      if (!error && data) return data.map(mapProgramToJS);
      console.error('Supabase fetchPrograms error:', error);
    }
    return getLocal(STORAGE_KEYS.programs);
  },

  async insertProgram(prg) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('programs').insert([mapProgramToDB(prg)]);
      if (error) console.error('Supabase insertProgram error:', error);
    }
  },

  async updateProgram(prg) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('programs').update(mapProgramToDB(prg)).eq('id', prg.id);
      if (error) console.error('Supabase updateProgram error:', error);
    }
  },

  async deleteProgram(id) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) console.error('Supabase deleteProgram error:', error);
    }
  },

  // --- ACTIVITIES ---
  async fetchActivities() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('activities').select('*').order('id', { ascending: false });
      if (!error && data) return data.map(mapActivityToJS);
      console.error('Supabase fetchActivities error:', error);
    }
    return getLocal(STORAGE_KEYS.activities);
  },

  async insertActivity(act) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('activities').insert([mapActivityToDB(act)]);
      if (error) console.error('Supabase insertActivity error:', error);
    }
  },

  // --- MARK ENTRIES ---
  async fetchMarkEntries() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('mark_entries').select('*');
      if (!error && data) return data.map(mapMarkEntryToJS);
      console.error('Supabase fetchMarkEntries error:', error);
    }
    return getLocal(STORAGE_KEYS.markEntries);
  },

  async upsertMarkEntry(me) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('mark_entries').upsert(mapMarkEntryToDB(me));
      if (error) console.error('Supabase upsertMarkEntry error:', error);
    }
  },

  async deleteMarkEntry(id) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('mark_entries').delete().eq('id', id);
      if (error) console.error('Supabase deleteMarkEntry error:', error);
    }
  },

  // --- ANNOUNCEMENTS ---
  async fetchAnnouncements() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (!error && data) return data.map(mapAnnouncementToJS);
      console.error('Supabase fetchAnnouncements error:', error);
    }
    return getLocal(STORAGE_KEYS.announcements);
  },

  async insertAnnouncement(ann) {
    const local = getLocal(STORAGE_KEYS.announcements);
    local.unshift(ann);
    setLocal(STORAGE_KEYS.announcements, local);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('announcements').insert([mapAnnouncementToDB(ann)]);
      if (error) console.error('Supabase insertAnnouncement error:', error);
    }
  },

  async deleteAnnouncement(id) {
    const local = getLocal(STORAGE_KEYS.announcements);
    const filtered = local.filter((a) => a.id !== id);
    setLocal(STORAGE_KEYS.announcements, filtered);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) console.error('Supabase deleteAnnouncement error:', error);
    }
  },

  saveLocalAll({ teams, managers, participants, programs, activities, markEntries, profiles, announcements }) {
    if (teams !== undefined) setLocal(STORAGE_KEYS.teams, teams);
    if (managers !== undefined) setLocal(STORAGE_KEYS.managers, managers);
    if (participants !== undefined) setLocal(STORAGE_KEYS.participants, participants);
    if (programs !== undefined) setLocal(STORAGE_KEYS.programs, programs);
    if (activities !== undefined) setLocal(STORAGE_KEYS.activities, activities);
    if (markEntries !== undefined) setLocal(STORAGE_KEYS.markEntries, markEntries);
    if (profiles !== undefined) setLocal(STORAGE_KEYS.profiles, profiles);
    if (announcements !== undefined) setLocal(STORAGE_KEYS.announcements, announcements);
  },
};
