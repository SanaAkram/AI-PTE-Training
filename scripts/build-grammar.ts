/**
 * Builds the "grammar_points" table — grammar/sentence-structure rules
 * explained in Urdu, with example sentences and one quick fill-in-the-blank
 * check each. Same generation approach as build-dictionary.ts and
 * daily-grow.ts, for the same reason: no freely-licensed, accurate
 * English-Urdu grammar resource was findable to import instead.
 *
 * Usage:  npm run build-grammar -- --count 4   (4 points per category per difficulty band)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
const COUNT_PER_BAND = Number(arg("count") ?? 3);

const CATEGORIES = [
  "present tenses (simple, continuous, perfect)",
  "past tenses (simple, continuous, perfect)",
  "future forms (will, going to, present continuous for plans)",
  "articles (a, an, the, no article)",
  "prepositions of time and place",
  "word order in statements and questions",
  "negatives and question formation",
  "subject-verb agreement",
  "modal verbs (can, could, should, must, may)",
  "comparatives and superlatives",
  "common mistakes Urdu speakers make in English (e.g. missing 'to be', wrong plural, literal word-order translation)",
];

const BANDS = [
  { min: 1, max: 2 },
  { min: 3, max: 3 },
  { min: 4, max: 5 },
];

interface GrammarItem {
  title_en: string;
  title_ur: string;
  explanation_ur: string;
  pattern_en: string;
  examples: { en: string; ur: string }[];
  practice_sentence: string;
  practice_options: string[];
  practice_answer: string;
}

async function generateBatch(openai: OpenAI, category: string, difficulty: number, count: number, avoid: string[]) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You build a grammar & sentence-building curriculum for a beginner-to-intermediate adult
English learner (native language Urdu) preparing for PTE. For the given category and difficulty,
produce distinct grammar points. Output STRICT JSON only:
{"items": [{
  "title_en": string (short, e.g. "Present Continuous Tense"),
  "title_ur": string (Urdu name/short label),
  "explanation_ur": string (2-3 sentences in Urdu explaining when/how to use it, clear and simple),
  "pattern_en": string (the structural pattern, e.g. "subject + am/is/are + verb-ing"),
  "examples": [{"en": string, "ur": string}] (exactly 2 example sentence pairs),
  "practice_sentence": string (one sentence with exactly one blank written as {{blank}}, testing this point),
  "practice_options": string[4] (four choices for the blank, including the correct one, plausible distractors),
  "practice_answer": string (must exactly match one of practice_options)
}]}
No markdown, no commentary. Difficulty 1 = very basic, common patterns; 5 = more nuanced usage.
Never repeat a title already listed as "avoid".`,
      },
      {
        role: "user",
        content: `Category: ${category}\nDifficulty: ${difficulty}/5\nGenerate exactly ${count} distinct grammar points.\nAvoid these titles (already have them): ${avoid.join(", ") || "(none yet)"}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(raw) as { items?: GrammarItem[] };
    return parsed.items ?? [];
  } catch {
    console.warn(`Could not parse output for ${category}/${difficulty}, skipping.`);
    return [];
  }
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!url || !key || !openaiKey) {
    console.error("Missing SUPABASE_URL, SUPABASE_SECRET_KEY, or OPENAI_API_KEY in .env.local.");
    process.exit(1);
  }
  const db = createClient(url, key);
  const openai = new OpenAI({ apiKey: openaiKey });

  const { data: existingRows } = await db.from("grammar_points").select("title_en");
  const seenTitles = new Set((existingRows ?? []).map((r) => r.title_en.toLowerCase()));

  let inserted = 0;
  for (const category of CATEGORIES) {
    for (const band of BANDS) {
      const difficulty = band.min + Math.floor(Math.random() * (band.max - band.min + 1));
      const avoid = Array.from(seenTitles).slice(-30);
      const items = await generateBatch(openai, category, difficulty, COUNT_PER_BAND, avoid);

      const fresh = items.filter(
        (it) =>
          it.title_en &&
          it.practice_options?.includes(it.practice_answer) &&
          it.practice_sentence?.includes("{{blank}}") &&
          !seenTitles.has(it.title_en.toLowerCase())
      );
      fresh.forEach((it) => seenTitles.add(it.title_en.toLowerCase()));
      if (fresh.length === 0) continue;

      const { data, error } = await db
        .from("grammar_points")
        .insert(fresh.map((it) => ({ ...it, category, difficulty })))
        .select("id");
      if (error) {
        console.warn(`Insert failed for ${category}/${difficulty}:`, error.message);
        continue;
      }
      inserted += data?.length ?? 0;
      console.log(`+ ${data?.length ?? 0} points — ${category} (difficulty ${difficulty})`);
    }
  }
  console.log(`\nGrammar bank now has ${seenTitles.size} points total (${inserted} added this run).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
