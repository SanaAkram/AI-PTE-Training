"use client";
import { useEffect, useRef, useState } from "react";
import type { TaskTypeConfig } from "@/lib/taskTypes";
import type {
  AnswerShortQuestionPayload,
  DescribeImagePayload,
  ReadAloudPayload,
  RepeatSentencePayload,
  RespondToSituationPayload,
  RetellLecturePayload,
  ResponsePayload,
  SpeakingTaskType,
  SummarizeGroupDiscussionPayload,
} from "@/lib/types";
import { useCountdown, formatSeconds } from "@/lib/hooks/useCountdown";
import { speakOnce, speakSequence, useSpeechRecognition } from "@/lib/hooks/useSpeech";
import { useAudioRate } from "@/lib/hooks/useAudioRate";
import { Bilingual, Button } from "@/components/ui";
import { SimpleChart } from "./SimpleChart";
import { ReplayButton } from "./ReplayButton";

/** The literal text/lines to replay for audio-first speaking tasks, or null
 * for tasks with no spoken prompt (Read Aloud, Describe Image, Respond to a
 * Situation just show text/an image — nothing was played aloud to replay). */
function audioReplayFor(taskType: SpeakingTaskType, payload: unknown): { text?: string; lines?: string[] } | null {
  switch (taskType) {
    case "repeat_sentence":
      return { text: (payload as RepeatSentencePayload).audioText };
    case "retell_lecture":
      return { text: (payload as RetellLecturePayload).audioText };
    case "answer_short_question":
      return { text: (payload as AnswerShortQuestionPayload).audioText };
    case "summarize_group_discussion": {
      const p = payload as SummarizeGroupDiscussionPayload;
      return { lines: p.lines.map((l) => `${l.speaker} says: ${l.text}`) };
    }
    default:
      return null;
  }
}

const AUDIO_FIRST: SpeakingTaskType[] = [
  "repeat_sentence",
  "retell_lecture",
  "answer_short_question",
  "summarize_group_discussion",
];

function Prompt({ taskType, payload }: { taskType: SpeakingTaskType; payload: unknown }) {
  switch (taskType) {
    case "read_aloud":
      return (
        <p className="en text-xl leading-relaxed text-center font-display font-semibold">
          {(payload as ReadAloudPayload).text}
        </p>
      );
    case "describe_image":
      return <SimpleChart payload={payload as DescribeImagePayload} />;
    case "respond_to_situation":
      return (
        <p className="en text-lg leading-relaxed text-center">
          {(payload as RespondToSituationPayload).situationText}
        </p>
      );
    default:
      return <p className="text-center text-4xl">🔊</p>;
  }
}

export function SpeakingRenderer({
  taskType,
  payload,
  config,
  onSubmit,
}: {
  taskType: SpeakingTaskType;
  payload: unknown;
  config: TaskTypeConfig;
  onSubmit: (r: ResponsePayload) => void;
}) {
  const audioFirst = AUDIO_FIRST.includes(taskType);
  const [phase, setPhase] = useState<"listen" | "prep" | "record">(
    audioFirst ? "listen" : config.prepSeconds ? "prep" : "record"
  );
  const { start, stop, listening, supported } = useSpeechRecognition();
  const { rate } = useAudioRate();
  const replay = audioReplayFor(taskType, payload);
  const recordStartRef = useRef(0);
  const finishedRef = useRef(false);
  const lastTranscriptRef = useRef("");

  function finish(transcript: string) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const durationMs = Date.now() - recordStartRef.current;
    const words = transcript.trim().split(/\s+/).filter(Boolean);
    onSubmit({
      kind: "speech",
      transcript: transcript.trim() || "[no speech captured]",
      durationMs,
      spokenWordCount: words.length,
    });
  }

  const prep = useCountdown(config.prepSeconds ?? 0, () => setPhase("record"), false);
  const record = useCountdown(
    config.recordSeconds ?? 15,
    () => {
      if (supported) {
        stop();
        setTimeout(() => finish(lastTranscriptRef.current), 1500);
      } else {
        finish("");
      }
    },
    false
  );

  // Kick off the "listen" phase for audio-first tasks.
  useEffect(() => {
    if (phase !== "listen") return;
    let cancelled = false;
    async function play() {
      if (replay?.lines) {
        await speakSequence(replay.lines, rate);
      } else if (replay?.text) {
        await speakOnce(replay.text, rate);
      }
      if (!cancelled) setPhase(config.prepSeconds ? "prep" : "record");
    }
    play();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase === "prep") {
      prep.reset(config.prepSeconds ?? 0);
      prep.start();
    }
    if (phase === "record") {
      record.reset(config.recordSeconds ?? 15);
      record.start();
      recordStartRef.current = Date.now();
      if (supported) {
        start(
          (t) => {
            lastTranscriptRef.current = t;
            finish(t);
          },
          () => finish("")
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <div className="flex flex-col gap-5">
      {phase === "listen" && (
        <div className="text-center py-6">
          <div className="text-5xl mb-3 animate-pulse">🔊</div>
          <Bilingual center ur="غور سے سنیں" en="LISTEN CAREFULLY" />
        </div>
      )}

      {(phase === "prep" || phase === "record") && (
        <div className="bg-surface-alt rounded-2xl p-5">
          <Prompt taskType={taskType} payload={payload} />
          {replay && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <ReplayButton text={replay.text} lines={replay.lines} size="sm" />
              <Bilingual center ur="دوبارہ سنیں" en="LISTEN AGAIN" />
            </div>
          )}
        </div>
      )}

      {phase === "prep" && (
        <div className="text-center">
          <Bilingual center ur="تیاری کا وقت" en="PREPARATION TIME" />
          <div className="text-3xl font-display font-extrabold mt-2 tabular-nums" dir="ltr">
            {formatSeconds(prep.remaining)}
          </div>
        </div>
      )}

      {phase === "record" && (
        <div className="text-center flex flex-col items-center gap-3">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl ${
              listening ? "bg-rose animate-pulse" : "bg-accent"
            }`}
          >
            🎤
          </div>
          <Bilingual
            center
            ur={supported ? "اب بولیں" : "مائیک دستیاب نہیں — پھر بھی بول کر مشق کریں"}
            en={supported ? "SPEAK NOW" : "MIC UNAVAILABLE — PRACTICE SPEAKING ANYWAY"}
          />
          <div className="text-2xl font-display font-extrabold tabular-nums" dir="ltr">
            {formatSeconds(record.remaining)}
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              if (supported) stop();
              setTimeout(() => finish(lastTranscriptRef.current), 300);
            }}
          >
            ختم کریں <span className="opacity-70 text-sm">(Finish now)</span>
          </Button>
        </div>
      )}
    </div>
  );
}

