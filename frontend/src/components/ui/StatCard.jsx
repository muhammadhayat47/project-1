export default function StatCard({ icon: Icon, label, value, sub, tone = "signal" }) {
  const toneClasses = {
    signal: "bg-signal-50 text-signal-600",
    forecast: "bg-forecast-50 text-forecast-600",
    ink: "bg-ink-100 text-ink-600",
  }[tone];

  return (
    <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClasses}`}>
            <Icon size={18} />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink-400">{label}</p>
          <p className="truncate font-display text-xl font-semibold text-ink-900">{value}</p>
        </div>
      </div>
      {sub && <p className="mt-2 text-xs text-ink-400">{sub}</p>}
    </div>
  );
}
