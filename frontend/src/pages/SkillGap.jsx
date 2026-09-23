import { useState } from "react";
import { FileSearch, CheckCircle2, XCircle, GraduationCap } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import FileDropzone from "../components/ui/FileDropzone";
import Loader from "../components/ui/Loader";
import { useResume } from "../context/ResumeContext";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function SkillGap() {
  useDocumentTitle("Skill Gap Analyzer");
  const toast = useToast();
  const { resumeText, resumeFileName, setResume, clearResume } = useResume();
  const [jobDescription, setJobDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleFile(file) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/api/skillgap/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResume(data.resume_text, file.name, data.extracted_skills);
      toast.success(`Resume read — found ${data.extracted_skills.length} skills.`);
    } catch (err) {
      const msg = apiErrorMessage(err, "Couldn't read that file.");
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    setError("");
    try {
      const { data } = await api.post("/api/skillgap/analyze", {
        resume_text: resumeText,
        job_description: jobDescription,
      });
      setResult(data);
    } catch (err) {
      const msg = apiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  }

  const canAnalyze = resumeText.trim().length > 0 && jobDescription.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <p className="mb-3 text-sm font-medium text-ink-200">1. Your resume</p>
          {uploading ? (
            <Loader label="Reading your resume…" />
          ) : (
            <FileDropzone onFile={handleFile} fileName={resumeFileName} onClear={clearResume} />
          )}
          <p className="mt-3 text-xs text-ink-400">
            Or paste resume text directly below — either source works.
          </p>
          <textarea
            value={resumeText}
            onChange={(e) => setResume(e.target.value, resumeFileName || "pasted-resume.txt", [])}
            rows={6}
            placeholder="Paste your resume text here…"
            className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-ink-400 focus:border-glow-400"
          />
        </Card>

        <Card>
          <p className="mb-3 text-sm font-medium text-ink-200">2. Job description</p>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            placeholder="Paste the job description you're targeting…"
            className="w-full rounded-lg border border-white/15 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-ink-400 focus:border-glow-400"
          />
        </Card>
      </div>

      <Button onClick={handleAnalyze} disabled={!canAnalyze} loading={analyzing}>
        <FileSearch size={16} /> Analyze skill gap
      </Button>

      {error && !result && <Card className="text-sm text-red-300">{error}</Card>}

      {result && (
        <div className="space-y-6">
          <Card className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div>
              <p className="text-xs font-medium text-ink-400">Overall match</p>
              <p className="font-display text-4xl font-semibold text-glow-300">{result.match_score_pct}%</p>
            </div>
            <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-white/10 sm:w-64">
              <div className="h-full rounded-full bg-gradient-to-r from-glow-500 to-glow-400 transition-all" style={{ width: `${result.match_score_pct}%` }} />
            </div>
            <div className="text-sm text-ink-300">
              {result.matched_skills.length} matched · {result.missing_skills.length} to learn
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card>
              <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-glow-300">
                <CheckCircle2 size={16} /> Skills you already match
              </p>
              <div className="flex flex-wrap gap-2">
                {result.matched_skills.length === 0 && <p className="text-sm text-ink-400">No direct overlaps found yet.</p>}
                {result.matched_skills.map((s) => (
                  <Badge key={s} tone="forecast">{s}</Badge>
                ))}
              </div>
            </Card>
            <Card>
              <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-red-300">
                <XCircle size={16} /> Skills to close the gap
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.length === 0 && <p className="text-sm text-ink-400">No major gaps — great fit!</p>}
                {result.missing_skills.map((s) => (
                  <Badge key={s} tone="high">{s}</Badge>
                ))}
              </div>
            </Card>
          </div>

          {result.recommended_courses.length > 0 && (
            <Card>
              <p className="mb-4 flex items-center gap-1.5 font-display text-base font-semibold text-white">
                <GraduationCap size={18} className="text-glow-400" /> Recommended courses
              </p>
              <div className="space-y-4">
                {result.recommended_courses.map(({ skill, courses }) => (
                  <div key={skill} className="flex flex-col gap-1.5 border-b border-white/10 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <Badge tone="signal" className="w-fit capitalize">{skill}</Badge>
                    <div className="text-sm text-ink-300">
                      {courses.map((c) => `${c.title} (${c.provider})`).join(" · ")}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
