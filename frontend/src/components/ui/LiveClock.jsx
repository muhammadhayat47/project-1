import useLiveClock from "../../hooks/useLiveClock";

function formatClock(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/**
 * A self-updating wall clock — ticks forward every second with no props
 * or parent re-renders required.
 */
export default function LiveClock({ className = "" }) {
  const now = useLiveClock(1000);
  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {formatClock(now)}
    </span>
  );
}
