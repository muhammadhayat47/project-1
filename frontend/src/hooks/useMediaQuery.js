import { useEffect, useState } from "react";

/**
 * Tracks a CSS media query, e.g. useMediaQuery("(max-width: 768px)").
 * Used to adapt layout (e.g. collapsing the sidebar) on small screens.
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
