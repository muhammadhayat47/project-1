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
import useDocumentTitle from "../hooks/useDocumentTitle";

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
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/hiring/roles").then(({ data }) => setRoles(data.roles)).catch(() => {});
  }, []);

  async function fetchForecast() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/hiring/forecast", { params: { role, location, horizon } });
      setData(data);
    } catch (err) {
      const msg = apiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <label className="mb-1.5 block text-xs font-medium text-ink-500">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-56 rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-signal-400"
            >
              {(roles.length ? roles : [role]).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-500">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-40 rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-signal-400"
              placeholder="Global"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-500">Forecast horizon: {horizon} months</label>
            <input
              type="range"
              min={1}
              max={12}
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="w-40 accent-signal-600"
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
                <p className="font-display text-lg font-semibold text-ink-900">Hiring volume, 24-month history + {horizon}-month forecast</p>
              </div>
              {Momentum && (
                <Badge tone={Momentum.tone} className="gap-1">
                  <Momentum.icon size={13} className="inline -mt-0.5" /> {data.hiring_momentum} · {data.monthly_growth_rate_pct}%/mo
                </Badge>
              )}
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={chartData} margin={{ left: -10 }}>
                <defs>
                  <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3538CD" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#3538CD" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EE" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#6B7396" }} tickLine={false} axisLine={{ stroke: "#E4E7EE" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7396" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E4E7EE", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="band" stroke="none" fill="url(#bandFill)" name="Confidence band" legendType="none" />
                <Line type="monotone" dataKey="actual" stroke="#131A2C" strokeWidth={2} dot={false} name="Historical postings" />
                <Line type="monotone" dataKey="forecast" stroke="#3538CD" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 2 }} name="Forecast" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <p className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-ink-900">
              <Building2 size={17} className="text-signal-600" /> Top hiring companies for this role
            </p>
            <div className="divide-y divide-ink-100">
              {data.top_hiring_companies.map((c) => (
                <div key={c.company} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-ink-800">{c.company}</span>
                  <div className="flex items-center gap-4 text-sm text-ink-500">
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
