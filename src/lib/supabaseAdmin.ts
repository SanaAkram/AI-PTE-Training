import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  throw new Error(
    `Missing required env var (tried: ${names.join(", ")}). Copy .env.example to .env.local and fill it in.`
  );
}

let cached: SupabaseClient | null = null;

/**
 * Server-only Supabase client, authenticated with the project's full-access
 * secret key. This bypasses Row Level Security by design (see
 * supabase/schema.sql) — every table is only ever touched from server code
 * (Server Actions, Route Handlers, scripts). Never import this file from a
 * Client Component.
 *
 * Supabase renamed its key types (2024): newer dashboards show
 * "Publishable key" / "Secret key" instead of the older "anon" / "service_role"
 * JWTs. Both env var names are accepted here so this works with either a
 * fresh project (SUPABASE_SECRET_KEY) or an older one still on legacy keys
 * (SUPABASE_SERVICE_ROLE_KEY).
 */
export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(
    requireEnv(["SUPABASE_URL"]),
    requireEnv(["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"]),
    { auth: { persistSession: false } }
  );
  return cached;
}
