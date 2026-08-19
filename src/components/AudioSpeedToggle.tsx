"use client";
import { useAudioRate } from "@/lib/hooks/useAudioRate";

export function AudioSpeedToggle() {
  const { slow, toggle } = useAudioRate();
  return (
    <button
      type="button"
      onClick={toggle}
      className={`text-xs font-bold px-2.5 py-1.5 rounded-full border ${
        slow ? "bg-surface-alt border-accent text-accent-deep" : "border-line text-ink-soft"
      }`}
      title="Audio speed"
    >
      {slow ? "🐢 آہستہ" : "🐇 عام"}
    </button>
  );
}
