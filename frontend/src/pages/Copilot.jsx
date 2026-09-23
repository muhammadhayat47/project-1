import { useState } from "react";
import { Compass, Sparkles, CheckCircle2, Flag, Download } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useResume } from "../context/ResumeContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { downloadRoadmapText } from "../utils/exportRoadmap";

export default function Copilot() {
  useDocumentTitle("Career Copilot");
  const toast = useToast();
  const { skills } = useResume();
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("Data Scientist");
  const [knownSkillsText, setKnownSkillsText] = useState(skills.join(", "));
  const [weeklyHours, setWeeklyHours] = useState(8);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!targetRole.trim()) return;
    setLoading(true);
    setError("");
    try {
      const known_skills = knownSkillsText.split(",").map((s) => s.trim()).filter(Boolean);
      const { data } = await api.post("/api/copilot/roadmap", {
        current_role: currentRole || null,
        target_role: targetRole,
        known_skills,
        weekly_hours: weeklyHours,
      });
      setRoadmap(data);
      toast.success("Your roadmap is ready.");
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-300">Current role (optional)</label>
              <input
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder="e.g. Computer Science student"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-ink-400 focus:border-glow-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-300">Target role</label>
              <input
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-glow-400"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-300">Skills you already have (comma-separated)</label>
            <input
              value={knownSkillsText}
              onChange={(e) => setKnownSkillsText(e.target.value)}
              placeholder="python, sql, communication"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-ink-400 focus:border-glow-400"
            />
            {skills.length > 0 && (
              <p className="mt-1.5 text-xs text-ink-400">Pre-filled from your uploaded resume — edit as needed.</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-300">Weekly study time: {weeklyHours}h</label>
            <input
              type="range" min={2} max={30} value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full max-w-xs accent-glow-500"
            />
          </div>
          <Button type="submit" loading={loading}>
            <Compass size={16} /> Generate my roadmap
          </Button>
        </form>
      </Card>

      {error && !roadmap && <Card className="text-sm text-red-300">{error}</Card>}

      {roadmap && (
        <div className="space-y-6">
          <Card className="border-glow-400/20 bg-glow-500/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-glow-300">
                  <Sparkles size={13} /> Your path to {roadmap.target_role}
                </p>
                <p className="mt-2 text-sm text-ink-200">{roadmap.summary}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <Badge tone={roadmap.source === "openai" ? "forecast" : "neutral"}>
                  {roadmap.source === "openai" ? "GPT-4o" : "Smart template"}
                </Badge>
                <button
                  onClick={() => {
                    downloadRoadmapText(roadmap);
                    toast.success("Roadmap downloaded.");
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-glow-300 hover:underline"
                >
                  <Download size={13} /> Download as text
                </button>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {roadmap.weeks.map((week, i) => (
              <Card key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-glow-400 to-signal-600 text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  {i < roadmap.weeks.length - 1 && <span className="mt-1 w-px flex-1 bg-white/10" />}
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-xs font-medium text-glow-300">{week.week_range}</p>
                  <p className="font-display text-base font-semibold text-white">{week.focus}</p>
                  <ul className="mt-3 space-y-1.5">
                    {week.tasks.map((t, ti) => (
                      <li key={ti} className="flex items-start gap-2 text-sm text-ink-300">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-glow-400" /> {t}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-ink-300">
                    <Flag size={13} className="text-glow-400" /> {week.milestone}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
