"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getSession } from "@/lib/auth";
import { scoreAttempt } from "@/lib/scoring";
import type { ResponsePayload, ScoreBreakdown, TaskType } from "@/lib/types";

export async function submitAttempt(
  questionId: string,
  response: ResponsePayload
): Promise<ScoreBreakdown> {
  const session = await getSession();
  if (!session) throw new Error("Not logged in");

  const { data: q, error } = await supabaseAdmin()
    .from("question_bank")
    .select("id, task_type, payload")
    .eq("id", questionId)
    .single();
  if (error || !q) throw new Error("Question not found");

  const score = await scoreAttempt(q.task_type as TaskType, q.payload, response);

  await supabaseAdmin().from("attempts").insert({
    profile_id: session.profileId,
    question_id: questionId,
    response,
    score_breakdown: score,
  });

  return score;
}
