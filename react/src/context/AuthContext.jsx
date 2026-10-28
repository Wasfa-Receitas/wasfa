import { createContext, useContext, useState } from "react";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem("loggedUser"));
  const login = (name) => {
    localStorage.setItem("loggedUser", name);
    setUser(name);
  };
  const logout = () => {
    localStorage.removeItem("loggedUser");
    setUser(null);
    window.location.assign("/pages/login.html");
  };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
