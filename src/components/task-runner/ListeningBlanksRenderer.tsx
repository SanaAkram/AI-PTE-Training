"use client";
import { useState } from "react";
import type { ListeningFillBlanksPayload, ResponsePayload } from "@/lib/types";
import { Bilingual, Button } from "@/components/ui";

export function ListeningBlanksRenderer({
  payload,
  onSubmit,
}: {
  payload: ListeningFillBlanksPayload;
  onSubmit: (r: ResponsePayload) => void;
}) {
  const segments = payload.textWithBlanks.split(/\{\{\d+\}\}/);
  const blankCount = segments.length - 1;
  const [values, setValues] = useState<string[]>(Array(blankCount).fill(""));
  const allFilled = values.every((v) => v.trim().length > 0);

  return (
    <div className="flex flex-col gap-4">
      <Bilingual ur="جو سنا اس کے مطابق خالی جگہ پُر کریں" en="TYPE THE WORDS YOU HEARD" />
      <p className="en text-base leading-loose" dir="ltr">
        {segments.map((seg, i) => (
          <span key={i}>
            {seg}
            {i < blankCount && (
              <input
                value={values[i]}
                onChange={(e) =>
                  setValues((v) => v.map((x, idx) => (idx === i ? e.target.value : x)))
                }
                className="en inline-block w-24 mx-1 rounded-lg border-b-2 border-accent bg-surface-alt px-2 py-0.5 text-center"
              />
            )}
          </span>
        ))}
      </p>
      <Button disabled={!allFilled} onClick={() => onSubmit({ kind: "blanks", values })}>
        جمع کرائیں <span className="opacity-80 text-sm">(Submit)</span>
      </Button>
    </div>
  );
}
