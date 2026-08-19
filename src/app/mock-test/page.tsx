import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ALL_TASK_TYPES, TASK_TYPES } from "@/lib/taskTypes";

// Real section order: Speaking & Writing tasks are interleaved by Pearson's
// algorithm, then Reading, then Listening. We approximate with our
// registry's natural order within each section.
const SECTION_ORDER = ["speaking", "writing", "reading", "listening"] as const;

export default async function MockTestStartPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "observer") redirect("/dashboard");

  const db = supabaseAdmin();
  const orderedTypes = ALL_TASK_TYPES.slice().sort(
    (a, b) => SECTION_ORDER.indexOf(TASK_TYPES[a].section) - SECTION_ORDER.indexOf(TASK_TYPES[b].section)
  );

  const ids: string[] = [];
  for (const type of orderedTypes) {
    const { data } = await db.from("question_bank").select("id").eq("task_type", type);
    if (data && data.length > 0) {
      ids.push(data[Math.floor(Math.random() * data.length)].id);
    }
  }

  if (ids.length === 0) {
    redirect("/today?empty=mock-test");
  }

  const queue = ids.join(",");
  redirect(
    `/practice/task/${ids[0]}?queue=${queue}&pos=0&returnTo=${encodeURIComponent(`/mock-test/summary?ids=${queue}`)}`
  );
}
