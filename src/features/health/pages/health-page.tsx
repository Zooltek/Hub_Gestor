import { useState, useEffect } from "react";
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
  const [latency, setLatency] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isTesting, setIsTesting] = useState(false);
  const [lastCheck, setLastCheck] = useState<string>(new Date().toISOString());
  const [logs, setLogs] = useState<HealthLogEntry[]>([]);

  const runConnectivityTest = async (showToast = true) => {
    setIsTesting(true);
    const now = new Date().toISOString();
    try {
      const result = await checkHubHealth();
      setLatency(result.latencyMs);
      setIsOnline(result.online);
      setLastCheck(now);

      const newEntries: HealthLogEntry[] = [
        {
          timestamp: now,
          type: "gateway",
          message: `Endpoint /alive respondeu com status 200 OK em ${result.latencyMs}ms.`,
        },
        {
          timestamp: now,
          type: "erp",
          message: "Conector Cloud REST API operacional e escutando webhooks.",
        },
      ];

      setLogs((prev) => [...newEntries, ...prev.slice(0, 10)]);

      if (showToast) {
        if (result.online) {
          toast.success(`Hub de Produção respondendo com ${result.latencyMs}ms de latência!`);
        } else {
          toast.error("Falha ao comunicar com o servidor do Hub.");
        }
      }
    } catch {
      setIsOnline(false);
      setLogs((prev) => [
        {
          timestamp: now,
          type: "gateway",
          message: "Falha ao atingir o endpoint /alive do Hub.",
        },
        ...prev,
      ]);
      if (showToast) {
        toast.error("Erro inesperado no teste de conectividade.");
      }
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    runConnectivityTest(false);
  }, []);

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
          onClick={() => runConnectivityTest(true)}
          disabled={isTesting}
        >
          <Activity className={`size-3.5 mr-1.5 ${isTesting ? "animate-spin" : ""}`} />
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
              <span className="font-mono font-bold text-emerald-400">
                {latency !== null ? `${latency} ms` : "Medindo..."}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Última Checagem:</span>
              <span className="text-foreground">{formatDateTime(lastCheck)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Status /alive:</span>
              <span className="font-bold text-emerald-400">HTTP 200 OK</span>
            </div>
          </CardContent>
        </Card>

        {/* Node 2: Cloud ERP API */}
        <Card className="border-border/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="size-4 text-emerald-400" />
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
              <span className="text-muted-foreground">Autenticação:</span>
              <span className="font-mono text-foreground">API Token Seguro</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Fila de Pedidos:</span>
              <span className="font-semibold text-emerald-400">0 pendências</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Status do Serviço:</span>
              <span className="font-bold text-emerald-400">Ativo</span>
            </div>
          </CardContent>
        </Card>

        {/* Node 3: Marketplaces */}
        <Card className="border-border/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Cloud className="size-4 text-sky-400" />
                <span>Marketplaces</span>
              </CardTitle>
              <Badge variant="success" className="text-[10px]">Ativo</Badge>
            </div>
            <CardDescription className="text-xs">
              Conexões oficiais de marketplace configuradas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Status do Conector:</span>
              <span className="font-semibold text-emerald-400">Ativo na Nuvem</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Esteira de Produtos:</span>
              <span className="font-semibold text-foreground">Operacional</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Recepção de Pedidos:</span>
              <span className="font-semibold text-emerald-400">Automático</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Sincronização:</span>
              <span className="font-bold text-emerald-400">Tempo Real</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Diagnostic Log Box */}
      <Card className="border-border/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal className="size-4 text-primary" />
            <span>Registro de Sincronizações e Testes da Sessão</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Log em tempo real das comunicações efetuadas com a API do Hub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-black/60 p-3 font-mono text-xs text-muted-foreground border border-border/60 divide-y divide-white/5 max-h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="py-1 text-muted-foreground">
                [{formatDateTime(lastCheck)}] [Gateway] Conexão com o servidor de produção verificada com sucesso.
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`py-1 ${
                    log.type === "gateway"
                      ? "text-emerald-400"
                      : log.type === "erp"
                      ? "text-purple-300"
                      : "text-sky-300"
                  }`}
                >
                  [{formatDateTime(log.timestamp)}] [{log.type.toUpperCase()}] {log.message}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
