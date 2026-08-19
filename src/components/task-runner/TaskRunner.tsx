"use client";
import { useState } from "react";
import type { QuestionRow, ResponsePayload, ScoreBreakdown, TaskType } from "@/lib/types";
import type { TaskTypeConfig } from "@/lib/taskTypes";
import { Bilingual, PteTag } from "@/components/ui";
import { SpeakingRenderer } from "./SpeakingRenderer";
import { WritingRenderer } from "./WritingRenderer";
import { ReadingMcqRenderer } from "./ReadingMcqRenderer";
import { ReorderRenderer } from "./ReorderRenderer";
import { BlankDragRenderer } from "./BlankDragRenderer";
import { BlankDropdownRenderer } from "./BlankDropdownRenderer";
import { ListeningSummaryRenderer } from "./ListeningSummaryRenderer";
import { ListeningBlanksRenderer } from "./ListeningBlanksRenderer";
import { HighlightIncorrectWordsRenderer } from "./HighlightIncorrectWordsRenderer";
import { DictationRenderer } from "./DictationRenderer";
import { AudioGate } from "./AudioGate";
import { ScoreCard } from "./ScoreCard";
import { useTaskNav } from "./useTaskNav";
import type {
  EssayWritingPayload,
  HighlightCorrectSummaryPayload,
  HighlightIncorrectWordsPayload,
  ListeningFillBlanksPayload,
  ListeningMcqMultiplePayload,
  ListeningMcqSinglePayload,
  ReadingFillBlanksDragPayload,
  ReadingMcqMultiplePayload,
  ReadingMcqSinglePayload,
  ReadingWritingFillBlanksDropdownPayload,
  ReorderParagraphsPayload,
  SelectMissingWordPayload,
  SummarizeWrittenTextPayload,
} from "@/lib/types";
import { submitAttempt } from "@/app/practice/task/[id]/actions";

export function TaskRunner({
  question,
  config,
}: {
  question: QuestionRow;
  config: TaskTypeConfig;
}) {
  const [grading, setGrading] = useState(false);
  const [score, setScore] = useState<ScoreBreakdown | null>(null);
  const payload = question.payload as Record<string, unknown>;
  const { goNext } = useTaskNav();

  async function handleSubmit(response: ResponsePayload) {
    setGrading(true);
    try {
      const result = await submitAttempt(question.id, response);
      setScore(result);
    } finally {
      setGrading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Bilingual ur={config.labelUr} en={config.labelEn.toUpperCase()} />
          <PteTag>{config.pteNote}</PteTag>
        </div>
        {!grading && !score && (
          <button
            onClick={() => goNext(question.task_type as TaskType)}
            className="shrink-0 text-xs font-bold text-ink-soft border border-line rounded-full px-3 py-1.5 mt-0.5"
          >
            چھوڑیں <span className="opacity-70">(Skip)</span> ⏭
          </button>
        )}
      </div>

      {grading && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3 animate-pulse">⏳</div>
          <Bilingual center ur="جانچا جا رہا ہے..." en="GRADING..." />
        </div>
      )}

      {!grading && score && <ScoreCard score={score} taskType={question.task_type as TaskType} />}

      {!grading && !score && (
        <TaskBody taskType={question.task_type as TaskType} payload={payload} config={config} onSubmit={handleSubmit} />
      )}
    </div>
  );
}

function TaskBody({
  taskType,
  payload,
  config,
  onSubmit,
}: {
  taskType: TaskType;
  payload: Record<string, unknown>;
  config: TaskTypeConfig;
  onSubmit: (r: ResponsePayload) => void;
}) {
  switch (config.renderer) {
    case "speaking":
      return (
        <SpeakingRenderer
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          taskType={taskType as any}
          payload={payload}
          config={config}
          onSubmit={onSubmit}
        />
      );

    case "writing": {
      const source =
        "passage" in payload
          ? { passage: payload.passage as string }
          : { prompt: payload.prompt as string };
      return (
        <WritingRenderer
          payload={source as SummarizeWrittenTextPayload | EssayWritingPayload}
          config={config}
          sourceLabelUr="متن پڑھیں"
          sourceLabelEn="READ THE SOURCE TEXT"
          onSubmit={onSubmit}
        />
      );
    }

    case "reading_mcq": {
      const p = payload as unknown as ReadingMcqSinglePayload | ReadingMcqMultiplePayload;
      return (
        <ReadingMcqRenderer
          passage={p.passage}
          question={p.question}
          options={p.options}
          multiSelect={!!config.multiSelect}
          onSubmit={onSubmit}
        />
      );
    }

    case "reorder":
      return (
        <ReorderRenderer
          payload={payload as unknown as ReorderParagraphsPayload}
          onSubmit={onSubmit}
        />
      );

    case "blank_drag":
      return (
        <BlankDragRenderer
          payload={payload as unknown as ReadingFillBlanksDragPayload}
          onSubmit={onSubmit}
        />
      );

    case "blank_dropdown":
      return (
        <BlankDropdownRenderer
          payload={payload as unknown as ReadingWritingFillBlanksDropdownPayload}
          onSubmit={onSubmit}
        />
      );

    case "listening_summary": {
      const audioText = payload.audioText as string;
      return (
        <AudioGate text={audioText}>
          <ListeningSummaryRenderer config={config} onSubmit={onSubmit} />
        </AudioGate>
      );
    }

    case "listening_mcq": {
      const p = payload as unknown as ListeningMcqSinglePayload | ListeningMcqMultiplePayload;
      return (
        <AudioGate text={p.audioText}>
          <ReadingMcqRenderer
            question={p.question}
            options={p.options}
            multiSelect={!!config.multiSelect}
            onSubmit={onSubmit}
          />
        </AudioGate>
      );
    }

    case "listening_blanks":
      return (
        <AudioGate text={payload.audioText as string}>
          <ListeningBlanksRenderer
            payload={payload as unknown as ListeningFillBlanksPayload}
            onSubmit={onSubmit}
          />
        </AudioGate>
      );

    case "highlight_summary": {
      const p = payload as unknown as HighlightCorrectSummaryPayload;
      return (
        <AudioGate text={p.audioText}>
          <ReadingMcqRenderer
            question="سب سے صحیح خلاصہ کون سا ہے؟ / Which is the best summary?"
            options={p.summaries}
            multiSelect={false}
            onSubmit={onSubmit}
          />
        </AudioGate>
      );
    }

    case "select_missing_word": {
      const p = payload as unknown as SelectMissingWordPayload;
      return (
        <AudioGate text={p.audioTextBeforeGap}>
          <ReadingMcqRenderer
            question="غائب لفظ کون سا ہے؟ / Which word is missing?"
            options={p.options}
            multiSelect={false}
            onSubmit={onSubmit}
          />
        </AudioGate>
      );
    }

    case "highlight_incorrect_words":
      return (
        <AudioGate text={payload.audioText as string}>
          <HighlightIncorrectWordsRenderer
            payload={payload as unknown as HighlightIncorrectWordsPayload}
            onSubmit={onSubmit}
          />
        </AudioGate>
      );

    case "dictation":
      return (
        <AudioGate text={payload.audioText as string}>
          <DictationRenderer onSubmit={onSubmit} />
        </AudioGate>
      );

    default:
      return <p>Unknown renderer: {config.renderer}</p>;
  }
}
