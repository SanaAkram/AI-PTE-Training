"use client";
import { useState } from "react";
import type { ReadingWritingFillBlanksDropdownPayload, ResponsePayload } from "@/lib/types";
import { Bilingual, Button } from "@/components/ui";

export function BlankDropdownRenderer({
  payload,
  onSubmit,
}: {
  payload: ReadingWritingFillBlanksDropdownPayload;
  onSubmit: (r: ResponsePayload) => void;
}) {
  const segments = payload.textWithBlanks.split(/\{\{\d+\}\}/);
  const [choices, setChoices] = useState<(number | null)[]>(Array(payload.blanks.length).fill(null));
  const allChosen = choices.every((c) => c !== null);

  return (
    <div className="flex flex-col gap-4">
      <Bilingual ur="ہر خالی جگہ کے لیے صحیح لفظ چنیں" en="PICK THE CORRECT WORD FOR EACH BLANK" />

      <p className="en text-base leading-loose" dir="ltr">
        {segments.map((seg, i) => (
          <span key={i}>
            {seg}
            {i < payload.blanks.length && (
              <select
                value={choices[i] ?? ""}
                onChange={(e) =>
                  setChoices((c) => c.map((v, idx) => (idx === i ? Number(e.target.value) : v)))
                }
                className="en mx-1 rounded-lg border-b-2 border-accent bg-surface-alt px-2 py-1 font-bold"
              >
                <option value="" disabled>
                  ___
                </option>
                {payload.blanks[i].options.map((opt, oi) => (
                  <option key={oi} value={oi}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </span>
        ))}
      </p>

      <Button
        disabled={!allChosen}
        onClick={() => onSubmit({ kind: "choice", indices: choices as number[] })}
      >
        جمع کرائیں <span className="opacity-80 text-sm">(Submit)</span>
      </Button>
    </div>
  );
}
