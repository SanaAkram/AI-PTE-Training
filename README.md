# Angrezi Safar (انگریزی سفر)

A real PTE (Pearson Test of English) training platform built for the family —
all 22 real PTE Academic task types with authentic timers and interactions, a
Postgres question bank that grows on its own, AI-graded Speaking/Writing
feedback, Easy/Medium/Hard levels per person, replayable/slowed-down audio, a
personal vocabulary module, a daily study plan, a full mock test, and a
progress dashboard observers can check from their own phone.

Stack: **Next.js (App Router, TypeScript) · Supabase (Postgres) · OpenAI**,
deployed on **Vercel**.

## 1. Create the database (Supabase)

1. Go to [supabase.com](https://supabase.com) → New project (free tier is enough to start).
2. Once it's created: **Project Settings → API** — copy the **Project URL** and the **Secret key** (older projects may instead call this **service_role** — either works, see `.env.example`). Never the **Publishable**/`anon` key — the secret key is server-only and never sent to the browser.
3. **SQL Editor → New query** — paste the contents of [supabase/schema.sql](supabase/schema.sql) and run it. This creates the four core tables (`profiles`, `question_bank`, `curriculum_days`, `attempts`).
4. Also run [supabase/migrations/002_levels_and_vocab.sql](supabase/migrations/002_levels_and_vocab.sql) the same way — adds per-person difficulty levels and the "My Words" personal vocabulary table.

## 2. Get an OpenAI key

[platform.openai.com/api-keys](https://platform.openai.com/api-keys) → create a key. This powers AI-graded Speaking/Writing feedback, the "My Words" lookups, and the question generator. Cost at this volume is a few cents to low dollars a month on `gpt-4o-mini`.

## 3. Configure environment variables

```
cp .env.example .env.local
```

Fill in `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `OPENAI_API_KEY`, and a random `SESSION_SECRET` (the command to generate one is in the file).

## 4. Install, seed, run

```
npm install
npm run seed   # creates the first two profiles + starter question bank + first ~11 days of plan
npm run dev    # http://localhost:3000
```

## 5. Add more household members

```
npm run add-profile -- --name Haneef --role learner --pin 12348 --level easy
```

`--role` is `learner` (practices, gets tracked progress) or `observer` (views dashboards only, like Sana). `--pin` can be any length, 4 digits or more. `--level` is `easy` / `medium` / `hard` (defaults to `medium`) — change it later any time with:

```
npm run set-level -- --name Haneef --level easy
```

## 6. Deploy to Vercel

```
vercel login
vercel --prod
```

Then, in the Vercel project dashboard → **Settings → Environment Variables**, add the same four variables from `.env.local` and redeploy (`vercel --prod` again) so the live site has them. Vercel needs no other configuration — it's a standard Next.js app.

## Keeping the bank growing

`npm run grow` (`scripts/daily-grow.ts`) asks OpenAI for a fresh batch of real-format questions across all 22 task types — spread across easy/medium/hard and a rotating pool of real PTE topic categories (education, technology & society, health, environment, government & policy, media, work, etc.) so items don't repeat — inserts them into `question_bank`, and extends `curriculum_days` further ahead.

`npm run build-dictionary` (`scripts/build-dictionary.ts`) and `npm run build-grammar` (`scripts/build-grammar.ts`) fill the shared vocabulary and grammar-point banks the same way — both take `-- --count N` for a bigger one-off batch (N per category per difficulty band). These were built by generating original content rather than importing an existing word list: the best openly-findable English-Urdu datasets turned out to have no declared license *and* real quality problems even in their "gold" tier (checked directly — e.g. ناک mapped to "sored" instead of "nose") — not something to load into a learner's database unreviewed.

- Daily default: `npm run grow` (~2 items/type/day, cheap, meant for the ongoing automation).
- One-off bulk top-up: `npm run grow -- --count 9` (~200 items in one run, spread across all three levels).

Run it manually any time, or set it up as a genuine daily automation using Claude Code's `/schedule` command (ask Claude to "schedule `npm run grow` to run once a day for this project") — that's a cloud routine that runs on its own timetable and needs the same env vars available to it.

## How the content is organized

- `src/lib/types.ts` — the payload shape for each of the 22 task types.
- `src/lib/taskTypes.ts` — the registry: label, timer, scoring family, which renderer draws it. Adding a 23rd task type later is one entry here plus (usually) reusing an existing renderer.
- `src/lib/difficulty.ts` — maps the 3 learner-facing levels (easy/medium/hard) onto the 1-5 difficulty scale stored on question rows; `src/lib/questionPicker.ts` is where that filtering actually happens (with a fallback to any difficulty so a thin bank never dead-ends).
- `src/components/task-runner/` — the interaction engine: one `TaskRunner` that reads the registry and delegates to the right renderer (Speaking, Writing, Reading MCQ, Reorder, Fill-in-Blanks ×2, and the Listening family). `AudioGate` and `ReplayButton` are the shared "play once, then replay anytime at your chosen speed" system used everywhere audio plays; the global speed toggle lives in `src/lib/hooks/useAudioRate.tsx`.
- `src/lib/scoring/` — `objective.ts` (instant exact-match scoring for Reading/Listening) and `ai.ts` (OpenAI rubric grading for Speaking/Writing).
- `src/app/my-words/` — the personal vocabulary module: type any word/sentence (Urdu or English), get an AI explanation + example, save it, then practice it three ways (listen & spell, recognize meaning, write your own sentence with AI feedback).
- `src/data/seedQuestions.ts` + `scripts/seed.ts` — the starter bank and the script that loads it plus builds the first curriculum days.
- `scripts/daily-grow.ts` — the content-growth script described above.
- `scripts/add-profile.ts` / `scripts/set-level.ts` — household member management.

## Notes on honesty

Every AI-graded result is labeled "practice estimate, not an official PTE score" (in Urdu and English). Speaking is graded from a browser speech-to-text transcript plus timing, not real audio analysis — genuine pronunciation scoring isn't something this (or really anything outside Pearson's own trained models) can claim to replicate. Objective task types (Reading MCQ, Reorder, Fill-in-Blanks, Dictation, etc.) are exact-match scored, which is reliable.

Microphone-based Speaking practice needs a real HTTPS site (works once deployed to Vercel) and a browser that supports the Web Speech API (Chrome works well; Safari's support is inconsistent) — everything else, including audio playback/replay, works in any modern browser.

---

_Earlier static-prototype version kept in [_legacy-prototype/](_legacy-prototype/) for reference — superseded by this app._
