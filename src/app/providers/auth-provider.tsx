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
// NOTA DE SEGURANÇA: O token é armazenado em sessionStorage (escopo por aba,
// limpo ao fechar o browser). Para máxima segurança, migrar para cookie
// HttpOnly; Secure; SameSite=Strict — requer suporte do backend.
const storage = typeof window !== "undefined" ? window.sessionStorage : null;


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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Sempre inicia na tela de login por padrão (sem usuário pré-autenticado)
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      storage?.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      storage?.removeItem(STORAGE_KEY);
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

      // Valida que o backend retornou um token real antes de autenticar
      if (!token || typeof token !== "string" || token.trim() === "") {
        throw new Error("A API não retornou um token de autenticação válido. Verifique as credenciais.");
      }

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
        token,
      };

      setUser(authUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    storage?.removeItem(STORAGE_KEY);
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
