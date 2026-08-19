import { supabaseAdmin } from "@/lib/supabaseAdmin";
import LoginClient, { type LoginProfile } from "./LoginClient";

// Always render per-request — the profile list can change (re-seeding, PIN
// resets) and this route has no other dynamic API call to signal that to
// Next.js, so without this it would try to prerender at build time, before
// any Supabase credentials exist.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { data } = await supabaseAdmin()
    .from("profiles")
    .select("id, name, role")
    .order("role", { ascending: false });

  const profiles = (data ?? []) as LoginProfile[];
  return <LoginClient profiles={profiles} />;
}
