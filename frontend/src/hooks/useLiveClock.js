import { useEffect, useState } from "react";

/**
 * Returns the current Date, re-rendering every `intervalMs` (default 1s).
 * Powers live clocks and "updated Xs ago" style indicators that tick
 * forward on their own, without any manual refresh.
 */
export default function useLiveClock(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
