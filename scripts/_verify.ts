import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

async function main() {
  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  const r1 = await db.from("personal_vocab").select("examples").limit(1);
  console.log("personal_vocab.examples query error:", r1.error?.message ?? "none (OK)");

  const { count: dictCount } = await db.from("dictionary").select("*", { count: "exact", head: true });
  const { count: gramCount } = await db.from("grammar_points").select("*", { count: "exact", head: true });
  const { count: qCount } = await db.from("question_bank").select("*", { count: "exact", head: true });
  console.log("dictionary:", dictCount, "| grammar_points:", gramCount, "| question_bank:", qCount);

  const { data: profiles } = await db.from("profiles").select("name, role, preferred_difficulty");
  console.log("profiles:", profiles);
}
main();
