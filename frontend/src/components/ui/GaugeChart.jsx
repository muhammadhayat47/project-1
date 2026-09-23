const COLORS = {
  Low: "#1E8E5A",
  Medium: "#C98A1B",
  High: "#C0392B",
};

// Semi-circular gauge, 0-100, colored by risk level.
export default function GaugeChart({ value = 0, level = "Medium", size = 220 }) {
  const radius = size / 2 - 14;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = Math.PI; // 180deg
  const endAngle = 0; // 0deg
  const clamped = Math.max(0, Math.min(100, value));
  const angle = startAngle - (clamped / 100) * (startAngle - endAngle);

  const arcPoint = (a) => ({ x: cx + radius * Math.cos(a), y: cy - radius * Math.sin(a) });
  const start = arcPoint(startAngle);
  const end = arcPoint(endAngle);
  const needle = arcPoint(angle);
  const color = COLORS[level] || COLORS.Medium;

  const largeArc = 1;
  const trackPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;

  const progressAngleSweep = startAngle - angle;
  const progressLargeArc = progressAngleSweep > Math.PI ? 1 : 0;
  const progressPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${progressLargeArc} 1 ${needle.x} ${needle.y}`;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 24} viewBox={`0 0 ${size} ${size / 2 + 24}`}>
        <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={14} strokeLinecap="round" />
        <path d={progressPath} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={5} fill={color} />
        <line
          x1={cx}
          y1={cy}
          x2={cx + (radius - 18) * Math.cos(angle)}
          y2={cy - (radius - 18) * Math.sin(angle)}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <text x={cx} y={cy - 6} textAnchor="middle" className="font-display" fontSize="28" fontWeight="700" fill="#FFFFFF">
          {clamped.toFixed(0)}%
        </text>
      </svg>
      <span className="mt-1 text-sm font-medium" style={{ color }}>
        {level} risk
      </span>
    </div>
  );
}
