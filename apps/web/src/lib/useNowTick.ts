"use client";

import { useEffect, useState } from "react";

// Shared 60s tick. All subscribers get the same Date.now() without each
// spinning up their own setInterval.
const listeners = new Set<(n: number) => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;
let current = typeof window === "undefined" ? 0 : Date.now();

function ensureInterval() {
  if (intervalId != null || typeof window === "undefined") return;
  intervalId = setInterval(() => {
    current = Date.now();
    for (const fn of listeners) fn(current);
  }, 60_000);
}

export function useNowTick(enabled = true): number {
  const [n, setN] = useState<number>(() => current || Date.now());
  useEffect(() => {
    if (!enabled) return;
    ensureInterval();
    listeners.add(setN);
    return () => {
      listeners.delete(setN);
      if (listeners.size === 0 && intervalId != null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, [enabled]);
  return n;
}
