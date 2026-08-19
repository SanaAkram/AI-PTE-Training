/**
 * Daily content-growth script. Meant to be invoked once a day by a scheduled
 * Claude Code routine (see README.md "Keeping the bank growing"). Generates
 * a fresh batch of real-format PTE questions per task type via OpenAI,
 * inserts them into question_bank, and extends curriculum_days so Mubeen
 * never runs out of "today". This is the gradual path toward a much larger
 * bank over months, as discussed with the user.
 *
 * Usage:  npm run grow
 * Needs:  .env.local with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

// Default (2/type/day ≈ 44/day) is what the daily automated routine should
// use — small and cheap, forever. Pass --count for a one-off bulk top-up,
// e.g. `npm run grow -- --count 9` for ~198 new questions in one run.
const ITEMS_PER_TYPE = Number(arg("count") ?? 2);
const DAYS_TO_EXTEND = 7;
const TASKS_PER_DAY = 4;

// Real PTE topic categories (Education, Technology & Society, Government/Law/
// Policy, Media & Advertising, Health & Lifestyle recur most) plus the 4
// standard essay structures — grounded in actual PTE prep research, given to
// the model so a multi-item batch spreads across topics instead of repeating.
const TOPIC_POOL = [
  "education",
  "technology and society",
  "health and lifestyle",
  "environment and climate",
  "government and public policy",
  "media and advertising",
  "work and career",
  "travel and transportation",
  "science and research",
  "society and culture",
  "money and the economy",
  "sports and recreation",
];
const ESSAY_STRUCTURES = [
  "agree or disagree",
  "advantages and disadvantages",
  "problem and solution",
  "discuss both views and give your opinion",
];

const TASK_TYPE_SECTION: Record<string, string> = {
  read_aloud: "speaking",
  repeat_sentence: "speaking",
  describe_image: "speaking",
  retell_lecture: "speaking",
  answer_short_question: "speaking",
  respond_to_situation: "speaking",
  summarize_group_discussion: "speaking",
  summarize_written_text: "writing",
  essay_writing: "writing",
  reading_mcq_single: "reading",
  reading_mcq_multiple: "reading",
  reorder_paragraphs: "reading",
  reading_fill_blanks_drag: "reading",
  reading_writing_fill_blanks_dropdown: "reading",
  summarize_spoken_text: "listening",
  listening_mcq_single: "listening",
  listening_mcq_multiple: "listening",
  listening_fill_blanks: "listening",
  highlight_correct_summary: "listening",
  select_missing_word: "listening",
  highlight_incorrect_words: "listening",
  write_from_dictation: "listening",
};

// One-line JSON-shape description per task type, given to the model verbatim.
const SCHEMA_HINT: Record<string, string> = {
  read_aloud: `{"text": string (15-30 words, natural spoken-register sentence)}`,
  repeat_sentence: `{"audioText": string (8-15 words)}`,
  describe_image: `{"imageType": "bar"|"line"|"pie"|"process"|"map"|"table", "imageTitle": string, "imageData": object (label->number for bar/line/pie/table) OR string[] (ordered steps for process/map), "keyPoints": string[3]}`,
  retell_lecture: `{"audioText": string (40-70 word short lecture), "keyPoints": string[3]}`,
  answer_short_question: `{"audioText": string (a short factual question), "answer": string (1-3 words)}`,
  respond_to_situation: `{"situationText": string (a workplace/social scenario), "sampleResponse": string}`,
  summarize_group_discussion: `{"lines": [{"speaker": string, "text": string}] (3 speakers), "keyPoints": string (1-2 sentence summary of the discussion)}`,
  summarize_written_text: `{"passage": string (60-100 words, academic/general topic)}`,
  essay_writing: `{"prompt": string (a 200-300-word-response essay prompt)}`,
  reading_mcq_single: `{"passage": string (40-80 words), "question": string, "options": string[4], "correctIndex": number}`,
  reading_mcq_multiple: `{"passage": string (40-80 words), "question": string, "options": string[4], "correctIndices": number[] (2-3 correct)}`,
  reorder_paragraphs: `{"paragraphsInOrder": string[4] (in correct logical order; app shuffles for the learner)}`,
  reading_fill_blanks_drag: `{"textWithBlanks": string (uses {{1}}, {{2}}, ... placeholders), "wordBank": string[] (correct answers plus 2-3 distractors), "answers": string[] (correct word per blank in order)}`,
  reading_writing_fill_blanks_dropdown: `{"textWithBlanks": string (uses {{1}}, {{2}} placeholders), "blanks": [{"options": string[4], "correctIndex": number}]}`,
  summarize_spoken_text: `{"audioText": string (80-120 word short talk transcript)}`,
  listening_mcq_single: `{"audioText": string (30-60 words), "question": string, "options": string[4], "correctIndex": number}`,
  listening_mcq_multiple: `{"audioText": string (30-60 words), "question": string, "options": string[4], "correctIndices": number[] (2-3 correct)}`,
  listening_fill_blanks: `{"audioText": string (the full sentence as spoken), "textWithBlanks": string (same text with 2 words replaced by {{1}} {{2}}), "answers": string[2]}`,
  highlight_correct_summary: `{"audioText": string (40-70 words), "summaries": string[4] (one correct paraphrase, three plausible-but-wrong), "correctIndex": number}`,
  select_missing_word: `{"audioTextBeforeGap": string (a sentence that ends right before its last word/phrase), "options": string[4] (the real missing word plus 3 distractors), "correctIndex": number}`,
  highlight_incorrect_words: `{"audioText": string (the correct sentence), "transcriptWithErrors": string (same sentence with 2-3 words swapped for wrong ones, same word count), "incorrectWordIndices": number[] (0-based indices into transcriptWithErrors.split(" ") of the swapped words)}`,
  write_from_dictation: `{"audioText": string (6-10 words, a clear simple sentence)}`,
};

async function generateForType(
  openai: OpenAI,
  taskType: string,
  difficulty: number,
  count: number,
  topics: string[]
) {
  const topicLine =
    taskType === "essay_writing"
      ? `Cover these topics, one per item, in this order — and use a different one of these essay structures for each: ${ESSAY_STRUCTURES.join(", ")}.\nTopics: ${topics.join("; ")}`
      : `Cover these topics, one per item, in this order (don't repeat a topic within this batch): ${topics.join("; ")}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You write practice questions for a PTE (Pearson Test of English) training app, in the exact
real exam format for the given task type. Register: general/academic topics only — never a
specific professional domain. Output STRICT JSON only: {"items": [<one object per item, matching
the given shape exactly>]}. No markdown, no commentary. Every item must be self-contained and
factually coherent.`,
      },
      {
        role: "user",
        content: `Task type: ${taskType}\nShape: ${SCHEMA_HINT[taskType]}\nDifficulty: ${difficulty}/5 (1=simple short sentences, 5=real exam length/complexity)\nGenerate exactly ${count} items.\n${topicLine}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.9,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(raw) as { items?: Record<string, unknown>[] };
    return parsed.items ?? [];
  } catch {
    console.warn(`Could not parse model output for ${taskType}, skipping.`);
    return [];
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!url || !key || !openaiKey) {
    console.error("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or OPENAI_API_KEY in .env.local.");
    process.exit(1);
  }
  const db = createClient(url, key);
  const openai = new OpenAI({ apiKey: openaiKey });

  // Spread each type's items across easy/medium/hard so the bank grows with
  // real level coverage, not just at one random difficulty.
  const BANDS = [
    { min: 1, max: 2 },
    { min: 3, max: 3 },
    { min: 4, max: 5 },
  ];

  const newIds: string[] = [];
  for (const taskType of Object.keys(TASK_TYPE_SECTION)) {
    const perBand = chunk(
      Array.from({ length: ITEMS_PER_TYPE }, (_, i) => i),
      Math.ceil(ITEMS_PER_TYPE / BANDS.length)
    );

    for (let b = 0; b < BANDS.length && b < perBand.length; b++) {
      const count = perBand[b].length;
      if (count === 0) continue;
      const band = BANDS[b];
      const difficulty = band.min + Math.floor(Math.random() * (band.max - band.min + 1));
      const topics = shuffle(TOPIC_POOL).slice(0, count);

      const items = await generateForType(openai, taskType, difficulty, count, topics);
      if (items.length === 0) continue;

      const { data, error } = await db
        .from("question_bank")
        .insert(
          items.map((payload) => ({
            section: TASK_TYPE_SECTION[taskType],
            task_type: taskType,
            payload,
            difficulty,
            source: "daily_gen",
          }))
        )
        .select("id");
      if (error) {
        console.warn(`Insert failed for ${taskType} (difficulty ${difficulty}):`, error.message);
        continue;
      }
      newIds.push(...(data ?? []).map((r) => r.id));
      console.log(`+ ${data?.length ?? 0} ${taskType} (difficulty ${difficulty})`);
    }
  }
  console.log(`\nInserted ${newIds.length} new questions.`);

  // Extend curriculum_days from wherever it currently ends.
  const { data: lastDay } = await db
    .from("curriculum_days")
    .select("day_number, unlock_date")
    .order("day_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: allRows } = await db.from("question_bank").select("id");
  const pool = (allRows ?? []).map((r) => r.id as string);
  const groups = chunk(shuffle(pool), TASKS_PER_DAY).slice(0, DAYS_TO_EXTEND);

  const startDayNumber = (lastDay?.day_number ?? 0) + 1;
  const startDate = lastDay ? new Date(lastDay.unlock_date) : new Date();
  const rows = groups.map((task_ids, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i + 1);
    return {
      day_number: startDayNumber + i,
      task_ids,
      unlock_date: date.toISOString().slice(0, 10),
    };
  });

  if (rows.length) {
    const { error } = await db.from("curriculum_days").insert(rows);
    if (error) console.warn("Could not extend curriculum_days:", error.message);
    else console.log(`Extended curriculum by ${rows.length} more days (up to day ${rows[rows.length - 1].day_number}).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
