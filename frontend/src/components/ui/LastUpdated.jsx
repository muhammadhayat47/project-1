import { RefreshCw } from "lucide-react";
import useLiveClock from "../../hooks/useLiveClock";

function relativeTime(seconds) {
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

/**
 * Shows "Updated Xs ago" next to a piece of data, ticking forward on its
 * own every second as time passes — no manual refresh needed to see the
 * label change. Pass `refreshing` while a background auto-refresh call
 * is in flight to spin the icon.
 */
export default function LastUpdated({ timestamp, refreshing = false, className = "" }) {
  const now = useLiveClock(1000);
  if (!timestamp) return null;
  const seconds = Math.max(0, Math.round((now.getTime() - timestamp) / 1000));

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-ink-400 ${className}`}>
      <RefreshCw size={11} className={refreshing ? "animate-spin text-glow-400" : ""} />
      Updated {relativeTime(seconds)}
    </span>
  );
}
