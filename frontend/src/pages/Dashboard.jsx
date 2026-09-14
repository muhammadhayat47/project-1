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
import useDocumentTitle from "../hooks/useDocumentTitle";

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
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    api
      .get("/api/dashboard/summary")
      .then(({ data }) => setSummary(data))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink-900">
          {isAuthenticated ? `Welcome back, ${user.full_name.split(" ")[0]}` : "Welcome to CareerOS"}
        </h2>
        <p className="mt-1 text-ink-500">
          {isAuthenticated
            ? "Here's where your career plan stands today."
            : "Explore every module free — log in to save your progress across sessions."}
        </p>
      </div>

      {!isAuthenticated && (
        <Card className="flex flex-col items-start justify-between gap-4 border-signal-100 bg-signal-50/60 sm:flex-row sm:items-center">
          <div>
            <p className="font-medium text-ink-900">You're browsing in demo mode</p>
            <p className="text-sm text-ink-500">Create a free account to save your resume, roadmap, and application queue.</p>
          </div>
          <Link to="/register" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-signal-600 px-4 py-2 text-sm font-medium text-white hover:bg-signal-700">
            Create account <ArrowRight size={15} />
          </Link>
        </Card>
      )}

      {loading ? (
        <Loader label="Loading your summary…" />
      ) : loadError ? (
        <Card className="text-sm text-ink-500">Couldn't load your summary right now — the numbers below will catch up once the backend is reachable.</Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={FileText} label="Resumes uploaded" value={summary?.resumes_uploaded ?? 0} tone="signal" />
          <StatCard icon={Compass} label="Roadmaps generated" value={summary?.roadmaps_generated ?? 0} tone="forecast" />
          <StatCard icon={SendHorizonal} label="Applications queued" value={summary?.applications_in_queue ?? 0} tone="signal" />
          <StatCard icon={CheckCircle2} label="Applications sent" value={summary?.applications_applied ?? 0} tone="forecast" />
        </div>
      )}

      <div>
        <h3 className="mb-3 font-display text-base font-semibold text-ink-900">Jump back in</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to} className="group rounded-xl2 border border-ink-100 bg-white p-5 shadow-card transition-shadow hover:shadow-raised">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-50 text-signal-600 group-hover:bg-signal-600 group-hover:text-white transition-colors">
                <Icon size={17} />
              </span>
              <p className="mt-3 font-medium text-ink-900">{label}</p>
              <p className="mt-1 text-xs text-ink-400">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
