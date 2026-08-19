/**
 * Sets an existing learner's difficulty level.
 * Usage:  npm run set-level -- --name Haneef --level easy
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const name = arg("name");
  const level = arg("level");
  if (!name || !level || !["easy", "medium", "hard"].includes(level)) {
    console.error("Usage: npm run set-level -- --name <Name> --level <easy|medium|hard>");
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local.");
    process.exit(1);
  }
  const db = createClient(url, key);

  const { data, error } = await db
    .from("profiles")
    .update({ preferred_difficulty: level })
    .ilike("name", name)
    .select("name, preferred_difficulty");
  if (error) throw error;
  if (!data || data.length === 0) {
    console.error(`No profile named "${name}" found.`);
    process.exit(1);
  }
  console.log(`${data[0].name} is now set to level: ${data[0].preferred_difficulty}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
