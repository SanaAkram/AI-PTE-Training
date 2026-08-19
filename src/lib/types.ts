// Core domain types shared across the app: the DB rows, the 22 real PTE
// task-type payload shapes, and the response/score shapes attempts store.
//
// Note on count: the plan referenced "20" types (the commonly-cited rough
// count); the actual current PTE Academic syllabus — including the two
// newest task types, Respond to a Situation and Summarize Group Discussion —
// comes to 22. This file implements the accurate, complete list.

export type Section = "speaking" | "writing" | "reading" | "listening";

export type SpeakingTaskType =
  | "read_aloud"
  | "repeat_sentence"
  | "describe_image"
  | "retell_lecture"
  | "answer_short_question"
  | "respond_to_situation"
  | "summarize_group_discussion";

export type WritingTaskType = "summarize_written_text" | "essay_writing";

export type ReadingTaskType =
  | "reading_mcq_single"
  | "reading_mcq_multiple"
  | "reorder_paragraphs"
  | "reading_fill_blanks_drag"
  | "reading_writing_fill_blanks_dropdown";

export type ListeningTaskType =
  | "summarize_spoken_text"
  | "listening_mcq_single"
  | "listening_mcq_multiple"
  | "listening_fill_blanks"
  | "highlight_correct_summary"
  | "select_missing_word"
  | "highlight_incorrect_words"
  | "write_from_dictation";

export type TaskType =
  | SpeakingTaskType
  | WritingTaskType
  | ReadingTaskType
  | ListeningTaskType;

// ---------------------------------------------------------------------------
// Payload shapes, one per task type. `payload` in question_bank is one of
// these, discriminated at the call site by the row's task_type column.
// ---------------------------------------------------------------------------

export interface ReadAloudPayload {
  text: string;
}
export interface RepeatSentencePayload {
  audioText: string;
}
export interface DescribeImagePayload {
  imageType: "bar" | "line" | "pie" | "process" | "map" | "table";
  imageTitle: string;
  imageData: Record<string, number> | string[]; // chart values, or ordered process/map steps
  keyPoints: string[];
}
export interface RetellLecturePayload {
  audioText: string;
  keyPoints: string[];
}
export interface AnswerShortQuestionPayload {
  audioText: string;
  answer: string;
}
export interface RespondToSituationPayload {
  situationText: string;
  sampleResponse: string;
}
export interface SummarizeGroupDiscussionPayload {
  lines: { speaker: string; text: string }[];
  keyPoints: string;
}

export interface SummarizeWrittenTextPayload {
  passage: string;
}
export interface EssayWritingPayload {
  prompt: string;
}

export interface ReadingMcqSinglePayload {
  passage: string;
  question: string;
  options: string[];
  correctIndex: number;
}
export interface ReadingMcqMultiplePayload {
  passage: string;
  question: string;
  options: string[];
  correctIndices: number[];
}
export interface ReorderParagraphsPayload {
  paragraphsInOrder: string[]; // correct order; shuffled client-side
}
export interface ReadingFillBlanksDragPayload {
  textWithBlanks: string; // uses {{1}}, {{2}}, ... placeholders
  wordBank: string[]; // correct answers + distractors, shuffled client-side
  answers: string[]; // correct word per blank, in blank order
}
export interface ReadingWritingFillBlanksDropdownPayload {
  textWithBlanks: string;
  blanks: { options: string[]; correctIndex: number }[];
}

export interface SummarizeSpokenTextPayload {
  audioText: string;
}
export interface ListeningMcqSinglePayload {
  audioText: string;
  question: string;
  options: string[];
  correctIndex: number;
}
export interface ListeningMcqMultiplePayload {
  audioText: string;
  question: string;
  options: string[];
  correctIndices: number[];
}
export interface ListeningFillBlanksPayload {
  audioText: string; // full text, spoken as-is
  textWithBlanks: string; // same text with {{1}}, {{2}}, ... for the blanked words
  answers: string[];
}
export interface HighlightCorrectSummaryPayload {
  audioText: string;
  summaries: string[]; // 3-4 options, one correct
  correctIndex: number;
}
export interface SelectMissingWordPayload {
  audioTextBeforeGap: string; // spoken in full, ending right before the missing word
  options: string[];
  correctIndex: number;
}
export interface HighlightIncorrectWordsPayload {
  audioText: string; // the correct spoken version
  transcriptWithErrors: string; // displayed text, space-tokenized, some words wrong
  incorrectWordIndices: number[]; // indices into transcriptWithErrors.split(" ")
}
export interface WriteFromDictationPayload {
  audioText: string; // short sentence, 5-9 words
}

export type PayloadFor<T extends TaskType> = T extends "read_aloud"
  ? ReadAloudPayload
  : T extends "repeat_sentence"
    ? RepeatSentencePayload
    : T extends "describe_image"
      ? DescribeImagePayload
      : T extends "retell_lecture"
        ? RetellLecturePayload
        : T extends "answer_short_question"
          ? AnswerShortQuestionPayload
          : T extends "respond_to_situation"
            ? RespondToSituationPayload
            : T extends "summarize_group_discussion"
              ? SummarizeGroupDiscussionPayload
              : T extends "summarize_written_text"
                ? SummarizeWrittenTextPayload
                : T extends "essay_writing"
                  ? EssayWritingPayload
                  : T extends "reading_mcq_single"
                    ? ReadingMcqSinglePayload
                    : T extends "reading_mcq_multiple"
                      ? ReadingMcqMultiplePayload
                      : T extends "reorder_paragraphs"
                        ? ReorderParagraphsPayload
                        : T extends "reading_fill_blanks_drag"
                          ? ReadingFillBlanksDragPayload
                          : T extends "reading_writing_fill_blanks_dropdown"
                            ? ReadingWritingFillBlanksDropdownPayload
                            : T extends "summarize_spoken_text"
                              ? SummarizeSpokenTextPayload
                              : T extends "listening_mcq_single"
                                ? ListeningMcqSinglePayload
                                : T extends "listening_mcq_multiple"
                                  ? ListeningMcqMultiplePayload
                                  : T extends "listening_fill_blanks"
                                    ? ListeningFillBlanksPayload
                                    : T extends "highlight_correct_summary"
                                      ? HighlightCorrectSummaryPayload
                                      : T extends "select_missing_word"
                                        ? SelectMissingWordPayload
                                        : T extends "highlight_incorrect_words"
                                          ? HighlightIncorrectWordsPayload
                                          : T extends "write_from_dictation"
                                            ? WriteFromDictationPayload
                                            : never;

// ---------------------------------------------------------------------------
// DB rows
// ---------------------------------------------------------------------------

export interface QuestionRow {
  id: string;
  section: Section;
  task_type: TaskType;
  payload: unknown; // narrow with PayloadFor<T> at the call site
  difficulty: 1 | 2 | 3 | 4 | 5;
  source: "seed" | "daily_gen";
  created_at: string;
}

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface ProfileRow {
  id: string;
  name: string;
  role: "learner" | "observer";
  pin_hash: string;
  preferred_difficulty: DifficultyLevel;
  created_at: string;
}

export interface GrammarPointRow {
  id: string;
  title_en: string;
  title_ur: string;
  explanation_ur: string;
  pattern_en: string;
  examples: { en: string; ur: string }[];
  practice_sentence: string; // contains {{blank}} once
  practice_options: string[];
  practice_answer: string;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  created_at: string;
}

export interface DictionaryRow {
  id: string;
  english: string;
  meaning_ur: string;
  example_en: string;
  example_ur: string;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  created_at: string;
}

export interface PersonalVocabRow {
  id: string;
  profile_id: string;
  term: string;
  english: string;
  meaning_ur: string;
  example_en: string;
  example_ur: string;
  created_at: string;
}

export interface CurriculumDayRow {
  id: string;
  day_number: number;
  task_ids: string[];
  unlock_date: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Responses & scoring
// ---------------------------------------------------------------------------

export type ResponsePayload =
  | { kind: "text"; value: string }
  | { kind: "choice"; indices: number[] }
  | { kind: "order"; value: string[] }
  | { kind: "blanks"; values: string[] }
  | { kind: "word_taps"; indices: number[] }
  | { kind: "speech"; transcript: string; durationMs: number; spokenWordCount: number };

export type ScoreBreakdown =
  | {
      kind: "objective";
      correct: boolean;
      correctAnswer: string;
    }
  | {
      kind: "ai";
      overall: number; // 0-100 practice scale, not an official PTE score
      criteria: { label: string; score: number; max: number }[];
      feedback: string;
    };

export interface AttemptRow {
  id: string;
  profile_id: string;
  question_id: string;
  response: ResponsePayload;
  score_breakdown: ScoreBreakdown;
  created_at: string;
}
