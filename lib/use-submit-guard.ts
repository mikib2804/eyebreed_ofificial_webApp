"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Prevents same-tick double submits, concurrent submits, and rapid retries. */
export function useSubmitGuard(cooldownMs = 1_500) {
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const run = useCallback(async <T,>(task: () => Promise<T>): Promise<T | undefined> => {
    if (locked.current) return undefined;
    locked.current = true;
    setBlocked(true);
    try {
      return await task();
    } finally {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        locked.current = false;
        setBlocked(false);
        timer.current = null;
      }, cooldownMs);
    }
  }, [cooldownMs]);

  return { blocked, run };
}
