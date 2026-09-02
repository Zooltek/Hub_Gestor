import { http, toErrorMessage } from "../http";
import { logger } from "../../logger";
import { z } from "zod";

export interface HubPluginDto {
  systemName: string;
  friendlyName?: string;
  description?: string;
  author?: string;
  version?: string;
  kind?: string;
  group?: string;
  isActiveGlobally?: boolean;
  isInstalledForCustomer?: boolean;
  isEnabledForCustomer?: boolean;
  configurationSchema?: {
    fields?: Array<{
      id: string;
      label: string;
      type?: "text" | "password" | "number" | "boolean" | "select";
      required?: boolean;
      placeholder?: string;
      description?: string;
      options?: Array<{ label: string; value: string }>;
      defaultValue?: any;
    }>;
  };
  currentConfiguration?: Record<string, any>;
}

/**
 * Busca todos os plugins registrados globalmente no Hub Admin
 */
export async function fetchHubAvailablePlugins(customerId?: string): Promise<HubPluginDto[]> {
  try {
    let plugins: any[] = [];
    try {
      const { data } = await http.get("/api/admin/plugins");
      plugins = Array.isArray(data) ? data : [];
    } catch {
      // ignore
    }

    if (plugins.length === 0) {
      try {
        const { data } = await http.get("/api/plugins");
        plugins = Array.isArray(data) ? data : [];
      } catch {
        // ignore
      }
    }

    // Default registered plugins from Hub Admin
    const defaultHubPlugins: HubPluginDto[] = [
      {
        systemName: "Ecommerce.LojaIntegrada",
        friendlyName: "Loja Integrada",
        description: "Loja Integrada Integration module para catálogo, estoque e pedidos.",
        author: "Amura",
        version: "1.1.1",
        kind: "Ecommerce",
        group: "Ecommerce",
        isActiveGlobally: true,
        configurationSchema: {
          fields: [
            { id: "apiKey", label: "Chave de API da Loja Integrada", type: "password", required: true, placeholder: "apiKey_..." },
            { id: "appKey", label: "Chave da Aplicação (App Key)", type: "text", required: true, placeholder: "appKey_..." },
          ],
        },
      },
      {
        systemName: "Ecommerce.NuvemShop",
        friendlyName: "Nuvem Shop",
        description: "Nuvem Shop integration module para catálogo, estoque e pedidos.",
        author: "Amura",
        version: "1.0.1",
        kind: "Ecommerce",
        group: "Ecommerce",
        isActiveGlobally: true,
        configurationSchema: {
          fields: [
            { id: "accessToken", label: "Access Token (OAuth 2.0)", type: "password", required: true, placeholder: "token_nuvemshop_..." },
            { id: "userId", label: "ID da Loja (User ID)", type: "text", required: true, placeholder: "1234567" },
          ],
        },
      },
      {
        systemName: "Ecommerce.Shopify",
        friendlyName: "Shopify",
        description: "Shopify integration module para sincronização completa de inventário e pedidos.",
        author: "Amura",
        version: "3.0.6",
        kind: "Ecommerce",
        group: "Ecommerce",
        isActiveGlobally: true,
        configurationSchema: {
          fields: [
            { id: "shopDomain", label: "Domínio da Loja (.myshopify.com)", type: "text", required: true, placeholder: "sualoja.myshopify.com" },
            { id: "accessToken", label: "Admin API Access Token (shpat_...)", type: "password", required: true, placeholder: "shpat_..." },
            { id: "locationId", label: "Location ID de Estoque (Opcional)", type: "text", placeholder: "Ex: 681234567" },
          ],
        },
      },
      {
        systemName: "Ecommerce.Tray",
        friendlyName: "Tray",
        description: "Tray integration module com suporte a variações de produtos e tracking de frete.",
        author: "Amura",
        version: "1.1.5",
        kind: "Ecommerce",
        group: "Ecommerce",
        isActiveGlobally: true,
        configurationSchema: {
          fields: [
            { id: "apiHost", label: "URL da API da Loja Tray", type: "text", required: true, placeholder: "https://sualoja.commercesuite.com.br/web_api" },
            { id: "accessToken", label: "Access Token", type: "password", required: true, placeholder: "token_tray_..." },
            { id: "refreshToken", label: "Refresh Token", type: "password", required: false, placeholder: "refresh_token_..." },
          ],
        },
      },
      {
        systemName: "Marketplace.MercadoLivre",
        friendlyName: "Mercado Livre",
        description: "Plugin marketplace para Mercado Livre com OAuth, categorias, produtos, pedidos e notificações.",
        author: "Amura",
        version: "1.3.11",
        kind: "Marketplace",
        group: "Marketplace",
        isActiveGlobally: true,
        configurationSchema: {
          fields: [
            { id: "appId", label: "App ID / Client ID", type: "text", required: true, placeholder: "Ex: 1234567890123456" },
            { id: "secretKey", label: "Secret Key / Client Secret", type: "password", required: true, placeholder: "secret_key_..." },
            { id: "sellerId", label: "Seller ID (ID do Vendedor)", type: "text", required: false, placeholder: "Ex: 123456789" },
          ],
        },
      },
    ];

    const baseList: HubPluginDto[] = plugins.length > 0
      ? plugins.map((p: any) => ({
          systemName: p.systemName || p.id,
          friendlyName: p.friendlyName || p.name || p.systemName,
          description: p.description || "",
          author: p.author || "Amura",
          version: p.version || "1.0.0",
          kind: p.kind || p.group || "Ecommerce",
          group: p.group || "Ecommerce",
          isActiveGlobally: p.isActive !== false,
          configurationSchema: p.configurationSchema || p.schema || {
            fields: [
              { id: "apiKey", label: "Chave de API / Token", type: "password", required: true },
            ],
          },
        }))
      : defaultHubPlugins;

    // Check customer installed status on server & local fallback
    if (customerId) {
      let serverCustomerPlugins: any[] = [];
      let customerConfigMap: Record<string, any> = {};

      // 1. Try reading live customer status from Hub server
      try {
        const { data: customerData } = await http.get<any>(`/api/admin/customers/${encodeURIComponent(customerId)}`);
        if (customerData && Array.isArray(customerData.plugins)) {
          serverCustomerPlugins = customerData.plugins;
        }
      } catch {
        try {
          const { data: pluginsData } = await http.get<any>(`/api/admin/customers/${encodeURIComponent(customerId)}/plugins`);
          if (Array.isArray(pluginsData)) {
            serverCustomerPlugins = pluginsData;
          }
        } catch {
          // ignore
        }
      }

      // 2. Read local overrides
      try {
        const stored = localStorage.getItem(`hub_customer_plugins_${customerId}`);
        if (stored) {
          // Valida que é um objeto simples antes de usar como mapa de config
          const PluginMapSchema = z.record(z.string(), z.object({
            installed: z.boolean().optional(),
            enabled: z.boolean().optional(),
            values: z.record(z.string(), z.unknown()).optional(),
            updatedAt: z.string().optional(),
          }).passthrough());
          const parsed = PluginMapSchema.safeParse(JSON.parse(stored));
          if (parsed.success) customerConfigMap = parsed.data;
        }
      } catch {
        // ignore
      }

      const serverPluginMap = new Map(
        serverCustomerPlugins.map((sp: any) => [
          (sp.systemName || sp.SystemName || "").toLowerCase(),
          sp,
        ])
      );

      return baseList.map((p) => {
        const serverPlugin = serverPluginMap.get(p.systemName.toLowerCase());
        const localCfg = customerConfigMap[p.systemName];

        const isInstalled = serverPlugin
          ? Boolean(serverPlugin.installed ?? serverPlugin.Installed ?? true)
          : Boolean(localCfg?.installed ?? (p.systemName === "Ecommerce.Shopify" || p.systemName === "Marketplace.MercadoLivre"));

        const isEnabled = serverPlugin
          ? Boolean(serverPlugin.isEnabled ?? serverPlugin.IsEnabled ?? true)
          : Boolean(localCfg?.enabled ?? (p.systemName === "Ecommerce.Shopify" || p.systemName === "Marketplace.MercadoLivre"));

        const currentValues = serverPlugin?.configuration || serverPlugin?.values || localCfg?.values || {};

        return {
          ...p,
          isInstalledForCustomer: isInstalled,
          isEnabledForCustomer: isInstalled && isEnabled,
          currentConfiguration: currentValues,
        };
      });
    }

    return baseList;
  } catch (error) {
    logger.error("Erro ao carregar plugins disponíveis:", toErrorMessage(error));
    return [];
  }
}

/**
 * Instala ou atualiza configuração de um plugin na conta do cliente
 */
export async function installOrUpdateCustomerPlugin(
  customerId: string,
  systemName: string,
  values: Record<string, any>
): Promise<boolean> {
  try {
    await http.post(`/api/admin/customers/${encodeURIComponent(customerId)}/plugins/${encodeURIComponent(systemName)}/install`, { values });
  } catch {
    try {
      await http.put(`/api/admin/customers/${encodeURIComponent(customerId)}/plugins/${encodeURIComponent(systemName)}/configuration`, { values });
    } catch {
      // ignore
    }
  }

  // Local storage persistence
  try {
    const key = `hub_customer_plugins_${customerId}`;
    const map = JSON.parse(localStorage.getItem(key) || "{}");
    map[systemName] = {
      installed: true,
      enabled: true,
      values,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(map));
    return true;
  } catch {
    return false;
  }
}

/**
 * Ativa ou Desativa um plugin instalado na conta do cliente
 */
export async function toggleCustomerPluginStatus(
  customerId: string,
  systemName: string,
  enable: boolean
): Promise<boolean> {
  try {
    await http.post(`/api/admin/customers/${encodeURIComponent(customerId)}/plugins/${encodeURIComponent(systemName)}/${enable ? "enable" : "disable"}`);
  } catch {
    // ignore
  }

  try {
    const key = `hub_customer_plugins_${customerId}`;
    const map = JSON.parse(localStorage.getItem(key) || "{}");
    if (!map[systemName]) {
      map[systemName] = { installed: true, values: {} };
    }
    map[systemName].enabled = enable;
    localStorage.setItem(key, JSON.stringify(map));
    return true;
  } catch {
    return false;
  }
}

/**
 * Desinstala um plugin da conta do cliente
 */
export async function uninstallCustomerPlugin(
  customerId: string,
  systemName: string
): Promise<boolean> {
  try {
    await http.post(`/api/admin/customers/${encodeURIComponent(customerId)}/plugins/${encodeURIComponent(systemName)}/uninstall`);
  } catch {
    // ignore
  }

  try {
    const key = `hub_customer_plugins_${customerId}`;
    const map = JSON.parse(localStorage.getItem(key) || "{}");
    if (map[systemName]) {
      map[systemName].installed = false;
      map[systemName].enabled = false;
      localStorage.setItem(key, JSON.stringify(map));
    }
    return true;
  } catch {
    return false;
  }
}
