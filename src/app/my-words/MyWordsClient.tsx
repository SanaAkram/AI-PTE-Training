"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DictionaryRow, PersonalVocabRow } from "@/lib/types";
import { lookupWordAction, saveWordAction, deleteWordAction, checkSentenceAction } from "./actions";
import type { VocabLookupResult } from "@/lib/vocabLookup";
import { Bilingual, Button, Card } from "@/components/ui";
import { ReplayButton } from "@/components/task-runner/ReplayButton";
import { useSpeechRecognition } from "@/lib/hooks/useSpeech";
import { useScrollToTop } from "@/lib/hooks/useScrollToTop";

type Mode = "translate" | "practice" | "saved";

/** The common shape the practice games actually need — both saved personal
 * words and shared dictionary words satisfy this, so practice can draw from
 * either pool interchangeably. */
interface VocabItem {
  id: string;
  english: string;
  meaning_ur: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MyWordsClient({
  words,
  dictionaryWords,
}: {
  words: PersonalVocabRow[];
  dictionaryWords: DictionaryRow[];
}) {
  const [mode, setMode] = useState<Mode>("practice");
  // Practice draws from both pools — your own saved words plus the shared
  // dictionary — so there's always something to practice, even on day one.
  const practicePool: VocabItem[] = useMemo(() => [...words, ...dictionaryWords], [words, dictionaryWords]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2" dir="ltr">
        {(
          [
            ["translate", "🌐 ترجمہ", "Translate"],
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

      {mode === "translate" && <TranslatorPanel onSaved={() => setMode("saved")} />}
      {mode === "practice" && <PracticePanel words={practicePool} />}
      {mode === "saved" && <SavedList words={words} />}
    </div>
  );
}

// ----------------------------------------------------------------- Translate

function TranslatorPanel({ onSaved }: { onSaved: () => void }) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [result, setResult] = useState<VocabLookupResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [micLang, setMicLang] = useState<"ur-PK" | "en-US">("ur-PK");
  const { start, listening, supported: micSupported } = useSpeechRecognition();

  async function lookup(text: string) {
    setError("");
    setResult(null);
    setBusy(true);
    try {
      const r = await lookupWordAction(text);
      setResult(r);
    } catch {
      setError("کچھ غلط ہوا، دوبارہ کوشش کریں / Something went wrong, try again");
    } finally {
      setBusy(false);
    }
  }

  function recordAndTranslate() {
    setError("");
    start(
      (transcript) => {
        setTerm(transcript);
        lookup(transcript); // record → transcribe → translate, no extra tap needed
      },
      () => setError("آواز نہیں پہچانی گئی، دوبارہ کوشش کریں / Could not hear that, try again"),
      micLang
    );
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
      <Bilingual ur="بولیں یا لکھیں — اردو یا انگریزی میں، فوری ترجمہ پائیں" en="SPEAK OR TYPE — URDU OR ENGLISH, INSTANT TRANSLATION" />

      {micSupported && (
        <div className="flex flex-col items-center gap-3 bg-surface-alt rounded-2xl p-5">
          <div className="flex gap-2" dir="ltr">
            {(["ur-PK", "en-US"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setMicLang(l)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                  micLang === l ? "bg-accent border-accent text-[color:var(--accent-ink)]" : "border-line text-ink-soft"
                }`}
              >
                {l === "ur-PK" ? "اردو" : "English"}
              </button>
            ))}
          </div>
          <button
            onClick={recordAndTranslate}
            disabled={busy}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border ${
              listening ? "bg-rose animate-pulse border-rose" : "bg-accent border-accent"
            }`}
            aria-label="بولیں / Record"
          >
            🎤
          </button>
          <Bilingual
            center
            ur={listening ? "سن رہا ہوں..." : "بولنے کے لیے دبائیں"}
            en={listening ? "LISTENING..." : "TAP TO SPEAK"}
          />
        </div>
      )}

      <textarea
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        rows={2}
        placeholder="مثلاً: مجھے دیر ہو گئی  یا  postpone"
        className="w-full rounded-2xl border border-line bg-surface p-4 text-base leading-relaxed resize-none text-right"
      />
      <Button onClick={() => lookup(term)} disabled={!term.trim() || busy}>
        🌐 ترجمہ کریں <span className="opacity-80 text-sm">(Translate)</span>
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
          <div className="flex flex-col gap-2">
            {result.examples.map((ex, i) => (
              <div key={i} className="bg-surface-alt rounded-xl p-3 flex items-center gap-2">
                <ReplayButton text={ex.en} size="sm" />
                <div className="flex-1">
                  <div className="en text-sm">{ex.en}</div>
                  <div className="ur text-sm text-ink-soft mt-1">{ex.ur}</div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="teal" onClick={save} disabled={busy}>
            💾 اپنی فہرست میں محفوظ کریں <span className="opacity-80 text-sm">(Save to my list)</span>
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
          ابھی کوئی لفظ محفوظ نہیں — "ترجمہ" سے شروع کریں
          <br />
          <span className="en text-xs">No words saved yet — start with &quot;Add&quot;.</span>
        </p>
      </Card>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      {words.map((w) => (
        <SavedWordCard key={w.id} word={w} onDeleted={() => router.refresh()} />
      ))}
    </div>
  );
}

function SavedWordCard({ word: w, onDeleted }: { word: PersonalVocabRow; onDeleted: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="!p-4 flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <ReplayButton text={w.english} size="sm" />
        <button className="flex-1 text-right" onClick={() => setExpanded((e) => !e)}>
          <div className="en font-display font-bold">{w.english}</div>
          <div className="ur text-accent-deep text-sm">{w.meaning_ur}</div>
          {!expanded && w.examples.length > 0 && (
            <div className="en text-xs text-ink-soft mt-1">{w.examples[0].en}</div>
          )}
        </button>
        <button
            onClick={async () => {
              await deleteWordAction(w.id);
              onDeleted();
            }}
            className="text-ink-soft text-lg shrink-0"
            aria-label="Delete"
          >
            🗑️
          </button>
      </div>
      {expanded && (
        <div className="flex flex-col gap-2">
          {w.examples.map((ex, i) => (
            <div key={i} className="bg-surface-alt rounded-xl p-2.5 flex items-center gap-2">
              <ReplayButton text={ex.en} size="sm" />
              <div className="flex-1">
                <div className="en text-sm">{ex.en}</div>
                <div className="ur text-xs text-ink-soft mt-0.5">{ex.ur}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// -------------------------------------------------------------------- Practice

type PracticeMode = "spell" | "meaning" | "sentence";

function PracticePanel({ words }: { words: VocabItem[] }) {
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

function GameHeader({ onExit, onSkip }: { onExit: () => void; onSkip: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <button onClick={onExit} className="text-xs text-ink-soft">
        ⬅ مشقوں کی فہرست
      </button>
      <button onClick={onSkip} className="text-xs font-bold text-ink-soft border border-line rounded-full px-3 py-1.5">
        چھوڑیں <span className="opacity-70">(Skip)</span> ⏭
      </button>
    </div>
  );
}

function SpellGame({ words, onExit }: { words: VocabItem[]; onExit: () => void }) {
  const [pool] = useState(() => shuffle(words));
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const word = pool[idx % pool.length];
  useScrollToTop(idx);

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
      <GameHeader onExit={onExit} onSkip={next} />
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

function MeaningGame({ words, onExit }: { words: VocabItem[]; onExit: () => void }) {
  const [pool] = useState(() => shuffle(words));
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const word = pool[idx % pool.length];
  useScrollToTop(idx);

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

  // Auto-advance a beat after answering — no extra tap needed for MCQ-style checks.
  useEffect(() => {
    if (answered === null) return;
    const t = setTimeout(next, 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered]);

  return (
    <div>
      <GameHeader onExit={onExit} onSkip={next} />
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

function SentenceGame({ words, onExit }: { words: VocabItem[]; onExit: () => void }) {
  const [pool] = useState(() => shuffle(words));
  const [idx, setIdx] = useState(0);
  const [sentence, setSentence] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ good: boolean; feedback_ur: string; corrected_en: string } | null>(null);
  const word = pool[idx % pool.length];
  useScrollToTop(idx);

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
      <GameHeader onExit={onExit} onSkip={next} />
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
