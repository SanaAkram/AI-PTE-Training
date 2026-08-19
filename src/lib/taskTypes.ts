import type { Section, TaskType } from "./types";

export type Renderer =
  | "speaking"
  | "writing"
  | "reading_mcq"
  | "reorder"
  | "blank_drag"
  | "blank_dropdown"
  | "listening_summary"
  | "listening_mcq"
  | "listening_blanks"
  | "highlight_summary"
  | "select_missing_word"
  | "highlight_incorrect_words"
  | "dictation";

export interface TaskTypeConfig {
  type: TaskType;
  section: Section;
  labelEn: string;
  labelUr: string;
  renderer: Renderer;
  scoring: "objective" | "ai";
  multiSelect?: boolean;
  prepSeconds?: number;
  recordSeconds?: number;
  writeMinutes?: number;
  wordLimit?: { min: number; max: number };
  /** Real-exam timing this is modeled on. Pearson updates these periodically —
   *  treat as a close approximation for practice pacing, not a guarantee. */
  pteNote: string;
}

export const TASK_TYPES: Record<TaskType, TaskTypeConfig> = {
  // ---------------------------------------------------------------- Speaking
  read_aloud: {
    type: "read_aloud",
    section: "speaking",
    labelEn: "Read Aloud",
    labelUr: "زور سے پڑھیں",
    renderer: "speaking",
    scoring: "ai",
    prepSeconds: 35,
    recordSeconds: 40,
    pteNote: "~30–40s prep, ~40s to speak (real exam prep time scales with text length)",
  },
  repeat_sentence: {
    type: "repeat_sentence",
    section: "speaking",
    labelEn: "Repeat Sentence",
    labelUr: "جملہ دہرائیں",
    renderer: "speaking",
    scoring: "ai",
    prepSeconds: 0,
    recordSeconds: 15,
    pteNote: "Listen once, then 15s to repeat",
  },
  describe_image: {
    type: "describe_image",
    section: "speaking",
    labelEn: "Describe Image",
    labelUr: "تصویر بیان کریں",
    renderer: "speaking",
    scoring: "ai",
    prepSeconds: 25,
    recordSeconds: 40,
    pteNote: "25s to study the image, 40s to describe it",
  },
  retell_lecture: {
    type: "retell_lecture",
    section: "speaking",
    labelEn: "Retell Lecture",
    labelUr: "لیکچر دوبارہ بیان کریں",
    renderer: "speaking",
    scoring: "ai",
    prepSeconds: 10,
    recordSeconds: 40,
    pteNote: "Listen to the lecture, 10s prep, 40s to retell",
  },
  answer_short_question: {
    type: "answer_short_question",
    section: "speaking",
    labelEn: "Answer Short Question",
    labelUr: "مختصر سوال کا جواب دیں",
    renderer: "speaking",
    scoring: "ai",
    prepSeconds: 0,
    recordSeconds: 10,
    pteNote: "One-word or short-phrase answer, ~10s",
  },
  respond_to_situation: {
    type: "respond_to_situation",
    section: "speaking",
    labelEn: "Respond to a Situation",
    labelUr: "صورتحال کا جواب دیں",
    renderer: "speaking",
    scoring: "ai",
    prepSeconds: 20,
    recordSeconds: 40,
    pteNote: "20s to think, 40s to respond naturally, as if talking to a colleague",
  },
  summarize_group_discussion: {
    type: "summarize_group_discussion",
    section: "speaking",
    labelEn: "Summarize Group Discussion",
    labelUr: "گروپ ڈسکشن کا خلاصہ کریں",
    renderer: "speaking",
    scoring: "ai",
    prepSeconds: 10,
    recordSeconds: 70,
    pteNote: "Listen to several speakers, 10s prep, up to ~70s to summarize",
  },

  // ----------------------------------------------------------------- Writing
  summarize_written_text: {
    type: "summarize_written_text",
    section: "writing",
    labelEn: "Summarize Written Text",
    labelUr: "تحریری متن کا خلاصہ کریں",
    renderer: "writing",
    scoring: "ai",
    writeMinutes: 10,
    wordLimit: { min: 5, max: 75 },
    pteNote: "One sentence, 5–75 words, 10 minutes",
  },
  essay_writing: {
    type: "essay_writing",
    section: "writing",
    labelEn: "Essay Writing",
    labelUr: "مضمون لکھیں",
    renderer: "writing",
    scoring: "ai",
    writeMinutes: 20,
    wordLimit: { min: 200, max: 300 },
    pteNote: "200–300 words, 20 minutes",
  },

  // ----------------------------------------------------------------- Reading
  reading_mcq_single: {
    type: "reading_mcq_single",
    section: "reading",
    labelEn: "Multiple Choice, Single Answer",
    labelUr: "کثیر انتخابی سوال (ایک جواب)",
    renderer: "reading_mcq",
    scoring: "objective",
    multiSelect: false,
    pteNote: "Choose the one correct answer",
  },
  reading_mcq_multiple: {
    type: "reading_mcq_multiple",
    section: "reading",
    labelEn: "Multiple Choice, Multiple Answers",
    labelUr: "کثیر انتخابی سوال (کئی جواب)",
    renderer: "reading_mcq",
    scoring: "objective",
    multiSelect: true,
    pteNote: "Choose all correct answers — wrong picks cost marks in the real exam",
  },
  reorder_paragraphs: {
    type: "reorder_paragraphs",
    section: "reading",
    labelEn: "Re-order Paragraphs",
    labelUr: "پیراگراف ترتیب دیں",
    renderer: "reorder",
    scoring: "objective",
    pteNote: "Put the shuffled paragraphs into the correct logical order",
  },
  reading_fill_blanks_drag: {
    type: "reading_fill_blanks_drag",
    section: "reading",
    labelEn: "Reading: Fill in the Blanks",
    labelUr: "پڑھ کر خالی جگہ پُر کریں",
    renderer: "blank_drag",
    scoring: "objective",
    pteNote: "Drag each word from the word bank into the correct blank",
  },
  reading_writing_fill_blanks_dropdown: {
    type: "reading_writing_fill_blanks_dropdown",
    section: "reading",
    labelEn: "Reading & Writing: Fill in the Blanks",
    labelUr: "خالی جگہ پُر کریں (ڈراپ ڈاؤن)",
    renderer: "blank_dropdown",
    scoring: "objective",
    pteNote: "Pick the correct word for each blank from its dropdown",
  },

  // --------------------------------------------------------------- Listening
  summarize_spoken_text: {
    type: "summarize_spoken_text",
    section: "listening",
    labelEn: "Summarize Spoken Text",
    labelUr: "سنی ہوئی بات کا خلاصہ لکھیں",
    renderer: "listening_summary",
    scoring: "ai",
    writeMinutes: 10,
    wordLimit: { min: 50, max: 70 },
    pteNote: "Listen once, then write a 50–70 word summary in 10 minutes",
  },
  listening_mcq_single: {
    type: "listening_mcq_single",
    section: "listening",
    labelEn: "Multiple Choice, Single Answer",
    labelUr: "سن کر ایک جواب چنیں",
    renderer: "listening_mcq",
    scoring: "objective",
    multiSelect: false,
    pteNote: "Listen once, then choose the one correct answer",
  },
  listening_mcq_multiple: {
    type: "listening_mcq_multiple",
    section: "listening",
    labelEn: "Multiple Choice, Multiple Answers",
    labelUr: "سن کر کئی جواب چنیں",
    renderer: "listening_mcq",
    scoring: "objective",
    multiSelect: true,
    pteNote: "Listen once, then choose all correct answers",
  },
  listening_fill_blanks: {
    type: "listening_fill_blanks",
    section: "listening",
    labelEn: "Fill in the Blanks",
    labelUr: "سن کر خالی جگہ پُر کریں",
    renderer: "listening_blanks",
    scoring: "objective",
    pteNote: "Type the missing words as you listen",
  },
  highlight_correct_summary: {
    type: "highlight_correct_summary",
    section: "listening",
    labelEn: "Highlight Correct Summary",
    labelUr: "صحیح خلاصہ چنیں",
    renderer: "highlight_summary",
    scoring: "objective",
    pteNote: "Listen once, then pick the paragraph that best summarizes it",
  },
  select_missing_word: {
    type: "select_missing_word",
    section: "listening",
    labelEn: "Select Missing Word",
    labelUr: "غائب لفظ منتخب کریں",
    renderer: "select_missing_word",
    scoring: "objective",
    pteNote: "The recording ends abruptly — choose the word that completes it",
  },
  highlight_incorrect_words: {
    type: "highlight_incorrect_words",
    section: "listening",
    labelEn: "Highlight Incorrect Words",
    labelUr: "غلط الفاظ نشان زد کریں",
    renderer: "highlight_incorrect_words",
    scoring: "objective",
    pteNote: "Tap every word in the transcript that differs from what you hear",
  },
  write_from_dictation: {
    type: "write_from_dictation",
    section: "listening",
    labelEn: "Write from Dictation",
    labelUr: "سن کر لکھیں",
    renderer: "dictation",
    scoring: "objective",
    pteNote: "Type the exact sentence you hear",
  },
};

export const SECTION_LABELS: Record<Section, { en: string; ur: string; icon: string }> = {
  speaking: { en: "Speaking", ur: "بولنا", icon: "🗣️" },
  writing: { en: "Writing", ur: "لکھنا", icon: "✍️" },
  reading: { en: "Reading", ur: "پڑھنا", icon: "📖" },
  listening: { en: "Listening", ur: "سننا", icon: "🎧" },
};

export const ALL_TASK_TYPES = Object.keys(TASK_TYPES) as TaskType[];

export function taskTypesBySection(section: Section): TaskTypeConfig[] {
  return ALL_TASK_TYPES.map((t) => TASK_TYPES[t]).filter((c) => c.section === section);
}
