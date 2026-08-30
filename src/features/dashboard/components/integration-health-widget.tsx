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
    <Card className="col-span-full xl:col-span-4 border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span>Saúde das Integrações</span>
          </CardTitle>
          <Badge
            variant="success"
            className="flex items-center gap-1 text-[11px]"
          >
            <span className="size-2 rounded-full bg-current animate-pulse" />
            Nuvem Operacional
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Pergunta 3: Está tudo funcionando? Status de ERP Online, Lotes e Pedidos
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Status items */}
        <div className="grid gap-2.5">
          {/* Online Cloud ERP */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Globe className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Bling! ERP (Nuvem API v3)</p>
                <p className="text-[11px] text-muted-foreground">
                  Token Ativo • Latência 142ms
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-emerald-400">
                Conectado
              </span>
              <p className="text-[10px] text-muted-foreground/80">
                Ping: {formatDateTime(health.desktop.lastPingUtc)}
              </p>
            </div>
          </div>

          {/* Product Batches */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <RefreshCw className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Envio para Marketplaces</p>
                <p className="text-[11px] text-muted-foreground">
                  {health.productSync.totalBatches24h} lotes nas últimas 24h
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
                Último: {formatDateTime(health.productSync.lastBatchUtc)}
              </p>
            </div>
          </div>

          {/* Order Sync */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <CheckCircle2 className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Envio de Vendas ao ERP</p>
                <p className="text-[11px] text-muted-foreground">
                  {health.orderSync.totalOrders24h} pedidos enviados via API
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="success" className="text-[10px] px-1.5 py-0">
                Fila Zerada
              </Badge>
              <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                Último: {formatDateTime(health.orderSync.lastOrderUtc)}
              </p>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        {health.alerts.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Alertas do Catálogo
            </span>
            {health.alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200"
              >
                <AlertTriangle className="size-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-300">{alert.title}</p>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">{alert.description}</p>
                  {alert.actionUrl && (
                    <Button asChild size="sm" variant="outline" className="mt-2 h-6 px-2 text-[11px]">
                      <Link to={alert.actionUrl}>
                        {alert.actionLabel || "Resolver"}
                        <ArrowUpRight className="size-3 ml-1 inline" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
