import { notFound, redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { TASK_TYPES } from "@/lib/taskTypes";
import type { TaskType } from "@/lib/types";

export default async function SectionPracticePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!(type in TASK_TYPES)) notFound();

  const { data } = await supabaseAdmin()
    .from("question_bank")
    .select("id")
    .eq("task_type", type as TaskType);

  if (!data || data.length === 0) {
    redirect(`/practice?empty=${type}`);
  }

  const pick = data[Math.floor(Math.random() * data.length)];
  redirect(`/practice/task/${pick.id}?returnTo=${encodeURIComponent("/practice")}`);
}
