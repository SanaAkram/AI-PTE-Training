"use client";
import { useState } from "react";
import type { TaskTypeConfig } from "@/lib/taskTypes";
import type { EssayWritingPayload, ResponsePayload, SummarizeWrittenTextPayload } from "@/lib/types";
import { useCountdown, formatSeconds } from "@/lib/hooks/useCountdown";
import { Bilingual, Button } from "@/components/ui";

function wordCount(text: string): number {
  return text.trim().length ? text.trim().split(/\s+/).length : 0;
}

export function WritingRenderer({
  payload,
  config,
  sourceLabelUr,
  sourceLabelEn,
  onSubmit,
}: {
  payload: SummarizeWrittenTextPayload | EssayWritingPayload;
  config: TaskTypeConfig;
  sourceLabelUr: string;
  sourceLabelEn: string;
  onSubmit: (r: ResponsePayload) => void;
}) {
  const [text, setText] = useState("");
  const source = "passage" in payload ? payload.passage : payload.prompt;
  const { min, max } = config.wordLimit ?? { min: 0, max: Infinity };
  const count = wordCount(text);
  const inRange = count >= min && count <= max;

  const timer = useCountdown(
    (config.writeMinutes ?? 10) * 60,
    () => submit(),
    true
  );

  function submit() {
    onSubmit({ kind: "text", value: text });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Bilingual ur={sourceLabelUr} en={sourceLabelEn} />
        <div className="text-lg font-display font-extrabold tabular-nums" dir="ltr">
          {formatSeconds(timer.remaining)}
        </div>
      </div>

      <div className="bg-surface-alt rounded-2xl p-4 en text-sm leading-relaxed max-h-48 overflow-y-auto">
        {source}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        dir="ltr"
        placeholder="Type your answer here..."
        className="en w-full rounded-2xl border border-line bg-surface p-4 text-base leading-relaxed resize-none"
      />

      <div className="flex items-center justify-between text-sm">
        <span className={inRange ? "text-teal font-bold" : "text-rose font-bold"}>
          {count} / {min}-{max} words
        </span>
      </div>

      <Button variant="primary" onClick={submit} disabled={count === 0}>
        جمع کرائیں <span className="opacity-80 text-sm">(Submit)</span>
      </Button>
    </div>
  );
}
