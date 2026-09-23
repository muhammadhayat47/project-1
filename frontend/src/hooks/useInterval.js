import { useEffect, useRef } from "react";

/**
 * Runs `callback` every `delay` ms, always calling the latest version of
 * the callback without restarting the timer when it changes identity
 * between renders (the standard React "ticking clock" interval pattern).
 * Pass delay = null to pause the interval entirely.
 */
export default function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null || delay === undefined) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
