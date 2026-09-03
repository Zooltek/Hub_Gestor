import { DollarSign, ShoppingCart, Package, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { SalesOverviewKPIs } from "@/lib/api/types";

interface SalesOverviewCardsProps {
  kpis: SalesOverviewKPIs;
  periodLabel?: string;
}

export function SalesOverviewCards({ kpis, periodLabel = "vs. período anterior" }: SalesOverviewCardsProps) {
  const items = [
    {
      title: "Faturamento Total",
      value: formatCurrency(kpis.revenue.current),
      previousValue: formatCurrency(kpis.revenue.previous),
      change: kpis.revenue.changePercent,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Total de Pedidos",
      value: formatNumber(kpis.orders.current),
      previousValue: formatNumber(kpis.orders.previous),
      change: kpis.orders.changePercent,
      icon: ShoppingCart,
      color: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      title: "Itens Vendidos",
      value: formatNumber(kpis.itemsSold.current),
      previousValue: formatNumber(kpis.itemsSold.previous),
      change: kpis.itemsSold.changePercent,
      icon: Package,
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(kpis.averageTicket.current),
      previousValue: formatCurrency(kpis.averageTicket.previous),
      change: kpis.averageTicket.changePercent,
      icon: TrendingUp,
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const isPositive = item.change > 0;
        const isNegative = item.change < 0;

        return (
          <Card key={item.title} className="relative overflow-hidden border-border/70 hover:border-primary/40 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {item.title}
                </span>
                <div className={`rounded-lg p-2 border ${item.color}`}>
                  <Icon className="size-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {item.value}
                </span>
              </div>

              {item.previousValue !== formatCurrency(0) && item.previousValue !== formatNumber(0) && item.previousValue !== "0" && item.previousValue !== "R$ 0,00" && (
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={isPositive ? "success" : isNegative ? "destructive" : "secondary"}
                      className="px-1.5 py-0 text-[11px] font-medium"
                    >
                      {isPositive && <TrendingUp className="size-3 mr-0.5 inline" />}
                      {isNegative && <TrendingDown className="size-3 mr-0.5 inline" />}
                      {!isPositive && !isNegative && <Minus className="size-3 mr-0.5 inline" />}
                      {formatPercent(item.change)}
                    </Badge>
                    <span className="text-muted-foreground text-[11px]">{periodLabel}</span>
                  </div>
                  <span className="text-muted-foreground/70 text-[11px]">
                    Ant: {item.previousValue}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
