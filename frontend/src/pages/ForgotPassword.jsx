import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function ForgotPassword() {
  useDocumentTitle("Forgot password");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [debugToken, setDebugToken] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setDebugToken("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/forgot-password", { email });
      setMessage(data.message);
      if (data.debug_reset_token) setDebugToken(data.debug_reset_token);
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
          <h1 className="font-display text-xl font-semibold text-white">Reset your password</h1>
          <p className="mt-1 text-sm text-ink-300">Enter your account email and we'll send a reset link.</p>

          {message ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-2 rounded-lg border border-glow-400/20 bg-glow-500/10 px-3 py-2 text-sm text-glow-200" role="status">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                {message}
              </div>
              {debugToken && (
                <div className="rounded-lg border border-white/15 bg-white/5 p-3 text-xs text-ink-300">
                  <p className="mb-1 font-medium text-ink-200">Demo mode — no email server configured.</p>
                  <p className="mb-2">Use this link to continue testing the reset flow:</p>
                  <Link
                    to={`/reset-password?token=${debugToken}`}
                    className="break-all font-medium text-glow-300 hover:underline"
                  >
                    /reset-password?token={debugToken}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-200">Email</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-ink-400 focus:border-glow-400 focus:ring-2 focus:ring-glow-400/20"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                Send reset link
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
