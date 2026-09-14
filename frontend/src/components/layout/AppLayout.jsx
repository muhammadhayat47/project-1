import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const TITLES = {
  "/app": "Dashboard",
  "/app/hiring-trends": "Predictive Hiring Analytics",
  "/app/salary-map": "Global Salary Map",
  "/app/copilot": "AI Career Copilot",
  "/app/skill-gap": "Skill Gap Analyzer",
  "/app/risk": "AI Job Risk Assessment",
  "/app/auto-apply": "Autonomous Job Application Agent",
  "/app/settings": "Settings",
};

export default function AppLayout() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const title = TITLES[location.pathname] || "CareerOS";

  useDocumentTitle(title);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "linear-gradient(135deg, #4A48E0 0%, #262A44 50%, #0E6F65 100%)" }}>
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="scroll-thin flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
          <div key={location.pathname} className="mx-auto max-w-6xl animate-rise">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
