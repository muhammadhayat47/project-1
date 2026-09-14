export default function Loader({ label = "Loading…", className = "" }) {
  return (
    <div className={`flex items-center gap-3 text-ink-400 ${className}`}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-200 border-t-signal-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
