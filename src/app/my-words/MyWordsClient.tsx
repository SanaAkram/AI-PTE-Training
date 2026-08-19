"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PersonalVocabRow } from "@/lib/types";
import { lookupWordAction, saveWordAction, deleteWordAction, checkSentenceAction } from "./actions";
import type { VocabLookupResult } from "@/lib/vocabLookup";
import { Bilingual, Button, Card } from "@/components/ui";
import { ReplayButton } from "@/components/task-runner/ReplayButton";

type Mode = "add" | "practice" | "saved";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MyWordsClient({ words }: { words: PersonalVocabRow[] }) {
  const [mode, setMode] = useState<Mode>(words.length === 0 ? "add" : "practice");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2" dir="ltr">
        {(
          [
            ["add", "➕ شامل کریں", "Add"],
            ["practice", "🎯 مشق", "Practice"],
            ["saved", "📚 محفوظ شدہ", "Saved"],
          ] as [Mode, string, string][]
        ).map(([m, ur, en]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-2xl py-3 border-2 text-center ${
              mode === m ? "bg-accent border-accent text-[color:var(--accent-ink)]" : "bg-surface border-line text-ink-soft"
            }`}
          >
            <div className="ur text-sm">{ur}</div>
            <div className="en text-[0.6rem] font-bold">{en}</div>
          </button>
        ))}
      </div>

      {mode === "add" && <AddWordPanel onSaved={() => setMode("saved")} />}
      {mode === "practice" && <PracticePanel words={words} />}
      {mode === "saved" && <SavedList words={words} />}
    </div>
  );
}

// --------------------------------------------------------------- Add a word

function AddWordPanel({ onSaved }: { onSaved: () => void }) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [result, setResult] = useState<VocabLookupResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function lookup() {
    setError("");
    setBusy(true);
    try {
      const r = await lookupWordAction(term);
      setResult(r);
    } catch {
      setError("کچھ غلط ہوا، دوبارہ کوشش کریں / Something went wrong, try again");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!result) return;
    setBusy(true);
    try {
      await saveWordAction(term, result);
      setTerm("");
      setResult(null);
      router.refresh();
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Bilingual ur="کوئی بھی لفظ یا جملہ لکھیں — اردو یا انگریزی میں" en="TYPE ANY WORD OR SENTENCE — URDU OR ENGLISH" />
      <textarea
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        rows={2}
        placeholder="مثلاً: مجھے دیر ہو گئی  یا  postpone"
        className="w-full rounded-2xl border border-line bg-surface p-4 text-base leading-relaxed resize-none text-right"
      />
      <Button onClick={lookup} disabled={!term.trim() || busy}>
        🔍 چیک کریں <span className="opacity-80 text-sm">(Check)</span>
      </Button>
      {error && <p className="text-rose text-sm text-center font-bold">{error}</p>}

      {result && (
        <Card className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <ReplayButton text={result.english} />
            <div className="text-right flex-1">
              <div className="en font-display font-bold text-lg">{result.english}</div>
              <div className="ur text-accent-deep">{result.meaning_ur}</div>
            </div>
          </div>
          <div className="bg-surface-alt rounded-xl p-3">
            <div className="en text-sm">{result.example_en}</div>
            <div className="ur text-sm text-ink-soft mt-1">{result.example_ur}</div>
          </div>
          <Button variant="teal" onClick={save} disabled={busy}>
            💾 محفوظ کریں <span className="opacity-80 text-sm">(Save)</span>
          </Button>
        </Card>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Saved list

function SavedList({ words }: { words: PersonalVocabRow[] }) {
  const router = useRouter();
  if (words.length === 0) {
    return (
      <Card>
        <p className="text-sm text-ink-soft text-center">
          ابھی کوئی لفظ محفوظ نہیں — "شامل کریں" سے شروع کریں
          <br />
          <span className="en text-xs">No words saved yet — start with &quot;Add&quot;.</span>
        </p>
      </Card>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      {words.map((w) => (
        <Card key={w.id} className="!p-4 flex items-start gap-3">
          <ReplayButton text={w.english} size="sm" />
          <div className="flex-1 text-right">
            <div className="en font-display font-bold">{w.english}</div>
            <div className="ur text-accent-deep text-sm">{w.meaning_ur}</div>
            <div className="en text-xs text-ink-soft mt-1">{w.example_en}</div>
          </div>
          <button
            onClick={async () => {
              await deleteWordAction(w.id);
              router.refresh();
            }}
            className="text-ink-soft text-lg shrink-0"
            aria-label="Delete"
          >
            🗑️
          </button>
        </Card>
      ))}
    </div>
  );
}

// -------------------------------------------------------------------- Practice

type PracticeMode = "spell" | "meaning" | "sentence";

function PracticePanel({ words }: { words: PersonalVocabRow[] }) {
  const [sub, setSub] = useState<PracticeMode | null>(null);

  if (words.length === 0) {
    return (
      <Card>
        <p className="text-sm text-ink-soft text-center">
          مشق کے لیے پہلے کچھ الفاظ شامل کریں
          <br />
          <span className="en text-xs">Add a few words first to start practicing.</span>
        </p>
      </Card>
    );
  }

  if (!sub) {
    return (
      <div className="grid grid-cols-1 gap-3">
        <button onClick={() => setSub("spell")}>
          <Card className="!p-4 flex items-center justify-between hover:border-accent">
            <span className="text-2xl">✍️</span>
            <Bilingual ur="سنیں اور ہجے لکھیں" en="LISTEN & SPELL" />
          </Card>
        </button>
        <button onClick={() => setSub("meaning")} disabled={words.length < 2}>
          <Card className={`!p-4 flex items-center justify-between ${words.length < 2 ? "opacity-40" : "hover:border-accent"}`}>
            <span className="text-2xl">🧠</span>
            <Bilingual ur="معنی پہچانیں" en="RECOGNIZE MEANING" />
          </Card>
        </button>
        <button onClick={() => setSub("sentence")}>
          <Card className="!p-4 flex items-center justify-between hover:border-accent">
            <span className="text-2xl">✏️</span>
            <Bilingual ur="اپنا جملہ بنائیں" en="MAKE YOUR OWN SENTENCE" />
          </Card>
        </button>
      </div>
    );
  }

  return (
    <div>
      {sub === "spell" && <SpellGame words={words} onExit={() => setSub(null)} />}
      {sub === "meaning" && <MeaningGame words={words} onExit={() => setSub(null)} />}
      {sub === "sentence" && <SentenceGame words={words} onExit={() => setSub(null)} />}
    </div>
  );
}

function BackToModes({ onExit }: { onExit: () => void }) {
  return (
    <button onClick={onExit} className="text-xs text-ink-soft mb-3 block">
      ⬅ مشقوں کی فہرست
    </button>
  );
}

function SpellGame({ words, onExit }: { words: PersonalVocabRow[]; onExit: () => void }) {
  const [pool] = useState(() => shuffle(words));
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const word = pool[idx % pool.length];

  function check() {
    setChecked(typed.trim().toLowerCase() === word.english.trim().toLowerCase());
  }
  function next() {
    setIdx((i) => i + 1);
    setTyped("");
    setChecked(null);
  }

  return (
    <div>
      <BackToModes onExit={onExit} />
      <div className="flex flex-col gap-4 items-center">
        <Bilingual center ur="سنیں اور صحیح ہجے لکھیں" en="LISTEN AND TYPE THE SPELLING" />
        <ReplayButton text={word.english} size="lg" />
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          dir="ltr"
          disabled={checked !== null}
          placeholder="Type what you hear..."
          className="en w-full rounded-2xl border border-line bg-surface p-4 text-base text-center"
          onKeyDown={(e) => e.key === "Enter" && !checked && check()}
        />
        {checked === null && (
          <Button disabled={!typed.trim()} onClick={check}>
            ✔️ چیک کریں
          </Button>
        )}
        {checked !== null && (
          <div className="w-full flex flex-col gap-3">
            <div className={`rounded-xl p-3 text-center font-bold ${checked ? "bg-teal-soft text-teal" : "bg-rose-soft text-rose"}`}>
              {checked ? "✅ بالکل صحیح!" : `❌ صحیح ہجے: ${word.english}`}
            </div>
            <Button variant="teal" onClick={next}>
              اگلا لفظ ➡️
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function MeaningGame({ words, onExit }: { words: PersonalVocabRow[]; onExit: () => void }) {
  const [pool] = useState(() => shuffle(words));
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const word = pool[idx % pool.length];

  const options = useMemo(() => {
    const distractors = shuffle(words.filter((w) => w.id !== word.id))
      .slice(0, 3)
      .map((w) => w.meaning_ur);
    return shuffle([word.meaning_ur, ...distractors]);
  }, [word, words]);

  function next() {
    setIdx((i) => i + 1);
    setAnswered(null);
  }

  return (
    <div>
      <BackToModes onExit={onExit} />
      <div className="flex flex-col gap-4">
        <Bilingual center ur="اس لفظ کا صحیح معنی چنیں" en="CHOOSE THE CORRECT MEANING" />
        <div className="bg-surface-alt rounded-2xl p-5 text-center flex items-center justify-center gap-3">
          <ReplayButton text={word.english} size="sm" />
          <span className="en font-display font-bold text-xl">{word.english}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {options.map((opt, i) => {
            const isCorrect = opt === word.meaning_ur;
            const show = answered !== null;
            return (
              <button
                key={i}
                disabled={show}
                onClick={() => setAnswered(i)}
                className={`text-right rounded-2xl border-2 px-4 py-3.5 ${
                  show && isCorrect
                    ? "border-teal bg-teal-soft"
                    : show && answered === i
                      ? "border-rose bg-rose-soft"
                      : "border-line bg-surface"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {answered !== null && (
          <Button variant="teal" onClick={next}>
            اگلا لفظ ➡️
          </Button>
        )}
      </div>
    </div>
  );
}

function SentenceGame({ words, onExit }: { words: PersonalVocabRow[]; onExit: () => void }) {
  const [pool] = useState(() => shuffle(words));
  const [idx, setIdx] = useState(0);
  const [sentence, setSentence] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ good: boolean; feedback_ur: string; corrected_en: string } | null>(null);
  const word = pool[idx % pool.length];

  async function check() {
    setBusy(true);
    try {
      const r = await checkSentenceAction(word.english, sentence);
      setFeedback(r);
    } finally {
      setBusy(false);
    }
  }
  function next() {
    setIdx((i) => i + 1);
    setSentence("");
    setFeedback(null);
  }

  return (
    <div>
      <BackToModes onExit={onExit} />
      <div className="flex flex-col gap-4">
        <Bilingual center ur="اس لفظ کو استعمال کر کے اپنا جملہ بنائیں" en="WRITE YOUR OWN SENTENCE USING THIS WORD" />
        <div className="bg-surface-alt rounded-2xl p-5 text-center flex items-center justify-center gap-3">
          <ReplayButton text={word.english} size="sm" />
          <div>
            <div className="en font-display font-bold text-xl">{word.english}</div>
            <div className="ur text-accent-deep text-sm">{word.meaning_ur}</div>
          </div>
        </div>
        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          dir="ltr"
          rows={3}
          disabled={!!feedback}
          placeholder="Write your sentence here..."
          className="en w-full rounded-2xl border border-line bg-surface p-4 text-base resize-none"
        />
        {!feedback && (
          <Button onClick={check} disabled={!sentence.trim() || busy}>
            ✔️ چیک کریں <span className="opacity-80 text-sm">(Check)</span>
          </Button>
        )}
        {feedback && (
          <div className="flex flex-col gap-3">
            <div className={`rounded-xl p-3 ${feedback.good ? "bg-teal-soft" : "bg-rose-soft"}`}>
              <p className="ur text-right">{feedback.feedback_ur}</p>
              {!feedback.good && (
                <p className="text-xs text-ink-soft mt-2 text-right">
                  <span className="ur">بہتر جملہ: </span>
                  <span className="en">{feedback.corrected_en}</span>
                </p>
              )}
            </div>
            <Button variant="teal" onClick={next}>
              اگلا لفظ ➡️
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
