import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, apiErrorMessage } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem("careeros_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data);
    } catch {
      localStorage.removeItem("careeros_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  async function login(email, password) {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("careeros_token", data.access_token);
      setUser(data.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: apiErrorMessage(err, "Couldn't log you in. Check your email and password.") };
    }
  }

  async function register(full_name, email, password) {
    try {
      const { data } = await api.post("/api/auth/register", { full_name, email, password });
      localStorage.setItem("careeros_token", data.access_token);
      setUser(data.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: apiErrorMessage(err, "Couldn't create your account.") };
    }
  }

  function logout() {
    localStorage.removeItem("careeros_token");
    setUser(null);
  }

  function updateUserLocal(patch) {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserLocal, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
