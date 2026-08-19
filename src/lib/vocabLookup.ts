import "server-only";
import OpenAI from "openai";

export interface VocabLookupResult {
  english: string;
  meaning_ur: string;
  examples: { en: string; ur: string }[];
}

let client: OpenAI | null = null;
function openai(): OpenAI {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY env var.");
  client = new OpenAI({ apiKey });
  return client;
}

const SYSTEM_PROMPT = `You help a beginner-to-intermediate English learner (native language Urdu) understand
any word, phrase, or sentence they type — it may be in Urdu, in English, or a mix. Always respond
with strict JSON only, exactly this shape:
{"english": string, "meaning_ur": string, "examples": [{"en": string, "ur": string}, ...]}

- "english": the natural English word/phrase/sentence. If the input was Urdu, translate it. If the
  input was already English, return it as-is (lightly corrected only if it had an obvious typo).
- "meaning_ur": a short, clear Urdu explanation of what it means (not just a translation — help them
  understand usage/nuance if relevant).
- "examples": exactly 5 natural, simple example sentences using it in different everyday contexts,
  each with its Urdu translation. Vary the contexts (don't just repeat the same sentence pattern).
Keep everything concise and beginner-friendly.`;

export async function lookupTerm(term: string): Promise<VocabLookupResult> {
  const completion = await openai().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: term },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<VocabLookupResult>;
  return {
    english: parsed.english ?? term,
    meaning_ur: parsed.meaning_ur ?? "",
    examples: Array.isArray(parsed.examples) && parsed.examples.length ? parsed.examples : [],
  };
}
