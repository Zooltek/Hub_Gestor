import { useState } from "react";
import { RefreshCw, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SalesOverviewCards } from "../components/sales-overview-cards";
import { SalesEvolutionChart, type PeriodFilterOption } from "../components/sales-evolution-chart";
import { IntegrationHealthWidget } from "../components/integration-health-widget";
import { TopProductsWidget } from "../components/top-products-widget";
import { ChannelDistributionChart } from "../components/channel-distribution-chart";
import {
  MOCK_EVOLUTION_HOJE,
  MOCK_EVOLUTION_7D,
  MOCK_EVOLUTION_15D,
  MOCK_EVOLUTION_30D,
  MOCK_EVOLUTION_90D,
  MOCK_EVOLUTION_ANO,
  MOCK_INTEGRATION_HEALTH,
} from "@/lib/api/mock-data";
import {
  AMURA_TESTE_KPIS,
  AMURA_TESTE_CHANNELS,
  AMURA_TESTE_TOP_PRODUCTS,
} from "@/lib/api/hub-client";
import { toast } from "sonner";

export function DashboardPage() {
  const [period, setPeriod] = useState<PeriodFilterOption>("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getEvolutionData = (p: PeriodFilterOption) => {
    switch (p) {
      case "hoje":
        return MOCK_EVOLUTION_HOJE;
      case "7d":
        return MOCK_EVOLUTION_7D;
      case "15d":
        return MOCK_EVOLUTION_15D;
      case "30d":
        return MOCK_EVOLUTION_30D;
      case "90d":
        return MOCK_EVOLUTION_90D;
      case "ano":
        return MOCK_EVOLUTION_ANO;
      default:
        return MOCK_EVOLUTION_7D;
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Métricas atualizadas com sucesso da API!");
    }, 600);
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
              Mercado Livre Conectado
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visão consolidada para o cliente <strong>Amura Teste</strong> integrado ao Mercado Livre.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
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
            onClick={() => toast.info("Relatório gerencial exportado!")}
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
        <SalesOverviewCards kpis={AMURA_TESTE_KPIS} />
      </section>

      {/* Camada Principal: Evolução (Pergunta 2) e Saúde (Pergunta 3) */}
      <section className="grid gap-6 xl:grid-cols-12">
        {/* Pergunta 2: Como minhas vendas estão evoluindo? */}
        <SalesEvolutionChart
          data={getEvolutionData(period)}
          period={period}
          onPeriodChange={setPeriod}
        />

        {/* Pergunta 3: Está tudo funcionando? */}
        <IntegrationHealthWidget health={MOCK_INTEGRATION_HEALTH} />
      </section>

      {/* Camada Secundária (Pergunta 4): O que está se destacando? */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          4. O que está se destacando?
        </h2>
        <div className="grid gap-6 xl:grid-cols-12">
          <TopProductsWidget products={AMURA_TESTE_TOP_PRODUCTS} />
          <ChannelDistributionChart channels={AMURA_TESTE_CHANNELS} />
        </div>
      </section>
    </div>
  );
}
