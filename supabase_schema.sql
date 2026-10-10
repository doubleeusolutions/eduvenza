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
    "date" TEXT DEFAULT 'Not Assigned',
    "time" TEXT DEFAULT 'Not Assigned',
    max_marks INT DEFAULT 50,
    status TEXT DEFAULT 'Upcoming',
    judge TEXT,
    criteria JSONB DEFAULT '[{"name": "Earned Mark", "max": 50}]'::jsonb,
    code_letters JSONB DEFAULT '{}'::jsonb,
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
    judge_name TEXT,
    judge_notes TEXT,
    code_letter TEXT,
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

-- 9. JUDGES TABLE
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
ALTER TABLE public.judges ENABLE ROW LEVEL SECURITY;

-- Create public access policies safely (drops existing policies first to allow re-running)
DROP POLICY IF EXISTS "Allow public read access on teams" ON public.teams;
CREATE POLICY "Allow public read access on teams" ON public.teams FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on teams" ON public.teams;
CREATE POLICY "Allow public write access on teams" ON public.teams FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read access on managers" ON public.managers;
CREATE POLICY "Allow public read access on managers" ON public.managers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on managers" ON public.managers;
CREATE POLICY "Allow public write access on managers" ON public.managers FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read access on participants" ON public.participants;
CREATE POLICY "Allow public read access on participants" ON public.participants FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on participants" ON public.participants;
CREATE POLICY "Allow public write access on participants" ON public.participants FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read access on programs" ON public.programs;
CREATE POLICY "Allow public read access on programs" ON public.programs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on programs" ON public.programs;
CREATE POLICY "Allow public write access on programs" ON public.programs FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read access on activities" ON public.activities;
CREATE POLICY "Allow public read access on activities" ON public.activities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on activities" ON public.activities;
CREATE POLICY "Allow public write access on activities" ON public.activities FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read access on mark_entries" ON public.mark_entries;
CREATE POLICY "Allow public read access on mark_entries" ON public.mark_entries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on mark_entries" ON public.mark_entries;
CREATE POLICY "Allow public write access on mark_entries" ON public.mark_entries FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read access on profiles" ON public.profiles;
CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on profiles" ON public.profiles;
CREATE POLICY "Allow public write access on profiles" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read access on announcements" ON public.announcements;
CREATE POLICY "Allow public read access on announcements" ON public.announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on announcements" ON public.announcements;
CREATE POLICY "Allow public write access on announcements" ON public.announcements FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read access on judges" ON public.judges;
CREATE POLICY "Allow public read access on judges" ON public.judges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write access on judges" ON public.judges;
CREATE POLICY "Allow public write access on judges" ON public.judges FOR ALL USING (true);

-- 8. SEED DEFAULT ADMIN ACCOUNT
INSERT INTO public.profiles (id, username, password, name, role, email)
VALUES ('prof-admin', 'eduvanzamds@gmail.com', 'eduvanza@345', 'Admin Administrator', 'Admin', 'eduvanzamds@gmail.com')
ON CONFLICT (username) 
DO UPDATE SET password = EXCLUDED.password, role = 'Admin', name = EXCLUDED.name, email = EXCLUDED.email;

-- 9. SEED DEFAULT JUDGE ACCOUNT
INSERT INTO public.profiles (id, username, password, name, role, email)
VALUES ('prof-judge', 'Eduvanza.juges@gmail.in', 'judges@#345', 'Judge', 'Judge', 'Eduvanza.juges@gmail.in')
ON CONFLICT (username)
DO UPDATE SET password = EXCLUDED.password, role = 'Judge', name = EXCLUDED.name, email = EXCLUDED.email;
-- 10. SEED OFFICIAL FEST COMPETITIONS / PROGRAMS (56 EVENTS)
INSERT INTO public.programs (id, code, name, category, type, member_count, venue, "date", "time", status, max_marks)
VALUES 
  -- 1. Individual On Stage
  ('prog-ios-01', 'IOS-01', 'Hamd Urdu', 'Individual On Stage', 'Individual', 1, 'Stage A', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-ios-02', 'IOS-02', 'Bilingual Speech Ara–Eng', 'Individual On Stage', 'Individual', 1, 'Stage A', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-ios-03', 'IOS-03', 'Bilingual Speech Urdu–Mal', 'Individual On Stage', 'Individual', 1, 'Stage A', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-ios-04', 'IOS-04', 'PPT Presentation (Eng)', 'Individual On Stage', 'Individual', 1, 'Seminar Hall', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-ios-05', 'IOS-05', 'Quran Speech (Urdu)', 'Individual On Stage', 'Individual', 1, 'Stage B', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-ios-06', 'IOS-06', 'Tadrees', 'Individual On Stage', 'Individual', 1, 'Stage B', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-ios-07', 'IOS-07', 'Qira''ath', 'Individual On Stage', 'Individual', 1, 'Stage A', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-ios-08', 'IOS-08', 'Speech Arabic', 'Individual On Stage', 'Individual', 1, 'Stage A', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-ios-09', 'IOS-09', 'Speech Malayalam', 'Individual On Stage', 'Individual', 1, 'Stage A', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-ios-10', 'IOS-10', 'Madh Song', 'Individual On Stage', 'Individual', 1, 'Stage B', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-ios-11', 'IOS-11', 'Hadees Musabaqa', 'Individual On Stage', 'Individual', 1, 'Stage B', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-ios-12', 'IOS-12', 'Quiz', 'Individual On Stage', 'Individual', 1, 'Main Auditorium', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-ios-13', 'IOS-13', 'Model Lecturing', 'Individual On Stage', 'Individual', 1, 'Seminar Hall', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-ios-14', 'IOS-14', 'Debate English', 'Individual On Stage', 'Individual', 1, 'Stage A', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-ios-15', 'IOS-15', 'News Reading Arabic', 'Individual On Stage', 'Individual', 1, 'Stage B', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),

  -- 2. Individual Off Stage
  ('prog-iof-01', 'IOF-01', 'Math Test', 'Individual Off Stage', 'Individual', 1, 'Exam Hall 1', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-02', 'IOF-02', 'Hifz and Thajweed', 'Individual Off Stage', 'Individual', 1, 'Hall C', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-03', 'IOF-03', 'Essay Malayalam', 'Individual Off Stage', 'Individual', 1, 'Exam Hall 1', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-04', 'IOF-04', 'Essay English', 'Individual Off Stage', 'Individual', 1, 'Exam Hall 1', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-05', 'IOF-05', 'Essay Arabic', 'Individual Off Stage', 'Individual', 1, 'Exam Hall 1', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-06', 'IOF-06', 'Essay Urdu', 'Individual Off Stage', 'Individual', 1, 'Exam Hall 1', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-07', 'IOF-07', 'Poem Making English', 'Individual Off Stage', 'Individual', 1, 'Classroom 2', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-08', 'IOF-08', 'Poem Making Malayalam', 'Individual Off Stage', 'Individual', 1, 'Classroom 2', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-09', 'IOF-09', 'Poem Making Arabic', 'Individual Off Stage', 'Individual', 1, 'Classroom 2', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-10', 'IOF-10', 'Naat Rachana Urdu', 'Individual Off Stage', 'Individual', 1, 'Classroom 3', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-11', 'IOF-11', 'Feature Writing', 'Individual Off Stage', 'Individual', 1, 'Classroom 3', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-12', 'IOF-12', 'Book Test Malayalam', 'Individual Off Stage', 'Individual', 1, 'Exam Hall 2', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-13', 'IOF-13', 'Book Test English', 'Individual Off Stage', 'Individual', 1, 'Exam Hall 2', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-14', 'IOF-14', 'Typing Arabic', 'Individual Off Stage', 'Individual', 1, 'Computer Lab 1', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-15', 'IOF-15', 'Digital Painting', 'Individual Off Stage', 'Individual', 1, 'Computer Lab 1', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-16', 'IOF-16', 'Calligraphy', 'Individual Off Stage', 'Individual', 1, 'Art Studio', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-17', 'IOF-17', 'Poster Designing', 'Individual Off Stage', 'Individual', 1, 'Art Studio', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-18', 'IOF-18', 'Video Designing', 'Individual Off Stage', 'Individual', 1, 'Media Lab', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-19', 'IOF-19', 'AI Web Designing', 'Individual Off Stage', 'Individual', 1, 'Computer Lab 2', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-20', 'IOF-20', 'News Writing English', 'Individual Off Stage', 'Individual', 1, 'Classroom 4', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-21', 'IOF-21', 'Translation Mal to Urdu', 'Individual Off Stage', 'Individual', 1, 'Classroom 4', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-22', 'IOF-22', 'Translation Eng to Ara', 'Individual Off Stage', 'Individual', 1, 'Classroom 4', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-23', 'IOF-23', 'Burda Test', 'Individual Off Stage', 'Individual', 1, 'Hall C', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-24', 'IOF-24', 'Dictionary Making Urdu', 'Individual Off Stage', 'Individual', 1, 'Classroom 5', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-25', 'IOF-25', 'Language Pro Eng', 'Individual Off Stage', 'Individual', 1, 'Language Lab', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-26', 'IOF-26', 'Interview Making Arabic', 'Individual Off Stage', 'Individual', 1, 'Media Studio', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-27', 'IOF-27', 'Sudoku Puzzle', 'Individual Off Stage', 'Individual', 1, 'Hall C', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-28', 'IOF-28', 'Social Text English', 'Individual Off Stage', 'Individual', 1, 'Classroom 5', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),
  ('prog-iof-29', 'IOF-29', 'Swarf Test', 'Individual Off Stage', 'Individual', 1, 'Hall C', 'Not Assigned', 'Not Assigned', 'Upcoming', 50),

  -- 3. General On Stage
  ('prog-gos-01', 'GOS-01', 'Thidkar e Rasool', 'General On Stage', 'Group', 4, 'Main Stage', 'Not Assigned', 'Not Assigned', 'Upcoming', 100),
  ('prog-gos-02', 'GOS-02', 'Fiqh Summit', 'General On Stage', 'Group', 4, 'Main Stage', 'Not Assigned', 'Not Assigned', 'Upcoming', 100),
  ('prog-gos-03', 'GOS-03', 'Qawali', 'General On Stage', 'Group', 5, 'Main Stage', 'Not Assigned', 'Not Assigned', 'Upcoming', 100),
  ('prog-gos-04', 'GOS-04', 'Nasheeda', 'General On Stage', 'Group', 4, 'Main Stage', 'Not Assigned', 'Not Assigned', 'Upcoming', 100),
  ('prog-gos-05', 'GOS-05', 'Badr Kissa', 'General On Stage', 'Group', 2, 'Main Stage', 'Not Assigned', 'Not Assigned', 'Upcoming', 100),
  ('prog-gos-06', 'GOS-06', 'Salam e Raza', 'General On Stage', 'Group', 3, 'Main Stage', 'Not Assigned', 'Not Assigned', 'Upcoming', 100),
  ('prog-gos-07', 'GOS-07', 'Book Discussion Urdu', 'General On Stage', 'Group', 3, 'Main Stage', 'Not Assigned', 'Not Assigned', 'Upcoming', 100),
  ('prog-gos-08', 'GOS-08', 'Alfiyya Musabaqa', 'General On Stage', 'Group', 4, 'Main Stage', 'Not Assigned', 'Not Assigned', 'Upcoming', 100),

  -- 4. General Off Stage
  ('prog-gof-01', 'GOF-01', 'Theopodcast', 'General Off Stage', 'Group', 4, 'Media Studio', 'Not Assigned', 'Not Assigned', 'Upcoming', 100),
  ('prog-gof-02', 'GOF-02', 'Spot Magazine', 'General Off Stage', 'Group', 5, 'Editorial Hall', 'Not Assigned', 'Not Assigned', 'Upcoming', 100),
  ('prog-gof-03', 'GOF-03', 'Risala Quiz', 'General Off Stage', 'Group', 2, 'Seminar Hall B', 'Not Assigned', 'Not Assigned', 'Upcoming', 100),
  ('prog-gof-04', 'GOF-04', 'Collage', 'General Off Stage', 'Group', 4, 'Art Studio', 'Not Assigned', 'Not Assigned', 'Upcoming', 100)
ON CONFLICT (id) DO UPDATE 
SET 
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  type = EXCLUDED.type,
  member_count = EXCLUDED.member_count,
  venue = EXCLUDED.venue,
  "date" = EXCLUDED."date",
  "time" = EXCLUDED."time",
  status = EXCLUDED.status,
  max_marks = EXCLUDED.max_marks;

