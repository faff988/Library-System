import { useState, useEffect, useCallback } from "react";

const TOKEN_KEY = "token";
const USER_KEY = "user";

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

const parseJson = (v) => {
  if (!v) return {};
  if (typeof v === "object") return v;
  try { return JSON.parse(v); } catch { return {}; }
};

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
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

  // Permissions: prefer the stored user (saved by Login.jsx as a real,
  // merged object); fall back to whatever the token carries.
  const stored = readStoredUser();
  const permissions = stored?.permissions
    ? parseJson(stored.permissions)
    : parseJson(payload.permissions);

  return {
    ...payload,
    roleName: payload.roleName ?? payload.role ?? stored?.roles?.role_name ?? null,
    permissions,
  };
}

export function useAuth() {
  const [user, setUser] = useState(readUserFromStorage);

  useEffect(() => {
    const onStorage = (e) => {
      if (!e.key || e.key === TOKEN_KEY || e.key === USER_KEY) {
        setUser(readUserFromStorage());
      }
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
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // Admins always pass. Viewing is open to everyone (matches the server).
  // Everything else needs an explicit true. Fails closed.
  const can = useCallback(
    (moduleId, action) => {
      if (!user) return false;
      if ((user.roleName || "").toLowerCase() === "admin") return true;
      if (action === "read") return true;
      return !!user.permissions?.[moduleId]?.[action];
    },
    [user]
  );

  return {
    user,
    role: user?.roleName ?? null,
    permissions: user?.permissions ?? null,
    isAuthenticated: !!user,
    can,
    login,
    logout,
  };
}