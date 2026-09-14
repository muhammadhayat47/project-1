import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Globe2,
  Compass,
  FileSearch,
  ShieldAlert,
  SendHorizonal,
  Settings as SettingsIcon,
  Sparkles,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/hiring-trends", label: "Hiring Trends", icon: TrendingUp },
  { to: "/app/salary-map", label: "Salary Map", icon: Globe2 },
  { to: "/app/copilot", label: "Career Copilot", icon: Compass },
  { to: "/app/skill-gap", label: "Skill Gap", icon: FileSearch },
  { to: "/app/risk", label: "Risk Assessment", icon: ShieldAlert },
  { to: "/app/auto-apply", label: "Auto-Apply", icon: SendHorizonal },
];

function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-600">
          <Sparkles size={16} className="text-white" />
        </span>
        <span className="font-display text-lg font-semibold text-white">CareerOS</span>
      </div>

      <nav className="scroll-thin flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-signal-600 text-white"
                  : "text-ink-300 hover:bg-ink-800 hover:text-white"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-800 p-3">
        <NavLink
          to="/app/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? "bg-signal-600 text-white" : "text-ink-300 hover:bg-ink-800 hover:text-white"
            }`
          }
        >
          <SettingsIcon size={17} />
          Settings
        </NavLink>
      </div>
    </>
  );
}

export default function Sidebar({ mobileOpen = false, onClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-100 bg-ink-900 text-ink-100 md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative flex h-full w-72 max-w-[80vw] flex-col bg-ink-900 text-ink-100 shadow-raised animate-rise">
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="absolute right-3 top-5 text-ink-300 hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
