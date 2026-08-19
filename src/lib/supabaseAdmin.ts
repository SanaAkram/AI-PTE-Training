import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required env var ${name}. Copy .env.example to .env.local and fill it in.`
    );
  }
  return value;
}

let cached: SupabaseClient | null = null;

/**
 * Server-only Supabase client, authenticated with the service_role key.
 * This bypasses Row Level Security by design (see supabase/schema.sql) —
 * every table is only ever touched from server code (Server Actions, Route
 * Handlers, scripts). Never import this file from a Client Component.
 */
export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });
  return cached;
}
