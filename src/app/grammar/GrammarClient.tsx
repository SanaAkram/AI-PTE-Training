"use client";

import { useEffect, useState } from "react";
import type { GrammarPointRow } from "@/lib/types";
import { Bilingual, Button, Card } from "@/components/ui";
import { ReplayButton } from "@/components/task-runner/ReplayButton";
import { useScrollToTop } from "@/lib/hooks/useScrollToTop";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GrammarClient({ points }: { points: GrammarPointRow[] }) {
  const [pool] = useState(() => shuffle(points));
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const point = pool[idx % pool.length];
  useScrollToTop(idx);

  function next() {
    setIdx((i) => i + 1);
    setAnswered(null);
  }

  // Auto-advance a beat after answering — no extra tap needed for MCQ-style checks.
  useEffect(() => {
    if (answered === null) return;
    const t = setTimeout(next, 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered]);

  const isCorrect = answered === point.practice_answer;
  const [before, after] = point.practice_sentence.split("{{blank}}");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-soft">
          {(idx % pool.length) + 1} / {pool.length}
        </span>
        <button onClick={next} className="text-xs font-bold text-ink-soft border border-line rounded-full px-3 py-1.5">
          چھوڑیں <span className="opacity-70">(Skip)</span> ⏭
        </button>
      </div>

      <Card className="flex flex-col gap-3">
        <div>
          <div className="ur text-lg">{point.title_ur}</div>
          <div className="en text-xs font-bold text-ink-soft">{point.title_en.toUpperCase()}</div>
        </div>
        <p className="ur text-sm leading-loose bg-surface-alt rounded-xl p-3">{point.explanation_ur}</p>
        <p className="en text-xs text-ink-soft text-center font-mono">{point.pattern_en}</p>
        <div className="flex flex-col gap-2">
          {point.examples.map((ex, i) => (
            <div key={i} className="flex items-center gap-2 bg-surface-alt rounded-xl p-3">
              <ReplayButton text={ex.en} size="sm" />
              <div className="flex-1 text-right">
                <div className="en text-sm">{ex.en}</div>
                <div className="ur text-xs text-ink-soft">{ex.ur}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <Bilingual center ur="خالی جگہ پُر کریں" en="FILL IN THE BLANK" />
        <p className="en text-base text-center leading-relaxed" dir="ltr">
          {before}
          <span className="inline-block mx-1 px-3 py-0.5 rounded-lg border-b-2 border-accent bg-surface-alt font-bold">
            {answered ?? "____"}
          </span>
          {after}
        </p>
        <p className="ur text-sm text-ink-soft text-center">{point.practice_sentence_ur}</p>
        <div className="flex flex-col gap-2">
          {point.practice_options.map((opt, i) => {
            const show = answered !== null;
            const optCorrect = opt === point.practice_answer;
            return (
              <button
                key={i}
                disabled={show}
                onClick={() => setAnswered(opt)}
                className={`rounded-2xl border-2 px-4 py-3 text-center ${
                  show && optCorrect
                    ? "border-teal bg-teal-soft"
                    : show && opt === answered
                      ? "border-rose bg-rose-soft"
                      : "border-line bg-surface"
                }`}
              >
                <div className="en">{opt}</div>
                {point.practice_options_ur?.[i] && (
                  <div className="ur text-sm text-ink-soft mt-0.5">{point.practice_options_ur[i]}</div>
                )}
              </button>
            );
          })}
        </div>
        {answered !== null && (
          <>
            <div className={`rounded-xl p-2 text-center text-sm font-bold ${isCorrect ? "text-teal" : "text-rose"}`}>
              {isCorrect ? "✅ بالکل صحیح!" : `❌ صحیح جواب: ${point.practice_answer}`}
            </div>
            <Button variant="teal" onClick={next}>
              اگلا ➡️ <span className="opacity-80 text-sm">(Next)</span>
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
