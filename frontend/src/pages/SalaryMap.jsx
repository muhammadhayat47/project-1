import { useEffect, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Globe2, ArrowUpDown, Info, TrendingUp, Wifi, DollarSign, X, MousePointerClick } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import useDocumentTitle from "../hooks/useDocumentTitle";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const MAP_SCALE = 148;
// react-simple-maps' default projection (geoEqualEarth) centered on [0, 0]
// with the given scale — this mirrors its internal math closely enough to
// place an HTML label over the right spot on the rendered SVG.
function project(lon, lat, width, height) {
  const λ = (lon * Math.PI) / 180;
  const φ = (lat * Math.PI) / 180;
  // Equirectangular approximation (good enough for label placement at this scale)
  const x = width / 2 + (λ * MAP_SCALE * width) / 800;
  const y = height / 2 - (φ * MAP_SCALE * width) / 800;
  return [x, y];
}

function formatUsd(n) {
  return `$${Math.round(n).toLocaleString()}`;
}

export default function SalaryMap() {
  useDocumentTitle("Salary Map");
  const toast = useToast();
  const [role, setRole] = useState("Data Scientist");
  const [inputRole, setInputRole] = useState("Data Scientist");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState("median_salary_usd");
  const [selected, setSelected] = useState(null); // clicked country — stays open until closed
  const [mapSize, setMapSize] = useState({ width: 800, height: 450 });
  const mapContainerElRef = useRef(null);

  async function fetchMap(r) {
    setLoading(true);
    setError("");
    setSelected(null);
    try {
      const { data } = await api.get("/api/salary/map", { params: { role: r } });
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
    fetchMap(role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const maxSalary = data ? Math.max(...data.points.map((p) => p.median_salary_usd)) : 1;
  const sortedPoints = data ? [...data.points].sort((a, b) => b[sortKey] - a[sortKey]) : [];

  function handleDotClick(point) {
    setSelected((prev) => (prev?.country_code === point.country_code ? null : point));
  }

  useEffect(() => {
    const node = mapContainerElRef.current;
    if (!node) return;

    const resize = () => {
      const width = node.offsetWidth;
      if (width > 0) {
        setMapSize((prev) => {
          const height = width * (450 / 800);
          if (Math.abs(prev.width - width) < 1) return prev; // no real change — skip update
          return { width, height };
        });
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    return () => observer.disconnect();
  }, [data]); // re-measure once the map card actually renders with data

  const selectedPos = selected ? project(selected.lon, selected.lat, mapSize.width, mapSize.height) : null;
  // Keep the card on-screen even when the country is near the map edge.
  const labelLeft = selectedPos
    ? Math.min(Math.max(selectedPos[0] - 100, 8), mapSize.width - 208)
    : 0;
  const labelBelow = selectedPos ? selectedPos[1] < 130 : false;

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!inputRole.trim()) return;
            setRole(inputRole.trim());
          }}
          className="flex flex-wrap items-end gap-4"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-xs font-medium text-ink-300">Job role</label>
            <input
              value={inputRole}
              onChange={(e) => setInputRole(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-ink-400 focus:border-glow-400"
              placeholder="e.g. Data Scientist"
            />
          </div>
          <Button type="submit" loading={loading}>See salary map</Button>
        </form>
      </Card>

      {loading && !data ? (
        <Loader label="Mapping global salaries…" />
      ) : error && !data ? (
        <Card className="text-sm text-red-300">{error}</Card>
      ) : data ? (
        <>
          {/* Explanation banner — what this page shows, in plain language */}
          <Card className="flex items-start gap-3 border-glow-400/20 bg-glow-500/5">
            <Info size={18} className="mt-0.5 shrink-0 text-glow-300" />
            <p className="text-sm text-ink-200">
              This shows how much a <strong className="text-white">{data.role}</strong> typically earns in each
              country, how many of those jobs are remote, and how much demand there is for the role there.
              Bigger dots on the map = higher pay. Click any column heading below to sort the table by it.
            </p>
          </Card>

          {/* Top-line summary numbers */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-glow-500/15 text-glow-300">
                <DollarSign size={18} />
              </span>
              <div>
                <p className="text-xs text-ink-400">Global median salary</p>
                <p className="font-display text-lg font-semibold text-white">{formatUsd(data.global_median_usd)}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal-500/15 text-signal-300">
                <Globe2 size={18} />
              </span>
              <div>
                <p className="text-xs text-ink-400">Countries compared</p>
                <p className="font-display text-lg font-semibold text-white">{data.points.length}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-glow-500/15 text-glow-300">
                <TrendingUp size={18} />
              </span>
              <div>
                <p className="text-xs text-ink-400">Highest-paying country</p>
                <p className="font-display text-lg font-semibold text-white">
                  {sortedPoints.length ? [...data.points].sort((a, b) => b.median_salary_usd - a.median_salary_usd)[0].country : "—"}
                </p>
              </div>
            </Card>
          </div>

          {/* Map */}
          <Card padded={false} className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-xs font-medium text-ink-400">{data.role}</p>
                <p className="font-display text-lg font-semibold text-white">Where the pay is highest</p>
              </div>
              <Globe2 className="text-glow-400" size={20} />
            </div>
            <div className="relative bg-ink-950/40" ref={mapContainerRef}>
              <ComposableMap projectionConfig={{ scale: MAP_SCALE }} style={{ width: "100%", height: "auto" }}>
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography key={geo.rsmKey} geography={geo} fill="#2A2E4A" stroke="#0A0D1C" strokeWidth={0.5} />
                    ))
                  }
                </Geographies>
                {data.points.map((p) => {
                  const radius = 4 + (p.median_salary_usd / maxSalary) * 14;
                  const isSelected = selected?.country_code === p.country_code;
                  return (
                    <Marker key={p.country_code} coordinates={[p.lon, p.lat]}>
                      <circle
                        r={radius}
                        fill={isSelected ? "#4A48E0" : "#1FE39C"}
                        fillOpacity={0.85}
                        stroke={isSelected ? "#C7CCFF" : "#0A0D1C"}
                        strokeWidth={isSelected ? 2.5 : 1}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDotClick(p)}
                      />
                    </Marker>
                  );
                })}
              </ComposableMap>

              {/* Detail card — positioned directly over the clicked dot on the map */}
              {selected && selectedPos ? (
                <div
                  className="absolute w-52 rounded-lg border border-glow-400/50 bg-ink-900/95 p-3 text-xs shadow-glow-lg backdrop-blur transition-all"
                  style={{
                    left: labelLeft,
                    top: labelBelow ? selectedPos[1] + 16 : undefined,
                    bottom: labelBelow ? undefined : mapSize.height - selectedPos[1] + 16,
                  }}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="font-display text-sm font-semibold text-white">{selected.country}</p>
                    <button
                      onClick={() => setSelected(null)}
                      aria-label="Close details"
                      className="shrink-0 text-ink-400 hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between rounded bg-white/5 px-2 py-1.5">
                      <span className="flex items-center gap-1 text-ink-300">
                        <DollarSign size={11} className="text-glow-300" /> Salary
                      </span>
                      <span className="font-semibold text-white">{formatUsd(selected.median_salary_usd)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded bg-white/5 px-2 py-1.5">
                      <span className="flex items-center gap-1 text-ink-300">
                        <Wifi size={11} className="text-signal-300" /> Remote
                      </span>
                      <span className="font-semibold text-white">{selected.remote_share_pct}%</span>
                    </div>
                    <div className="flex items-center justify-between rounded bg-white/5 px-2 py-1.5">
                      <span className="flex items-center gap-1 text-ink-300">
                        <TrendingUp size={11} className="text-glow-300" /> Demand
                      </span>
                      <span className="font-semibold text-white">{selected.demand_index} / 1.0</span>
                    </div>
                  </div>
                  {/* small pointer triangle toward the dot */}
                  <div
                    className="absolute h-2.5 w-2.5 rotate-45 border border-glow-400/50 bg-ink-900"
                    style={{
                      left: Math.min(Math.max(selectedPos[0] - labelLeft - 5, 10), 190),
                      top: labelBelow ? -5 : undefined,
                      bottom: labelBelow ? undefined : -5,
                      borderTop: labelBelow ? "inherit" : "none",
                      borderLeft: labelBelow ? "inherit" : "none",
                      borderBottom: labelBelow ? "none" : "inherit",
                      borderRight: labelBelow ? "none" : "inherit",
                    }}
                  />
                </div>
              ) : (
                <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-1.5 rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 text-xs text-ink-300 backdrop-blur">
                  <MousePointerClick size={13} className="text-glow-300" />
                  Click any dot to see its numbers
                </div>
              )}
            </div>
          </Card>

          {/* Table with clear column explanations */}
          <Card padded={false}>
            <div className="border-b border-white/10 p-5">
              <p className="font-display text-base font-semibold text-white">Country-by-country breakdown</p>
              <p className="mt-1 text-xs text-ink-400">
                Median salary = the middle value (half earn more, half earn less) · Remote share = % of jobs
                that allow remote work · Demand index = how strong hiring demand is, from 0 (low) to 1 (high)
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs text-ink-400">
                    <th className="px-5 py-3 font-medium">Country</th>
                    {[
                      ["median_salary_usd", "Median salary"],
                      ["remote_share_pct", "Remote share"],
                      ["demand_index", "Demand index"],
                    ].map(([key, label]) => (
                      <th key={key} className="px-5 py-3 font-medium">
                        <button
                          className={`flex items-center gap-1 hover:text-white ${sortKey === key ? "text-glow-300" : ""}`}
                          onClick={() => setSortKey(key)}
                        >
                          {label} <ArrowUpDown size={12} />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {sortedPoints.map((p, i) => (
                    <tr
                      key={p.country_code}
                      onClick={() => handleDotClick(p)}
                      className={`cursor-pointer transition-colors hover:bg-white/5 ${
                        selected?.country_code === p.country_code ? "bg-glow-500/10" : i < 3 ? "bg-glow-500/5" : ""
                      }`}
                    >
                      <td className="px-5 py-3 font-medium text-white">
                        <span className={`mr-1.5 ${i < 3 ? "text-glow-300" : "text-ink-400"}`}>#{i + 1}</span>
                        {p.country}
                      </td>
                      <td className="px-5 py-3 text-ink-200">{formatUsd(p.median_salary_usd)}</td>
                      <td className="px-5 py-3 text-ink-200">{p.remote_share_pct}%</td>
                      <td className="px-5 py-3 text-ink-200">{p.demand_index}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
