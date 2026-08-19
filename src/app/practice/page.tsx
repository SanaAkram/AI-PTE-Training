import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SECTION_LABELS, taskTypesBySection } from "@/lib/taskTypes";
import type { Section } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { Bilingual, Card } from "@/components/ui";

const SECTIONS: Section[] = ["speaking", "writing", "reading", "listening"];

export default async function PracticePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <TopBar session={session} />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 flex flex-col gap-6">
        <Bilingual ur="مہارت کے مطابق مشق کریں" en="PRACTICE BY SKILL" />
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
