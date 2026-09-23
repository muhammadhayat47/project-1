export default function Loader({ label = "Loading…", className = "" }) {
  return (
    <div className={`flex items-center gap-3 text-ink-300 ${className}`}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-glow-400" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
