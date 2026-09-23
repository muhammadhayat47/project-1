import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  SendHorizonal, MapPin, Building2, DollarSign, Clock, Sparkles, ListChecks, ExternalLink, X, Download, LogIn,
} from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Loader from "../components/ui/Loader";
import FileDropzone from "../components/ui/FileDropzone";
import { useResume } from "../context/ResumeContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useInterval from "../hooks/useInterval";
import LastUpdated from "../components/ui/LastUpdated";
import { downloadCoverLetterText } from "../utils/exportRoadmap";

const QUEUE_REFRESH_MS = 30000; // keep the application queue current on its own

const TONES = ["professional", "enthusiastic", "concise"];

function matchTone(score) {
  if (score >= 60) return "forecast";
  if (score >= 35) return "signal";
  return "neutral";
}

export default function AutoApply() {
  useDocumentTitle("Auto-Apply");
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const { resumeText, resumeFileName, setResume } = useResume();
  const [targetRole, setTargetRole] = useState("Data Scientist");
  const [targetLocation, setTargetLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [activeDraft, setActiveDraft] = useState(null); // job being drafted
  const [tone, setTone] = useState("professional");
  const [draftResult, setDraftResult] = useState(null);
  const [drafting, setDrafting] = useState(false);

  const [queue, setQueue] = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueRefreshing, setQueueRefreshing] = useState(false);
  const [queueUpdatedAt, setQueueUpdatedAt] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  async function loadQueue({ background = false } = {}) {
    if (!isAuthenticated) {
      setQueue([]);
      setQueueLoading(false);
      return;
    }
    if (background) setQueueRefreshing(true);
    else setQueueLoading(true);
    try {
      const { data } = await api.get("/api/autoapply/queue");
      setQueue(data.queue);
      setQueueUpdatedAt(Date.now());
    } catch {
      // Backend unreachable — queue simply stays empty.
    } finally {
      setQueueLoading(false);
      setQueueRefreshing(false);
    }
  }

  useEffect(() => {
    loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Keep the queue current on its own while the user is signed in.
  useInterval(() => loadQueue({ background: true }), isAuthenticated ? QUEUE_REFRESH_MS : null);

  async function handleFile(file) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/api/skillgap/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResume(data.resume_text, file.name, data.extracted_skills);
      toast.success("Resume loaded — matches will use it to score jobs.");
    } catch (err) {
      const msg = apiErrorMessage(err, "Couldn't read that file.");
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  async function handleMatch(e) {
    e.preventDefault();
    if (!targetRole.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/autoapply/match", {
        resume_text: resumeText || "General candidate with a broad, adaptable skill set.",
        target_role: targetRole,
        target_location: targetLocation || null,
        remote_only: remoteOnly,
        max_results: 10,
      });
      setJobs(data.jobs);
      if (data.jobs.length === 0) {
        toast.info("No matches found for that role/location — try broadening your search.");
      }
    } catch (err) {
      const msg = apiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function openDraft(job, chosenTone = tone) {
    setActiveDraft(job);
    setDraftResult(null);
    setDrafting(true);
    try {
      const { data } = await api.post("/api/autoapply/draft", {
        job,
        resume_text: resumeText || "General candidate with a broad, adaptable skill set.",
        tone: chosenTone,
      });
      setDraftResult(data);
      loadQueue();
    } catch (err) {
      const msg = apiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setDrafting(false);
    }
  }

  function handleToneChange(t) {
    setTone(t);
    if (activeDraft) openDraft(activeDraft, t);
  }

  async function updateStatus(id, status_value) {
    setUpdatingId(id);
    try {
      await api.patch(`/api/autoapply/queue/${id}`, null, { params: { status_value } });
      await loadQueue();
      if (status_value === "applied") toast.success("Marked as applied — nice work.");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-amber-400/20 bg-amber-500/5 text-sm text-ink-200">
        <strong className="text-white">How this works:</strong> CareerOS matches you against real
        opening structures and drafts a tailored cover letter for each — it won't log into LinkedIn/Indeed
        or auto-submit on other platforms, since that breaks their terms of service. Review each draft,
        then click through to apply, and mark it "Applied" to track your pipeline here.
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium text-ink-200">Your resume (used to score and tailor matches)</p>
        {uploading ? <Loader label="Reading your resume…" /> : <FileDropzone onFile={handleFile} fileName={resumeFileName} onClear={() => setResume("", "", [])} />}
      </Card>

      <Card>
        <form onSubmit={handleMatch} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-300">Target role</label>
            <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} required
              className="w-52 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-glow-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-300">Location (optional)</label>
            <input value={targetLocation} onChange={(e) => setTargetLocation(e.target.value)}
              className="w-40 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-ink-400 focus:border-glow-400" placeholder="Any" />
          </div>
          <label className="flex items-center gap-2 pb-2.5 text-sm text-ink-200">
            <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} className="accent-glow-500" />
            Remote only
          </label>
          <Button type="submit" loading={loading}>
            <SendHorizonal size={16} /> Find matches
          </Button>
        </form>
      </Card>

      {error && jobs.length === 0 && <Card className="text-sm text-red-300">{error}</Card>}

      {jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">{job.title}</p>
                  <Badge tone={matchTone(job.match_score_pct)}>{job.match_score_pct}% match</Badge>
                  {job.remote && <Badge tone="neutral">Remote</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-300">
                  <span className="flex items-center gap-1"><Building2 size={12} /> {job.company}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                  {job.salary_usd && <span className="flex items-center gap-1"><DollarSign size={12} /> {Math.round(job.salary_usd).toLocaleString()}</span>}
                  <span className="flex items-center gap-1"><Clock size={12} /> {job.posted_days_ago === 0 ? "Today" : `${job.posted_days_ago}d ago`}</span>
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => openDraft(job)}>
                <Sparkles size={14} /> Draft application
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 font-display text-base font-semibold text-white">
            <ListChecks size={18} className="text-glow-400" /> Application queue
          </p>
          {isAuthenticated && <LastUpdated timestamp={queueUpdatedAt} refreshing={queueRefreshing} />}
        </div>
        {!isAuthenticated ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-glow-400/20 bg-glow-500/5 p-4 text-sm text-ink-200 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <LogIn size={15} className="shrink-0 text-glow-300" />
              Drafts you create here work fully in demo mode — sign in to save them to a persistent queue you can track over time.
            </span>
            <Link to="/register" className="shrink-0 rounded-lg bg-gradient-to-r from-glow-500 to-glow-600 px-3 py-1.5 text-xs font-semibold text-ink-950 hover:brightness-110">
              Create free account
            </Link>
          </div>
        ) : queueLoading ? (
          <Loader label="Loading your queue…" />
        ) : queue.length === 0 ? (
          <p className="text-sm text-ink-400">No applications drafted yet — find matches above to get started.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {queue.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{item.job_title} · {item.company}</p>
                  <p className="text-xs text-ink-400">{item.location} · {item.match_score}% match</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={item.status === "applied" ? "forecast" : item.status === "skipped" ? "neutral" : "signal"}>
                    {item.status}
                  </Badge>
                  {item.status !== "applied" && (
                    <Button size="sm" variant="secondary" loading={updatingId === item.id} onClick={() => updateStatus(item.id, "applied")}>
                      Mark applied
                    </Button>
                  )}
                  {item.status !== "skipped" && item.status !== "applied" && (
                    <Button size="sm" variant="ghost" loading={updatingId === item.id} onClick={() => updateStatus(item.id, "skipped")}>
                      Skip
                    </Button>
                  )}
                  {item.apply_url && (
                    <a href={item.apply_url} target="_blank" rel="noreferrer" className="text-ink-400 hover:text-glow-300" aria-label="Open job posting">
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {activeDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto scroll-thin rounded-xl2 border border-white/10 bg-ink-900 p-6 shadow-glow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="font-display text-lg font-semibold text-white">{activeDraft.title}</p>
                <p className="text-sm text-ink-300">{activeDraft.company}</p>
              </div>
              <button onClick={() => setActiveDraft(null)} className="text-ink-400 hover:text-white" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 flex gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  disabled={drafting}
                  onClick={() => handleToneChange(t)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors disabled:opacity-50 ${
                    tone === t ? "bg-gradient-to-r from-glow-500 to-glow-600 text-ink-950" : "bg-white/10 text-ink-200 hover:bg-white/15"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {drafting ? (
              <Loader label="Drafting your application…" />
            ) : draftResult ? (
              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-xs font-medium text-ink-400">Cover letter</p>
                    <Badge tone={draftResult.source === "openai" ? "forecast" : "neutral"}>
                      {draftResult.source === "openai" ? "GPT-4o" : "Smart template"}
                    </Badge>
                  </div>
                  <div className="whitespace-pre-wrap rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-ink-200">
                    {draftResult.cover_letter}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-ink-400">Resume bullet suggestions</p>
                  <ul className="space-y-1.5">
                    {draftResult.resume_bullet_suggestions.map((b, i) => (
                      <li key={i} className="text-sm text-ink-300">• {b}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(draftResult.cover_letter);
                      toast.success("Cover letter copied.");
                    }}
                  >
                    Copy letter
                  </Button>
                  <Button variant="secondary" onClick={() => downloadCoverLetterText(draftResult)}>
                    <Download size={14} /> Download
                  </Button>
                  {activeDraft.apply_url && (
                    <a href={activeDraft.apply_url} target="_blank" rel="noreferrer">
                      <Button>Open job posting</Button>
                    </a>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
