import { useEffect, useState } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Building2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import LastUpdated from "../components/ui/LastUpdated";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useInterval from "../hooks/useInterval";

const REFRESH_MS = 60000; // re-forecast on its own so the chart stays current

const MOMENTUM_META = {
  Accelerating: { tone: "forecast", icon: TrendingUp },
  Stable: { tone: "neutral", icon: Minus },
  Cooling: { tone: "high", icon: TrendingDown },
};

export default function HiringTrends() {
  useDocumentTitle("Hiring Trends");
  const toast = useToast();
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState("Software Engineer");
  const [location, setLocation] = useState("Global");
  const [horizon, setHorizon] = useState(6);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    api.get("/api/hiring/roles").then(({ data }) => setRoles(data.roles)).catch(() => {});
  }, []);

  async function fetchForecast({ background = false } = {}) {
    if (background) setRefreshing(true);
    else setLoading(true);
    if (!background) setError("");
    try {
      const { data } = await api.get("/api/hiring/forecast", { params: { role, location, horizon } });
      setData(data);
      setUpdatedAt(Date.now());
    } catch (err) {
      const msg = apiErrorMessage(err);
      if (!background) {
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the forecast current on its own for the same role/location/horizon.
  useInterval(() => fetchForecast({ background: true }), REFRESH_MS);

  const chartData = data
    ? [
        ...data.history.map((p) => ({ period: p.period, actual: p.value })),
        ...data.forecast.map((p) => ({ period: p.period, forecast: p.value, band: [p.lower, p.upper] })),
      ]
    : [];

  const Momentum = data ? MOMENTUM_META[data.hiring_momentum] : null;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-300">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-56 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-glow-400"
            >
              {(roles.length ? roles : [role]).map((r) => (
                <option key={r} value={r} className="bg-ink-900 text-white">{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-300">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-40 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-ink-400 focus:border-glow-400"
              placeholder="Global"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-300">Forecast horizon: {horizon} months</label>
            <input
              type="range"
              min={1}
              max={12}
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="w-40 accent-glow-500"
            />
          </div>
          <Button onClick={fetchForecast} loading={loading}>Update forecast</Button>
        </div>
      </Card>

      {loading && !data ? (
        <Loader label="Crunching hiring history…" />
      ) : error && !data ? (
        <Card className="text-sm text-risk-high">{error}</Card>
      ) : data ? (
        <>
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-ink-400">{data.role} · {data.location}</p>
                <p className="font-display text-lg font-semibold text-white">Hiring volume, 24-month history + {horizon}-month forecast</p>
              </div>
              <div className="flex items-center gap-3">
                <LastUpdated timestamp={updatedAt} refreshing={refreshing} />
                {Momentum && (
                  <Badge tone={Momentum.tone} className="gap-1">
                    <Momentum.icon size={13} className="inline -mt-0.5" /> {data.hiring_momentum} · {data.monthly_growth_rate_pct}%/mo
                  </Badge>
                )}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={chartData} margin={{ left: -10 }}>
                <defs>
                  <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1FE39C" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1FE39C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#9AA1BC" }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.15)" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9AA1BC" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", fontSize: 12, background: "#191C30", color: "#fff" }} labelStyle={{ color: "#fff" }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#C7CCDC" }} />
                <Area type="monotone" dataKey="band" stroke="none" fill="url(#bandFill)" name="Confidence band" legendType="none" />
                <Line type="monotone" dataKey="actual" stroke="#C7CCDC" strokeWidth={2} dot={false} name="Historical postings" />
                <Line type="monotone" dataKey="forecast" stroke="#1FE39C" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 2, fill: "#1FE39C" }} name="Forecast" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <p className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
              <Building2 size={17} className="text-glow-400" /> Top hiring companies for this role
            </p>
            <div className="divide-y divide-white/10">
              {data.top_hiring_companies.map((c) => (
                <div key={c.company} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-white">{c.company}</span>
                  <div className="flex items-center gap-4 text-sm text-ink-300">
                    <span>{c.open_roles} open roles</span>
                    <Badge tone={c.hiring_trend_pct >= 0 ? "forecast" : "high"}>
                      {c.hiring_trend_pct >= 0 ? "+" : ""}{c.hiring_trend_pct}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
