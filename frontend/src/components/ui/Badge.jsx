const TONES = {
  neutral: "bg-white/10 text-ink-200",
  signal: "border border-signal-400/30 bg-signal-500/10 text-signal-300",
  forecast: "border border-glow-400/30 bg-glow-500/10 text-glow-300",
  low: "border border-glow-400/30 bg-glow-500/10 text-glow-300",
  medium: "border border-amber-400/30 bg-amber-500/10 text-amber-300",
  high: "border border-red-400/30 bg-red-500/10 text-red-300",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}
