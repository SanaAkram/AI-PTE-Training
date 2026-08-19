"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { lookupTerm, type VocabLookupResult } from "@/lib/vocabLookup";
import OpenAI from "openai";

export async function lookupWordAction(term: string): Promise<VocabLookupResult> {
  const session = await getSession();
  if (!session) throw new Error("Not logged in");
  if (!term.trim()) throw new Error("Type a word or sentence first.");
  return lookupTerm(term.trim());
}

export async function saveWordAction(term: string, result: VocabLookupResult) {
  const session = await getSession();
  if (!session) throw new Error("Not logged in");

  const { error } = await supabaseAdmin().from("personal_vocab").insert({
    profile_id: session.profileId,
    term,
    english: result.english,
    meaning_ur: result.meaning_ur,
    examples: result.examples,
  });
  if (error) throw error;
  revalidatePath("/my-words");
}

export async function deleteWordAction(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Not logged in");

  const { error } = await supabaseAdmin()
    .from("personal_vocab")
    .delete()
    .eq("id", id)
    .eq("profile_id", session.profileId); // can only delete your own
  if (error) throw error;
  revalidatePath("/my-words");
}

let client: OpenAI | null = null;
function openai(): OpenAI {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY env var.");
  client = new OpenAI({ apiKey });
  return client;
}

export interface SentenceCheckResult {
  good: boolean;
  feedback_ur: string;
  corrected_en: string;
}

/** Checks a learner-written sentence that's meant to use a specific word —
 * gentle, specific feedback in Urdu, not a score. */
export async function checkSentenceAction(word: string, sentence: string): Promise<SentenceCheckResult> {
  const session = await getSession();
  if (!session) throw new Error("Not logged in");
  if (!sentence.trim()) throw new Error("Type a sentence first.");

  const completion = await openai().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You help a beginner English learner (native language Urdu) practice building their own
sentences using a specific word. Check whether their sentence uses the word correctly and is
grammatically sound. Respond with strict JSON only: {"good": boolean, "feedback_ur": string (short,
encouraging, specific feedback IN URDU — if there's a mistake, explain what and how to fix it; if
it's good, say so warmly), "corrected_en": string (a corrected/improved version of their sentence in
English — if it was already good, this can be the same sentence or a slightly better phrasing)}.`,
      },
      { role: "user", content: `Word: "${word}"\nStudent's sentence: "${sentence}"` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<SentenceCheckResult>;
  return {
    good: parsed.good ?? false,
    feedback_ur: parsed.feedback_ur ?? "",
    corrected_en: parsed.corrected_en ?? sentence,
  };
}
