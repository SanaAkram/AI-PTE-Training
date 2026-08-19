-- Run this once in the Supabase SQL editor (same place as schema.sql).
-- Adds: a per-person difficulty level, and the personal vocabulary module.

alter table profiles
  add column if not exists preferred_difficulty text not null default 'medium'
    check (preferred_difficulty in ('easy', 'medium', 'hard'));

create index if not exists question_bank_difficulty_idx2 on question_bank (task_type, difficulty);

-- "My Words" — a personal lookup/review list. Anyone can type an English or
-- Urdu word/sentence, get an AI-generated meaning + example, and save it for
-- repeated review (with audio) outside the structured PTE task types.
create table if not exists personal_vocab (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  term text not null,        -- exactly what they typed (Urdu, English, or mixed)
  english text not null,     -- the natural English word/phrase/sentence (translated if needed)
  meaning_ur text not null,  -- Urdu explanation of meaning/usage
  example_en text not null,
  example_ur text not null,
  created_at timestamptz not null default now()
);
create index if not exists personal_vocab_profile_idx on personal_vocab (profile_id, created_at desc);

-- Shared "Dictionary" — a curated, pre-loaded word bank (not tied to any one
-- profile) so vocabulary/spelling practice has ready-made content from day
-- one, without anyone having to type words in first. Built by
-- scripts/build-dictionary.ts, same approach as question_bank's daily-grow.
create table if not exists dictionary (
  id uuid primary key default gen_random_uuid(),
  english text not null unique,
  meaning_ur text not null,
  example_en text not null,
  example_ur text not null,
  category text not null,
  difficulty smallint not null check (difficulty between 1 and 5),
  created_at timestamptz not null default now()
);
create index if not exists dictionary_difficulty_idx on dictionary (difficulty);
