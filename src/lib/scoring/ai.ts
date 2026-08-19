import "server-only";
import OpenAI from "openai";
import type {
  AnswerShortQuestionPayload,
  DescribeImagePayload,
  EssayWritingPayload,
  ReadAloudPayload,
  RepeatSentencePayload,
  RespondToSituationPayload,
  RetellLecturePayload,
  ResponsePayload,
  ScoreBreakdown,
  SummarizeGroupDiscussionPayload,
  SummarizeSpokenTextPayload,
  SummarizeWrittenTextPayload,
  TaskType,
} from "@/lib/types";

let client: OpenAI | null = null;
function openai(): OpenAI {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY env var.");
  client = new OpenAI({ apiKey });
  return client;
}

const MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `You are an experienced PTE (Pearson Test of English) examiner giving PRACTICE feedback to
an adult learner working toward the real exam. Grade strictly against the real PTE rubric for the
task type you're given, on a 0-100 scale per criterion (PTE's proportional style, not literal
Pearson point values). Be encouraging but honest — this learner needs accurate feedback to improve,
not empty praise. Use simple, clear sentences in your feedback (the learner is not yet fluent).
Always give exactly one specific, actionable note in "feedback" — something concrete they can fix
next time, not generic encouragement. If you're scoring a SPEAKING task, you only have a text
transcript and timing, not audio — you cannot judge pronunciation directly. Do not invent a
pronunciation score; if the transcript looks garbled or word-substituted in a way that suggests a
pronunciation issue, you may mention that possibility in "feedback" with clear hedging language
("this might mean...", "possibly a pronunciation slip on..."), but never state it as certain.
Respond with strict JSON only, exactly this shape, no markdown fencing:
{"overall": number, "criteria": [{"label": string, "score": number, "max": 100}], "feedback": string}`;

function speakingSource(taskType: TaskType, payload: unknown): string {
  switch (taskType) {
    case "read_aloud":
      return `Task: Read Aloud. Text shown to the student:\n"${(payload as ReadAloudPayload).text}"`;
    case "repeat_sentence":
      return `Task: Repeat Sentence. Sentence played to the student:\n"${(payload as RepeatSentencePayload).audioText}"`;
    case "describe_image": {
      const p = payload as DescribeImagePayload;
      return `Task: Describe Image. Image title: "${p.imageTitle}". Key points a strong answer should cover: ${p.keyPoints.join("; ")}.`;
    }
    case "retell_lecture": {
      const p = payload as RetellLecturePayload;
      return `Task: Retell Lecture. Lecture the student heard:\n"${p.audioText}"\nKey points a strong retell should cover: ${p.keyPoints.join("; ")}.`;
    }
    case "answer_short_question":
      return `Task: Answer Short Question. Expected answer: "${(payload as AnswerShortQuestionPayload).answer}".`;
    case "respond_to_situation": {
      const p = payload as RespondToSituationPayload;
      return `Task: Respond to a Situation. Situation given:\n"${p.situationText}"\nOne sample strong response: "${p.sampleResponse}"`;
    }
    case "summarize_group_discussion": {
      const p = payload as SummarizeGroupDiscussionPayload;
      const lines = p.lines.map((l) => `${l.speaker}: ${l.text}`).join("\n");
      return `Task: Summarize Group Discussion. Discussion the student heard:\n${lines}\nKey points a strong summary should cover: ${p.keyPoints}`;
    }
    default:
      return `Task: ${taskType}.`;
  }
}

function writingSource(taskType: TaskType, payload: unknown): string {
  switch (taskType) {
    case "summarize_written_text":
      return `Task: Summarize Written Text (must be exactly ONE sentence, 5-75 words). Source passage:\n"${(payload as SummarizeWrittenTextPayload).passage}"`;
    case "essay_writing":
      return `Task: Essay Writing (200-300 words). Prompt:\n"${(payload as EssayWritingPayload).prompt}"`;
    case "summarize_spoken_text":
      return `Task: Summarize Spoken Text (50-70 words). Transcript of what the student heard:\n"${(payload as SummarizeSpokenTextPayload).audioText}"`;
    default:
      return `Task: ${taskType}.`;
  }
}

/** LLM-graded scoring for the AI-scored task types (Speaking + free-writing). One OpenAI call. */
export async function scoreWithAI(
  taskType: TaskType,
  payload: unknown,
  response: ResponsePayload
): Promise<ScoreBreakdown> {
  const isSpeaking = response.kind === "speech";
  const source = isSpeaking ? speakingSource(taskType, payload) : writingSource(taskType, payload);

  const studentAnswer = isSpeaking
    ? `Student's spoken response (from speech recognition):\n"${response.transcript}"\nSpeaking time: ${(response.durationMs / 1000).toFixed(1)}s, ${response.spokenWordCount} words recognized.`
    : `Student's written response:\n"${response.kind === "text" ? response.value : ""}"`;

  const criteriaHint = isSpeaking
    ? `Score exactly these two criteria: "Content" and "Fluency" (fluency from pace/word count/timing, not audio quality).`
    : `Score exactly these five criteria: "Content", "Form", "Grammar", "Vocabulary", "Spelling".`;

  const userPrompt = `${source}\n\n${studentAnswer}\n\n${criteriaHint}`;

  const completion = await openai().chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: { overall?: number; criteria?: { label: string; score: number; max: number }[]; feedback?: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  return {
    kind: "ai",
    overall: typeof parsed.overall === "number" ? parsed.overall : 0,
    criteria: parsed.criteria ?? [],
    feedback: parsed.feedback ?? "Could not generate feedback this time — try submitting again.",
  };
}
