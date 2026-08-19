"use client";
import { useEffect, useState, type ReactNode } from "react";
import { speakOnce } from "@/lib/hooks/useSpeech";
import { useAudioRate } from "@/lib/hooks/useAudioRate";
import { Bilingual } from "@/components/ui";
import { ReplayButton } from "./ReplayButton";

/**
 * Every Listening task shares one real-exam rule: the audio auto-plays once
 * before the answer UI appears, matching "you hear it only once." Unlike the
 * real exam, a Replay button stays available afterward — this is a practice
 * tool, and re-listening (at a slower speed if wanted) is exactly how
 * listening skill gets built before he's ready for exam conditions.
 */
export function AudioGate({ text, children }: { text: string; children: ReactNode }) {
  const [played, setPlayed] = useState(false);
  const { rate } = useAudioRate();

  useEffect(() => {
    let cancelled = false;
    speakOnce(text, rate).then(() => {
      if (!cancelled) setPlayed(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!played) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-3 animate-pulse">🔊</div>
        <Bilingual center ur="غور سے سنیں" en="LISTEN CAREFULLY" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-3">
        <ReplayButton text={text} />
        <Bilingual center ur="دوبارہ سننے کے لیے دبائیں" en="TAP TO LISTEN AGAIN" />
      </div>
      {children}
    </div>
  );
}
