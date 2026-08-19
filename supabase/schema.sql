-- Angrezi Safar — schema. Run this once in the Supabase SQL editor
-- (Project -> SQL Editor -> New query -> paste -> Run) before running `npm run seed`.

create extension if not exists "pgcrypto";

-- The two household profiles: Mubeen (learner) and Sana (observer).
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null check (role in ('learner', 'observer')),
  pin_hash text not null,
  created_at timestamptz not null default now()
);

-- One row per PTE practice item. `payload` shape depends on task_type —
-- see src/lib/types.ts for the discriminated-union TypeScript shapes.
create table if not exists question_bank (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('speaking', 'writing', 'reading', 'listening')),
  task_type text not null,
  payload jsonb not null,
  difficulty smallint not null check (difficulty between 1 and 5),
  source text not null default 'seed' check (source in ('seed', 'daily_gen')),
  created_at timestamptz not null default now()
);
create index if not exists question_bank_task_type_idx on question_bank (task_type);
create index if not exists question_bank_difficulty_idx on question_bank (difficulty);

-- Mubeen's day-by-day plan. Extended continuously by the daily-grow routine
-- so "today" is always populated.
create table if not exists curriculum_days (
  id uuid primary key default gen_random_uuid(),
  day_number int not null unique,
  task_ids uuid[] not null,
  unlock_date date not null unique,
  created_at timestamptz not null default now()
);

-- Every submitted response, objective or AI-graded.
create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  question_id uuid not null references question_bank(id) on delete cascade,
  response jsonb not null,
  score_breakdown jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists attempts_profile_created_idx on attempts (profile_id, created_at desc);
create index if not exists attempts_question_idx on attempts (question_id);

-- Row Level Security stays off: all access goes through server-side code
-- using the service_role key (see src/lib/supabase.ts), never a browser client.
