import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "evote-auth";

const defaultState = {
  role: null,
  token: null,
  user: null,
};

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultState;
    } catch (err) {
      console.warn("Failed to parse auth storage", err);
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const value = useMemo(() => {
    const login = (role, token, user) => {
      setAuthState({ role, token, user });
    };

    return {
      role: authState.role,
      token: authState.token,
      user: authState.user,
      isAdmin: authState.role === "admin",
      isVoter: authState.role === "voter",
      loginAdmin: (token, admin) => login("admin", token ?? null, admin ?? null),
      loginVoter: (token, voter) => login("voter", token ?? null, voter ?? null),
      logout: () => setAuthState(defaultState),
    };
  }, [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
