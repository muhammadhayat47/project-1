import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function Login() {
  useDocumentTitle("Log in");
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      toast.success("Welcome back.");
      navigate(location.state?.from?.pathname || "/app", { replace: true });
    } else {
      setError(res.error);
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
          <h1 className="font-display text-xl font-semibold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-300">Log in to pick up your roadmap and applications.</p>

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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-200">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-ink-400 focus:border-glow-400 focus:ring-2 focus:ring-glow-400/20"
                placeholder="••••••••"
              />
              <div className="mt-1.5 text-right">
                <Link to="/forgot-password" className="text-xs font-medium text-glow-300 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Log in
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-300">
            New here?{" "}
            <Link to="/register" className="font-medium text-glow-300 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
