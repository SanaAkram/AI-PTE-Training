"use client";
import { useState } from "react";
import type { ResponsePayload } from "@/lib/types";
import { Bilingual, Button } from "@/components/ui";

export function ReadingMcqRenderer({
  passage,
  question,
  options,
  multiSelect,
  onSubmit,
}: {
  passage?: string;
  question: string;
  options: string[];
  multiSelect: boolean;
  onSubmit: (r: ResponsePayload) => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);

  function toggle(i: number) {
    if (multiSelect) {
      setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
    } else {
      // Single-answer: submit immediately, no separate tap needed.
      onSubmit({ kind: "choice", indices: [i] });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {passage && (
        <div className="bg-surface-alt rounded-2xl p-4 en text-sm leading-relaxed max-h-56 overflow-y-auto">
          {passage}
        </div>
      )}
      <p className="en text-base font-semibold text-center">{question}</p>
      <div className="flex flex-col gap-2.5">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`en text-left rounded-2xl border-2 px-4 py-3.5 transition ${
              selected.includes(i) ? "border-accent bg-surface-alt" : "border-line bg-surface"
            }`}
          >
            {multiSelect ? (selected.includes(i) ? "☑" : "☐") : selected.includes(i) ? "🔘" : "⚪"} {opt}
          </button>
        ))}
      </div>
      <Bilingual
        center
        ur={multiSelect ? "تمام درست جواب چنیں" : "جواب پر دبائیں"}
        en={multiSelect ? "SELECT ALL THAT APPLY" : "TAP YOUR ANSWER"}
      />
      {multiSelect && (
        <Button
          disabled={selected.length === 0}
          onClick={() => onSubmit({ kind: "choice", indices: selected })}
        >
          جمع کرائیں <span className="opacity-80 text-sm">(Submit)</span>
        </Button>
      )}
    </div>
  );
}
