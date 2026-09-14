import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/ui/Button";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function Register() {
  useDocumentTitle("Create account");
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await register(fullName, email, password);
    setLoading(false);
    if (res.ok) {
      toast.success("Account created — welcome to CareerOS.");
      navigate("/app", { replace: true });
    } else {
      setError(res.error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm animate-rise">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-600">
            <Sparkles size={16} className="text-white" />
          </span>
          <span className="font-display text-lg font-semibold text-ink-900">CareerOS</span>
        </Link>

        <div className="rounded-xl2 border border-ink-100 bg-white p-7 shadow-card">
          <h1 className="font-display text-xl font-semibold text-ink-900">Create your account</h1>
          <p className="mt-1 text-sm text-ink-500">Free — save your resume, roadmap, and applications.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Full name</label>
              <input
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-signal-400 focus:ring-2 focus:ring-signal-100"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-signal-400 focus:ring-2 focus:ring-signal-100"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-signal-400 focus:ring-2 focus:ring-signal-100"
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-risk-high" role="alert">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Create account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-signal-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
