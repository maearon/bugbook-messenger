"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "../auth";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/token";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tokens from token.ts on mount
  useEffect(() => {
    const access = getAccessToken();
    const refresh = getRefreshToken();

    if (access && refresh) {
      setAccessTokenState(access);
      fetchCurrentUser(access);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch /me
  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await fetch(
        `https://node-boilerplate-pww8.onrender.com/v1/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        await refreshAccessToken();
      }
    } catch (error) {
      console.error("[auth] Failed to fetch user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    const access = data.tokens.access.token;
    const refresh = data.tokens.refresh.token;

    setTokens(access, refresh, true);
    setAccessTokenState(access);
    setUser(data.user);
  };

  // Register
  const register = async (email: string, password: string, name: string) => {
    const response = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const data = await response.json();
    const access = data.tokens.access.token;
    const refresh = data.tokens.refresh.token;

    setTokens(access, refresh, true);
    setAccessTokenState(access);
    setUser(data.user);
  };

  // Logout
  const logout = async () => {
    try {
      const refresh = getRefreshToken();

      await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
    } catch (err) {
      console.warn("[auth] Logout failed but clearing anyway.");
    } finally {
      clearTokens();
      setUser(null);
      setAccessTokenState(null);
    }
  };

  // Refresh
  const refreshAccessToken = async (): Promise<string | null> => {
    const refresh = getRefreshToken();

    if (!refresh) {
      logout();
      return null;
    }

    try {
      const response = await fetch("/api/v1/auth/refresh-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });

      if (!response.ok) {
        logout();
        return null;
      }

      const data = await response.json();
      const access = data.tokens.access.token;

      setTokens(access, refresh, true);
      setAccessTokenState(access);

      await fetchCurrentUser(access);

      return access;             // 🔥🔥🔥 THIS IS REQUIRED
    } catch (error) {
      console.error("[auth] Failed to refresh token:", error);
      logout();
      return null;               // 🔥 return null thay vì void
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: accessTokenState,
        isLoading,
        login,
        register,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
