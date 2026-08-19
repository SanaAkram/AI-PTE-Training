/**
 * Adds one more household profile (another learner or observer) without
 * touching existing ones — unlike seed.ts, which only knows about Mubeen/Sana.
 *
 * Usage:  npm run add-profile -- --name Haneef --role learner --pin 12348 --level easy
 * (--level defaults to "medium"; only matters for learners)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { randomBytes, scrypt as scryptCb } from "crypto";
import { promisify } from "util";
import { createClient } from "@supabase/supabase-js";

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

async function hashPin(pin: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(pin, salt, 32);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const name = arg("name");
  const role = arg("role") ?? "learner";
  const pin = arg("pin");
  const level = arg("level") ?? "medium";

  if (!name || !pin || (role !== "learner" && role !== "observer")) {
    console.error('Usage: npm run add-profile -- --name <Name> --role <learner|observer> --pin <passcode> [--level easy|medium|hard]');
    process.exit(1);
  }
  if (!["easy", "medium", "hard"].includes(level)) {
    console.error("--level must be easy, medium, or hard.");
    process.exit(1);
  }
  if (pin.length < 4) {
    console.error("Passcode must be at least 4 digits.");
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local.");
    process.exit(1);
  }
  const db = createClient(url, key);

  const { data: existing, error: selectError } = await db
    .from("profiles")
    .select("id, name")
    .ilike("name", name);
  if (selectError) throw selectError;
  if (existing && existing.length > 0) {
    console.error(`A profile named "${name}" already exists — pick a different name or edit it directly in Supabase.`);
    process.exit(1);
  }

  const { error } = await db
    .from("profiles")
    .insert({ name, role, pin_hash: await hashPin(pin), preferred_difficulty: level });
  if (error) throw error;

  console.log(`Created profile: ${name} (${role}), passcode ${pin}, level ${level}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
