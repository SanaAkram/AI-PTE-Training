"use client";
import { useState } from "react";
import type { ReadingFillBlanksDragPayload, ResponsePayload } from "@/lib/types";
import { Bilingual, Button } from "@/components/ui";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function BlankDragRenderer({
  payload,
  onSubmit,
}: {
  payload: ReadingFillBlanksDragPayload;
  onSubmit: (r: ResponsePayload) => void;
}) {
  const segments = payload.textWithBlanks.split(/\{\{\d+\}\}/);
  const blankCount = segments.length - 1;
  const [bank] = useState(() => shuffle(payload.wordBank));
  const [placedBankIndex, setPlacedBankIndex] = useState<(number | null)[]>(
    Array(blankCount).fill(null)
  );

  function place(bankIdx: number) {
    if (placedBankIndex.includes(bankIdx)) return;
    const nextEmpty = placedBankIndex.findIndex((v) => v === null);
    if (nextEmpty === -1) return;
    setPlacedBankIndex((p) => p.map((v, i) => (i === nextEmpty ? bankIdx : v)));
  }
  function clearBlank(i: number) {
    setPlacedBankIndex((p) => p.map((v, idx) => (idx === i ? null : v)));
  }
  const allFilled = placedBankIndex.every((v) => v !== null);

  return (
    <div className="flex flex-col gap-4">
      <Bilingual ur="لفظ دبائیں تاکہ اگلی خالی جگہ پُر ہو" en="TAP A WORD TO FILL THE NEXT BLANK" />

      <p className="en text-base leading-loose" dir="ltr">
        {segments.map((seg, i) => (
          <span key={i}>
            {seg}
            {i < blankCount && (
              <button
                onClick={() => clearBlank(i)}
                className={`inline-block mx-1 px-3 py-1 rounded-lg border-b-2 font-bold ${
                  placedBankIndex[i] !== null
                    ? "border-accent bg-surface-alt"
                    : "border-line bg-surface text-ink-soft"
                }`}
              >
                {placedBankIndex[i] !== null ? bank[placedBankIndex[i] as number] : `___`}
              </button>
            )}
          </span>
        ))}
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        {bank.map((word, i) => (
          <button
            key={i}
            disabled={placedBankIndex.includes(i)}
            onClick={() => place(i)}
            className="en px-3 py-2 rounded-xl bg-surface-alt border border-line font-bold disabled:opacity-30"
          >
            {word}
          </button>
        ))}
      </div>

      <Button
        disabled={!allFilled}
        onClick={() =>
          onSubmit({
            kind: "blanks",
            values: placedBankIndex.map((idx) => (idx !== null ? bank[idx] : "")),
          })
        }
      >
        جمع کرائیں <span className="opacity-80 text-sm">(Submit)</span>
      </Button>
    </div>
  );
}
