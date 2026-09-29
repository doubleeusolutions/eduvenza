-- Eduvenza Database Schema for Supabase
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    campus TEXT NOT NULL,
    code TEXT,
    color TEXT DEFAULT '#2563eb',
    bg_light TEXT DEFAULT '#eff6ff',
    icon TEXT DEFAULT '🏛️',
    manager TEXT,
    created_on TEXT,
    points NUMERIC DEFAULT 0,
    gold INT DEFAULT 0,
    silver INT DEFAULT 0,
    bronze INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. MANAGERS TABLE
CREATE TABLE IF NOT EXISTS public.managers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT,
    team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
    team_name TEXT,
    campus TEXT,
    role TEXT DEFAULT 'Team Manager',
    email TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.managers ADD COLUMN IF NOT EXISTS password TEXT;

-- 3. PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.participants (
    id TEXT PRIMARY KEY,
    chest_no TEXT NOT NULL,
    name TEXT NOT NULL,
    team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
    category TEXT,
    gender TEXT,
    email TEXT,
    programs JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Registered',
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. PROGRAMS / COMPETITIONS TABLE
CREATE TABLE IF NOT EXISTS public.programs (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    type TEXT DEFAULT 'Individual',
    member_count INT DEFAULT 1,
    venue TEXT,
    date TEXT,
    time TEXT,
    max_marks INT DEFAULT 50,
    status TEXT DEFAULT 'Upcoming',
    judge TEXT,
    criteria JSONB DEFAULT '[{"name": "Earned Mark", "max": 50}]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    time TEXT,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. MARK ENTRIES TABLE
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. PROFILES TABLE
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

-- ENABLE ROW LEVEL SECURITY (RLS) & ALLOW PUBLIC ACCESS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mark_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    date TEXT,
    time TEXT,
    author TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create public access policies for development
CREATE POLICY "Allow public read access on teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow public write access on teams" ON public.teams FOR ALL USING (true);

CREATE POLICY "Allow public read access on managers" ON public.managers FOR SELECT USING (true);
CREATE POLICY "Allow public write access on managers" ON public.managers FOR ALL USING (true);

CREATE POLICY "Allow public read access on participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Allow public write access on participants" ON public.participants FOR ALL USING (true);

CREATE POLICY "Allow public read access on programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Allow public write access on programs" ON public.programs FOR ALL USING (true);

CREATE POLICY "Allow public read access on activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Allow public write access on activities" ON public.activities FOR ALL USING (true);

CREATE POLICY "Allow public read access on mark_entries" ON public.mark_entries FOR SELECT USING (true);
CREATE POLICY "Allow public write access on mark_entries" ON public.mark_entries FOR ALL USING (true);

CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public write access on profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Allow public read access on announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow public write access on announcements" ON public.announcements FOR ALL USING (true);

-- 8. SEED DEFAULT ADMIN ACCOUNT
INSERT INTO public.profiles (id, username, password, name, role, email)
VALUES ('prof-admin', 'eduvanzamds@gmail.com', 'eduvanza@345', 'Admin Administrator', 'Admin', 'eduvanzamds@gmail.com')
ON CONFLICT (username) 
DO UPDATE SET password = EXCLUDED.password, role = 'Admin', name = EXCLUDED.name, email = EXCLUDED.email;


