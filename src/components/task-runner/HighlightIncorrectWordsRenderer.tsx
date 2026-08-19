"use client";
import { useState } from "react";
import type { HighlightIncorrectWordsPayload, ResponsePayload } from "@/lib/types";
import { Bilingual, Button } from "@/components/ui";

export function HighlightIncorrectWordsRenderer({
  payload,
  onSubmit,
}: {
  payload: HighlightIncorrectWordsPayload;
  onSubmit: (r: ResponsePayload) => void;
}) {
  const words = payload.transcriptWithErrors.split(" ");
  const [tapped, setTapped] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setTapped((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Bilingual ur="جو الفاظ آپ نے سنے ان سے مختلف الفاظ کو دبائیں" en="TAP EVERY WORD THAT DIFFERS FROM WHAT YOU HEARD" />
      <p className="en text-base leading-loose text-center" dir="ltr">
        {words.map((w, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`inline-block m-0.5 px-1.5 py-0.5 rounded ${
              tapped.has(i) ? "bg-rose text-white" : "hover:bg-surface-alt"
            }`}
          >
            {w}
          </button>
        ))}
      </p>
      <Button
        disabled={tapped.size === 0}
        onClick={() => onSubmit({ kind: "word_taps", indices: Array.from(tapped) })}
      >
        جمع کرائیں <span className="opacity-80 text-sm">(Submit)</span>
      </Button>
    </div>
  );
}
