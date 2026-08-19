import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { SECTION_LABELS, TASK_TYPES } from "@/lib/taskTypes";
import type { AttemptRow, Section, TaskType } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { Bilingual, Button, Card } from "@/components/ui";

export default async function MockTestSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { ids } = await searchParams;
  const questionIds = (ids ?? "").split(",").filter(Boolean);

  const db = supabaseAdmin();
  const { data: attempts } = await db
    .from("attempts")
    .select("*")
    .eq("profile_id", session.profileId)
    .in("question_id", questionIds)
    .order("created_at", { ascending: false });

  // most recent attempt per question id
  const latestByQuestion = new Map<string, AttemptRow>();
  for (const a of (attempts ?? []) as AttemptRow[]) {
    if (!latestByQuestion.has(a.question_id)) latestByQuestion.set(a.question_id, a);
  }

  const { data: questionRows } = await db.from("question_bank").select("*").in("id", questionIds);
  const bySection: Record<Section, { total: number; scoreSum: number; count: number }> = {
    speaking: { total: 0, scoreSum: 0, count: 0 },
    writing: { total: 0, scoreSum: 0, count: 0 },
    reading: { total: 0, scoreSum: 0, count: 0 },
    listening: { total: 0, scoreSum: 0, count: 0 },
  };

  let overallSum = 0;
  let overallCount = 0;

  for (const q of questionRows ?? []) {
    const config = TASK_TYPES[q.task_type as TaskType];
    bySection[config.section].total++;
    const attempt = latestByQuestion.get(q.id);
    if (!attempt) continue;
    const pct =
      attempt.score_breakdown.kind === "ai"
        ? attempt.score_breakdown.overall
        : attempt.score_breakdown.correct
          ? 100
          : 0;
    bySection[config.section].scoreSum += pct;
    bySection[config.section].count++;
    overallSum += pct;
    overallCount++;
  }

  const overall = overallCount ? Math.round(overallSum / overallCount) : 0;

  return (
    <>
      <TopBar session={session} />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 flex flex-col gap-5">
        <Bilingual center ur="موک ٹیسٹ کا نتیجہ" en="MOCK TEST RESULT" />

        <Card className="text-center">
          <div
            className="w-36 h-36 rounded-full mx-auto flex items-center justify-center"
            style={{ background: `conic-gradient(var(--accent) ${overall}%, var(--line) 0)` }}
          >
            <div className="w-28 h-28 rounded-full bg-surface flex flex-col items-center justify-center">
              <span className="text-3xl font-display font-extrabold tabular-nums">{overall}</span>
              <span className="text-[0.65rem] text-ink-soft font-bold">/ 100 practice score</span>
            </div>
          </div>
          <p className="text-[0.65rem] text-ink-soft mt-3">
            {overallCount}/{questionIds.length} tasks completed — practice estimate, not an official PTE score
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(bySection) as Section[]).map((s) => (
            <Card key={s} className="!p-4 text-center">
              <div className="text-xl mb-1">{SECTION_LABELS[s].icon}</div>
              <div className="ur text-sm">{SECTION_LABELS[s].ur}</div>
              <div className="text-lg font-display font-extrabold tabular-nums mt-1">
                {bySection[s].count ? Math.round(bySection[s].scoreSum / bySection[s].count) : "–"}
              </div>
              <div className="text-[0.6rem] text-ink-soft">{bySection[s].count}/{bySection[s].total} done</div>
            </Card>
          ))}
        </div>

        <Link href="/today">
          <Button variant="teal">آج کی مشق پر واپس <span className="opacity-80 text-sm">(Back to Today)</span></Button>
        </Link>
      </main>
    </>
  );
}
