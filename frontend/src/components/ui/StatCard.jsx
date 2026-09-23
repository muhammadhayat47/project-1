export default function StatCard({ icon: Icon, label, value, sub, tone = "signal" }) {
  const toneClasses = {
    signal: "bg-signal-500/15 text-signal-300",
    forecast: "bg-glow-500/15 text-glow-300",
    ink: "bg-white/10 text-ink-200",
  }[tone];

  return (
    <div className="rounded-xl2 border border-white/10 bg-ink-900/60 p-5 shadow-glow backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClasses}`}>
            <Icon size={18} />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink-400">{label}</p>
          <p className="truncate font-display text-xl font-semibold text-white">{value}</p>
        </div>
      </div>
      {sub && <p className="mt-2 text-xs text-ink-400">{sub}</p>}
    </div>
  );
}
