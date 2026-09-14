import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Globe2, ArrowUpDown } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import useDocumentTitle from "../hooks/useDocumentTitle";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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
  const [hovered, setHovered] = useState(null);

  async function fetchMap(r) {
    setLoading(true);
    setError("");
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

  return (
    <div className="space-y-6">
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
            <label className="mb-1.5 block text-xs font-medium text-ink-500">Role</label>
            <input
              value={inputRole}
              onChange={(e) => setInputRole(e.target.value)}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-signal-400"
              placeholder="e.g. Data Scientist"
            />
          </div>
          <Button type="submit" loading={loading}>See salary map</Button>
        </form>
      </Card>

      {loading && !data ? (
        <Loader label="Mapping global salaries…" />
      ) : error && !data ? (
        <Card className="text-sm text-risk-high">{error}</Card>
      ) : data ? (
        <>
          <Card padded={false} className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-100 p-5">
              <div>
                <p className="text-xs font-medium text-ink-400">{data.role}</p>
                <p className="font-display text-lg font-semibold text-ink-900">Global median: {formatUsd(data.global_median_usd)}</p>
              </div>
              <Globe2 className="text-signal-600" size={20} />
            </div>
            <div className="relative bg-ink-50">
              <ComposableMap projectionConfig={{ scale: 148 }} style={{ width: "100%", height: "auto" }}>
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography key={geo.rsmKey} geography={geo} fill="#E4E7EE" stroke="#F7F8FB" strokeWidth={0.5} />
                    ))
                  }
                </Geographies>
                {data.points.map((p) => {
                  const radius = 4 + (p.median_salary_usd / maxSalary) * 14;
                  return (
                    <Marker key={p.country_code} coordinates={[p.lon, p.lat]}
                      onMouseEnter={() => setHovered(p)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <circle r={radius} fill="#3538CD" fillOpacity={0.75} stroke="#fff" strokeWidth={1} />
                    </Marker>
                  );
                })}
              </ComposableMap>
              {hovered && (
                <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-ink-100 bg-white px-3 py-2 text-xs shadow-raised">
                  <p className="font-semibold text-ink-900">{hovered.country}</p>
                  <p className="text-ink-500">Median: {formatUsd(hovered.median_salary_usd)}</p>
                  <p className="text-ink-500">Remote share: {hovered.remote_share_pct}%</p>
                </div>
              )}
            </div>
          </Card>

          <Card padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-xs text-ink-400">
                    <th className="px-5 py-3 font-medium">Country</th>
                    {[
                      ["median_salary_usd", "Median salary"],
                      ["remote_share_pct", "Remote share"],
                      ["demand_index", "Demand index"],
                    ].map(([key, label]) => (
                      <th key={key} className="px-5 py-3 font-medium">
                        <button
                          className={`flex items-center gap-1 hover:text-ink-700 ${sortKey === key ? "text-signal-600" : ""}`}
                          onClick={() => setSortKey(key)}
                        >
                          {label} <ArrowUpDown size={12} />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {sortedPoints.map((p) => (
                    <tr key={p.country_code}>
                      <td className="px-5 py-3 font-medium text-ink-800">{p.country}</td>
                      <td className="px-5 py-3 text-ink-600">{formatUsd(p.median_salary_usd)}</td>
                      <td className="px-5 py-3 text-ink-600">{p.remote_share_pct}%</td>
                      <td className="px-5 py-3 text-ink-600">{p.demand_index}</td>
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
