import "server-only";
import { supabaseAdmin } from "./supabaseAdmin";
import { DIFFICULTY_RANGE } from "./difficulty";
import type { DifficultyLevel, TaskType } from "./types";

/** Random question id of the given type, preferring the learner's level —
 * falls back to any difficulty for that type so a thin bank never dead-ends. */
export async function pickRandomQuestionId(
  taskType: TaskType,
  level: DifficultyLevel
): Promise<string | null> {
  const db = supabaseAdmin();
  const [min, max] = DIFFICULTY_RANGE[level];
  const { data } = await db
    .from("question_bank")
    .select("id")
    .eq("task_type", taskType)
    .gte("difficulty", min)
    .lte("difficulty", max);
  if (data && data.length > 0) return data[Math.floor(Math.random() * data.length)].id;

  const { data: anyDifficulty } = await db.from("question_bank").select("id").eq("task_type", taskType);
  if (anyDifficulty && anyDifficulty.length > 0) {
    return anyDifficulty[Math.floor(Math.random() * anyDifficulty.length)].id;
  }
  return null;
}

export async function getLearnerDifficulty(profileId: string): Promise<DifficultyLevel> {
  const { data } = await supabaseAdmin()
    .from("profiles")
    .select("preferred_difficulty")
    .eq("id", profileId)
    .single();
  return (data?.preferred_difficulty as DifficultyLevel | undefined) ?? "medium";
}
