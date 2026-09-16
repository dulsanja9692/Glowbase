import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setToken, clearToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await api("/auth/login", { method: "POST", body: { email, password } });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const data = await api("/auth/register", { method: "POST", body: { name, email, password } });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  // Re-checks the token against the server. Used after bfcache restores
  // (browser back/forward) to make sure a logged-out session can't keep
  // viewing a page that was rendered while still logged in.
  const verifySession = useCallback(async () => {
    try {
      const data = await api("/auth/me");
      setUser(data.user);
      return true;
    } catch {
      clearToken();
      setUser(null);
      return false;
    }
  }, []);

  // Hard logout: clears the token/state AND does a full page navigation
  // (not client-side routing) to /login. This drops all in-memory app
  // state and replaces the current history entry, so pressing "back"
  // afterwards cannot land on a page that was rendered while authenticated.
  function logout() {
    clearToken();
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, verifySession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
