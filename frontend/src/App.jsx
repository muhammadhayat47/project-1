import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ui/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import HiringTrends from "./pages/HiringTrends";
import SalaryMap from "./pages/SalaryMap";
import Copilot from "./pages/Copilot";
import SkillGap from "./pages/SkillGap";
import RiskAssessment from "./pages/RiskAssessment";
import AutoApply from "./pages/AutoApply";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="hiring-trends" element={<HiringTrends />} />
        <Route path="salary-map" element={<SalaryMap />} />
        <Route path="copilot" element={<Copilot />} />
        <Route path="skill-gap" element={<SkillGap />} />
        <Route path="risk" element={<RiskAssessment />} />
        <Route path="auto-apply" element={<AutoApply />} />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
