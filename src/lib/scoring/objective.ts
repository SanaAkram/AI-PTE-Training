import type {
  ReadingFillBlanksDragPayload,
  ReadingMcqMultiplePayload,
  ReadingMcqSinglePayload,
  ReadingWritingFillBlanksDropdownPayload,
  ReorderParagraphsPayload,
  ResponsePayload,
  ScoreBreakdown,
  HighlightCorrectSummaryPayload,
  HighlightIncorrectWordsPayload,
  ListeningFillBlanksPayload,
  ListeningMcqMultiplePayload,
  ListeningMcqSinglePayload,
  SelectMissingWordPayload,
  TaskType,
  WriteFromDictationPayload,
} from "@/lib/types";

function norm(s: string): string {
  return s.toLowerCase().replace(/[.,!?؟،]/g, "").trim().replace(/\s+/g, " ");
}
function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const as = [...a].sort((x, y) => x - y);
  const bs = [...b].sort((x, y) => x - y);
  return as.every((v, i) => v === bs[i]);
}

/** Exact-match / rule-based scoring for every objective task type — instant, free, no API call. */
export function scoreObjective(
  taskType: TaskType,
  payload: unknown,
  response: ResponsePayload
): ScoreBreakdown {
  switch (taskType) {
    case "reading_mcq_single":
    case "listening_mcq_single": {
      const p = payload as ReadingMcqSinglePayload | ListeningMcqSinglePayload;
      const idx = response.kind === "choice" ? response.indices[0] : -1;
      return {
        kind: "objective",
        correct: idx === p.correctIndex,
        correctAnswer: p.options[p.correctIndex],
      };
    }
    case "reading_mcq_multiple":
    case "listening_mcq_multiple": {
      const p = payload as ReadingMcqMultiplePayload | ListeningMcqMultiplePayload;
      const indices = response.kind === "choice" ? response.indices : [];
      return {
        kind: "objective",
        correct: sameSet(indices, p.correctIndices),
        correctAnswer: p.correctIndices.map((i) => p.options[i]).join(", "),
      };
    }
    case "reorder_paragraphs": {
      const p = payload as ReorderParagraphsPayload;
      const order = response.kind === "order" ? response.value : [];
      const correct =
        order.length === p.paragraphsInOrder.length &&
        order.every((v, i) => v === p.paragraphsInOrder[i]);
      return { kind: "objective", correct, correctAnswer: p.paragraphsInOrder.join(" / ") };
    }
    case "reading_fill_blanks_drag": {
      const p = payload as ReadingFillBlanksDragPayload;
      const values = response.kind === "blanks" ? response.values : [];
      const correct =
        values.length === p.answers.length &&
        values.every((v, i) => norm(v) === norm(p.answers[i]));
      return { kind: "objective", correct, correctAnswer: p.answers.join(", ") };
    }
    case "reading_writing_fill_blanks_dropdown": {
      const p = payload as ReadingWritingFillBlanksDropdownPayload;
      const indices = response.kind === "choice" ? response.indices : [];
      const correct =
        indices.length === p.blanks.length &&
        indices.every((v, i) => v === p.blanks[i].correctIndex);
      return {
        kind: "objective",
        correct,
        correctAnswer: p.blanks.map((b) => b.options[b.correctIndex]).join(", "),
      };
    }
    case "listening_fill_blanks": {
      const p = payload as ListeningFillBlanksPayload;
      const values = response.kind === "blanks" ? response.values : [];
      const correct =
        values.length === p.answers.length &&
        values.every((v, i) => norm(v) === norm(p.answers[i]));
      return { kind: "objective", correct, correctAnswer: p.answers.join(", ") };
    }
    case "highlight_correct_summary": {
      const p = payload as HighlightCorrectSummaryPayload;
      const idx = response.kind === "choice" ? response.indices[0] : -1;
      return {
        kind: "objective",
        correct: idx === p.correctIndex,
        correctAnswer: p.summaries[p.correctIndex],
      };
    }
    case "select_missing_word": {
      const p = payload as SelectMissingWordPayload;
      const idx = response.kind === "choice" ? response.indices[0] : -1;
      return {
        kind: "objective",
        correct: idx === p.correctIndex,
        correctAnswer: p.options[p.correctIndex],
      };
    }
    case "highlight_incorrect_words": {
      const p = payload as HighlightIncorrectWordsPayload;
      const indices = response.kind === "word_taps" ? response.indices : [];
      return {
        kind: "objective",
        correct: sameSet(indices, p.incorrectWordIndices),
        correctAnswer: p.incorrectWordIndices
          .map((i) => p.transcriptWithErrors.split(" ")[i])
          .join(", "),
      };
    }
    case "write_from_dictation": {
      const p = payload as WriteFromDictationPayload;
      const value = response.kind === "text" ? response.value : "";
      return { kind: "objective", correct: norm(value) === norm(p.audioText), correctAnswer: p.audioText };
    }
    default:
      return { kind: "objective", correct: false, correctAnswer: "" };
  }
}
