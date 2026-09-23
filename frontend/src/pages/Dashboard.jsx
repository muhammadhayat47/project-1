import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText, Compass, SendHorizonal, CheckCircle2, ArrowRight, TrendingUp, Globe2, ShieldAlert,
} from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import LastUpdated from "../components/ui/LastUpdated";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useInterval from "../hooks/useInterval";

const REFRESH_MS = 30000; // keep the dashboard numbers live without a manual reload

const QUICK_LINKS = [
  { to: "/app/hiring-trends", icon: TrendingUp, label: "Hiring Trends", desc: "See where demand is heading" },
  { to: "/app/salary-map", icon: Globe2, label: "Salary Map", desc: "Compare pay across countries" },
  { to: "/app/copilot", icon: Compass, label: "Career Copilot", desc: "Get your 90-day roadmap" },
  { to: "/app/risk", icon: ShieldAlert, label: "Risk Assessment", desc: "Check a role's automation risk" },
];

export default function Dashboard() {
  useDocumentTitle("Dashboard");
  const { user, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  function fetchSummary({ background = false } = {}) {
    if (background) setRefreshing(true);
    api
      .get("/api/dashboard/summary")
      .then(({ data }) => {
        setSummary(data);
        setLoadError(false);
        setUpdatedAt(Date.now());
      })
      .catch(() => setLoadError(true))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the dashboard current on its own — no button press needed.
  useInterval(() => fetchSummary({ background: true }), REFRESH_MS);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-semibold text-white">
            {isAuthenticated ? `Welcome back, ${user.full_name.split(" ")[0]}` : "Welcome to CareerOS"}
          </h2>
          <p className="mt-1 text-ink-300">
            {isAuthenticated
              ? "Here's where your career plan stands today."
              : "Explore every module free — log in to save your progress across sessions."}
          </p>
        </div>
        <LastUpdated timestamp={updatedAt} refreshing={refreshing} className="mt-1.5" />
      </div>

      {!isAuthenticated && (
        <Card className="flex flex-col items-start justify-between gap-4 border-glow-400/20 bg-glow-500/5 sm:flex-row sm:items-center">
          <div>
            <p className="font-medium text-white">You're browsing in demo mode</p>
            <p className="text-sm text-ink-300">Create a free account to save your resume, roadmap, and application queue.</p>
          </div>
          <Link to="/register" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-glow-500 to-glow-600 px-4 py-2 text-sm font-semibold text-ink-950 shadow-glow hover:brightness-110">
            Create account <ArrowRight size={15} />
          </Link>
        </Card>
      )}

      {loading ? (
        <Loader label="Loading your summary…" />
      ) : loadError ? (
        <Card className="text-sm text-ink-300">Couldn't load your summary right now — the numbers below will catch up once the backend is reachable.</Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={FileText} label="Resumes uploaded" value={summary?.resumes_uploaded ?? 0} tone="signal" />
          <StatCard icon={Compass} label="Roadmaps generated" value={summary?.roadmaps_generated ?? 0} tone="forecast" />
          <StatCard icon={SendHorizonal} label="Applications queued" value={summary?.applications_in_queue ?? 0} tone="signal" />
          <StatCard icon={CheckCircle2} label="Applications sent" value={summary?.applications_applied ?? 0} tone="forecast" />
        </div>
      )}

      <div>
        <h3 className="mb-3 font-display text-base font-semibold text-white">Jump back in</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map(({ to, icon: Icon, label, desc }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-xl2 border border-white/10 bg-ink-900/60 p-5 shadow-glow backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-glow-400/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-glow-300 transition-colors group-hover:bg-glow-500 group-hover:text-ink-950">
                <Icon size={17} />
              </span>
              <p className="mt-3 font-medium text-white">{label}</p>
              <p className="mt-1 text-xs text-ink-400">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
