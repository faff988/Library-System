import { useState, useEffect, useCallback } from "react";

// ASSUMPTION: JWT is stored in localStorage under "token".
// If you store it elsewhere (cookie, context set at login, etc.),
// update readUserFromStorage() below accordingly.
const TOKEN_KEY = "token";

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function readUserFromStorage() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload) return null;

  // Drop expired tokens
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }

  return payload;
}

export function useAuth() {
  const [user, setUser] = useState(readUserFromStorage);

  useEffect(() => {
    // Keep in sync if the token changes in another tab, or is
    // set/cleared by login/logout calls elsewhere in the app.
    const onStorage = (e) => {
      if (!e.key || e.key === TOKEN_KEY) setUser(readUserFromStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback((token) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(readUserFromStorage());
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return {
    user,
    role: user?.roleName ?? null,
    isAuthenticated: !!user,
    login,
    logout,
  };
}