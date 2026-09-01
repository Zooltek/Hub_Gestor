import React, { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser, LoginCredentials } from "@/features/auth/types";
import { authenticateHubUser } from "@/lib/api/hub-client";

interface ExtendedLoginCredentials extends LoginCredentials {
  consumerKey?: string;
  consumerSecret?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: ExtendedLoginCredentials) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "hub_gerencial_auth";

function parseJwtClaims(token?: string) {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Default account: Cliente real Amura Teste
const DEFAULT_AMURA_TESTE_USER: AuthUser = {
  id: "6a96e389bc3f49ca84122eb6",
  username: "amura@amura.com.br",
  email: "amura@amura.com.br",
  displayName: "Amura Teste",
  role: "Manager",
  customerId: "6a96e389bc3f49ca84122eb6",
  customerName: "Amura Teste",
  token: "jwt-amura-teste-session",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return DEFAULT_AMURA_TESTE_USER;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (credentials: ExtendedLoginCredentials) => {
    setIsLoading(true);
    try {
      // Autenticação com a API Real do Hub
      const response = await authenticateHubUser({
        username: credentials.username,
        password: credentials.password,
        consumerKey: credentials.consumerKey,
        consumerSecret: credentials.consumerSecret,
      });

      const token = response?.token;
      const claims = parseJwtClaims(token) || {};

      const effectiveCustomerId =
        response?.customerId ||
        claims?.CustomerId ||
        response?.testCustomerId ||
        response?.userId ||
        "6a96e389bc3f49ca84122eb6";

      const effectiveEmail =
        claims?.Email ||
        response?.email ||
        (credentials.username?.includes("@") ? credentials.username : "amura@amura.com.br");

      const effectiveName =
        claims?.Company ||
        response?.customerName ||
        response?.displayName ||
        response?.company ||
        "Amura Teste";

      const authUser: AuthUser = {
        id: effectiveCustomerId,
        username: effectiveEmail,
        email: effectiveEmail,
        displayName: effectiveName,
        role: "Manager",
        customerId: effectiveCustomerId,
        customerName: effectiveName,
        token: token || `jwt-${Date.now()}`,
      };

      setUser(authUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
