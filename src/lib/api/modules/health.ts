import { http } from "../http";
import type { IntegrationHealthStatus, ProductBatchDto, CustomerOrderDto } from "../types";

/**
 * Health check geral da API do Hub
 */
export async function checkHubHealth(): Promise<{ online: boolean; latencyMs: number }> {
  const start = performance.now();
  try {
    await http.get("/alive", { timeout: 5000 });
    const latencyMs = Math.round(performance.now() - start);
    return { online: true, latencyMs };
  } catch {
    return { online: false, latencyMs: 0 };
  }
}

/**
 * Compila o status de saúde geral em tempo real
 */
export async function fetchIntegrationHealth(batches: ProductBatchDto[], orders: CustomerOrderDto[]): Promise<IntegrationHealthStatus> {
  const ping = await checkHubHealth();

  const totalBatches24h = batches.length;
  const errorBatches24h = batches.filter((b) => b.errorItems > 0 || b.status === "ERRO").length;
  const successBatches24h = totalBatches24h - errorBatches24h;

  const totalOrders24h = orders.length;
  const pendingErpDownload = orders.filter((o) => o.erpDownloadStatus === "PENDENTE").length;

  return {
    desktop: {
      status: ping.online ? "online" : "offline",
      lastPingUtc: new Date().toISOString(),
      version: "Cloud API",
      machineName: "Hub Central Cloud",
      pendingQueueCount: 0,
    },
    productSync: {
      status: errorBatches24h > 0 ? "degraded" : "healthy",
      lastBatchUtc: batches[0]?.startedAtUtc || new Date().toISOString(),
      totalBatches24h,
      successBatches24h,
      errorBatches24h,
    },
    orderSync: {
      status: pendingErpDownload > 0 ? "degraded" : "healthy",
      lastOrderUtc: orders[0]?.createdAtUtc || new Date().toISOString(),
      totalOrders24h,
      pendingErpDownload,
      failedIntegration: 0,
    },
    alerts: errorBatches24h > 0
      ? [
          {
            id: "al_1",
            severity: "warning",
            title: "Lote de produtos com pendências",
            description: `${errorBatches24h} lote(s) necessitam de atenção na esteira de validação.`,
            timestampUtc: new Date().toISOString(),
            actionUrl: "/lotes-produtos",
            actionLabel: "Ver Lotes",
          },
        ]
      : [],
  };
}
