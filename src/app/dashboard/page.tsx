import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { SECTION_LABELS, TASK_TYPES } from "@/lib/taskTypes";
import type { AttemptRow, ProfileRow, Section, TaskType } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { Bilingual, Card } from "@/components/ui";

function computeStreak(dates: string[]): number {
  const uniq = Array.from(new Set(dates)).sort().reverse();
  if (uniq.length === 0) return 0;
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (uniq.includes(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ learner?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const db = supabaseAdmin();
  const isObserver = session.role === "observer";

  let learner: Pick<ProfileRow, "id" | "name">;
  let learners: Pick<ProfileRow, "id" | "name">[] = [];

  if (isObserver) {
    const { data } = await db.from("profiles").select("id, name").eq("role", "learner").order("name");
    learners = data ?? [];
    if (learners.length === 0) redirect("/login");
    const { learner: requestedId } = await searchParams;
    learner = learners.find((l) => l.id === requestedId) ?? learners[0];
  } else {
    // A learner always views their own dashboard.
    learner = { id: session.profileId, name: session.name };
  }

  const { data: attempts } = await db
    .from("attempts")
    .select("*, question_bank(task_type, section)")
    .eq("profile_id", learner.id)
    .order("created_at", { ascending: false })
    .limit(300);

  const rows = (attempts ?? []) as (AttemptRow & {
    question_bank: { task_type: TaskType; section: Section } | null;
  })[];

  const streak = computeStreak(rows.map((r) => r.created_at.slice(0, 10)));

  const bySection: Record<Section, { sum: number; count: number }> = {
    speaking: { sum: 0, count: 0 },
    writing: { sum: 0, count: 0 },
    reading: { sum: 0, count: 0 },
    listening: { sum: 0, count: 0 },
  };
  const weakByType = new Map<TaskType, { sum: number; count: number }>();

  for (const r of rows) {
    const section = r.question_bank?.section;
    const taskType = r.question_bank?.task_type;
    if (!section || !taskType) continue;
    const pct = r.score_breakdown.kind === "ai" ? r.score_breakdown.overall : r.score_breakdown.correct ? 100 : 0;
    bySection[section].sum += pct;
    bySection[section].count += 1;
    const w = weakByType.get(taskType) ?? { sum: 0, count: 0 };
    w.sum += pct;
    w.count += 1;
    weakByType.set(taskType, w);
  }

  const weakest = Array.from(weakByType.entries())
    .map(([type, v]) => ({ type, avg: v.sum / v.count, count: v.count }))
    .filter((w) => w.count >= 2)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 4);

  return (
    <>
      <TopBar session={session} />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 flex flex-col gap-5">
        <Bilingual
          ur={isObserver ? `${learner.name} کی پیش رفت` : "میری پیش رفت"}
          en={isObserver ? `${learner.name.toUpperCase()}'S PROGRESS` : "MY PROGRESS"}
        />

        {isObserver && learners.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {learners.map((l) => (
              <Link
                key={l.id}
                href={`/dashboard?learner=${l.id}`}
                className={`text-sm font-display font-bold px-4 py-2 rounded-full border ${
                  l.id === learner.id
                    ? "bg-accent border-accent text-[color:var(--accent-ink)]"
                    : "bg-surface-alt border-line text-ink-soft"
                }`}
              >
                {l.name}
              </Link>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Card className="!p-4 text-center">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-2xl font-display font-extrabold tabular-nums">{streak}</div>
            <Bilingual center ur="دن کا تسلسل" en="DAY STREAK" />
          </Card>
          <Card className="!p-4 text-center">
            <div className="text-2xl mb-1">📝</div>
            <div className="text-2xl font-display font-extrabold tabular-nums">{rows.length}</div>
            <Bilingual center ur="کل مشقیں" en="TOTAL ATTEMPTS" />
          </Card>
        </div>

        <div>
          <Bilingual ur="مہارت کے مطابق اوسط سکور" en="AVERAGE SCORE BY SECTION" />
          <div className="grid grid-cols-2 gap-3 mt-2">
            {(Object.keys(bySection) as Section[]).map((s) => (
              <Card key={s} className="!p-4 text-center">
                <div className="text-xl mb-1">{SECTION_LABELS[s].icon}</div>
                <div className="ur text-sm">{SECTION_LABELS[s].ur}</div>
                <div className="text-lg font-display font-extrabold tabular-nums mt-1">
                  {bySection[s].count ? Math.round(bySection[s].sum / bySection[s].count) : "–"}
                </div>
                <div className="text-[0.6rem] text-ink-soft">{bySection[s].count} attempts</div>
              </Card>
            ))}
          </div>
        </div>

        {weakest.length > 0 && (
          <div>
            <Bilingual ur="سب سے زیادہ توجہ درکار" en="NEEDS THE MOST PRACTICE" />
            <div className="flex flex-col gap-2 mt-2">
              {weakest.map((w) => (
                <Card key={w.type} className="!p-3 flex items-center justify-between">
                  <span className="text-sm font-bold tabular-nums">{Math.round(w.avg)}</span>
                  <div className="text-right">
                    <div className="ur text-sm">{TASK_TYPES[w.type].labelUr}</div>
                    <div className="en text-xs text-ink-soft">{TASK_TYPES[w.type].labelEn}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {rows.length === 0 && (
          <Card>
            <p className="text-sm text-ink-soft text-center">
              {isObserver
                ? "ابھی کوئی مشق نہیں ہوئی۔ / No attempts yet."
                : "ابھی کوئی مشق نہیں ہوئی — آج کی مشق شروع کریں!"}
            </p>
          </Card>
        )}
      </main>
    </>
  );
}
