import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { PersonalVocabRow } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { Bilingual } from "@/components/ui";
import MyWordsClient from "./MyWordsClient";

export default async function MyWordsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { data } = await supabaseAdmin()
    .from("personal_vocab")
    .select("*")
    .eq("profile_id", session.profileId)
    .order("created_at", { ascending: false });

  const words = (data ?? []) as PersonalVocabRow[];

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
        <MyWordsClient words={words} />
      </main>
    </>
  );
}
