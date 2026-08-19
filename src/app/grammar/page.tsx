import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLearnerDifficulty } from "@/lib/questionPicker";
import { DIFFICULTY_RANGE } from "@/lib/difficulty";
import type { GrammarPointRow } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { Bilingual, Card } from "@/components/ui";
import GrammarClient from "./GrammarClient";

export default async function GrammarPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const db = supabaseAdmin();
  const level = session.role === "learner" ? await getLearnerDifficulty(session.profileId) : "medium";
  const [min, max] = DIFFICULTY_RANGE[level];

  const { data } = await db.from("grammar_points").select("*").gte("difficulty", min).lte("difficulty", max).limit(60);
  const points = (data ?? []) as GrammarPointRow[];

  return (
    <>
      <TopBar session={session} />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 flex flex-col gap-5">
        <Bilingual ur="گرامر اور جملے" en="GRAMMAR & SENTENCES" />
        {points.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft text-center">
              ابھی گرامر کا مواد شامل نہیں کیا گیا
              <br />
              <span className="en text-xs">No grammar content added yet.</span>
            </p>
          </Card>
        ) : (
          <GrammarClient points={points} />
        )}
      </main>
    </>
  );
}
