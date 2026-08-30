import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ShoppingBag, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ChannelPerformance } from "@/lib/api/types";

interface ChannelDistributionChartProps {
  channels: ChannelPerformance[];
}

export function ChannelDistributionChart({ channels }: ChannelDistributionChartProps) {
  return (
    <Card className="col-span-full xl:col-span-5 border-border/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ShoppingBag className="size-4 text-primary" />
          <span>Distribuição por Canal / Marketplace</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Pergunta 4: Onde e quando suas vendas mais acontecem
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Best day and time info banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Calendar className="size-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Melhor Dia</p>
              <p className="font-semibold text-foreground">Sexta-feira (28%)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Clock className="size-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Horário de Pico</p>
              <p className="font-semibold text-foreground">14:00 às 17:30</p>
            </div>
          </div>
        </div>

        {/* Donut chart + Legend (Responsive Flex) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="h-[180px] w-[180px] shrink-0 mx-auto md:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channels}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="sharePercent"
                >
                  {channels.map((entry) => (
                    <Cell key={entry.channel} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(23, 23, 35, 0.95)",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% (${formatCurrency(item.payload.revenue)})`,
                    item.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Channels list with share bars */}
          <div className="flex flex-col gap-2 w-full">
            {channels.map((channel) => (
              <div key={channel.channel} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: channel.color }}
                    />
                    <span className="font-medium text-foreground">{channel.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono text-[11px]">
                      {formatCurrency(channel.revenue)}
                    </span>
                    <span className="font-semibold text-foreground text-[11px] w-10 text-right">
                      {channel.sharePercent}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${channel.sharePercent}%`,
                      backgroundColor: channel.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
