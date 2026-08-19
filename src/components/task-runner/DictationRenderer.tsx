"use client";
import { useState } from "react";
import type { ResponsePayload } from "@/lib/types";
import { Bilingual, Button } from "@/components/ui";

export function DictationRenderer({ onSubmit }: { onSubmit: (r: ResponsePayload) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <Bilingual ur="جو جملہ سنا وہی لکھیں" en="TYPE THE EXACT SENTENCE YOU HEARD" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        dir="ltr"
        placeholder="Type here..."
        className="en w-full rounded-2xl border border-line bg-surface p-4 text-base"
        onKeyDown={(e) => {
          if (e.key === "Enter" && text.trim()) onSubmit({ kind: "text", value: text });
        }}
      />
      <Button disabled={!text.trim()} onClick={() => onSubmit({ kind: "text", value: text })}>
        جمع کرائیں <span className="opacity-80 text-sm">(Submit)</span>
      </Button>
    </div>
  );
}
