import { TASK_TYPES } from "@/lib/taskTypes";
import type { ResponsePayload, ScoreBreakdown, TaskType } from "@/lib/types";
import { scoreObjective } from "./objective";
import { scoreWithAI } from "./ai";

export async function scoreAttempt(
  taskType: TaskType,
  payload: unknown,
  response: ResponsePayload
): Promise<ScoreBreakdown> {
  const config = TASK_TYPES[taskType];
  if (config.scoring === "ai") return scoreWithAI(taskType, payload, response);
  return scoreObjective(taskType, payload, response);
}
