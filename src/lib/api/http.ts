import axios, { AxiosError } from "axios";

function resolveBaseUrl() {
  const configuredBaseUrl = (import.meta as any).env?.VITE_HUB_API_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  return "/";
}

const baseURL = resolveBaseUrl();

export const http = axios.create({
  baseURL,
  timeout: 30000,
});

http.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("hub_gerencial_auth");
    if (stored) {
      const session = JSON.parse(stored);
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    }
  } catch {
    // ignore
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("hub-auth-expired"));
    }

    return Promise.reject(error);
  }
);

export function toErrorMessage(error: unknown, fallback = "Erro inesperado ao conectar com a API.") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (typeof data === "object" && data && "error" in data) {
      const message = String((data as { error?: unknown }).error ?? "");
      if (message.trim()) {
        return message;
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
