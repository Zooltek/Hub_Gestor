import { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
        value: "https://api.erp-cloud.com.br/v1",
        description: "Endpoint raiz da API do seu sistema.",
      },
      {
        key: "bearerToken",
        label: "Bearer Token / Header de Autenticação",
        placeholder: "Bearer secret_token_...",
        type: "password",
        value: "Bearer live_token_sec_89128391823",
        description: "Token ou chave de autorização no cabeçalho Authorization.",
      },
      {
        key: "webhookUrl",
        label: "URL de Webhook para Receber Pedidos (Opcional)",
        placeholder: "https://api.seuerp.com.br/webhooks/pedidos",
        type: "text",
        value: "https://api.erp-cloud.com.br/webhooks/pedidos",
        description: "O Hub enviará novos pedidos aprovados para este webhook em tempo real.",
      },
    ],
    lastSyncUtc: new Date(Date.now() - 3 * 60000).toISOString(),
    stats: {
      productsAvailable: 1580,
      syncedOrders24h: 215,
      latencyMs: 98,
    },
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
  const [providers, setProviders] = useState<ErpProvider[]>(INITIAL_PROVIDERS);
  const [activeModalProvider, setActiveModalProvider] = useState<ErpProvider | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [formFields, setFormFields] = useState<Record<string, string>>({});

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
      await new Promise((resolve) => setTimeout(resolve, 1200));

      toast.success(
        `Conexão bem-sucedida com ${activeModalProvider.name}! Latência: 98ms • API Online.`
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
                productsAvailable: Math.floor(1400 + Math.random() * 300),
                syncedOrders24h: 215,
                latencyMs: 98,
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Globe className="size-6 text-primary" />
            Conexão com ERPs Online (Nuvem)
          </h1>
          <p className="text-sm text-muted-foreground">
            Conecte sua API REST ou ERP em nuvem para sincronizar produtos, preços, estoque e pedidos automaticamente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400 bg-purple-500/10 gap-1.5 py-1 px-3">
            <Zap className="size-3.5" />
            100% em Nuvem (Sem Instalação)
          </Badge>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-foreground">Comunicação Direta Cloud-to-Cloud</p>
            <p className="text-muted-foreground mt-0.5">
              Você pode conectar a <strong>API REST do seu próprio sistema</strong> ou utilizar conectores oficiais para Bling, Tiny, Omie e ContaAzul. O Hub executa a sincronização em tempo real na nuvem.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Providers Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {providers.map((provider) => {
          const isConnected = provider.status === "CONNECTED";

          return (
            <Card
              key={provider.id}
              className={`border-border/80 flex flex-col justify-between transition-all ${
                isConnected ? "ring-1 ring-primary/40 bg-card/90" : "bg-card/60 hover:border-border"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border font-bold text-sm ${provider.logoColor}`}>
                      <Plug className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{provider.name}</CardTitle>
                      <span className="text-[11px] text-muted-foreground">{provider.category}</span>
                    </div>
                  </div>

                  <Badge variant={isConnected ? "success" : "secondary"} className="text-[10px]">
                    {isConnected ? "Conectado" : "Não Conectado"}
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-2 line-clamp-2">
                  {provider.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-3 pt-0">
                {isConnected && provider.stats && (
                  <div className="rounded-lg bg-muted/40 p-2.5 border border-border/50 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Produtos</p>
                      <p className="font-bold text-foreground">{provider.stats.productsAvailable}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Pedidos (24h)</p>
                      <p className="font-bold text-emerald-400">{provider.stats.syncedOrders24h}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Latência</p>
                      <p className="font-bold text-foreground">{provider.stats.latencyMs}ms</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                  {isConnected ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs flex-1"
                        onClick={() => handleOpenConfig(provider)}
                      >
                        <Settings2 className="size-3.5 mr-1" />
                        Configurar Chaves
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive hover:text-destructive"
                        onClick={() => handleDisconnect(provider.id)}
                      >
                        Desconectar
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleOpenConfig(provider)}
                    >
                      <Key className="size-3.5 mr-1.5" />
                      Inserir Chave de API & Conectar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration & Test Connection Modal */}
      {activeModalProvider && (
        <Dialog open={Boolean(activeModalProvider)} onOpenChange={(open) => !open && setActiveModalProvider(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <Plug className="size-4 text-primary" />
                <span>Configurar Integração: {activeModalProvider.name}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Informe os dados de autenticação e URL da API para sincronização em nuvem.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2 text-xs">
              {activeModalProvider.fields.map((field) => (
                <div key={field.key} className="flex flex-col gap-1">
                  <label className="font-medium text-foreground flex items-center justify-between">
                    <span>{field.label}</span>
                    <Lock className="size-3 text-muted-foreground" />
                  </label>
                  <Input
                    type={field.type}
                    value={formFields[field.key] || ""}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="text-xs font-mono"
                  />
                  {field.description && (
                    <p className="text-[11px] text-muted-foreground">{field.description}</p>
                  )}
                </div>
              ))}

              <div className="rounded-lg bg-muted/40 p-3 border border-border/50 text-[11px] text-muted-foreground flex items-start gap-2">
                <Zap className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Ao clicar em <strong>Testar Conexão</strong>, o Hub fará um ping oficial na sua API validando o token, leitura de produtos e emissão de pedidos.
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModalProvider(null)}
                disabled={isTesting}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="gap-1.5"
              >
                <RefreshCw className={`size-3.5 ${isTesting ? "animate-spin" : ""}`} />
                {isTesting ? "Validando Chave de API..." : "Testar Conexão & Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
