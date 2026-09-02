import { http } from "../http";

/**
 * Autenticação de usuário ou chave de cliente no Hub API de Produção
 */
export async function authenticateHubUser(credentials: {
  username?: string;
  password?: string;
  consumerKey?: string;
  consumerSecret?: string;
}) {
  if (credentials.consumerKey && credentials.consumerSecret) {
    const { data } = await http.post("/api/token", {
      consumerKey: credentials.consumerKey.trim(),
      consumerSecret: credentials.consumerSecret.trim(),
    });
    return data;
  }

  if (credentials.username && credentials.password) {
    const { data } = await http.post("/api/admin/token", {
      username: credentials.username.trim(),
      password: credentials.password.trim(),
    });
    return data;
  }

  throw new Error("Credenciais inválidas para autenticação no Hub.");
}
