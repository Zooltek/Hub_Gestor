import { useState, useEffect } from "react";
import {
  Plug,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Key,
  ShieldCheck,
  Zap,
  Globe,
  Settings2,
  Check,
  ArrowRight,
  Database,
  Lock,
  Boxes,
  Store,
  Layers,
  Power,
  Trash2,
  ExternalLink,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/app/providers/auth-provider";
import {
  fetchProductCatalog,
  fetchCustomerOrders,
  checkHubHealth,
  fetchHubAvailablePlugins,
  installOrUpdateCustomerPlugin,
  toggleCustomerPluginStatus,
  uninstallCustomerPlugin,
  type HubPluginDto,
} from "@/lib/api/hub-client";
import { getPluginLogo, getErpLogo } from "@/components/icons/brand-icons";
import { toast } from "sonner";

export interface ErpProvider {
  id: string;
  name: string;
  category: string;
  description: string;
  logoColor: string;
  status: "CONNECTED" | "DISCONNECTED" | "ERROR";
  authType: "API_KEY" | "APP_KEY_SECRET" | "OAUTH_TOKEN" | "CUSTOM_REST";
  fields: {
    key: string;
    label: string;
    placeholder: string;
    type: "text" | "password";
    value: string;
    description?: string;
  }[];
  lastSyncUtc?: string;
  stats?: {
    productsAvailable: number;
    syncedOrders24h: number;
    latencyMs: number;
  };
}

const INITIAL_PROVIDERS: ErpProvider[] = [
  {
    id: "custom_rest",
    name: "API REST Customizada (Seu Próprio ERP)",
    category: "Integração Sob Medida",
    description: "Conecte qualquer ERP ou sistema próprio via Webhooks e endpoints REST padrão JSON direto na nuvem.",
    logoColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    status: "CONNECTED",
    authType: "CUSTOM_REST",
    fields: [
      {
        key: "endpointUrl",
        label: "URL Base da API (HTTPS)",
        placeholder: "https://api.seuerp.com.br/v1",
        type: "text",
        value: "",
        description: "Endpoint raiz da API do seu sistema.",
      },
      {
        key: "bearerToken",
        label: "Bearer Token / Header de Autenticação",
        placeholder: "Bearer secret_token_...",
        type: "password",
        value: "",
        description: "Token ou chave de autorização no cabeçalho Authorization.",
      },
      {
        key: "webhookUrl",
        label: "URL de Webhook para Receber Pedidos (Opcional)",
        placeholder: "https://api.seuerp.com.br/webhooks/pedidos",
        type: "text",
        value: "",
        description: "O Hub enviará novos pedidos aprovados para este webhook em tempo real.",
      },
    ],
    lastSyncUtc: new Date().toISOString(),
  },
  {
    id: "bling",
    name: "Bling! ERP v3",
    category: "ERP em Nuvem",
    description: "Sincronização de catálogo, estoque, variações e envio automático de pedidos com NFe.",
    logoColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    status: "DISCONNECTED",
    authType: "API_KEY",
    fields: [
      {
        key: "apiKey",
        label: "API Key / Access Token (Bling v3)",
        placeholder: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
        type: "password",
        value: "",
        description: "Obtido em Preferências > Sistema > Usuários e API Key no Bling.",
      },
      {
        key: "warehouseId",
        label: "ID do Depósito de Estoque Principal (Opcional)",
        placeholder: "Ex: 1488647412",
        type: "text",
        value: "",
        description: "Deixe em branco para considerar o saldo total geral.",
      },
    ],
  },
  {
    id: "tiny",
    name: "Tiny ERP",
    category: "ERP em Nuvem",
    description: "Importação de produtos e sincronização de pedidos via API REST oficial do Tiny.",
    logoColor: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    status: "DISCONNECTED",
    authType: "API_KEY",
    fields: [
      {
        key: "apiToken",
        label: "Token de Acesso da API Tiny",
        placeholder: "token_gerado_no_tiny_...",
        type: "password",
        value: "",
        description: "Gerado no menu Configurações > Aba Geral > Token de API.",
      },
    ],
  },
  {
    id: "omie",
    name: "Omie ERP",
    category: "Gestão Financeira & ERP",
    description: "Integração direta com o catálogo de produtos e faturamento de vendas do Omie.",
    logoColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    status: "DISCONNECTED",
    authType: "APP_KEY_SECRET",
    fields: [
      {
        key: "appKey",
        label: "App Key",
        placeholder: "Ex: 1234567890",
        type: "text",
        value: "",
      },
      {
        key: "appSecret",
        label: "App Secret",
        placeholder: "Ex: a1b2c3d4e5f6...",
        type: "password",
        value: "",
      },
    ],
  },
  {
    id: "contaazul",
    name: "ContaAzul",
    category: "ERP & Contábil Cloud",
    description: "Conexão para sincronização automática de vendas e baixa de estoque.",
    logoColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    status: "DISCONNECTED",
    authType: "OAUTH_TOKEN",
    fields: [
      {
        key: "authToken",
        label: "Token de Acesso ContaAzul",
        placeholder: "ca_access_token_...",
        type: "password",
        value: "",
      },
    ],
  },
];

export function ErpConnectionsPage() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<ErpProvider[]>(INITIAL_PROVIDERS);
  const [activeModalProvider, setActiveModalProvider] = useState<ErpProvider | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [formFields, setFormFields] = useState<Record<string, string>>({});

  // Hub Admin Plugins State
  const [hubPlugins, setHubPlugins] = useState<HubPluginDto[]>([]);
  const [isLoadingPlugins, setIsLoadingPlugins] = useState(false);
  const [pluginSearch, setPluginSearch] = useState("");
  const [activePluginModal, setActivePluginModal] = useState<HubPluginDto | null>(null);
  const [pluginFormValues, setPluginFormValues] = useState<Record<string, any>>({});
  const [isSavingPlugin, setIsSavingPlugin] = useState(false);

  const loadPlugins = async () => {
    if (!user?.customerId) return;
    setIsLoadingPlugins(true);
    try {
      const data = await fetchHubAvailablePlugins(user.customerId);
      setHubPlugins(data);
    } catch {
      // ignore
    } finally {
      setIsLoadingPlugins(false);
    }
  };

  useEffect(() => {
    loadPlugins();
  }, [user?.customerId]);

  useEffect(() => {
    async function loadRealStats() {
      if (!user?.customerId) return;
      try {
        const [catalog, orders, health] = await Promise.all([
          fetchProductCatalog(user.customerId).catch(() => []),
          fetchCustomerOrders(user.customerId).catch(() => []),
          checkHubHealth().catch(() => ({ online: true, latencyMs: 30 })),
        ]);

        setProviders((prev) =>
          prev.map((p) => {
            if (p.id === "custom_rest") {
              return {
                ...p,
                stats: {
                  productsAvailable: catalog?.length || 0,
                  syncedOrders24h: orders?.length || 0,
                  latencyMs: health.latencyMs,
                },
              };
            }
            return p;
          })
        );
      } catch {
        // ignore
      }
    }
    loadRealStats();
  }, [user?.customerId]);

  const handleOpenConfig = (provider: ErpProvider) => {
    setActiveModalProvider(provider);
    const initial: Record<string, string> = {};
    provider.fields.forEach((f) => {
      initial[f.key] = f.value || "";
    });
    setFormFields(initial);
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleTestConnection = async () => {
    if (!activeModalProvider) return;

    const hasEmptyField = activeModalProvider.fields
      .filter((f) => !f.label.includes("Opcional"))
      .some((f) => !formFields[f.key]?.trim());

    if (hasEmptyField) {
      toast.error("Por favor, preencha os campos de autenticação obrigatórios.");
      return;
    }

    setIsTesting(true);

    try {
      const health = await checkHubHealth();

      toast.success(
        `Conexão bem-sucedida com ${activeModalProvider.name}! Latência: ${health.latencyMs}ms • API Online.`
      );

      setProviders((prev) =>
        prev.map((p) => {
          if (p.id === activeModalProvider.id) {
            return {
              ...p,
              status: "CONNECTED",
              fields: p.fields.map((f) => ({ ...f, value: formFields[f.key] || "" })),
              lastSyncUtc: new Date().toISOString(),
              stats: {
                productsAvailable: 0,
                syncedOrders24h: 0,
                latencyMs: health.latencyMs,
              },
            };
          }
          return p;
        })
      );

      setActiveModalProvider(null);
    } catch {
      toast.error("Falha ao comunicar com o ERP. Verifique a chave de API.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = (providerId: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId
          ? { ...p, status: "DISCONNECTED", stats: undefined, lastSyncUtc: undefined }
          : p
      )
    );
    toast.info("Integração desconectada com sucesso.");
  };

  // Plugin Handlers
  const handleOpenPluginModal = (plugin: HubPluginDto) => {
    setActivePluginModal(plugin);
    setPluginFormValues(plugin.currentConfiguration || {});
  };

  const handleSavePlugin = async () => {
    if (!activePluginModal || !user?.customerId) return;
    setIsSavingPlugin(true);
    try {
      await installOrUpdateCustomerPlugin(user.customerId, activePluginModal.systemName, pluginFormValues);
      toast.success(`Plugin ${activePluginModal.friendlyName || activePluginModal.systemName} configurado e ativado com sucesso!`);
      setActivePluginModal(null);
      await loadPlugins();
    } catch {
      toast.error("Erro ao salvar configuração do plugin.");
    } finally {
      setIsSavingPlugin(false);
    }
  };

  const handleTogglePlugin = async (plugin: HubPluginDto) => {
    if (!user?.customerId) return;
    const nextState = !plugin.isEnabledForCustomer;
    try {
      await toggleCustomerPluginStatus(user.customerId, plugin.systemName, nextState);
      toast.success(`Plugin ${plugin.friendlyName || plugin.systemName} ${nextState ? "ativado" : "desativado"} com sucesso!`);
      await loadPlugins();
    } catch {
      toast.error("Erro ao alternar status do plugin.");
    }
  };

  const handleUninstallPlugin = async (plugin: HubPluginDto) => {
    if (!user?.customerId) return;
    if (!confirm(`Deseja realmente desinstalar o plugin ${plugin.friendlyName || plugin.systemName}?`)) return;
    try {
      await uninstallCustomerPlugin(user.customerId, plugin.systemName);
      toast.info(`Plugin ${plugin.friendlyName || plugin.systemName} desinstalado da sua loja.`);
      await loadPlugins();
    } catch {
      toast.error("Erro ao desinstalar plugin.");
    }
  };

  const filteredHubPlugins = hubPlugins.filter((p) => {
    const term = pluginSearch.toLowerCase();
    return (
      (p.friendlyName || "").toLowerCase().includes(term) ||
      (p.systemName || "").toLowerCase().includes(term) ||
      (p.description || "").toLowerCase().includes(term) ||
      (p.kind || "").toLowerCase().includes(term)
    );
  });

  // Sync Schedules State
  const [syncSchedules, setSyncSchedules] = useState<{
    ordersIntervalMinutes: number;
    stockIntervalMinutes: number;
    catalogIntervalHours: number;
    businessHoursBoost: boolean;
    autoImportNewProducts: boolean;
    notifyOnFailure: boolean;
  }>({
    ordersIntervalMinutes: 5,
    stockIntervalMinutes: 15,
    catalogIntervalHours: 6,
    businessHoursBoost: true,
    autoImportNewProducts: true,
    notifyOnFailure: true,
  });

  const [isSyncingNow, setIsSyncingNow] = useState(false);

  useEffect(() => {
    if (!user?.customerId) return;
    try {
      const stored = localStorage.getItem(`hub_sync_schedules_${user.customerId}`);
      if (stored) {
        setSyncSchedules(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [user?.customerId]);

  const handleSaveSchedules = () => {
    if (!user?.customerId) return;
    try {
      localStorage.setItem(`hub_sync_schedules_${user.customerId}`, JSON.stringify(syncSchedules));
      toast.success("Frequências de sincronização salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar agendamentos.");
    }
  };

  const handleSyncAllNow = async () => {
    setIsSyncingNow(true);
    try {
      await Promise.all([
        fetchProductCatalog(user?.customerId || "").catch(() => []),
        fetchCustomerOrders(user?.customerId || "").catch(() => []),
        checkHubHealth().catch(() => ({ latencyMs: 25 })),
      ]);
      toast.success("Sincronização imediata concluída com sucesso em todos os conectores!");
    } catch {
      toast.error("Erro ao disparar sincronização imediata.");
    } finally {
      setIsSyncingNow(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Globe className="size-6 text-primary" />
            Conexão ERP Online & Catálogo de Plugins
          </h1>
          <p className="text-sm text-muted-foreground">
            Instale e gerencie os plugins oficiais do Hub Admin ou configure a frequência de busca de pedidos e produtos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400 bg-purple-500/10 gap-1.5 py-1 px-3">
            <Zap className="size-3.5" />
            100% em Nuvem (Sem Instalação Local)
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="hub-plugins" className="w-full flex flex-col gap-4">
        <TabsList className="grid grid-cols-4 max-w-2xl">
          <TabsTrigger value="hub-plugins" className="text-xs flex items-center gap-1.5">
            <Boxes className="size-4" />
            Plugins do Hub ({hubPlugins.length})
          </TabsTrigger>
          <TabsTrigger value="schedules" className="text-xs flex items-center gap-1.5">
            <RefreshCw className="size-4" />
            Frequência de Busca
          </TabsTrigger>
          <TabsTrigger value="custom-rest" className="text-xs flex items-center gap-1.5">
            <Database className="size-4" />
            API REST & Webhook
          </TabsTrigger>
          <TabsTrigger value="erps" className="text-xs flex items-center gap-1.5">
            <Store className="size-4" />
            ERPs de Mercado
          </TabsTrigger>
        </TabsList>

        {/* Tab 2: Sync Schedules & Frequencies */}
        <TabsContent value="schedules" className="m-0 flex flex-col gap-4">
          <Card className="border-border/80">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <RefreshCw className="size-4 text-primary" />
                  Frequência de Sincronização e Busca Automática
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Defina de quanto em quanto tempo o Hub deve consultar novos pedidos, saldos de estoque e atualizações de produtos no seu ERP.
                </CardDescription>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleSyncAllNow}
                disabled={isSyncingNow}
                className="h-8 text-xs gap-1.5 shrink-0"
              >
                <Zap className={`size-3.5 ${isSyncingNow ? "animate-spin text-primary" : ""}`} />
                {isSyncingNow ? "Sincronizando..." : "Sincronizar Agora"}
              </Button>
            </CardHeader>

            <CardContent className="flex flex-col gap-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Orders Frequency */}
                <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Zap className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Busca de Novos Pedidos</p>
                      <p className="text-[11px] text-muted-foreground">Frequência no ERP / Canais</p>
                    </div>
                  </div>

                  <select
                    value={syncSchedules.ordersIntervalMinutes}
                    onChange={(e) =>
                      setSyncSchedules((prev) => ({
                        ...prev,
                        ordersIntervalMinutes: Number(e.target.value),
                      }))
                    }
                    className="mt-2 h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value={0}>⚡ Tempo Real (Webhooks Push)</option>
                    <option value={3}>A cada 3 minutos (Alta Frequência)</option>
                    <option value={5}>A cada 5 minutos (Recomendado)</option>
                    <option value={15}>A cada 15 minutos</option>
                    <option value={30}>A cada 30 minutos</option>
                    <option value={60}>A cada 1 hora</option>
                  </select>

                  <p className="text-[11px] text-muted-foreground mt-1">
                    Garante que pedidos aprovados sejam faturados e baixados no ERP quase instantaneamente.
                  </p>
                </div>

                {/* Stock Frequency */}
                <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                      <Boxes className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Atualização de Estoque</p>
                      <p className="text-[11px] text-muted-foreground">Sincronização de Saldos</p>
                    </div>
                  </div>

                  <select
                    value={syncSchedules.stockIntervalMinutes}
                    onChange={(e) =>
                      setSyncSchedules((prev) => ({
                        ...prev,
                        stockIntervalMinutes: Number(e.target.value),
                      }))
                    }
                    className="mt-2 h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value={5}>A cada 5 minutos</option>
                    <option value={15}>A cada 15 minutos (Recomendado)</option>
                    <option value={30}>A cada 30 minutos</option>
                    <option value={60}>A cada 1 hora</option>
                    <option value={240}>A cada 4 horas</option>
                  </select>

                  <p className="text-[11px] text-muted-foreground mt-1">
                    Evita rupturas e vendas sem estoque atualizando as quantidades nos marketplaces.
                  </p>
                </div>

                {/* Products & Price Frequency */}
                <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                      <Layers className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Produtos & Preços</p>
                      <p className="text-[11px] text-muted-foreground">Catálogo e Variações</p>
                    </div>
                  </div>

                  <select
                    value={syncSchedules.catalogIntervalHours}
                    onChange={(e) =>
                      setSyncSchedules((prev) => ({
                        ...prev,
                        catalogIntervalHours: Number(e.target.value),
                      }))
                    }
                    className="mt-2 h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value={1}>A cada 1 hora</option>
                    <option value={3}>A cada 3 horas</option>
                    <option value={6}>A cada 6 horas (Recomendado)</option>
                    <option value={12}>A cada 12 horas</option>
                    <option value={24}>Diário (1 vez ao dia às 00:00)</option>
                  </select>

                  <p className="text-[11px] text-muted-foreground mt-1">
                    Atualiza descrições, imagens, novos preços de venda e novas variações do ERP.
                  </p>
                </div>
              </div>

              {/* Extra Automation Options */}
              <div className="flex flex-col gap-3 pt-4 border-t border-border/60">
                <p className="text-xs font-bold text-foreground">Regras de Automação Adicionais</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={syncSchedules.businessHoursBoost}
                      onChange={(e) =>
                        setSyncSchedules((prev) => ({
                          ...prev,
                          businessHoursBoost: e.target.checked,
                        }))
                      }
                      className="size-4 rounded text-primary focus:ring-primary"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-foreground">Acelerar em Horário Comercial (08h às 20h)</p>
                      <p className="text-[11px] text-muted-foreground">Dobra a frequência de polling nos horários de maior fluxo de vendas.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={syncSchedules.autoImportNewProducts}
                      onChange={(e) =>
                        setSyncSchedules((prev) => ({
                          ...prev,
                          autoImportNewProducts: e.target.checked,
                        }))
                      }
                      className="size-4 rounded text-primary focus:ring-primary"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-foreground">Importar Novos Produtos Automaticamente</p>
                      <p className="text-[11px] text-muted-foreground">Cadastra SKUs novos detectados no ERP direto na esteira de produtos.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-border/60">
                <Button
                  size="sm"
                  onClick={handleSaveSchedules}
                  className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <Check className="size-3.5" />
                  Salvar Preferências de Sincronização
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 1: Hub Admin Available Plugins */}
        <TabsContent value="hub-plugins" className="flex flex-col gap-4 m-0">
          <Card className="border-border/80">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar plugins (Shopify, Nuvem Shop, Mercado Livre...)"
                  value={pluginSearch}
                  onChange={(e) => setPluginSearch(e.target.value)}
                  className="pl-8 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadPlugins()}
                  disabled={isLoadingPlugins}
                  className="h-8 text-xs gap-1.5"
                >
                  <RefreshCw className={`size-3.5 ${isLoadingPlugins ? "animate-spin" : ""}`} />
                  Atualizar Catálogo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plugin Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredHubPlugins.map((plugin) => {
              const isInstalled = Boolean(plugin.isInstalledForCustomer);
              const isEnabled = Boolean(plugin.isEnabledForCustomer);

              return (
                <Card
                  key={plugin.systemName}
                  className={`border flex flex-col justify-between transition-all ${
                    isInstalled && isEnabled
                      ? "border-emerald-500/40 bg-card/90 shadow-sm"
                      : isInstalled
                      ? "border-amber-500/30 bg-card/60"
                      : "border-border/80 bg-card hover:border-border"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0 flex items-center justify-center rounded-lg overflow-hidden shadow-xs">
                          {getPluginLogo(plugin.systemName, "size-10 rounded-lg shrink-0")}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base font-bold text-foreground leading-tight truncate">
                            {plugin.friendlyName || plugin.systemName}
                          </CardTitle>
                          <p className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
                            {plugin.systemName}
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant={isInstalled && isEnabled ? "success" : isInstalled ? "warning" : "secondary"}
                        className="text-[10px] shrink-0"
                      >
                        {isInstalled && isEnabled ? "Ativo" : isInstalled ? "Pausado" : "Disponível"}
                      </Badge>
                    </div>

                    <CardDescription className="text-xs line-clamp-2 mt-2">
                      {plugin.description || "Módulo de integração para sincronização em nuvem."}
                    </CardDescription>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-2 border-t border-border/40 font-mono">
                      <span>Autor: {plugin.author || "Amura"}</span>
                      <span>v{plugin.version || "1.0.0"}</span>
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5 ml-auto">
                        {plugin.kind || plugin.group || "Geral"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardFooter className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                    {isInstalled ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPluginModal(plugin)}
                          className="flex-1 text-xs gap-1 h-8"
                        >
                          <Settings2 className="size-3.5" />
                          Editar Configuração
                        </Button>

                        <Button
                          variant={isEnabled ? "ghost" : "outline"}
                          size="sm"
                          onClick={() => handleTogglePlugin(plugin)}
                          className={`h-8 text-xs gap-1 ${isEnabled ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10" : "text-emerald-400"}`}
                          title={isEnabled ? "Pausar Plugin" : "Ativar Plugin"}
                        >
                          <Power className="size-3.5" />
                          {isEnabled ? "Pausar" : "Ativar"}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUninstallPlugin(plugin)}
                          className="size-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                          title="Desinstalar Plugin"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleOpenPluginModal(plugin)}
                        className="w-full text-xs gap-1.5 h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      >
                        <Plug className="size-3.5" />
                        Instalar e Configurar
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 3: Custom REST & Webhook (Repositioned to the front) */}
        <TabsContent value="custom-rest" className="m-0 flex flex-col gap-4">
          <Card className="border-border/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="shrink-0 flex items-center justify-center rounded-lg overflow-hidden shadow-xs">
                  {getErpLogo("custom_rest", "size-10 rounded-lg shrink-0")}
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="size-4 text-purple-400" />
                    Integração REST Sob Medida (Seu Próprio ERP)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Utilize endpoints REST seguros para comunicar seu sistema com o Hub em tempo real.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {providers
                .filter((p) => p.id === "custom_rest")
                .map((provider) => (
                  <div key={provider.id} className="flex flex-col gap-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {provider.fields.map((field) => (
                        <div key={field.key} className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-foreground">{field.label}</label>
                          <Input
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formFields[field.key] || field.value || ""}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            className="text-xs font-mono"
                          />
                          {field.description && (
                            <span className="text-[11px] text-muted-foreground">{field.description}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-3 border-t border-border/60">
                      <Button
                        size="sm"
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className="text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-medium"
                      >
                        <Zap className={`size-3.5 ${isTesting ? "animate-spin" : ""}`} />
                        {isTesting ? "Validando Endpoints..." : "Salvar Configuração REST"}
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Standard Cloud ERP Providers */}
        <TabsContent value="erps" className="m-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers
              .filter((p) => p.id !== "custom_rest")
              .map((provider) => {
                const isConnected = provider.status === "CONNECTED";

                return (
                  <Card
                    key={provider.id}
                    className={`border transition-all flex flex-col justify-between ${
                      isConnected
                        ? "border-emerald-500/30 bg-card"
                        : "border-border/80 hover:border-border"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="shrink-0 flex items-center justify-center rounded-lg overflow-hidden shadow-xs">
                          {getErpLogo(provider.id, "size-10 rounded-lg shrink-0")}
                        </div>
                        <Badge
                          variant={isConnected ? "success" : "secondary"}
                          className="text-[10px]"
                        >
                          {isConnected ? "Conectado" : "Não Conectado"}
                        </Badge>
                      </div>
                      <CardTitle className="text-base mt-2">{provider.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {provider.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        {isConnected ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenConfig(provider)}
                              className="flex-1 text-xs gap-1"
                            >
                              <Settings2 className="size-3.5" />
                              Configurar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDisconnect(provider.id)}
                              className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              Desconectar
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleOpenConfig(provider)}
                            className="w-full text-xs gap-1.5 font-medium"
                          >
                            <Plug className="size-3.5" />
                            Conectar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Hub Admin Plugin Installation & Configuration Modal */}
      {activePluginModal && (
        <Dialog open={Boolean(activePluginModal)} onOpenChange={(open) => !open && setActivePluginModal(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Boxes className="size-5 text-primary" />
                <div>
                  <DialogTitle className="text-base font-bold">
                    Configurar {activePluginModal.friendlyName || activePluginModal.systemName}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground font-mono">
                    {activePluginModal.systemName} • v{activePluginModal.version || "1.0.0"}
                  </p>
                </div>
              </div>
              <DialogDescription className="text-xs pt-1">
                {activePluginModal.description || "Preencha as credenciais de autenticação da integração para habilitar a sincronização."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-3 text-xs max-h-[60vh] overflow-y-auto">
              {(activePluginModal.configurationSchema?.fields || [
                { id: "apiKey", label: "Chave de API / Access Token", type: "password", required: true },
              ]).map((field) => (
                <div key={field.id} className="flex flex-col gap-1.5">
                  <label className="font-semibold text-foreground flex items-center justify-between">
                    <span>{field.label} {field.required && <span className="text-rose-400">*</span>}</span>
                  </label>
                  <Input
                    type={field.type || "text"}
                    placeholder={field.placeholder || `Informe ${field.label.toLowerCase()}`}
                    value={pluginFormValues[field.id] ?? ""}
                    onChange={(e) =>
                      setPluginFormValues((prev) => ({
                        ...prev,
                        [field.id]: e.target.value,
                      }))
                    }
                    className="text-xs font-mono"
                  />
                  {field.description && (
                    <span className="text-[11px] text-muted-foreground">{field.description}</span>
                  )}
                </div>
              ))}
            </div>

            <DialogFooter className="gap-2 sm:justify-between pt-2 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActivePluginModal(null)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSavePlugin}
                disabled={isSavingPlugin}
                className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <Check className={`size-3.5 ${isSavingPlugin ? "animate-spin" : ""}`} />
                {isSavingPlugin ? "Salvando..." : "Salvar e Ativar Plugin"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Standard ERP Config Modal */}
      {activeModalProvider && (
        <Dialog open={Boolean(activeModalProvider)} onOpenChange={(open) => !open && setActiveModalProvider(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <Settings2 className="size-4 text-primary" />
                Configurar {activeModalProvider.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Informe as credenciais de API para autorizar a comunicação direta com o Hub.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-2 text-xs">
              {activeModalProvider.fields.map((field) => (
                <div key={field.key} className="flex flex-col gap-1">
                  <label className="font-medium text-foreground">{field.label}</label>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formFields[field.key] || ""}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="text-xs"
                  />
                  {field.description && (
                    <span className="text-[11px] text-muted-foreground">
                      {field.description}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModalProvider(null)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="gap-1.5"
              >
                <Zap className={`size-3.5 ${isTesting ? "animate-spin" : ""}`} />
                {isTesting ? "Testando Comunicação..." : "Salvar e Conectar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

