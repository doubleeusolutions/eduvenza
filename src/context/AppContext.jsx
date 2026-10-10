import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

const AppContext = createContext();

const getInitialAuth = () => {
  try {
    const raw = localStorage.getItem('eduvenza_auth_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user) {
        if (parsed.role === 'Team Manager') parsed.role = 'Manager';
        if (parsed.user.role === 'Team Manager') parsed.user.role = 'Manager';
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved auth session:', e);
  }
  return null;
};

export function AppProvider({ children }) {
  // Authentication State
  const initialSession = getInitialAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialSession));
  const [userRole, setUserRole] = useState(initialSession?.role || 'Admin');
  const [currentUser, setCurrentUser] = useState(initialSession?.user || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  // Data Store
  const [teams, setTeams] = useState([]);
  const [managers, setManagers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [activities, setActivities] = useState([]);
  const [markEntries, setMarkEntries] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [judges, setJudges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Clear any stale localStorage data keys — all data now lives in Supabase only
  useEffect(() => {
    const dataKeys = [
      'eduvenza_teams', 'eduvenza_managers', 'eduvenza_participants',
      'eduvenza_programs', 'eduvenza_activities', 'eduvenza_mark_entries',
      'eduvenza_profiles', 'eduvenza_announcements', 'eduvenza_judges',
    ];
    dataKeys.forEach((k) => localStorage.removeItem(k));
  }, []);

  // Load Initial Data from Database / Storage on Mount
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const [
          fetchedTeams,
          fetchedManagers,
          fetchedParticipants,
          fetchedPrograms,
          fetchedActivities,
          fetchedMarkEntries,
          fetchedProfiles,
          fetchedAnnouncements,
          fetchedJudges,
        ] = await Promise.all([
          dbService.fetchTeams(),
          dbService.fetchManagers(),
          dbService.fetchParticipants(),
          dbService.fetchPrograms(),
          dbService.fetchActivities(),
          dbService.fetchMarkEntries(),
          dbService.fetchProfiles(),
          dbService.fetchAnnouncements(),
          dbService.fetchJudges(),
        ]);

        setTeams(fetchedTeams);
        setManagers(fetchedManagers);
        setParticipants(fetchedParticipants);
        setPrograms(fetchedPrograms);
        setActivities(fetchedActivities);
        setMarkEntries(fetchedMarkEntries);
        setProfiles(fetchedProfiles);

        if (fetchedJudges && fetchedJudges.length > 0) {
          setJudges(fetchedJudges);
        } else {
          const defaultJudge = {
            id: 'judge-default',
            name: 'Official Fest Judge',
            username: 'Eduvanza.juges@gmail.in',
            email: 'Eduvanza.juges@gmail.in',
            password: 'judges@#345',
            phone: '+91 9876543210',
            specialization: 'General Competitions',
            status: 'Active',
            role: 'Judge',
            avatar: '',
            assignedPrograms: [],
            createdOn: new Date().toISOString().split('T')[0],
          };
          setJudges([defaultJudge]);
          dbService.insertJudge(defaultJudge);
        }
        if (fetchedAnnouncements && fetchedAnnouncements.length > 0) {
          setAnnouncements(fetchedAnnouncements);
        } else {
          // Default announcement if empty
          setAnnouncements([
            {
              id: 'ann-1',
              title: 'Welcome to Eduvanza Fest 2026',
              content: 'We are thrilled to begin the inter-college fest! Please ensure all participants arrive at their venues 15 minutes prior to the scheduled time.',
              date: 'Oct 05, 2026',
              time: '09:00 AM',
              author: 'Admin'
            }
          ]);
        }
      } catch (err) {
        console.error('Error loading data from database:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);



  // Manager's assigned team helper
  const activeManagerTeam =
    teams.find(
      (t) =>
        ((currentUser?.teamId || currentUser?.team_id) && t.id === (currentUser.teamId || currentUser.team_id)) ||
        (currentUser?.name && (t.manager === currentUser.name || t.manager === currentUser.username)) ||
        (currentUser?.teamName && t.name === currentUser.teamName) ||
        (currentUser?.team_name && t.name === currentUser.team_name)
    ) ||
    teams.find((t) => t.id === 'team-gujarat' || t.name?.toLowerCase().includes('gujarat')) ||
    teams[0] ||
    null;

  // Auth Actions with Supabase profile saving
  const loginWithCredentials = async (username, password) => {
    const cleanUsername = (username || '').trim();
    if (!cleanUsername) {
      throw new Error('Please enter a username');
    }
    if (!password) {
      throw new Error('Please enter a password');
    }

    const lowerUser = cleanUsername.toLowerCase();

    // 1. Check if Admin account (eduvanzamds@gmail.com or admin)
    if (lowerUser === 'eduvanzamds@gmail.com' || lowerUser === 'admin') {
      if (lowerUser === 'eduvanzamds@gmail.com' && password !== 'eduvanza@345') {
        throw new Error('Invalid username or password');
      }

      const adminProfile = {
        id: 'prof-admin',
        username: cleanUsername,
        password: password,
        name: 'Admin Administrator',
        role: 'Admin',
        email: 'eduvanzamds@gmail.com',
        lastLogin: new Date().toISOString(),
      };

      const saved = await dbService.upsertProfile(adminProfile);
      const finalProfile = saved || adminProfile;

      const session = {
        role: 'Admin',
        user: finalProfile,
        timestamp: Date.now(),
      };
      localStorage.setItem('eduvenza_auth_session', JSON.stringify(session));

      setUserRole('Admin');
      setCurrentUser(finalProfile);
      setIsAuthenticated(true);
      return { role: 'Admin', user: finalProfile };
    }

    // 2. Check if Judge account (hardcoded default or any created judge)
    const existingJudge = judges.find(
      (j) => j.username?.toLowerCase() === lowerUser || j.email?.toLowerCase() === lowerUser
    );

    if (existingJudge || lowerUser === 'eduvanza.juges@gmail.in') {
      const expectedPassword = existingJudge?.password || 'judges@#345';
      if (password !== expectedPassword) {
        throw new Error('Invalid username or password');
      }

      const existingProfile = profiles.find(
        (p) => p.username?.toLowerCase() === lowerUser
      );

      const judgeProfile = {
        id: existingJudge?.id || existingProfile?.id || 'prof-judge',
        username: existingJudge?.username || cleanUsername,
        password: password,
        name: existingJudge?.name || existingProfile?.name || 'Judge',
        role: 'Judge',
        email: existingJudge?.email || existingProfile?.email || cleanUsername,
        phone: existingJudge?.phone || '',
        specialization: existingJudge?.specialization || 'General Competitions',
        avatar: existingJudge?.avatar || existingProfile?.avatar || '',
        lastLogin: new Date().toISOString(),
      };

      const saved = await dbService.upsertProfile(judgeProfile);
      const finalProfile = saved || judgeProfile;

      const session = {
        role: 'Judge',
        user: finalProfile,
        timestamp: Date.now(),
      };
      localStorage.setItem('eduvenza_auth_session', JSON.stringify(session));

      setUserRole('Judge');
      setCurrentUser(finalProfile);
      setIsAuthenticated(true);
      return { role: 'Judge', user: finalProfile };
    }

    // 3. Check if Team Manager / other accounts (created by Admin or in DB)
    const existingManager = managers.find(
      (m) => m.username?.toLowerCase() === lowerUser
    );
    const existingProfile = profiles.find(
      (p) => p.username?.toLowerCase() === lowerUser
    );

    if (existingManager || existingProfile || lowerUser === 'gujarat_mgr') {
      const targetUser = existingManager || existingProfile || {};

      // If password was set, verify it
      if (targetUser.password && targetUser.password !== password) {
        throw new Error('Invalid username or password');
      }

      let role = targetUser.role || 'Manager';
      if (role === 'Team Manager') role = 'Manager';
      const userName = targetUser.name || `${cleanUsername} ${role}`;
      const userProfile = {
        id: targetUser.id || `usr-${lowerUser}`,
        username: cleanUsername,
        password: password,
        name: userName,
        role: role,
        email: targetUser.email || `${lowerUser}@eduvenza.org`,
        avatar: targetUser.avatar || '',
        teamId: targetUser.teamId || targetUser.team_id || '',
        teamName: targetUser.teamName || targetUser.team_name || '',
        campus: targetUser.campus || '',
        lastLogin: new Date().toISOString(),
      };

      const saved = await dbService.upsertProfile(userProfile);
      const finalProfile = saved || userProfile;

      const session = {
        role: role,
        user: finalProfile,
        timestamp: Date.now(),
      };
      localStorage.setItem('eduvenza_auth_session', JSON.stringify(session));

      setUserRole(role);
      setCurrentUser(finalProfile);
      setIsAuthenticated(true);
      return { role: role, user: finalProfile };
    }

    throw new Error('Invalid username or password');
  };

  const login = async (role, username, customDetails = {}) => {
    return loginWithCredentials(username, customDetails.password || 'password123');
  };

  const logout = () => {
    localStorage.removeItem('eduvenza_auth_session');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const switchRole = async (role) => {
    const targetUsername = role === 'Admin' ? 'admin' : currentUser?.username || 'manager';
    await login(role, targetUsername);
  };
  // --- DATA ACTIONS WITH DATABASE SYNC ---

  // Teams
  const addTeam = async (newTeam) => {
    setTeams((prev) => [...prev, newTeam]);
    const newAct = {
      id: `act-${Date.now()}`,
      title: 'New team created',
      subtitle: `${newTeam.campus || 'Main'} - ${newTeam.name}`,
      time: 'Just now',
      color: '#f97316',
      icon: 'team',
    };
    setActivities((prev) => [newAct, ...prev]);

    await dbService.insertTeam(newTeam);
    await dbService.insertActivity(newAct);
  };

  const updateTeam = async (updatedTeam) => {
    setTeams((prev) => prev.map((t) => (t.id === updatedTeam.id ? { ...t, ...updatedTeam } : t)));
    const newAct = {
      id: `act-${Date.now()}`,
      title: 'Team updated',
      subtitle: `${updatedTeam.name}`,
      time: 'Just now',
      color: '#3b82f6',
      icon: 'team',
    };
    setActivities((prev) => [newAct, ...prev]);

    await dbService.updateTeam(updatedTeam);
    await dbService.insertActivity(newAct);
  };

  const deleteTeam = async (teamId) => {
    const targetTeam = teams.find((t) => t.id === teamId);
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    const newAct = {
      id: `act-${Date.now()}`,
      title: 'Team deleted',
      subtitle: targetTeam ? targetTeam.name : `Team ID ${teamId}`,
      time: 'Just now',
      color: '#ef4444',
      icon: 'team',
    };
    setActivities((prev) => [newAct, ...prev]);

    await dbService.deleteTeam(teamId);
    await dbService.insertActivity(newAct);
  };

  // Managers
  const addManager = async (newMgr) => {
    setManagers((prev) => [...prev, newMgr]);

    const managerProfile = {
      id: newMgr.id || `mgr-${Date.now()}`,
      username: newMgr.username,
      password: newMgr.password,
      name: newMgr.name,
      role: 'Manager',
      email: newMgr.email,
      avatar: newMgr.avatar,
      teamId: newMgr.teamId,
      teamName: newMgr.teamName,
      campus: newMgr.campus,
      lastLogin: null,
    };
    setProfiles((prev) => [...prev, managerProfile]);

    const newAct = {
      id: `act-${Date.now()}`,
      title: 'Team manager added',
      subtitle: `${newMgr.campus || ''} - ${newMgr.username}`,
      time: 'Just now',
      color: '#10b981',
      icon: 'manager',
    };
    setActivities((prev) => [newAct, ...prev]);

    await dbService.insertManager(newMgr);
    await dbService.upsertProfile(managerProfile);
    await dbService.insertActivity(newAct);
  };

  const updateManager = async (updatedMgr) => {
    setManagers((prev) => prev.map((m) => (m.id === updatedMgr.id ? { ...m, ...updatedMgr } : m)));

    const updatedProfile = {
      id: updatedMgr.id,
      username: updatedMgr.username,
      password: updatedMgr.password,
      name: updatedMgr.name,
      role: 'Manager',
      email: updatedMgr.email,
      avatar: updatedMgr.avatar,
      teamId: updatedMgr.teamId,
      teamName: updatedMgr.teamName,
      campus: updatedMgr.campus,
    };

    setProfiles((prev) =>
      prev.map((p) => (p.id === updatedMgr.id || p.username === updatedMgr.username ? { ...p, ...updatedProfile } : p))
    );

    const newAct = {
      id: `act-${Date.now()}`,
      title: 'Manager updated',
      subtitle: `${updatedMgr.name} (@${updatedMgr.username})`,
      time: 'Just now',
      color: '#3b82f6',
      icon: 'manager',
    };
    setActivities((prev) => [newAct, ...prev]);

    await dbService.updateManager(updatedMgr);
    await dbService.upsertProfile(updatedProfile);
    await dbService.insertActivity(newAct);
  };

  const deleteManager = async (mgrId) => {
    const target = managers.find((m) => m.id === mgrId);
    setManagers((prev) => prev.filter((m) => m.id !== mgrId));
    const newAct = {
      id: `act-${Date.now()}`,
      title: 'Manager deleted',
      subtitle: target ? target.name : `Manager ID ${mgrId}`,
      time: 'Just now',
      color: '#ef4444',
      icon: 'manager',
    };
    setActivities((prev) => [newAct, ...prev]);

    await dbService.deleteManager(mgrId);
    await dbService.insertActivity(newAct);
  };

  // Participants
  const addParticipant = async (newParticipant) => {
    setParticipants((prev) => [...prev, newParticipant]);
    const newAct = {
      id: `act-${Date.now()}`,
      title: 'Participant registered',
      subtitle: `${newParticipant.name}`,
      time: 'Just now',
      color: '#3b82f6',
      icon: 'user',
    };
    setActivities((prev) => [newAct, ...prev]);

    await dbService.insertParticipant(newParticipant);
    await dbService.insertActivity(newAct);
  };

  const updateParticipant = async (updatedParticipant) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === updatedParticipant.id ? { ...p, ...updatedParticipant } : p))
    );
    const newAct = {
      id: `act-${Date.now()}`,
      title: 'Participant updated',
      subtitle: `${updatedParticipant.name}`,
      time: 'Just now',
      color: '#3b82f6',
      icon: 'user',
    };
    setActivities((prev) => [newAct, ...prev]);

    await dbService.updateParticipant(updatedParticipant);
    await dbService.insertActivity(newAct);
  };

  const deleteParticipant = async (participantId) => {
    const target = participants.find((p) => p.id === participantId);
    setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    const newAct = {
      id: `act-${Date.now()}`,
      title: 'Participant deleted',
      subtitle: target ? target.name : `Participant ID ${participantId}`,
      time: 'Just now',
      color: '#ef4444',
      icon: 'user',
    };
    setActivities((prev) => [newAct, ...prev]);

    await dbService.deleteParticipant(participantId);
    await dbService.insertActivity(newAct);
  };

  // Mark Entries
  const saveMarkEntry = async (entry) => {
    setMarkEntries((prev) => {
      const existingIdx = prev.findIndex((m) => m.id === entry.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = entry;
        return updated;
      }
      return [...prev, entry];
    });
    await dbService.upsertMarkEntry(entry);
  };

  // Batch save: updates state once + upserts all to Supabase in parallel
  const saveMarkEntries = async (entries) => {
    if (!entries || entries.length === 0) return;
    setMarkEntries((prev) => {
      const map = new Map(prev.map((m) => [m.id, m]));
      entries.forEach((e) => map.set(e.id, e));
      return Array.from(map.values());
    });
    await Promise.all(entries.map((e) => dbService.upsertMarkEntry(e)));
  };

  const deleteMarkEntry = async (id) => {
    setMarkEntries((prev) => prev.filter((m) => m.id !== id));
    await dbService.deleteMarkEntry(id);
  };

  // Programs / Competitions
  const addProgram = async (newProgram) => {
    setPrograms((prev) => [...prev, newProgram]);
    const newAct = {
      id: `act-${Date.now()}`,
      title: 'New competition added',
      subtitle: `${newProgram.code} - ${newProgram.name}`,
      time: 'Just now',
      color: '#a855f7',
      icon: 'event',
    };
    setActivities((prev) => [newAct, ...prev]);

    await dbService.insertProgram(newProgram);
    await dbService.insertActivity(newAct);
  };

  const updateProgram = async (updatedProgram) => {
    setPrograms((prev) => prev.map((p) => (p.id === updatedProgram.id ? { ...p, ...updatedProgram } : p)));
    const newAct = {
      id: `act-${Date.now()}`,
      title: 'Competition updated',
      subtitle: `${updatedProgram.name}`,
      time: 'Just now',
      color: '#3b82f6',
      icon: 'event',
    };
    setActivities((prev) => [newAct, ...prev]);

    await dbService.updateProgram(updatedProgram);
    await dbService.insertActivity(newAct);
  };

  const deleteProgram = async (programId) => {
    const target = programs.find((p) => p.id === programId);
    setPrograms((prev) => prev.filter((p) => p.id !== programId));
    const newAct = {
      id: `act-${Date.now()}`,
      title: 'Competition deleted',
      subtitle: target ? target.name : `Program ID ${programId}`,
      time: 'Just now',
      color: '#ef4444',
      icon: 'event',
    };
    setActivities((prev) => [newAct, ...prev]);

    await dbService.deleteProgram(programId);
    await dbService.insertActivity(newAct);
  };

  const toggleProgramPublish = async (id) => {
    const target = programs.find((p) => p.id === id);
    if (!target) return;
    const isPublishing = target.status !== 'Published';
    const updatedProgram = {
      ...target,
      status: isPublishing ? 'Published' : 'Draft',
    };

    setPrograms((prev) =>
      prev.map((p) => (p.id === id ? updatedProgram : p))
    );

    await dbService.updateProgram(updatedProgram);

    // Generate Activity
    const newAct = {
      id: `act-${Date.now()}`,
      title: isPublishing ? 'Results Published' : 'Results Unpublished',
      subtitle: `${updatedProgram.name}`,
      time: 'Just now',
      color: isPublishing ? '#d97706' : '#64748b',
      icon: '🏆',
    };
    setActivities((prev) => [newAct, ...prev]);
    await dbService.insertActivity(newAct);

    // If publishing, also create an announcement
    if (isPublishing) {
      const now = new Date();
      const newAnnouncement = {
        id: `ann-${Date.now()}`,
        title: `Results Announced: ${updatedProgram.name}`,
        content: `The official results and standings for the ${updatedProgram.name} competition have been published. Team Managers can now view the detailed scores in their dashboard.`,
        date: now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        author: 'Admin',
      };
      setAnnouncements((prev) => [newAnnouncement, ...prev]);
      await dbService.insertAnnouncement(newAnnouncement);
    }
  };

  // Announcements
  const addAnnouncement = async (ann) => {
    setAnnouncements((prev) => [ann, ...prev]);
    await dbService.insertAnnouncement(ann);
  };

  const deleteAnnouncement = async (id) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    await dbService.deleteAnnouncement(id);
  };

  // Judges CRUD
  const addJudge = async (newJudge) => {
    setJudges((prev) => [newJudge, ...prev]);
    const newAct = {
      id: `act-${Date.now()}`,
      title: 'New judge appointed',
      subtitle: `${newJudge.name} (${newJudge.specialization || 'Judge'})`,
      time: 'Just now',
      color: '#d97706',
      icon: 'judge',
    };
    setActivities((prev) => [newAct, ...prev]);

    await dbService.insertJudge(newJudge);
    await dbService.insertActivity(newAct);
  };

  const updateJudge = async (updatedJudge) => {
    setJudges((prev) =>
      prev.map((j) => (j.id === updatedJudge.id ? { ...j, ...updatedJudge } : j))
    );
    const newAct = {
      id: `act-${Date.now()}`,
      title: 'Judge profile updated',
      subtitle: `${updatedJudge.name}`,
      time: 'Just now',
      color: '#d97706',
      icon: 'judge',
    };
    setActivities((prev) => [newAct, ...prev]);

    await dbService.updateJudge(updatedJudge);
    await dbService.insertActivity(newAct);
  };

  const deleteJudge = async (judgeId) => {
    const target = judges.find((j) => j.id === judgeId);
    setJudges((prev) => prev.filter((j) => j.id !== judgeId));
    const newAct = {
      id: `act-${Date.now()}`,
      title: 'Judge removed',
      subtitle: target ? target.name : `Judge ID ${judgeId}`,
      time: 'Just now',
      color: '#ef4444',
      icon: 'judge',
    };
    setActivities((prev) => [newAct, ...prev]);

    await dbService.deleteJudge(judgeId);
    await dbService.insertActivity(newAct);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        userRole,
        currentUser,
        teams,
        managers,
        participants,
        programs,
        activities,
        markEntries,
        profiles,
        announcements,
        setAnnouncements,
        judges,
        setJudges,
        addJudge,
        updateJudge,
        deleteJudge,
        activeManagerTeam,
        isLoading,
        isSupabaseConfigured,
        isSidebarOpen,
        setIsSidebarOpen,
        login,
        loginWithCredentials,
        logout,
        switchRole,
        addTeam,
        updateTeam,
        deleteTeam,
        addManager,
        updateManager,
        deleteManager,
        addParticipant,
        updateParticipant,
        deleteParticipant,
        addProgram,
        updateProgram,
        deleteProgram,
        saveMarkEntry,
        saveMarkEntries,
        deleteMarkEntry,
        toggleProgramPublish,
        setParticipants,
        setPrograms,
        setTeams,
        setManagers,
        setProfiles,
        addAnnouncement,
        deleteAnnouncement,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
