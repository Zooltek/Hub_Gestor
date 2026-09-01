import { useState, useEffect, useMemo } from "react";
import { RefreshCw, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SalesOverviewCards } from "../components/sales-overview-cards";
import { SalesEvolutionChart, type PeriodFilterOption } from "../components/sales-evolution-chart";
import { IntegrationHealthWidget } from "../components/integration-health-widget";
import { TopProductsWidget } from "../components/top-products-widget";
import { ChannelDistributionChart } from "../components/channel-distribution-chart";
import { useAuth } from "@/app/providers/auth-provider";
import {
  fetchCustomerOrders,
  fetchProductBatches,
  fetchProductCatalog,
  fetchIntegrationHealth,
  calculateSalesMetrics,
  generateEvolutionPoints,
} from "@/lib/api/hub-client";
import type {
  CustomerOrderDto,
  ProductBatchDto,
  CatalogItemDto,
  IntegrationHealthStatus,
} from "@/lib/api/types";
import { toast } from "sonner";

export function DashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<PeriodFilterOption>("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orders, setOrders] = useState<CustomerOrderDto[]>([]);
  const [batches, setBatches] = useState<ProductBatchDto[]>([]);
  const [catalog, setCatalog] = useState<CatalogItemDto[]>([]);
  const [health, setHealth] = useState<IntegrationHealthStatus | null>(null);

  const loadData = async (showToast = false) => {
    if (!user?.customerId) return;
    setIsRefreshing(true);
    try {
      const [fetchedOrders, fetchedBatches, fetchedCatalog] = await Promise.all([
        fetchCustomerOrders(user.customerId),
        fetchProductBatches(user.customerId),
        fetchProductCatalog(user.customerId).catch(() => []),
      ]);

      setOrders(fetchedOrders);
      setBatches(fetchedBatches);
      setCatalog(fetchedCatalog || []);

      const computedHealth = await fetchIntegrationHealth(fetchedBatches, fetchedOrders);
      setHealth(computedHealth);

      if (showToast) {
        toast.success("Dados do Hub de Produção atualizados com sucesso!");
      }
    } catch (error) {
      if (showToast) {
        toast.error("Erro ao atualizar métricas da API de Produção.");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.customerId]);

  const { kpis, topProducts, channels } = useMemo(() => {
    return calculateSalesMetrics(orders, catalog);
  }, [orders, catalog]);

  const evolutionData = useMemo(() => {
    return generateEvolutionPoints(orders, period);
  }, [orders, period]);

  const defaultHealth: IntegrationHealthStatus = {
    desktop: {
      status: "online",
      lastPingUtc: new Date().toISOString(),
      version: "Cloud API",
      machineName: "Hub Central Cloud",
      pendingQueueCount: 0,
    },
    productSync: {
      status: "healthy",
      lastBatchUtc: batches[0]?.startedAtUtc || new Date().toISOString(),
      totalBatches24h: batches.length,
      successBatches24h: batches.length,
      errorBatches24h: 0,
    },
    orderSync: {
      status: "healthy",
      lastOrderUtc: orders[0]?.createdAtUtc || new Date().toISOString(),
      totalOrders24h: orders.length,
      pendingErpDownload: 0,
      failedIntegration: 0,
    },
    alerts: [],
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dashboard Gerencial
            </h1>
            <Badge variant="outline" className="gap-1 border-primary/30 text-primary bg-primary/5 text-xs">
              <Sparkles className="size-3 text-primary" />
              Hub Produção Conectado
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visão consolidada em tempo real para <strong>{user?.customerName || "Amura Teste"}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="text-xs"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Atualizando..." : "Atualizar Dados"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => toast.info("Relatório gerencial exportado com dados da produção!")}
          >
            <Download className="size-3.5 mr-1.5" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Pergunta 1: Quanto estou vendendo? */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            1. Quanto estou vendendo?
          </h2>
        </div>
        <SalesOverviewCards kpis={kpis} />
      </section>

      {/* Camada Principal: Evolução (Pergunta 2) e Saúde (Pergunta 3) */}
      <section className="grid gap-6 xl:grid-cols-12">
        {/* Pergunta 2: Como minhas vendas estão evoluindo? */}
        <SalesEvolutionChart
          data={evolutionData}
          period={period}
          onPeriodChange={setPeriod}
        />

        {/* Pergunta 3: Está tudo funcionando? */}
        <IntegrationHealthWidget health={health || defaultHealth} />
      </section>

      {/* Camada Secundária (Pergunta 4): O que está se destacando? */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          4. O que está se destacando?
        </h2>
        <div className="grid gap-6 xl:grid-cols-12">
          <TopProductsWidget products={topProducts} />
          <ChannelDistributionChart channels={channels} />
        </div>
      </section>
    </div>
  );
}
