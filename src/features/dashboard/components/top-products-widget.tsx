import { Trophy, ArrowUpRight, TrendingUp, TrendingDown, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { TopProduct } from "@/lib/api/types";

interface TopProductsWidgetProps {
  products: TopProduct[];
}

export function TopProductsWidget({ products }: TopProductsWidgetProps) {
  const championProduct = products[0];

  return (
    <Card className="col-span-full xl:col-span-7 border-border/80">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="size-4 text-amber-400" />
            <span>Produtos Campeões de Venda</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Pergunta 4: O que está se destacando em faturamento e volume
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-xs text-primary">
          <Link to="/catalogo">
            Ver Catálogo
            <ArrowUpRight className="size-3.5 ml-1" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {/* Champion product highlight */}
        {championProduct && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-bold text-base border border-amber-500/30">
                1º
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning" className="text-[10px] px-1.5 py-0 uppercase">
                    Campeão Absoluto
                  </Badge>
                  <span className="text-[11px] text-muted-foreground font-mono">{championProduct.sku}</span>
                </div>
                <p className="text-sm font-semibold text-foreground mt-0.5 line-clamp-1">
                  {championProduct.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-left sm:text-right">
                <p className="text-xs text-muted-foreground">Faturamento</p>
                <p className="text-sm font-bold text-amber-300">
                  {formatCurrency(championProduct.revenue)}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-muted-foreground">Volume</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatNumber(championProduct.unitsSold)} un
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Other top products list */}
        <div className="divide-y divide-border/50">
          {products.slice(1).map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-between py-2.5 hover:bg-muted/30 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {index + 2}º
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {product.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {product.sku} • {product.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-right">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {formatCurrency(product.revenue)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatNumber(product.unitsSold)} un
                  </p>
                </div>
                <div className="w-14 text-right">
                  <Badge
                    variant={product.trendPercent >= 0 ? "success" : "destructive"}
                    className="text-[10px] px-1 py-0 font-normal"
                  >
                    {product.trendPercent >= 0 ? "+" : ""}
                    {product.trendPercent}%
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
