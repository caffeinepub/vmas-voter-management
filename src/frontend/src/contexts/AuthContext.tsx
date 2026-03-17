import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  login as authLogin,
  logout as authLogout,
  getCurrentUser,
  refreshSession,
} from "../store/auth";
import type { User } from "../store/types";

const SESSION_KEY = "vmas_current_session";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const activityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(SESSION_KEY);
    if (storedToken) {
      const currentUser = getCurrentUser(storedToken);
      if (currentUser) {
        setToken(storedToken);
        setUser(currentUser);
        refreshSession(storedToken);
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Activity tracking — refresh session on any user interaction
  const handleActivity = useCallback(() => {
    if (token) {
      refreshSession(token);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    for (const e of events)
      window.addEventListener(e, handleActivity, { passive: true });
    return () => {
      for (const e of events) window.removeEventListener(e, handleActivity);
    };
  }, [token, handleActivity]);

  // Check session expiry every minute
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      const currentUser = getCurrentUser(token);
      if (!currentUser) {
        setToken(null);
        setUser(null);
        localStorage.removeItem(SESSION_KEY);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [token]);

  // Cleanup timeout ref on unmount
  useEffect(() => {
    return () => {
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    };
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    const newToken = authLogin(username, password);
    if (!newToken) return false;

    const currentUser = getCurrentUser(newToken);
    if (!currentUser) return false;

    setToken(newToken);
    setUser(currentUser);
    localStorage.setItem(SESSION_KEY, newToken);
    return true;
  }, []);

  const logout = useCallback(() => {
    if (token) {
      authLogout(token);
      localStorage.removeItem(SESSION_KEY);
    }
    setToken(null);
    setUser(null);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
