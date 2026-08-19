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

-- Grammar & sentence-building points — a rule/pattern explained in Urdu with
-- example sentences, paired with one quick fill-in-the-blank check. Built by
-- scripts/build-grammar.ts, same generation approach as dictionary/question_bank.
create table if not exists grammar_points (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_ur text not null,
  explanation_ur text not null,       -- how/when to use this pattern, in Urdu
  pattern_en text not null,           -- e.g. "subject + am/is/are + verb-ing"
  examples jsonb not null,            -- [{en, ur}, ...]
  practice_sentence text not null,    -- uses {{blank}} once
  practice_sentence_ur text not null, -- Urdu translation of the full sentence
  practice_options text[] not null,   -- includes the correct answer
  practice_options_ur text[] not null, -- Urdu meaning of each option, same order
  practice_answer text not null,
  category text not null,             -- tenses / articles / prepositions / word-order / agreement / etc.
  difficulty smallint not null check (difficulty between 1 and 5),
  created_at timestamptz not null default now()
);
create index if not exists grammar_points_difficulty_idx on grammar_points (difficulty);

-- If grammar_points already existed from an earlier partial run, add the
-- newer Urdu columns (per-option glosses + the practice sentence itself) and
-- clear out the incomplete rows that predate them — they'll be regenerated.
alter table grammar_points add column if not exists practice_options_ur text[];
alter table grammar_points add column if not exists practice_sentence_ur text;
delete from grammar_points where practice_options_ur is null or practice_sentence_ur is null;
alter table grammar_points alter column practice_options_ur set not null;
alter table grammar_points alter column practice_sentence_ur set not null;
