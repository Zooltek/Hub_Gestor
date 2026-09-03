import { useState, useMemo } from "react";
import { RefreshCw, Download, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
import type { IntegrationHealthStatus } from "@/lib/api/types";
import { exportSalesReportToCsv } from "@/lib/csv-export";
import { toast } from "sonner";

export function DashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<PeriodFilterOption>("7d");

  // React Query para pedidos
  const {
    data: orders = [],
    isLoading: isLoadingOrders,
    isFetching: isFetchingOrders,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["dashboard-orders", user?.customerId],
    queryFn: () => (user?.customerId ? fetchCustomerOrders(user.customerId) : Promise.resolve([])),
    enabled: Boolean(user?.customerId),
    staleTime: 30000,
  });

  // React Query para lotes
  const {
    data: batches = [],
    isLoading: isLoadingBatches,
    isFetching: isFetchingBatches,
    refetch: refetchBatches,
  } = useQuery({
    queryKey: ["dashboard-batches", user?.customerId],
    queryFn: () => (user?.customerId ? fetchProductBatches(user.customerId) : Promise.resolve([])),
    enabled: Boolean(user?.customerId),
    staleTime: 30000,
  });

  // React Query para catálogo
  const {
    data: catalog = [],
    isLoading: isLoadingCatalog,
    isFetching: isFetchingCatalog,
    refetch: refetchCatalog,
  } = useQuery({
    queryKey: ["dashboard-catalog", user?.customerId],
    queryFn: () => (user?.customerId ? fetchProductCatalog(user.customerId).catch(() => []) : Promise.resolve([])),
    enabled: Boolean(user?.customerId),
    staleTime: 60000,
  });

  // React Query para status de saúde da integração
  const { data: health } = useQuery({
    queryKey: ["dashboard-health", batches.length, orders.length],
    queryFn: () => fetchIntegrationHealth(batches, orders),
    enabled: Boolean(user?.customerId),
    staleTime: 30000,
  });

  const isRefreshing = isFetchingOrders || isFetchingBatches || isFetchingCatalog;

  const handleRefreshAll = async () => {
    try {
      await Promise.all([refetchOrders(), refetchBatches(), refetchCatalog()]);
      toast.success("Métricas atualizadas com sucesso!");
    } catch {
      toast.error("Erro ao sincronizar métricas da API de Produção.");
    }
  };

  const { kpis, topProducts, channels } = useMemo(() => {
    return calculateSalesMetrics(orders, catalog);
  }, [orders, catalog]);

  const evolutionData = useMemo(() => {
    return generateEvolutionPoints(orders, period);
  }, [orders, period]);

  const handleExportReport = () => {
    if (orders.length === 0 && topProducts.length === 0) {
      toast.warning("Não há pedidos ou produtos para exportar no período atual.");
      return;
    }
    try {
      exportSalesReportToCsv(orders, topProducts, user?.customerName || user?.displayName || "Amura Teste");
      toast.success("Relatório gerencial CSV exportado com sucesso!");
    } catch {
      toast.error("Falha ao exportar relatório.");
    }
  };

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
      lastBatchUtc: batches[0]?.startedAtUtc || "",
      totalBatches24h: batches.length,
      successBatches24h: batches.length,
      errorBatches24h: 0,
    },
    orderSync: {
      status: "healthy",
      lastOrderUtc: orders[0]?.createdAtUtc || "",
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
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="text-xs"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Atualizando..." : "Atualizar Dados"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="text-xs gap-1.5"
            onClick={handleExportReport}
          >
            <Download className="size-3.5" />
            Exportar Relatório (.csv)
          </Button>
        </div>
      </div>

      {/* Cards de Métricas Gerais */}
      <section className="flex flex-col gap-2">
        <SalesOverviewCards kpis={kpis} />
      </section>

      {/* Camada Principal: Evolução e Saúde */}
      <section className="grid gap-6 xl:grid-cols-12">
        <SalesEvolutionChart
          data={evolutionData}
          period={period}
          onPeriodChange={setPeriod}
        />

        <IntegrationHealthWidget health={health || defaultHealth} />
      </section>

      {/* Camada Secundária: Produtos e Canais */}
      <section className="grid gap-6 xl:grid-cols-12">
        <TopProductsWidget products={topProducts} />
        <ChannelDistributionChart channels={channels} />
      </section>
    </div>
  );
}
