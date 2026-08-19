"use client";
import { useState } from "react";
import type { ReorderParagraphsPayload, ResponsePayload } from "@/lib/types";
import { Bilingual, Button } from "@/components/ui";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ReorderRenderer({
  payload,
  onSubmit,
}: {
  payload: ReorderParagraphsPayload;
  onSubmit: (r: ResponsePayload) => void;
}) {
  const [pool] = useState(() => shuffle(payload.paragraphsInOrder));
  const [placed, setPlaced] = useState<number[]>([]); // indices into pool

  function place(i: number) {
    if (placed.includes(i)) return;
    setPlaced((p) => [...p, i]);
  }
  function unplace(pos: number) {
    setPlaced((p) => p.filter((_, idx) => idx !== pos));
  }

  return (
    <div className="flex flex-col gap-4">
      <Bilingual ur="پیراگراف کو دبا کر صحیح ترتیب میں لگائیں" en="TAP THE PARAGRAPHS IN THE RIGHT ORDER" />

      <div className="flex flex-col gap-2 min-h-16 border-2 border-dashed border-line rounded-2xl p-3">
        {placed.length === 0 && <span className="text-ink-soft text-sm text-center py-2">…</span>}
        {placed.map((i, pos) => (
          <button
            key={i}
            onClick={() => unplace(pos)}
            className="en text-left text-sm bg-surface border border-accent rounded-xl px-3 py-2.5"
          >
            <span className="font-bold text-accent-deep mr-2">{pos + 1}.</span>
            {pool[i]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {pool.map((para, i) => (
          <button
            key={i}
            disabled={placed.includes(i)}
            onClick={() => place(i)}
            className="en text-left text-sm bg-surface-alt border border-line rounded-xl px-3 py-2.5 disabled:opacity-30"
          >
            {para}
          </button>
        ))}
      </div>

      <Button
        disabled={placed.length !== pool.length}
        onClick={() => onSubmit({ kind: "order", value: placed.map((i) => pool[i]) })}
      >
        جمع کرائیں <span className="opacity-80 text-sm">(Submit)</span>
      </Button>
    </div>
  );
}
