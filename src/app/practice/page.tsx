import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { setDifficultyAction } from "@/lib/actions";
import { getLearnerDifficulty } from "@/lib/questionPicker";
import { DIFFICULTY_LABELS, DIFFICULTY_LEVELS } from "@/lib/difficulty";
import { SECTION_LABELS, taskTypesBySection } from "@/lib/taskTypes";
import type { Section } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { Bilingual, Card } from "@/components/ui";

const SECTIONS: Section[] = ["speaking", "writing", "reading", "listening"];

export default async function PracticePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "learner") redirect("/dashboard");

  const level = await getLearnerDifficulty(session.profileId);

  return (
    <>
      <TopBar session={session} />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 flex flex-col gap-6">
        <Bilingual ur="مہارت کے مطابق مشق کریں" en="PRACTICE BY SKILL" />

        <div>
          <Bilingual ur="اپنی سطح چنیں" en="CHOOSE YOUR LEVEL" />
          <div className="flex gap-2 mt-2" dir="ltr">
            {DIFFICULTY_LEVELS.map((l) => (
              <form key={l} action={setDifficultyAction.bind(null, l)} className="flex-1">
                <button
                  type="submit"
                  className={`w-full rounded-2xl py-3 font-display font-bold text-sm flex flex-col items-center gap-0.5 border-2 ${
                    level === l
                      ? "bg-accent border-accent text-[color:var(--accent-ink)]"
                      : "bg-surface border-line text-ink-soft"
                  }`}
                >
                  <span className="text-lg">{DIFFICULTY_LABELS[l].icon}</span>
                  <span className="ur text-base">{DIFFICULTY_LABELS[l].ur}</span>
                  <span className="text-[0.65rem]">{DIFFICULTY_LABELS[l].en}</span>
                </button>
              </form>
            ))}
          </div>
        </div>

        {SECTIONS.map((section) => (
          <div key={section} className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">{SECTION_LABELS[section].icon}</span>
              <span className="ur text-lg">{SECTION_LABELS[section].ur}</span>
              <span className="en text-xs font-bold text-ink-soft">{SECTION_LABELS[section].en.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {taskTypesBySection(section).map((t) => (
                <Link key={t.type} href={`/practice/${t.type}`}>
                  <Card className="!p-4 flex items-center justify-between hover:border-accent">
                    <span className="text-ink-soft">›</span>
                    <div className="text-right">
                      <div className="ur text-sm">{t.labelUr}</div>
                      <div className="en text-xs font-bold text-ink-soft">{t.labelEn}</div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
