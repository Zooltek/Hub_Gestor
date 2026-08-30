import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { SalesEvolutionPoint } from "@/lib/api/types";

export type PeriodFilterOption = "hoje" | "7d" | "15d" | "30d" | "90d" | "ano";

interface SalesEvolutionChartProps {
  data: SalesEvolutionPoint[];
  period: PeriodFilterOption;
  onPeriodChange: (period: PeriodFilterOption) => void;
}

const PERIOD_BUTTONS: { id: PeriodFilterOption; label: string }[] = [
  { id: "hoje", label: "Hoje (24h)" },
  { id: "7d", label: "7 Dias" },
  { id: "15d", label: "15 Dias" },
  { id: "30d", label: "30 Dias" },
  { id: "90d", label: "90 Dias" },
  { id: "ano", label: "Ano (YTD)" },
];

export function SalesEvolutionChart({ data, period, onPeriodChange }: SalesEvolutionChartProps) {
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");

  const totalCurrent = data.reduce(
    (acc, p) => acc + (metric === "revenue" ? p.currentRevenue : p.currentOrders),
    0
  );
  const totalPrevious = data.reduce(
    (acc, p) => acc + (metric === "revenue" ? p.previousRevenue : p.previousOrders),
    0
  );

  return (
    <Card className="col-span-full xl:col-span-8">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <span>Evolução de Vendas</span>
            <span className="text-xs font-normal text-muted-foreground">
              (Histórico + Comparativo com Período Anterior)
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Acompanhe o ritmo diário e compare o desempenho de faturamento e pedidos
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Toggle */}
          <div className="inline-flex rounded-lg border border-border/80 p-0.5 bg-muted/40 text-xs">
            <button
              onClick={() => setMetric("revenue")}
              className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                metric === "revenue"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Faturamento (R$)
            </button>
            <button
              onClick={() => setMetric("orders")}
              className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                metric === "orders"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Qtd. Pedidos
            </button>
          </div>

          {/* Extended Period Filter Buttons */}
          <div className="inline-flex flex-wrap rounded-lg border border-border/80 p-0.5 bg-muted/40 text-xs gap-0.5">
            {PERIOD_BUTTONS.map((btn) => (
              <button
                key={btn.id}
                onClick={() => onPeriodChange(btn.id)}
                className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  period === btn.id
                    ? "bg-secondary text-secondary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-6 py-2 border-b border-border/50 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Período Atual:</span>
            <span className="font-semibold text-foreground">
              {metric === "revenue" ? formatCurrency(totalCurrent) : formatNumber(totalCurrent)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-muted-foreground/40" />
            <span className="text-muted-foreground">Período Anterior:</span>
            <span className="font-semibold text-foreground">
              {metric === "revenue" ? formatCurrency(totalPrevious) : formatNumber(totalPrevious)}
            </span>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="previousGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.6 0.02 260)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="oklch(0.6 0.02 260)" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.4)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) =>
                  metric === "revenue"
                    ? val >= 1000000
                      ? `R$${(val / 1000000).toFixed(1)}M`
                      : `R$${Math.round(val / 1000)}k`
                    : String(val)
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(23, 23, 35, 0.95)",
                  borderColor: "rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                }}
                formatter={(value: any, name: any) => {
                  const valNum = Number(value ?? 0);
                  const formatted = metric === "revenue" ? formatCurrency(valNum) : formatNumber(valNum);
                  const label = name === "currentRevenue" || name === "currentOrders" ? "Período Atual" : "Período Anterior";
                  return [formatted, label];
                }}
                labelFormatter={(label) => `Período: ${label}`}
              />
              <Area
                type="monotone"
                dataKey={metric === "revenue" ? "previousRevenue" : "previousOrders"}
                stroke="oklch(0.6 0.02 260)"
                strokeDasharray="4 4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#previousGradient)"
                name={metric === "revenue" ? "previousRevenue" : "previousOrders"}
              />
              <Area
                type="monotone"
                dataKey={metric === "revenue" ? "currentRevenue" : "currentOrders"}
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#currentGradient)"
                name={metric === "revenue" ? "currentRevenue" : "currentOrders"}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
