/**
 * Clears recorded attempts so exercises show as unsolved again and can be
 * done over. Does NOT touch question_bank/dictionary/grammar_points/
 * curriculum_days/profiles — only the record of what's been solved.
 *
 * Usage:
 *   npm run reset-attempts                    (everyone)
 *   npm run reset-attempts -- --name Mubeen    (just one person)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local.");
    process.exit(1);
  }
  const db = createClient(url, key);
  const name = arg("name");

  let profileIds: string[] | null = null;
  if (name) {
    const { data, error } = await db.from("profiles").select("id, name").ilike("name", name);
    if (error) throw error;
    if (!data || data.length === 0) {
      console.error(`No profile named "${name}" found.`);
      process.exit(1);
    }
    profileIds = data.map((p) => p.id);
    console.log(`Resetting attempts for: ${data.map((p) => p.name).join(", ")}`);
  } else {
    console.log("Resetting attempts for everyone.");
  }

  const { count: before } = await db.from("attempts").select("*", { count: "exact", head: true });

  let query = db.from("attempts").delete();
  query = profileIds ? query.in("profile_id", profileIds) : query.gte("created_at", "1900-01-01");
  const { error } = await query;
  if (error) throw error;

  const { count: after } = await db.from("attempts").select("*", { count: "exact", head: true });
  console.log(`Done. attempts: ${before} -> ${after}. All affected exercises now show as unsolved again.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
