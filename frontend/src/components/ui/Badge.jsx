const TONES = {
  neutral: "bg-ink-100 text-ink-600",
  signal: "bg-signal-100 text-signal-700",
  forecast: "bg-forecast-100 text-forecast-700",
  low: "bg-emerald-50 text-risk-low",
  medium: "bg-amber-50 text-risk-medium",
  high: "bg-red-50 text-risk-high",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}
