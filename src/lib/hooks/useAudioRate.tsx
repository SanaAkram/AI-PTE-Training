"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "safar_audio_slow";

interface AudioRateContextValue {
  slow: boolean;
  rate: number;
  toggle: () => void;
}

const AudioRateContext = createContext<AudioRateContextValue>({ slow: false, rate: 1, toggle: () => {} });

export function AudioRateProvider({ children }: { children: ReactNode }) {
  // Default to slow — most useful starting point for a beginner-to-intermediate listener.
  const [slow, setSlow] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) setSlow(saved === "1");
    } catch {
      // localStorage unavailable — fall back to the default.
    }
  }, []);

  function toggle() {
    setSlow((s) => {
      const next = !s;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <AudioRateContext.Provider value={{ slow, rate: slow ? 0.65 : 1, toggle }}>
      {children}
    </AudioRateContext.Provider>
  );
}

export function useAudioRate() {
  return useContext(AudioRateContext);
}
