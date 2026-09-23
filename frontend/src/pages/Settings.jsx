import { useState } from "react";
import { User, Target, MapPin, Save, CheckCircle2 } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function Settings() {
  useDocumentTitle("Settings");
  const { user, updateUserLocal } = useAuth();
  const toast = useToast();
  const [targetRole, setTargetRole] = useState(user?.target_role || "");
  const [targetLocation, setTargetLocation] = useState(user?.target_location || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const { data } = await api.patch("/api/auth/me", null, {
        params: { target_role: targetRole || null, target_location: targetLocation || null },
      });
      updateUserLocal(data);
      setSaved(true);
      toast.success("Career targets saved.");
    } catch (err) {
      const msg = apiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <p className="mb-4 flex items-center gap-1.5 font-display text-base font-semibold text-white">
          <User size={18} className="text-glow-400" /> Your profile
        </p>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/10 pb-3">
            <span className="text-ink-400">Full name</span>
            <span className="font-medium text-ink-100">{user?.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-400">Email</span>
            <span className="font-medium text-ink-100">{user?.email}</span>
          </div>
        </div>
      </Card>

      <Card>
        <p className="mb-4 flex items-center gap-1.5 font-display text-base font-semibold text-white">
          <Target size={18} className="text-glow-400" /> Career targets
        </p>
        <p className="mb-4 text-sm text-ink-300">
          Pre-fills the role and location fields across Hiring Trends, Salary Map, and Auto-Apply.
        </p>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-300">Target role</label>
            <input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Machine Learning Engineer"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-ink-400 focus:border-glow-400"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-ink-300">
              <MapPin size={12} /> Target location
            </label>
            <input
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
              placeholder="e.g. Remote, or a city/country"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-ink-400 focus:border-glow-400"
            />
          </div>

          {error && <p className="text-sm text-red-300" role="alert">{error}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" loading={saving}>
              <Save size={15} /> Save changes
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-glow-300">
                <CheckCircle2 size={15} /> Saved
              </span>
            )}
          </div>
        </form>
      </Card>

      <Card className="border-white/10 bg-white/5 text-sm text-ink-300">
        <strong className="text-white">Want richer AI output?</strong> Add your own OpenAI API key to{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-glow-300">backend/.env</code> to switch the Career Copilot
        and Auto-Apply cover letters from smart templates to live GPT-4o generation. No key needed to use
        every feature — it just upgrades the writing quality.
      </Card>
    </div>
  );
}
