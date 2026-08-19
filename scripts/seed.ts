/**
 * One-time / re-runnable setup script: creates the two household profiles
 * (Mubeen the learner, Sana the observer) and, if the question bank is
 * empty, inserts the starter question set and builds the first stretch of
 * curriculum_days from it.
 *
 * Usage:  npm run seed
 * Needs:  .env.local with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and
 *         optionally SEED_MUBEEN_PIN / SEED_SANA_PIN (defaults: 1234 / 5678).
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { randomBytes, scrypt as scryptCb } from "crypto";
import { promisify } from "util";
import { createClient } from "@supabase/supabase-js";
import { SEED_QUESTIONS } from "../src/data/seedQuestions";

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

async function hashPin(pin: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(pin, salt, 32);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  const url = process.env.SUPABASE_URL;
  // Newer Supabase projects call this "Secret key" (SUPABASE_SECRET_KEY);
  // older ones call it "service_role" — accept either.
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing SUPABASE_URL or SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) in .env.local — see .env.example."
    );
    process.exit(1);
  }
  const db = createClient(url, key);

  // ---- profiles ---------------------------------------------------------
  const { data: existingProfiles, error: profilesSelectError } = await db
    .from("profiles")
    .select("id, name, role");
  if (profilesSelectError) {
    console.error("Could not read the profiles table — is supabase/schema.sql set up? Details:");
    console.error(profilesSelectError);
    process.exit(1);
  }
  const hasMubeen = existingProfiles?.some((p) => p.role === "learner");
  const hasSana = existingProfiles?.some((p) => p.role === "observer");

  if (!hasMubeen) {
    const pin = process.env.SEED_MUBEEN_PIN ?? "1234";
    const { error } = await db
      .from("profiles")
      .insert({ name: "Mubeen", role: "learner", pin_hash: await hashPin(pin) });
    if (error) throw error;
    console.log(`Created profile: Mubeen (learner), PIN ${pin}`);
  } else {
    console.log("Profile Mubeen already exists — skipping.");
  }
  if (!hasSana) {
    const pin = process.env.SEED_SANA_PIN ?? "5678";
    const { error } = await db
      .from("profiles")
      .insert({ name: "Sana", role: "observer", pin_hash: await hashPin(pin) });
    if (error) throw error;
    console.log(`Created profile: Sana (observer), PIN ${pin}`);
  } else {
    console.log("Profile Sana already exists — skipping.");
  }

  // ---- question bank ------------------------------------------------------
  const { count } = await db.from("question_bank").select("*", { count: "exact", head: true });
  let allIds: string[] = [];

  if (!count || count === 0) {
    const { data: inserted, error } = await db
      .from("question_bank")
      .insert(
        SEED_QUESTIONS.map((q) => ({
          section: q.section,
          task_type: q.task_type,
          payload: q.payload,
          difficulty: q.difficulty,
          source: "seed",
        }))
      )
      .select("id");
    if (error) throw error;
    allIds = (inserted ?? []).map((r) => r.id);
    console.log(`Inserted ${allIds.length} starter questions across ${new Set(SEED_QUESTIONS.map((q) => q.task_type)).size} task types.`);
  } else {
    console.log(`question_bank already has ${count} rows — skipping insert.`);
    const { data: rows } = await db.from("question_bank").select("id");
    allIds = (rows ?? []).map((r) => r.id);
  }

  // ---- curriculum days ------------------------------------------------------
  const { count: dayCount } = await db.from("curriculum_days").select("*", { count: "exact", head: true });
  if (!dayCount || dayCount === 0) {
    const groups = chunk(shuffle(allIds), 4);
    const today = new Date();
    const rows = groups.map((task_ids, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      return {
        day_number: i + 1,
        task_ids,
        unlock_date: date.toISOString().slice(0, 10),
      };
    });
    const { error } = await db.from("curriculum_days").insert(rows);
    if (error) throw error;
    console.log(`Built ${rows.length} days of curriculum (${rows[0]?.task_ids.length ?? 0} tasks/day).`);
  } else {
    console.log(`curriculum_days already has ${dayCount} rows — skipping.`);
  }

  console.log("\nDone. Run `npm run dev` and log in as Mubeen or Sana.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
