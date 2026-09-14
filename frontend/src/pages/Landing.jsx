import { Link } from "react-router-dom";
import {
  TrendingUp, Globe2, Compass, FileSearch, ShieldAlert, SendHorizonal, Sparkles, ArrowRight, CheckCircle2,
} from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";

const MODULES = [
  {
    icon: TrendingUp,
    title: "Predictive Hiring Analytics",
    desc: "Forecast which roles and companies will be hiring next quarter, using trend + seasonality modeling over historical postings.",
    to: "/app/hiring-trends",
  },
  {
    icon: Globe2,
    title: "Global Salary Mapping",
    desc: "See median pay, remote share, and demand for any role across 15 countries on an interactive map.",
    to: "/app/salary-map",
  },
  {
    icon: Compass,
    title: "AI Career Copilot",
    desc: "Get a personalized 90-day roadmap from where you are to the role you want — real tasks, real milestones.",
    to: "/app/copilot",
  },
  {
    icon: FileSearch,
    title: "Skill Gap Analyzer",
    desc: "Upload your resume and a job description to see exactly what matches, what's missing, and what to learn next.",
    to: "/app/skill-gap",
  },
  {
    icon: ShieldAlert,
    title: "AI Job Risk Assessment",
    desc: "A machine-learning read on how automation-exposed a role is, with concrete moves to stay ahead of it.",
    to: "/app/risk",
  },
  {
    icon: SendHorizonal,
    title: "Autonomous Job Application Agent",
    desc: "Match against real openings, auto-draft tailored cover letters, and manage your applications from one queue.",
    to: "/app/auto-apply",
  },
];

function MiniForecastChart() {
  // Purely decorative inline chart echoing the Hiring Trends module.
  const points = [22, 28, 24, 34, 30, 40, 38, 48, 44, 55];
  const max = Math.max(...points);
  const w = 320, h = 140, pad = 8;
  const stepX = (w - pad * 2) / (points.length - 1);
  const coords = points.map((p, i) => [pad + i * stepX, h - pad - (p / max) * (h - pad * 2)]);
  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1][0]} ${h} L ${coords[0][0]} ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Rising hiring forecast trend line">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3538CD" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3538CD" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#fade)" />
      <path d={linePath} fill="none" stroke="#3538CD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === coords.length - 1 ? 4 : 0} fill="#3538CD" />
      ))}
    </svg>
  );
}

export default function Landing() {
  useDocumentTitle(null);
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-600">
            <Sparkles size={16} className="text-white" />
          </span>
          <span className="font-display text-lg font-semibold text-ink-900">CareerOS</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100">
            Log in
          </Link>
          <Link to="/register" className="rounded-lg bg-signal-600 px-4 py-2 text-sm font-medium text-white hover:bg-signal-700">
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-50 px-3 py-1 text-xs font-medium text-signal-700">
            AI career intelligence, in one place
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-ink-900 md:text-5xl">
            Know where the jobs are going —{" "}
            <span className="text-signal-600">before you apply.</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-ink-500">
            CareerOS reads hiring trends, maps global pay, closes your skill gaps, and
            queues up tailored applications — six tools that turn a job search into a plan.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-signal-600 px-5 py-3 text-sm font-medium text-white shadow-raised hover:bg-signal-700"
            >
              Start free <ArrowRight size={16} />
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-5 py-3 text-sm font-medium text-ink-700 hover:border-ink-300"
            >
              Explore without an account
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-400">
            {["No credit card", "Works with zero setup", "Your own OpenAI key upgrades the AI"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-forecast-500" /> {t}
              </span>
            ))}
          </div>
        </div>

        <div className="animate-rise rounded-xl2 border border-ink-100 bg-white p-6 shadow-raised">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-ink-400">Hiring forecast</p>
              <p className="font-display text-lg font-semibold text-ink-900">Machine Learning Engineer</p>
            </div>
            <span className="rounded-full bg-forecast-50 px-2.5 py-1 text-xs font-medium text-forecast-700">
              +18% next quarter
            </span>
          </div>
          <MiniForecastChart />
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-ink-100 pt-4 text-center">
            <div>
              <p className="font-display text-lg font-semibold text-ink-900">$121k</p>
              <p className="text-xs text-ink-400">Global median</p>
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-ink-900">Low</p>
              <p className="text-xs text-ink-400">Automation risk</p>
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-ink-900">74%</p>
              <p className="text-xs text-ink-400">Your match score</p>
            </div>
          </div>
        </div>
      </section>

      <section id="modules" className="border-y border-ink-100 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl font-semibold text-ink-900">Six tools. One decision.</h2>
            <p className="mt-3 text-ink-500">Every module feeds the same goal: helping you decide what to learn, where to apply, and why.</p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map(({ icon: Icon, title, desc, to }) => (
              <Link
                key={title}
                to={to}
                className="group rounded-xl2 border border-ink-100 p-6 text-left transition-all hover:-translate-y-0.5 hover:border-signal-200 hover:shadow-raised"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-signal-50 text-signal-600 transition-colors group-hover:bg-signal-600 group-hover:text-white">
                  <Icon size={19} />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-ink-900">{title}</h3>
                <p className="mt-2 text-sm text-ink-500">{desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-signal-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Try it <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="font-display text-3xl font-semibold text-ink-900">Ready to see your own numbers?</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-500">Create a free account to save your resume, roadmap, and application queue.</p>
        <Link
          to="/register"
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-signal-600 px-6 py-3 text-sm font-medium text-white shadow-raised hover:bg-signal-700"
        >
          Get started <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="border-t border-ink-100 py-8 text-center text-xs text-ink-400">
        © {year} CareerOS — a final year project. Built with FastAPI, React, and scikit-learn.
      </footer>
    </div>
  );
}
