"use client";
import type { ScoreBreakdown, TaskType } from "@/lib/types";
import { Button, Card } from "@/components/ui";
import { useTaskNav } from "./useTaskNav";

export function ScoreCard({ score, taskType }: { score: ScoreBreakdown; taskType: TaskType }) {
  const { goNext } = useTaskNav();
  const isAi = score.kind === "ai";
  const pct = isAi ? Math.round(score.overall) : score.correct ? 100 : 0;
  const good = isAi ? score.overall >= 65 : score.correct;

  return (
    <Card className="text-center flex flex-col gap-4">
      <div
        className="w-32 h-32 rounded-full mx-auto flex items-center justify-center"
        style={{
          background: `conic-gradient(${good ? "var(--teal)" : "var(--rose)"} ${pct}%, var(--line) 0)`,
        }}
      >
        <div className="w-24 h-24 rounded-full bg-surface flex flex-col items-center justify-center">
          <span className="text-2xl font-display font-extrabold tabular-nums">{pct}</span>
          <span className="text-[0.65rem] text-ink-soft font-bold">
            {isAi ? "/ 100" : good ? "درست" : "غلط"}
          </span>
        </div>
      </div>

      {isAi ? (
        <div className="flex flex-col gap-2 text-right">
          {score.criteria.map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              <span className="text-xs text-ink-soft w-20 shrink-0">{c.label}</span>
              <div className="flex-1 h-2 rounded-full bg-surface-alt overflow-hidden" dir="ltr">
                <div className="h-full bg-accent" style={{ width: `${(c.score / (c.max || 100)) * 100}%` }} />
              </div>
              <span className="text-xs font-bold w-8 text-left tabular-nums">{Math.round(c.score)}</span>
            </div>
          ))}
          <p className="text-sm bg-surface-alt rounded-xl p-3 mt-2 en text-left">{score.feedback}</p>
          <p className="text-[0.65rem] text-ink-soft text-center mt-1">
            <span className="ur">یہ مشق کا اندازہ ہے، سرکاری PTE سکور نہیں</span>
            <br />
            <span className="en">practice estimate, not an official PTE score</span>
          </p>
        </div>
      ) : (
        !score.correct && (
          <p className="text-sm bg-surface-alt rounded-xl p-3 text-right">
            <span className="ur">صحیح جواب: </span>
            <span className="en font-bold">{score.correctAnswer}</span>
          </p>
        )
      )}

      <Button variant="teal" onClick={() => goNext(taskType)}>
        اگلا ➡️ <span className="opacity-80 text-sm">(Next)</span>
      </Button>
    </Card>
  );
}
