"use client";
import { speakOnce, speakSequence } from "@/lib/hooks/useSpeech";
import { useAudioRate } from "@/lib/hooks/useAudioRate";

/** Lets the learner hear a prompt again, as many times as they want, at the
 * current global speed — the deliberate practice-mode override of the real
 * exam's "you hear it only once" rule. Pass either `text` (single utterance)
 * or `lines` (a multi-speaker sequence, e.g. Summarize Group Discussion). */
export function ReplayButton({
  text,
  lines,
  size = "md",
}: {
  text?: string;
  lines?: string[];
  size?: "sm" | "md" | "lg";
}) {
  const { rate } = useAudioRate();
  const sizeClass = size === "lg" ? "w-16 h-16 text-2xl" : size === "sm" ? "w-9 h-9 text-base" : "w-12 h-12 text-xl";
  return (
    <button
      type="button"
      onClick={() => (lines ? speakSequence(lines, rate) : speakOnce(text ?? "", rate))}
      className={`${sizeClass} rounded-full bg-surface-alt border border-line flex items-center justify-center active:scale-95 shrink-0`}
      aria-label="Replay audio"
    >
      🔁
    </button>
  );
}
