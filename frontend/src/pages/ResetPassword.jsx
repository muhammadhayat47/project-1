import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function ResetPassword() {
  useDocumentTitle("Reset password");
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { token, new_password: password });
      setDone(true);
      toast.success("Password updated — you can log in now.");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-6">
      <div className="pointer-events-none fixed -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-glow-500/15 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-signal-500/15 blur-[120px]" />

      <div className="relative w-full max-w-sm animate-rise">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <Logo size={38} />
          <span className="font-display text-xl font-semibold text-white">CareerOS</span>
        </Link>

        <div className="rounded-xl2 border border-white/10 bg-ink-900/60 p-7 shadow-glow backdrop-blur-xl">
          <h1 className="font-display text-xl font-semibold text-white">Set a new password</h1>
          <p className="mt-1 text-sm text-ink-300">Choose a new password for your account.</p>

          {!token ? (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              This link is missing its reset token. Request a new one from the forgot-password page.
            </div>
          ) : done ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-2 rounded-lg border border-glow-400/20 bg-glow-500/10 px-3 py-2 text-sm text-glow-200" role="status">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                Your password has been updated.
              </div>
              <Button className="w-full" onClick={() => navigate("/login")}>
                Go to log in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-200">New password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-ink-400 focus:border-glow-400 focus:ring-2 focus:ring-glow-400/20"
                  placeholder="At least 8 characters, with a letter and a number"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                Update password
              </Button>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-ink-300">
            <Link to="/login" className="font-medium text-glow-300 hover:underline">
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
