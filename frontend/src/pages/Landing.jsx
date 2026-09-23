import { Link } from "react-router-dom";
import {
  TrendingUp, Globe2, Compass, FileSearch, ShieldAlert, SendHorizonal, ArrowRight, CheckCircle2,
} from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import Logo from "../components/ui/Logo";

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
    desc: "See median pay, remote share, and demand for any role across dozens of countries on an interactive map.",
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
          <stop offset="0%" stopColor="#00C97F" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00C97F" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#fade)" />
      <path d={linePath} fill="none" stroke="#1FE39C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === coords.length - 1 ? 4 : 0} fill="#1FE39C" />
      ))}
    </svg>
  );
}

export default function Landing() {
  useDocumentTitle(null);
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen overflow-hidden bg-ink-950 text-white">
      <div className="pointer-events-none fixed -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-glow-500/20 blur-[120px]" />
      <div className="pointer-events-none fixed top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-signal-500/20 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-glow-400/10 blur-[100px]" />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Logo size={38} />
          <span className="font-display text-xl font-semibold text-white">CareerOS</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-ink-200 hover:bg-white/10">
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-gradient-to-r from-glow-500 to-glow-600 px-4 py-2 text-sm font-medium text-ink-950 shadow-glow transition-transform hover:scale-[1.03]"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-glow-400/30 bg-glow-400/10 px-3 py-1 text-xs font-medium text-glow-300">
            AI career intelligence, in one place
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-white md:text-5xl">
            Know where the jobs are going —{" "}
            <span className="bg-gradient-to-r from-glow-300 via-glow-400 to-signal-300 bg-clip-text text-transparent">
              before you apply.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base text-ink-300">
            CareerOS reads hiring trends, maps global pay, closes your skill gaps, and
            queues up tailored applications — six tools that turn a job search into a plan.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-glow-500 to-glow-600 px-5 py-3 text-sm font-semibold text-ink-950 shadow-glow-lg transition-transform hover:scale-[1.03]"
            >
              Start free <ArrowRight size={16} />
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/10"
            >
              Explore without an account
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-400">
            {["No credit card", "Works with zero setup", "Your own OpenAI key upgrades the AI"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-glow-400" /> {t}
              </span>
            ))}
          </div>
        </div>

        <div className="animate-rise rounded-xl2 border border-white/10 bg-ink-900/60 p-6 shadow-glow backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-ink-400">Hiring forecast</p>
              <p className="font-display text-lg font-semibold text-white">Machine Learning Engineer</p>
            </div>
            <span className="rounded-full border border-glow-400/30 bg-glow-400/10 px-2.5 py-1 text-xs font-medium text-glow-300">
              +18% next quarter
            </span>
          </div>
          <MiniForecastChart />
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-center">
            <div>
              <p className="font-display text-lg font-semibold text-white">$121k</p>
              <p className="text-xs text-ink-400">Global median</p>
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-glow-300">Low</p>
              <p className="text-xs text-ink-400">Automation risk</p>
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-white">74%</p>
              <p className="text-xs text-ink-400">Your match score</p>
            </div>
          </div>
        </div>
      </section>

      <section id="modules" className="relative border-y border-white/10 bg-ink-900/40 py-20 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl font-semibold text-white">Six tools. One decision.</h2>
            <p className="mt-3 text-ink-300">Every module feeds the same goal: helping you decide what to learn, where to apply, and why.</p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map(({ icon: Icon, title, desc, to }, i) => (
              <Link
                key={title}
                to={to}
                className="group relative overflow-hidden rounded-xl2 border border-white/10 bg-gradient-to-br from-ink-800/80 to-ink-900/80 p-6 text-left transition-all hover:-translate-y-1 hover:border-glow-400/40 hover:shadow-glow"
              >
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
                  style={{ background: i % 2 === 0 ? "#00C97F" : "#4A48E0" }}
                />
                <span className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-glow-300 transition-colors group-hover:bg-glow-500 group-hover:text-ink-950">
                  <Icon size={19} />
                </span>
                <h3 className="relative mt-4 font-display text-base font-semibold text-white">{title}</h3>
                <p className="relative mt-2 text-sm text-ink-300">{desc}</p>
                <span className="relative mt-3 inline-flex items-center gap-1 text-xs font-medium text-glow-300 opacity-0 transition-opacity group-hover:opacity-100">
                  Try it <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="font-display text-3xl font-semibold text-white">Ready to see your own numbers?</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-300">Create a free account to save your resume, roadmap, and application queue.</p>
        <Link
          to="/register"
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-glow-500 to-glow-600 px-6 py-3 text-sm font-semibold text-ink-950 shadow-glow-lg transition-transform hover:scale-[1.03]"
        >
          Get started <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="relative border-t border-white/10 py-8 text-center text-xs text-ink-500">
        © {year} CareerOS — a final year project. Built with FastAPI, React, and scikit-learn.
      </footer>
    </div>
  );
}
