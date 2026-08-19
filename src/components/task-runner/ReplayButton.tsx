"use client";
import { speakOnce, speakSequence } from "@/lib/hooks/useSpeech";
import { useAudioRate } from "@/lib/hooks/useAudioRate";

const SIZE_PX: Record<"sm" | "md" | "lg", number> = { sm: 36, md: 48, lg: 64 };
const ICON_SCALE: Record<"sm" | "md" | "lg", number> = { sm: 0.48, md: 0.5, lg: 0.46 };

/** Lets the learner hear a prompt again, as many times as they want, at the
 * current global speed — the deliberate practice-mode override of the real
 * exam's "you hear it only once" rule. Pass either `text` (single utterance)
 * or `lines` (a multi-speaker sequence, e.g. Summarize Group Discussion).
 *
 * Uses an inline SVG rather than an emoji glyph (🔊/🔁) — emoji rendering
 * depends on the OS/browser having that glyph cached, and was observed
 * falling back to a broken "download" placeholder on at least one setup. */
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
  const px = SIZE_PX[size];
  const iconPx = Math.round(px * ICON_SCALE[size]);
  return (
    <button
      type="button"
      onClick={() => (lines ? speakSequence(lines, rate) : speakOnce(text ?? "", rate))}
      style={{ width: px, height: px }}
      className="rounded-full bg-surface-alt border border-line flex items-center justify-center active:scale-95 shrink-0"
      aria-label="دوبارہ سنیں / Replay audio"
    >
      <svg width={iconPx} height={iconPx} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 10v4a1 1 0 0 0 1 1h3l4.5 4V5L8 9H5a1 1 0 0 0-1 1Z"
          fill="var(--accent-deep)"
        />
        <path
          d="M17 8.5a5 5 0 0 1 0 7"
          stroke="var(--accent-deep)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M19.3 6.2a8.5 8.5 0 0 1 0 11.6"
          stroke="var(--accent-deep)"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </button>
  );
}
