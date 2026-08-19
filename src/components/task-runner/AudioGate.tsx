"use client";
import { useEffect, useState, type ReactNode } from "react";
import { speakOnce } from "@/lib/hooks/useSpeech";
import { Bilingual } from "@/components/ui";

/**
 * Every Listening task shares one real-exam rule: the audio auto-plays once,
 * and the answer UI only appears after it finishes — matching "you hear it
 * only once." (Real PTE lets a few sub-types accept input *during* playback;
 * here every listening type answers after, which is simpler to build
 * reliably and keeps the actual listening skill the point of the exercise.)
 */
export function AudioGate({ text, children }: { text: string; children: ReactNode }) {
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    speakOnce(text).then(() => {
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
  return <>{children}</>;
}
