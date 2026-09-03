import { Globe, RefreshCw, AlertTriangle, CheckCircle2, XCircle, ArrowUpRight, Plug, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import type { IntegrationHealthStatus } from "@/lib/api/types";

interface IntegrationHealthWidgetProps {
  health: IntegrationHealthStatus;
}

export function IntegrationHealthWidget({ health }: IntegrationHealthWidgetProps) {
  return (
    <Card className="col-span-full xl:col-span-5 border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span>Saúde das Integrações</span>
          </CardTitle>
          <Badge
            variant={health.desktop.status === "online" ? "success" : "destructive"}
            className="flex items-center gap-1 text-[11px]"
          >
            <span className="size-2 rounded-full bg-current animate-pulse" />
            {health.desktop.status === "online" ? "Nuvem Operacional" : "Desconectado"}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Status de ERP Online, Lotes e Pedidos em tempo real
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Status items */}
        <div className="grid gap-2.5">
          {/* Online Cloud ERP via API REST */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Globe className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">API REST Cloud (ERP Próprio)</p>
                <p className="text-[11px] text-muted-foreground">
                  Comunicação Direta HTTPS • Webhooks Ativos
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Conectado
              </span>
              <p className="text-[10px] text-muted-foreground/80">
                Status: Ativo
              </p>
            </div>
          </div>

          {/* Product Batches */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <RefreshCw className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Envio para Marketplaces</p>
                <p className="text-[11px] text-muted-foreground">
                  {health.productSync.totalBatches24h} lotes registrados
                </p>
              </div>
            </div>
            <div className="text-right">
              {health.productSync.errorBatches24h > 0 ? (
                <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                  {health.productSync.errorBatches24h} com alerta
                </Badge>
              ) : (
                <Badge variant="success" className="text-[10px] px-1.5 py-0">
                  100% Sucesso
                </Badge>
              )}
              <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                {health.productSync.lastBatchUtc ? `Último: ${formatDateTime(health.productSync.lastBatchUtc)}` : "Sem registros"}
              </p>
            </div>
          </div>

          {/* Order Sync */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Sincronização de Pedidos</p>
                <p className="text-[11px] text-muted-foreground">
                  {health.orderSync.totalOrders24h} pedidos sincronizados
                </p>
              </div>
            </div>
            <div className="text-right">
              {health.orderSync.pendingErpDownload > 0 ? (
                <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                  {health.orderSync.pendingErpDownload} pendente(s)
                </Badge>
              ) : (
                <Badge variant="success" className="text-[10px] px-1.5 py-0">
                  Operacional
                </Badge>
              )}
              <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                {health.orderSync.lastOrderUtc ? `Último: ${formatDateTime(health.orderSync.lastOrderUtc)}` : "Sem registros"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Link to Health Central */}
        <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
          <span className="text-muted-foreground">Gateway de Produção</span>
          <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-primary p-0 hover:bg-transparent">
            <Link to="/saude">
              Ver Central de Saúde
              <ArrowUpRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
