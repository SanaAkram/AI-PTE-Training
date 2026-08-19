import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { SECTION_LABELS, TASK_TYPES } from "@/lib/taskTypes";
import type { QuestionRow, TaskType } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { Bilingual, Card } from "@/components/ui";

export default async function TodayPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "observer") redirect("/dashboard");

  const db = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const { data: dayRow } = await db
    .from("curriculum_days")
    .select("*")
    .lte("unlock_date", today)
    .order("day_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  let tasks: QuestionRow[] = [];
  let doneIds = new Set<string>();

  if (dayRow?.task_ids?.length) {
    const { data: questionRows } = await db
      .from("question_bank")
      .select("*")
      .in("id", dayRow.task_ids);
    // keep the plan's original order, not the DB's arbitrary return order
    const byId = new Map((questionRows ?? []).map((q) => [q.id, q as QuestionRow]));
    tasks = dayRow.task_ids.map((id: string) => byId.get(id)).filter(Boolean) as QuestionRow[];

    const { data: attempts } = await db
      .from("attempts")
      .select("question_id")
      .eq("profile_id", session.profileId)
      .in("question_id", dayRow.task_ids);
    doneIds = new Set((attempts ?? []).map((a) => a.question_id as string));
  }

  const queue = tasks.map((t) => t.id).join(",");
  const doneCount = tasks.filter((t) => doneIds.has(t.id)).length;

  return (
    <>
      <TopBar session={session} />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 flex flex-col gap-6">
        <div>
          <Bilingual ur={`خوش آمدید، ${session.name}!`} en={`WELCOME, ${session.name.toUpperCase()}!`} />
          {dayRow && (
            <p className="text-xs text-ink-soft mt-1">
              دن {dayRow.day_number} · {doneCount}/{tasks.length} مکمل — Day {dayRow.day_number}, {doneCount}/{tasks.length} done
            </p>
          )}
        </div>

        {!dayRow && (
          <Card>
            <p className="text-sm text-ink-soft text-center">
              No plan yet for today — run <code>npm run seed</code> to generate the curriculum.
            </p>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          {tasks.map((t, i) => {
            const config = TASK_TYPES[t.task_type as TaskType];
            const done = doneIds.has(t.id);
            return (
              <Link
                key={t.id}
                href={`/practice/task/${t.id}?queue=${queue}&pos=${i}&returnTo=${encodeURIComponent("/today")}`}
              >
                <Card className="!p-4 flex items-center gap-3">
                  <span className="text-2xl">{done ? "✅" : SECTION_LABELS[config.section].icon}</span>
                  <div className="flex-1 text-right">
                    <div className="ur text-sm">{config.labelUr}</div>
                    <div className="en text-xs font-bold text-ink-soft">{config.labelEn}</div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <Link href="/practice">
            <Card className="!p-4 text-center">
              <div className="text-2xl mb-1">🎯</div>
              <Bilingual center ur="مہارت کی مشق" en="PRACTICE BY SKILL" />
            </Card>
          </Link>
          <Link href="/mock-test">
            <Card className="!p-4 text-center">
              <div className="text-2xl mb-1">⏱️</div>
              <Bilingual center ur="مکمل موک ٹیسٹ" en="FULL MOCK TEST" />
            </Card>
          </Link>
        </div>
      </main>
    </>
  );
}
