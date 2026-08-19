# Angrezi Safar (انگریزی سفر)

A real PTE (Pearson Test of English) training platform built for Mubeen — all
22 real PTE Academic task types with authentic timers and interactions, a
Postgres question bank that grows on its own, AI-graded Speaking/Writing
feedback, a daily study plan, a full mock test, and a progress dashboard Sana
can check from her own phone.

Stack: **Next.js (App Router, TypeScript) · Supabase (Postgres) · OpenAI**,
deployed on **Vercel**.

## 1. Create the database (Supabase)

1. Go to [supabase.com](https://supabase.com) → New project (free tier is enough to start).
2. Once it's created: **Project Settings → API** — copy the **Project URL** and the **service_role** secret key (not the `anon` key — the service role key is what the server uses; it's never sent to the browser).
3. **SQL Editor → New query** — paste the contents of [supabase/schema.sql](supabase/schema.sql) and run it. This creates the four tables (`profiles`, `question_bank`, `curriculum_days`, `attempts`).

## 2. Get an OpenAI key

[platform.openai.com/api-keys](https://platform.openai.com/api-keys) → create a key. This powers AI-graded Speaking/Writing feedback and the daily question generator. Cost at this volume (a few people practicing, one daily generation run) is a few cents to low dollars a month on `gpt-4o-mini`.

## 3. Configure environment variables

```
cp .env.example .env.local
```

Fill in `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and a random `SESSION_SECRET` (the command to generate one is in the file). Optionally change `SEED_MUBEEN_PIN` / `SEED_SANA_PIN` from the defaults before seeding.

## 4. Install, seed, run

```
npm install
npm run seed   # creates the Mubeen/Sana profiles + starter question bank + first ~11 days of plan
npm run dev    # http://localhost:3000
```

Log in as **Mubeen** (learner) to practice, or **Sana** (observer) to see the dashboard — using the PINs from step 3 (or the console output of `npm run seed`).

## 5. Deploy to Vercel

```
vercel login
vercel --prod
```

Then, in the Vercel project dashboard → **Settings → Environment Variables**, add the same four variables from `.env.local` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `SESSION_SECRET`) and redeploy (`vercel --prod` again) so the live site has them. Vercel needs no other configuration — it's a standard Next.js app.

## Keeping the bank growing

`npm run grow` (`scripts/daily-grow.ts`) asks OpenAI for a fresh batch of real-format questions across all 22 task types, inserts them into `question_bank`, and extends `curriculum_days` further ahead — this is the gradual path toward a much larger bank over months rather than a one-time seed.

Run it manually any time, or set it up as a genuine daily automation using Claude Code's `/schedule` command (ask Claude to "schedule `npm run grow` to run once a day for this project") — that's a cloud routine that runs on its own timetable and needs the same env vars available to it.

## How the content is organized

- `src/lib/types.ts` — the payload shape for each of the 22 task types.
- `src/lib/taskTypes.ts` — the registry: label, timer, scoring family, which renderer draws it. Adding a 23rd task type later is one entry here plus (usually) reusing an existing renderer.
- `src/components/task-runner/` — the interaction engine: one `TaskRunner` that reads the registry and delegates to the right renderer (Speaking, Writing, Reading MCQ, Reorder, Fill-in-Blanks ×2, and the Listening family).
- `src/lib/scoring/` — `objective.ts` (instant exact-match scoring for Reading/Listening) and `ai.ts` (OpenAI rubric grading for Speaking/Writing).
- `src/data/seedQuestions.ts` + `scripts/seed.ts` — the starter bank and the script that loads it plus builds the first curriculum days.
- `scripts/daily-grow.ts` — the automated content-growth script described above.

## Notes on honesty

Every AI-graded result is labeled "practice estimate, not an official PTE score." Speaking is graded from a browser speech-to-text transcript plus timing, not real audio analysis — genuine pronunciation scoring isn't something this (or really anything outside Pearson's own trained models) can claim to replicate. Objective task types (Reading MCQ, Reorder, Fill-in-Blanks, Dictation, etc.) are exact-match scored, which is reliable.

Microphone-based Speaking practice needs a real HTTPS site (works once deployed to Vercel) and a browser that supports the Web Speech API (Chrome works well; Safari's support is inconsistent) — everything else works in any modern browser.

---

_Earlier static-prototype version kept in [_legacy-prototype/](_legacy-prototype/) for reference — superseded by this app._
