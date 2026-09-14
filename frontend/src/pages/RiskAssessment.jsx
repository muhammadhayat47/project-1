import { useState } from "react";
import { ShieldAlert, Zap, Lightbulb } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import GaugeChart from "../components/ui/GaugeChart";
import useDocumentTitle from "../hooks/useDocumentTitle";

const BAR_COLORS = { Low: "#1E8E5A", Medium: "#C98A1B", High: "#C0392B" };

export default function RiskAssessment() {
  useDocumentTitle("Risk Assessment");
  const toast = useToast();
  const [jobTitle, setJobTitle] = useState("Data Entry Clerk");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!jobTitle.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/risk/assess", { job_title: jobTitle, job_description: description || null });
      setResult(data);
    } catch (err) {
      const msg = apiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-500">Job title</label>
            <input
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-signal-400"
              placeholder="e.g. Financial Analyst"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-500">Job description (optional, improves accuracy)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-ink-200 p-3 text-sm outline-none focus:border-signal-400"
              placeholder="Paste a description of day-to-day responsibilities…"
            />
          </div>
          <Button type="submit" loading={loading}>
            <ShieldAlert size={16} /> Assess risk
          </Button>
        </form>
      </Card>

      {error && !result && <Card className="text-sm text-risk-high">{error}</Card>}

      {result && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="flex flex-col items-center justify-center">
            <p className="mb-2 text-xs font-medium text-ink-400">{result.job_title}</p>
            <GaugeChart value={result.risk_score_pct} level={result.risk_level} />
            <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center">
              {Object.entries(result.probability_breakdown).map(([level, pct]) => (
                <div key={level} className="rounded-lg bg-ink-50 py-2">
                  <p className="text-xs text-ink-400">{level}</p>
                  <p className="font-display text-sm font-semibold" style={{ color: BAR_COLORS[level] }}>{pct}%</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-ink-700">
                <Zap size={16} className="text-signal-600" /> What's driving this score
              </p>
              <ul className="space-y-2">
                {result.drivers.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-400" /> {d}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-ink-700">
                <Lightbulb size={16} className="text-forecast-500" /> How to stay ahead of it
              </p>
              <ul className="space-y-2">
                {result.resilience_tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forecast-400" /> {t}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
