import { useState } from "react";
import { Activity, Monitor, Server, Cloud, CheckCircle, AlertTriangle, RefreshCw, Terminal, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_INTEGRATION_HEALTH } from "@/lib/api/mock-data";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export function HealthPage() {
  const [health, setHealth] = useState(MOCK_INTEGRATION_HEALTH);
  const [isTesting, setIsTesting] = useState(false);

  const runConnectivityTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      toast.success("Teste de conectividade concluído: Todas as pontas responderam com sucesso!");
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Central de Saúde e Conexões
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitore em tempo real a comunicação entre o Hub Desktop, Hub Admin/API e Marketplaces.
          </p>
        </div>

        <Button
          size="sm"
          onClick={runConnectivityTest}
          disabled={isTesting}
        >
          <Activity className={`size-3.5 mr-1.5 ${isTesting ? "animate-spin" : ""}`} />
          {isTesting ? "Testando Pontas..." : "Testar Conectividade Geral"}
        </Button>
      </div>

      {/* Grid of nodes */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Node 1: Hub Desktop */}
        <Card className="border-border/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="size-4 text-emerald-400" />
                <span>Hub Desktop</span>
              </CardTitle>
              <Badge variant="success" className="text-[10px]">Online</Badge>
            </div>
            <CardDescription className="text-xs">
              Agente local instalado no servidor do seu ERP
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Máquina:</span>
              <span className="font-semibold text-foreground">{health.desktop.machineName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Versão:</span>
              <span className="font-mono text-foreground">v{health.desktop.version}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Último Heartbeat:</span>
              <span className="text-foreground">{formatDateTime(health.desktop.lastPingUtc)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Fila de Envio:</span>
              <span className="font-bold text-emerald-400">0 pendências</span>
            </div>
          </CardContent>
        </Card>

        {/* Node 2: Hub API / Gateway */}
        <Card className="border-border/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="size-4 text-primary" />
                <span>Hub API & Gateway</span>
              </CardTitle>
              <Badge variant="success" className="text-[10px]">Operacional</Badge>
            </div>
            <CardDescription className="text-xs">
              Camada de roteamento seguro e alta disponibilidade
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Status do Gateway:</span>
              <span className="font-semibold text-emerald-400">YARP Ativo (Porta 5000)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Latência Média:</span>
              <span className="font-mono text-foreground">18ms</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Banco de Dados:</span>
              <span className="text-foreground">MongoDB Conectado</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Uptime 30d:</span>
              <span className="font-bold text-foreground">99.98%</span>
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
                <span>Canais / Marketplaces</span>
              </CardTitle>
              <Badge variant="success" className="text-[10px]">4 Conectados</Badge>
            </div>
            <CardDescription className="text-xs">
              Conexões de API oficiais autorizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Mercado Livre:</span>
              <span className="font-semibold text-emerald-400">Token Válido (OAuth)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Shopee:</span>
              <span className="font-semibold text-emerald-400">Conectado (Open API)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Amazon:</span>
              <span className="font-semibold text-emerald-400">SP-API Ativa</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Magalu:</span>
              <span className="font-semibold text-emerald-400">Integração Ativa</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Diagnostic Log Box */}
      <Card className="border-border/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal className="size-4 text-primary" />
            <span>Registro de Sincronizações Recentes</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Log operacional simplificado das últimas transações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-black/60 p-3 font-mono text-xs text-muted-foreground border border-border/60 divide-y divide-white/5 max-h-48 overflow-y-auto">
            <div className="py-1 text-emerald-400">
              [2026-08-30 12:30:15] [Desktop] Heartbeat recebido com sucesso de SRV-AMURA-ERP01.
            </div>
            <div className="py-1 text-sky-300">
              [2026-08-30 12:28:40] [Orders] Pedido MLB-2026-9817234 recebido e baixado pelo ERP.
            </div>
            <div className="py-1 text-purple-300">
              [2026-08-30 12:25:00] [Pipeline] Lote #LOTE-2026-089 (145 produtos) concluído com 100% sucesso.
            </div>
            <div className="py-1 text-amber-300">
              [2026-08-30 11:55:00] [Pipeline] Lote #LOTE-2026-088: 2 SKUs com aviso de validação (NCM/Preço).
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
