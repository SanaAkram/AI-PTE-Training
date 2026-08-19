/**
 * Builds the shared "dictionary" table — a curated, ready-made English-Urdu
 * word bank for vocabulary/spelling practice, so My Words has real content
 * from day one without anyone having to type words in first.
 *
 * Generated fresh via OpenAI rather than importing a scraped dataset: the
 * best openly-findable English-Urdu word lists (e.g. academic
 * machine-alignment datasets) either declare no license or are noisy
 * low-confidence machine output — not something to load into someone's
 * database sight-unseen. This is original, curated, and level-appropriate.
 *
 * Usage:  npm run build-dictionary -- --count 10   (10 words per category per difficulty band)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
const COUNT_PER_BAND = Number(arg("count") ?? 6);

const CATEGORIES = [
  "everyday life and greetings",
  "family and relationships",
  "food and health",
  "home and daily routine",
  "education and study",
  "work and career",
  "travel and transportation",
  "technology and communication",
  "environment and nature",
  "money and shopping",
  "emotions and personality",
  "time, numbers and measurement",
  "PTE exam vocabulary (academic verbs and connectors)",
];

const BANDS = [
  { min: 1, max: 2 },
  { min: 3, max: 3 },
  { min: 4, max: 5 },
];

async function generateBatch(openai: OpenAI, category: string, difficulty: number, count: number, avoid: string[]) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You build a curated English vocabulary dictionary for a beginner-to-intermediate adult
English learner (native language Urdu) preparing for PTE. For the given category and difficulty,
produce common, genuinely useful English words (single words or short fixed phrases — not full
sentences) with accurate Urdu meanings. Output STRICT JSON only:
{"items": [{"english": string, "meaning_ur": string, "example_en": string, "example_ur": string}]}
No markdown, no commentary. Difficulty 1 = very common everyday words, 5 = less common but still
useful academic/formal words. Never repeat a word already listed as "avoid".`,
      },
      {
        role: "user",
        content: `Category: ${category}\nDifficulty: ${difficulty}/5\nGenerate exactly ${count} words.\nAvoid these (already have them): ${avoid.join(", ") || "(none yet)"}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(raw) as { items?: { english: string; meaning_ur: string; example_en: string; example_ur: string }[] };
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

  const { data: existingRows } = await db.from("dictionary").select("english");
  const seen = new Set((existingRows ?? []).map((r) => r.english.toLowerCase()));

  let inserted = 0;
  for (const category of CATEGORIES) {
    for (const band of BANDS) {
      const difficulty = band.min + Math.floor(Math.random() * (band.max - band.min + 1));
      const avoid = Array.from(seen).slice(-40); // keep the prompt short
      const items = await generateBatch(openai, category, difficulty, COUNT_PER_BAND, avoid);

      const fresh = items.filter((it) => it.english && !seen.has(it.english.toLowerCase()));
      fresh.forEach((it) => seen.add(it.english.toLowerCase()));
      if (fresh.length === 0) continue;

      const { data, error } = await db
        .from("dictionary")
        .upsert(
          fresh.map((it) => ({ ...it, category, difficulty })),
          { onConflict: "english", ignoreDuplicates: true }
        )
        .select("id");
      if (error) {
        console.warn(`Insert failed for ${category}/${difficulty}:`, error.message);
        continue;
      }
      inserted += data?.length ?? 0;
      console.log(`+ ${data?.length ?? 0} words — ${category} (difficulty ${difficulty})`);
    }
  }
  console.log(`\nDictionary now has ${seen.size} words total (${inserted} added this run).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
