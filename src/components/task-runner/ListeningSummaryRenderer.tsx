"use client";
import { useState } from "react";
import type { TaskTypeConfig } from "@/lib/taskTypes";
import type { ResponsePayload } from "@/lib/types";
import { useCountdown, formatSeconds } from "@/lib/hooks/useCountdown";
import { Bilingual, Button } from "@/components/ui";

export function ListeningSummaryRenderer({
  config,
  onSubmit,
}: {
  config: TaskTypeConfig;
  onSubmit: (r: ResponsePayload) => void;
}) {
  const [text, setText] = useState("");
  const { min, max } = config.wordLimit ?? { min: 0, max: Infinity };
  const count = text.trim().length ? text.trim().split(/\s+/).length : 0;
  const inRange = count >= min && count <= max;
  const timer = useCountdown((config.writeMinutes ?? 10) * 60, () => submit(), true);

  function submit() {
    onSubmit({ kind: "text", value: text });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Bilingual ur="خلاصہ لکھیں" en="WRITE YOUR SUMMARY" />
        <div className="text-lg font-display font-extrabold tabular-nums" dir="ltr">
          {formatSeconds(timer.remaining)}
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        dir="ltr"
        placeholder="Type your summary here..."
        className="en w-full rounded-2xl border border-line bg-surface p-4 text-base leading-relaxed resize-none"
      />
      <div className="flex items-center justify-between text-sm">
        <span className={inRange ? "text-teal font-bold" : "text-rose font-bold"}>
          {count} / {min}-{max} words
        </span>
      </div>
      <Button disabled={count === 0} onClick={submit}>
        جمع کرائیں <span className="opacity-80 text-sm">(Submit)</span>
      </Button>
    </div>
  );
}
