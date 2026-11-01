import { createContext, useContext, useEffect, useState } from "react";
import { authApi, session } from "../services/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    // Remove apenas contas do antigo protótipo que continham senha em texto puro.
    localStorage.removeItem("loggedUser");
    Object.keys(localStorage).forEach((key) => {
      try {
        const entry = JSON.parse(localStorage.getItem(key));
        if (key.includes("@") && entry?.email === key && typeof entry.password === "string" && typeof entry.username === "string") localStorage.removeItem(key);
      } catch { /* Outras chaves não são dados de autenticação. */ }
    });
    const expired = () => { setUser(null); setError(""); };
    window.addEventListener("wasfa:session-expired", expired);
    return () => window.removeEventListener("wasfa:session-expired", expired);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    if (!session.get()) { setLoading(false); return; }
    setLoading(true);
    authApi.me(controller.signal).then(setUser).catch((err) => {
      if (err.name !== "AbortError" && err.status !== 401) setError(err.message);
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);
  async function authenticate(action, data) {
    setError("");
    const result = await authApi[action](data);
    session.set(result.accessToken);
    setUser(result.usuario);
    return result.usuario;
  }
  const logout = () => {
    session.clear(); setUser(null); setError("");
    window.location.assign("/pages/login.html");
  };
  return <AuthContext.Provider value={{ user, loading, error, retry: () => setAttempt((value) => value + 1), login: (data) => authenticate("login", data), register: (data) => authenticate("register", data), logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
