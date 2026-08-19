"use client";
import { useCallback, useRef, useState } from "react";

export function speak(text: string, rate = 1.0) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

export function speakOnce(text: string, rate = 1.0): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = rate;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export function speakSequence(lines: string[], rate = 1.0, gapMs = 350): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || lines.length === 0) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    let i = 0;
    const next = () => {
      if (i >= lines.length) {
        resolve();
        return;
      }
      const u = new SpeechSynthesisUtterance(lines[i]);
      u.lang = "en-US";
      u.rate = rate;
      u.onend = () => {
        i++;
        setTimeout(next, gapMs);
      };
      window.speechSynthesis.speak(u);
    };
    next();
  });
}

// SpeechRecognition isn't in TS's default DOM lib — narrow `any` locally instead
// of widening types app-wide.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any;

export function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const recRef = useRef<AnySpeechRecognition>(null);
  const supported =
    typeof window !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const start = useCallback(
    (onDone: (transcript: string) => void, onError?: () => void, lang: string = "en-US") => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      onError?.();
      return;
    }
    const rec: AnySpeechRecognition = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recRef.current = rec;
    setListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript as string;
      setListening(false);
      onDone(t);
    };
    rec.onerror = () => {
      setListening(false);
      onError?.();
    };
    rec.onend = () => setListening(false);
    try {
      rec.start();
    } catch {
      setListening(false);
      onError?.();
    }
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      // no active recognition — nothing to stop
    }
  }, []);

  return { start, stop, listening, supported };
}
