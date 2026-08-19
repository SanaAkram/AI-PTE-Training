import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { SECTION_LABELS, TASK_TYPES, taskTypesBySection } from "@/lib/taskTypes";
import { getLearnerDifficulty, pickRandomQuestionId } from "@/lib/questionPicker";
import type { QuestionRow, Section, TaskType } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { Bilingual, Card } from "@/components/ui";

const SECTIONS: Section[] = ["speaking", "writing", "reading", "listening"];

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
  const allDone = tasks.length > 0 && doneCount === tasks.length;

  // Finished everything assigned for today? Don't dead-end — pull a fresh
  // bonus set (one per section, at the learner's level) so there's always
  // something new to do without waiting for tomorrow.
  let bonusTasks: QuestionRow[] = [];
  if (allDone) {
    const level = await getLearnerDifficulty(session.profileId);
    const bonusIds: string[] = [];
    for (const section of SECTIONS) {
      const types = taskTypesBySection(section);
      const type = types[Math.floor(Math.random() * types.length)].type;
      const id = await pickRandomQuestionId(type, level);
      if (id) bonusIds.push(id);
    }
    if (bonusIds.length) {
      const { data: bonusRows } = await db.from("question_bank").select("*").in("id", bonusIds);
      const byId = new Map((bonusRows ?? []).map((q) => [q.id, q as QuestionRow]));
      bonusTasks = bonusIds.map((id) => byId.get(id)).filter(Boolean) as QuestionRow[];
    }
  }
  const bonusQueue = bonusTasks.map((t) => t.id).join(",");

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

        {!allDone && (
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
        )}

        {allDone && (
          <div className="flex flex-col gap-3">
            <Card className="!p-4 text-center bg-teal-soft border-teal">
              <div className="text-2xl mb-1">🎉</div>
              <Bilingual center ur="آج کا ہدف مکمل! کیا آپ مزید مشق کرنا چاہتے ہیں؟" en="TODAY'S GOAL DONE! WANT TO KEEP GOING?" />
            </Card>
            {bonusTasks.map((t, i) => {
              const config = TASK_TYPES[t.task_type as TaskType];
              return (
                <Link
                  key={t.id}
                  href={`/practice/task/${t.id}?queue=${bonusQueue}&pos=${i}&returnTo=${encodeURIComponent("/today")}`}
                >
                  <Card className="!p-4 flex items-center gap-3">
                    <span className="text-2xl">{SECTION_LABELS[config.section].icon}</span>
                    <div className="flex-1 text-right">
                      <div className="ur text-sm">{config.labelUr}</div>
                      <div className="en text-xs font-bold text-ink-soft">{config.labelEn}</div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mt-2">
          <Link href="/practice">
            <Card className="!p-3 text-center">
              <div className="text-xl mb-1">🎯</div>
              <Bilingual center ur="مہارت کی مشق" en="PRACTICE" />
            </Card>
          </Link>
          <Link href="/my-words">
            <Card className="!p-3 text-center">
              <div className="text-xl mb-1">📚</div>
              <Bilingual center ur="میرے الفاظ" en="MY WORDS" />
            </Card>
          </Link>
          <Link href="/mock-test">
            <Card className="!p-3 text-center">
              <div className="text-xl mb-1">⏱️</div>
              <Bilingual center ur="موک ٹیسٹ" en="MOCK TEST" />
            </Card>
          </Link>
        </div>
      </main>
    </>
  );
}
