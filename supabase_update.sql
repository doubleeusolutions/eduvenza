-- ==============================================================================
-- Eduvenza Supabase Database Updation Script (Safe & Idempotent)
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
--
-- This script updates an EXISTING database with all new tables, columns,
-- RLS policies, and default accounts without losing any existing data.
-- ==============================================================================

-- 1. UPDATE PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS public.programs (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    type TEXT DEFAULT 'Individual',
    member_count INT DEFAULT 1,
    venue TEXT,
    "date" TEXT DEFAULT 'Not Assigned',
    "time" TEXT DEFAULT 'Not Assigned',
    max_marks INT DEFAULT 50,
    status TEXT DEFAULT 'Upcoming',
    judge TEXT,
    criteria JSONB DEFAULT '[{"name": "Earned Mark", "max": 50}]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS judge TEXT;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Upcoming';
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS max_marks INT DEFAULT 50;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS criteria JSONB DEFAULT '[{"name": "Earned Mark", "max": 50}]'::jsonb;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS member_count INT DEFAULT 1;

-- 2. UPDATE MARK ENTRIES TABLE (Includes Judge tracking)
CREATE TABLE IF NOT EXISTS public.mark_entries (
    id TEXT PRIMARY KEY,
    program_id TEXT REFERENCES public.programs(id) ON DELETE CASCADE,
    participant_id TEXT REFERENCES public.participants(id) ON DELETE CASCADE,
    scores JSONB DEFAULT '{}'::jsonb,
    total_score NUMERIC DEFAULT 0,
    grade TEXT,
    position INT,
    grade_points NUMERIC DEFAULT 0,
    position_points NUMERIC DEFAULT 0,
    team_points NUMERIC DEFAULT 0,
    entered_at TEXT,
    judge_name TEXT,
    judge_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.mark_entries ADD COLUMN IF NOT EXISTS judge_name TEXT;
ALTER TABLE public.mark_entries ADD COLUMN IF NOT EXISTS judge_notes TEXT;
ALTER TABLE public.mark_entries ADD COLUMN IF NOT EXISTS scores JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.mark_entries ADD COLUMN IF NOT EXISTS total_score NUMERIC DEFAULT 0;
ALTER TABLE public.mark_entries ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE public.mark_entries ADD COLUMN IF NOT EXISTS position INT;
ALTER TABLE public.mark_entries ADD COLUMN IF NOT EXISTS grade_points NUMERIC DEFAULT 0;
ALTER TABLE public.mark_entries ADD COLUMN IF NOT EXISTS position_points NUMERIC DEFAULT 0;
ALTER TABLE public.mark_entries ADD COLUMN IF NOT EXISTS team_points NUMERIC DEFAULT 0;
ALTER TABLE public.mark_entries ADD COLUMN IF NOT EXISTS entered_at TEXT;

-- 3. ENSURE JUDGES DIRECTORY TABLE (Created Judges)
CREATE TABLE IF NOT EXISTS public.judges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT,
    password TEXT,
    email TEXT,
    phone TEXT,
    specialization TEXT,
    role TEXT DEFAULT 'Judge',
    avatar TEXT,
    status TEXT DEFAULT 'Active',
    assigned_programs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Relax constraints in case table was created with NOT NULL username
ALTER TABLE public.judges ALTER COLUMN username DROP NOT NULL;
ALTER TABLE public.judges ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE public.judges ADD COLUMN IF NOT EXISTS assigned_programs JSONB DEFAULT '[]'::jsonb;

-- 4. UPDATE MANAGERS TABLE
ALTER TABLE public.managers ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.managers ADD COLUMN IF NOT EXISTS team_name TEXT;
ALTER TABLE public.managers ADD COLUMN IF NOT EXISTS campus TEXT;

-- 5. UPDATE TEAMS TABLE
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS points NUMERIC DEFAULT 0;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS gold INT DEFAULT 0;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS silver INT DEFAULT 0;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS bronze INT DEFAULT 0;

-- 6. UPDATE PARTICIPANTS TABLE
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS programs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Registered';

-- 7. ENSURE ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    date TEXT,
    time TEXT,
    author TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. ENSURE ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    time TEXT,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. ENSURE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Manager',
    email TEXT,
    avatar TEXT,
    team_id TEXT,
    team_name TEXT,
    campus TEXT,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 10. REFRESH ROW LEVEL SECURITY (RLS) POLICIES SAFELY
-- (Drops old policy if already exists to avoid "policy already exists" error)

-- Teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on teams" ON public.teams;
CREATE POLICY "Allow public read access on teams" ON public.teams FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on teams" ON public.teams;
CREATE POLICY "Allow public write access on teams" ON public.teams FOR ALL USING (true);

-- Managers
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on managers" ON public.managers;
CREATE POLICY "Allow public read access on managers" ON public.managers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on managers" ON public.managers;
CREATE POLICY "Allow public write access on managers" ON public.managers FOR ALL USING (true);

-- Participants
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on participants" ON public.participants;
CREATE POLICY "Allow public read access on participants" ON public.participants FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on participants" ON public.participants;
CREATE POLICY "Allow public write access on participants" ON public.participants FOR ALL USING (true);

-- Programs
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on programs" ON public.programs;
CREATE POLICY "Allow public read access on programs" ON public.programs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on programs" ON public.programs;
CREATE POLICY "Allow public write access on programs" ON public.programs FOR ALL USING (true);

-- Activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on activities" ON public.activities;
CREATE POLICY "Allow public read access on activities" ON public.activities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on activities" ON public.activities;
CREATE POLICY "Allow public write access on activities" ON public.activities FOR ALL USING (true);

-- Mark Entries
ALTER TABLE public.mark_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on mark_entries" ON public.mark_entries;
CREATE POLICY "Allow public read access on mark_entries" ON public.mark_entries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on mark_entries" ON public.mark_entries;
CREATE POLICY "Allow public write access on mark_entries" ON public.mark_entries FOR ALL USING (true);

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on profiles" ON public.profiles;
CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on profiles" ON public.profiles;
CREATE POLICY "Allow public write access on profiles" ON public.profiles FOR ALL USING (true);

-- Announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on announcements" ON public.announcements;
CREATE POLICY "Allow public read access on announcements" ON public.announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on announcements" ON public.announcements;
CREATE POLICY "Allow public write access on announcements" ON public.announcements FOR ALL USING (true);

-- Judges
ALTER TABLE public.judges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on judges" ON public.judges;
CREATE POLICY "Allow public read access on judges" ON public.judges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on judges" ON public.judges;
CREATE POLICY "Allow public write access on judges" ON public.judges FOR ALL USING (true);

-- 11. UPSERT DEFAULT ADMIN ACCOUNT
INSERT INTO public.profiles (id, username, password, name, role, email)
VALUES ('prof-admin', 'eduvanzamds@gmail.com', 'eduvanza@345', 'Admin Administrator', 'Admin', 'eduvanzamds@gmail.com')
ON CONFLICT (username) 
DO UPDATE SET 
  password = EXCLUDED.password, 
  role = 'Admin', 
  name = EXCLUDED.name, 
  email = EXCLUDED.email;

-- 12. UPSERT SHARED JUDGE ACCOUNT (Used by all judges to login)
INSERT INTO public.profiles (id, username, password, name, role, email)
VALUES ('prof-judge', 'Eduvanza.juges@gmail.in', 'judges@#345', 'Judge', 'Judge', 'Eduvanza.juges@gmail.in')
ON CONFLICT (username)
DO UPDATE SET 
  password = EXCLUDED.password, 
  role = 'Judge', 
  name = EXCLUDED.name, 
  email = EXCLUDED.email;

-- 13. KOT LETTERS (CODE LETTERS) SUPPORT FOR ANONYMOUS JUDGING
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS code_letters JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.mark_entries ADD COLUMN IF NOT EXISTS code_letter TEXT;
