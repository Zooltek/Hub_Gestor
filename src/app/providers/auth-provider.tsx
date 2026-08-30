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

// Default account: Cliente real Amura Teste
const DEFAULT_AMURA_TESTE_USER: AuthUser = {
  id: "6a9218d05e09ae4df7465e34",
  username: "contato@amura.com.br",
  email: "contato@amura.com.br",
  displayName: "Amura Teste",
  role: "Manager",
  customerId: "6a9218d05e09ae4df7465e34",
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

      const authUser: AuthUser = {
        id: response?.customerId || "6a9218d05e09ae4df7465e34",
        username: credentials.username,
        email: response?.email || "contato@amura.com.br",
        displayName: response?.customerName || "Amura Teste",
        role: "Manager",
        customerId: response?.customerId || "6a9218d05e09ae4df7465e34",
        customerName: response?.customerName || "Amura Teste",
        token: response?.token || `jwt-${Date.now()}`,
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
