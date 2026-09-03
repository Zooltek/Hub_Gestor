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
import { TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { SalesEvolutionPoint } from "@/lib/api/types";
import { useTheme } from "@/app/providers/theme-provider";

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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Dynamic colors for light and dark modes
  const axisColor = isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(15, 23, 42, 0.75)";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
  const tooltipBg = isDark ? "rgba(23, 23, 35, 0.95)" : "rgba(255, 255, 255, 0.98)";
  const tooltipBorder = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.12)";
  const tooltipTextColor = isDark ? "#ffffff" : "#0f172a";

  const totalCurrent = data.reduce(
    (acc, p) => acc + (metric === "revenue" ? p.currentRevenue : p.currentOrders),
    0
  );
  const totalPrevious = data.reduce(
    (acc, p) => acc + (metric === "revenue" ? p.previousRevenue : p.previousOrders),
    0
  );

  return (
    <Card className="col-span-full xl:col-span-7">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-4 text-primary" />
            <span>Evolução de Vendas</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Acompanhe o ritmo diário e compare com o período anterior
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
        {totalCurrent === 0 && totalPrevious === 0 ? (
          <div className="h-[320px] flex flex-col items-center justify-center gap-3 text-center">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <TrendingUp className="size-10 text-primary/40" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Nenhuma venda registrada neste período</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                O gráfico de evolução será preenchido automaticamente conforme novos pedidos forem integrados ao Hub.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-6 py-2 border-b border-border/50 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Período Atual:</span>
                <span className="font-semibold text-foreground">
                  {metric === "revenue" ? formatCurrency(totalCurrent) : formatNumber(totalCurrent)}
                </span>
              </div>
              {totalPrevious > 0 && (
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-muted-foreground/40" />
                  <span className="text-muted-foreground">Período Anterior:</span>
                  <span className="font-semibold text-foreground">
                    {metric === "revenue" ? formatCurrency(totalPrevious) : formatNumber(totalPrevious)}
                  </span>
                </div>
              )}
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
                      <stop offset="5%" stopColor={isDark ? "oklch(0.6 0.02 260)" : "oklch(0.7 0.02 260)"} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={isDark ? "oklch(0.6 0.02 260)" : "oklch(0.7 0.02 260)"} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke={axisColor}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val, index) => {
                      const point = data[index] || data.find((d) => d.date === val);
                      if (point?.label) return point.label;
                      if (!val) return "";
                      try {
                        const d = new Date(val);
                        if (!isNaN(d.getTime())) {
                          if (period === "hoje") {
                            return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                          }
                          return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
                        }
                      } catch {
                        // ignore
                      }
                      return String(val);
                    }}
                  />
                  <YAxis
                    stroke={axisColor}
                    tick={{ fill: axisColor, fontSize: 11 }}
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
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      color: tooltipTextColor,
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: isDark
                        ? "0 10px 25px -5px rgba(0,0,0,0.5)"
                        : "0 10px 25px -5px rgba(0,0,0,0.1)",
                    }}
                    itemStyle={{ color: tooltipTextColor }}
                    labelStyle={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(15,23,42,0.7)", fontWeight: 600 }}
                    formatter={(value: any, name: any) => {
                      const valNum = Number(value ?? 0);
                      const formatted = metric === "revenue" ? formatCurrency(valNum) : formatNumber(valNum);
                      const label = name === "currentRevenue" || name === "currentOrders" ? "Período Atual" : "Período Anterior";
                      return [formatted, label];
                    }}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      if (item?.label) return `Período: ${item.label}`;
                      return `Período: ${label}`;
                    }}
                  />
                  {totalPrevious > 0 && (
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
                  )}
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
