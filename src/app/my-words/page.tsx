import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLearnerDifficulty } from "@/lib/questionPicker";
import { DIFFICULTY_RANGE } from "@/lib/difficulty";
import type { DictionaryRow, PersonalVocabRow } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { Bilingual } from "@/components/ui";
import MyWordsClient from "./MyWordsClient";

export default async function MyWordsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const db = supabaseAdmin();

  const { data: personalData } = await db
    .from("personal_vocab")
    .select("*")
    .eq("profile_id", session.profileId)
    .order("created_at", { ascending: false });
  const words = (personalData ?? []) as PersonalVocabRow[];

  // A ready-made practice pool from the shared dictionary, at this learner's
  // level, so practice isn't empty before they've saved anything themselves.
  const level = session.role === "learner" ? await getLearnerDifficulty(session.profileId) : "medium";
  const [min, max] = DIFFICULTY_RANGE[level];
  const { data: dictData } = await db
    .from("dictionary")
    .select("*")
    .gte("difficulty", min)
    .lte("difficulty", max)
    .limit(60);
  const dictionaryWords = (dictData ?? []) as DictionaryRow[];

  return (
    <>
      <TopBar session={session} />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 flex flex-col gap-5">
        <Bilingual ur="میرے الفاظ" en="MY WORDS" />
        <p className="text-xs text-ink-soft -mt-3">
          کوئی بھی لفظ یا جملہ لکھیں جس کا مطلب جاننا ہے، محفوظ کریں، اور مشق کریں۔
          <br />
          <span className="en">Type any word or sentence you want to learn, save it, and practice.</span>
        </p>
        <MyWordsClient words={words} dictionaryWords={dictionaryWords} />
      </main>
    </>
  );
}
