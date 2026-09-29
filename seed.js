import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env manually
const envPath = path.resolve('.env');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  });
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const teams = [
  { id: 'team-1', name: 'Alpha Squad', campus: 'North Campus', code: 'ALP', manager: 'John Doe', color: '#3b82f6', bg_light: '#eff6ff', icon: '🏛️' },
  { id: 'team-2', name: 'Beta Force', campus: 'South Campus', code: 'BET', manager: 'Jane Smith', color: '#10b981', bg_light: '#ecfdf5', icon: '🌟' }
];

const managers = [
  { id: 'mgr-1', name: 'John Doe', username: 'johndoe', password: 'password123', team_id: 'team-1', team_name: 'Alpha Squad', campus: 'North Campus', role: 'Manager', email: 'john@eduvenza.com' },
  { id: 'mgr-2', name: 'Jane Smith', username: 'janesmith', password: 'password123', team_id: 'team-2', team_name: 'Beta Force', campus: 'South Campus', role: 'Manager', email: 'jane@eduvenza.com' }
];

const participants = [
  { id: 'part-1', chest_no: 'A001', name: 'Alice Walker', team_id: 'team-1', category: 'Senior', gender: 'Female', email: 'alice@example.com', status: 'Registered' },
  { id: 'part-2', chest_no: 'A002', name: 'Bob Carter', team_id: 'team-1', category: 'Junior', gender: 'Male', email: 'bob@example.com', status: 'Registered' },
  { id: 'part-3', chest_no: 'B001', name: 'Charlie Davis', team_id: 'team-2', category: 'Senior', gender: 'Male', email: 'charlie@example.com', status: 'Registered' },
  { id: 'part-4', chest_no: 'B002', name: 'Diana Evans', team_id: 'team-2', category: 'Junior', gender: 'Female', email: 'diana@example.com', status: 'Registered' }
];

const programs = [
  { id: 'prog-1', code: 'PRG001', name: 'Debate', category: 'Arts', type: 'Individual', member_count: 1, venue: 'Main Hall', date: '2026-10-15', time: '10:00 AM', status: 'Published', max_marks: 50 },
  { id: 'prog-2', code: 'PRG002', name: 'Hackathon', category: 'Tech', type: 'Group', member_count: 4, venue: 'Lab 1', date: '2026-10-16', time: '09:00 AM', status: 'Published', max_marks: 100 }
];

async function seedData() {
  console.log("Seeding Teams...");
  for (const team of teams) {
    const { error } = await supabase.from('teams').upsert(team);
    if (error) console.error("Error inserting team:", error.message);
  }

  console.log("Seeding Managers...");
  for (const manager of managers) {
    const { error } = await supabase.from('managers').upsert(manager);
    if (error) console.error("Error inserting manager:", error.message);
  }

  console.log("Seeding Participants...");
  for (const participant of participants) {
    const { error } = await supabase.from('participants').upsert(participant);
    if (error) console.error("Error inserting participant:", error.message);
  }

  console.log("Seeding Programs...");
  for (const program of programs) {
    const { error } = await supabase.from('programs').upsert(program);
    if (error) console.error("Error inserting program:", error.message);
  }

  console.log("Seeding completed.");
}

seedData();
