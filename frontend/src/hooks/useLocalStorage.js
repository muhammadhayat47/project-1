import { useCallback, useState } from "react";

/**
 * useState that mirrors its value to localStorage under `key`, JSON-encoded.
 * Falls back to `initialValue` if the key is missing or unparsable, and
 * never throws in environments where localStorage is unavailable (SSR, etc).
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage full or unavailable — value still updates in memory.
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, setStoredValue];
}
