"use client";
import { useEffect, useRef, useState } from "react";

export function useCountdown(initialSeconds: number, onExpire?: () => void, autoStart = true) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(autoStart);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining]);

  useEffect(() => {
    if (running && remaining === 0) {
      setRunning(false);
      onExpireRef.current?.();
    }
  }, [running, remaining]);

  return {
    remaining,
    running,
    start: () => setRunning(true),
    stop: () => setRunning(false),
    reset: (s: number) => setRemaining(s),
  };
}

export function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
