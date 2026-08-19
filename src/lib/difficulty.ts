import type { DifficultyLevel } from "./types";

/** Maps the 3 learner-facing levels onto the 1-5 difficulty scale stored on question_bank rows. */
export const DIFFICULTY_RANGE: Record<DifficultyLevel, [number, number]> = {
  easy: [1, 2],
  medium: [2, 3],
  hard: [4, 5],
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, { ur: string; en: string; icon: string }> = {
  easy: { ur: "آسان", en: "Easy", icon: "🌱" },
  medium: { ur: "درمیانہ", en: "Medium", icon: "🌿" },
  hard: { ur: "مشکل", en: "Hard", icon: "🌳" },
};

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ["easy", "medium", "hard"];
