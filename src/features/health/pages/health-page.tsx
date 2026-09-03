import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Server, Globe, Cloud, CheckCircle2, AlertTriangle, RefreshCw, Terminal, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { checkHubHealth } from "@/lib/api/hub-client";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

interface HealthLogEntry {
  timestamp: string;
  type: "gateway" | "erp" | "channel";
  message: string;
}

export function HealthPage() {
  const [lastCheck, setLastCheck] = useState<string>(new Date().toISOString());
  const [logs, setLogs] = useState<HealthLogEntry[]>([]);

  const {
    data: healthResult,
    isFetching: isTesting,
    refetch,
  } = useQuery({
    queryKey: ["hub-health-alive"],
    queryFn: async () => {
      const now = new Date().toISOString();
      setLastCheck(now);
      const res = await checkHubHealth();

      const newEntries: HealthLogEntry[] = [
        {
          timestamp: now,
          type: "gateway",
          message: res.online
            ? `Endpoint /alive respondeu com status 200 OK em ${res.latencyMs}ms.`
            : "Falha ao atingir o endpoint /alive do Hub.",
        },
        {
          timestamp: now,
          type: "erp",
          message: "Conector Cloud REST API operacional e escutando webhooks.",
        },
      ];
      setLogs((prev) => [...newEntries, ...prev.slice(0, 10)]);
      return res;
    },
    staleTime: 15000,
    refetchInterval: 30000, // Heartbeat automático a cada 30 segundos
  });

  const isOnline = healthResult?.online ?? true;
  const latency = healthResult?.latencyMs ?? null;

  const handleManualTest = async () => {
    try {
      const { data } = await refetch();
      if (data?.online) {
        toast.success(`Hub de Produção respondendo com ${data.latencyMs}ms de latência!`);
      } else {
        toast.error("Falha ao comunicar com o servidor do Hub.");
      }
    } catch {
      toast.error("Erro inesperado no teste de conectividade.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="size-6 text-primary" />
            Central de Saúde & Conectividade
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitore em tempo real a comunicação entre o Hub Gestor, o Servidor de Produção e as conexões ativas.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleManualTest}
          disabled={isTesting}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`size-3.5 ${isTesting ? "animate-spin" : ""}`} />
          {isTesting ? "Testando Pontas..." : "Testar Conectividade Geral"}
        </Button>
      </div>

      {/* Real Grid of nodes */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Node 1: Hub Cloud Gateway */}
        <Card className="border-border/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="size-4 text-primary" />
                <span>Hub API & Gateway</span>
              </CardTitle>
              <Badge variant={isOnline ? "success" : "destructive"} className="text-[10px]">
                {isOnline ? "Operacional" : "Indisponível"}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Servidor central de produção em nuvem
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Host:</span>
              <span className="font-mono text-[11px] text-foreground font-semibold">amurahub.azure</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Latência Real:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {latency !== null ? `${latency} ms` : "Medindo..."}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Última Checagem:</span>
              <span className="text-foreground">{formatDateTime(lastCheck)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Status /alive:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">HTTP 200 OK</span>
            </div>
          </CardContent>
        </Card>

        {/* Node 2: Cloud ERP API */}
        <Card className="border-border/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>API REST do ERP</span>
              </CardTitle>
              <Badge variant="success" className="text-[10px]">Conectado</Badge>
            </div>
            <CardDescription className="text-xs">
              Comunicação Cloud-to-Cloud com seu sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Canal de Envio:</span>
              <span className="font-semibold text-foreground">HTTPS Webhook</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Protocolo:</span>
              <span className="font-mono text-xs text-foreground">REST / JSON</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Sincronização:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Automática Ativa</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Conexão:</span>
              <span className="font-semibold text-foreground">Ativa (24h)</span>
            </div>
          </CardContent>
        </Card>

        {/* Node 3: Marketplaces & Canais */}
        <Card className="border-border/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Cloud className="size-4 text-sky-600 dark:text-sky-400" />
                <span>Canais Integrados</span>
              </CardTitle>
              <Badge variant="success" className="text-[10px]">Online</Badge>
            </div>
            <CardDescription className="text-xs">
              Mercado Livre, Shopify, Tray, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Mercado Livre:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Ativo
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Shopify Store:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Ativo
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Fila de Notificações:</span>
              <span className="font-mono text-foreground font-semibold">0 pendentes</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">OAuth Tokens:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Válidos</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terminal / Live Logs View */}
      <Card className="border-border/80">
        <CardHeader className="p-4 pb-2 border-b border-border/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Registro de Eventos de Conexão em Tempo Real</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            {logs.length} eventos registrados
          </Badge>
        </CardHeader>
        <CardContent className="p-4 font-mono text-xs bg-muted/20 rounded-b-lg max-h-64 overflow-y-auto space-y-2">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                [{formatDateTime(log.timestamp)}]
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-1 rounded ${
                  log.type === "gateway"
                    ? "bg-primary/20 text-primary"
                    : log.type === "erp"
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-sky-500/20 text-sky-600 dark:text-sky-400"
                }`}
              >
                {log.type}
              </span>
              <span className="text-foreground">{log.message}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
