export interface SalesOverviewKPIs {
  revenue: {
    current: number;
    previous: number;
    changePercent: number;
  };
  orders: {
    current: number;
    previous: number;
    changePercent: number;
  };
  itemsSold: {
    current: number;
    previous: number;
    changePercent: number;
  };
  averageTicket: {
    current: number;
    previous: number;
    changePercent: number;
  };
}

export interface SalesEvolutionPoint {
  date: string;
  label: string;
  currentRevenue: number;
  previousRevenue: number;
  currentOrders: number;
  previousOrders: number;
}

export interface ChannelPerformance {
  channel: string;
  name: string;
  revenue: number;
  orders: number;
  sharePercent: number;
  color: string;
}

export interface TopProduct {
  id: string;
  sku: string;
  title: string;
  category: string;
  unitsSold: number;
  revenue: number;
  stock: number;
  price: number;
  imageUrl?: string;
  trendPercent: number;
}

export interface IntegrationHealthStatus {
  desktop: {
    status: "online" | "offline" | "syncing" | "warning";
    lastPingUtc: string;
    version: string;
    machineName: string;
    pendingQueueCount: number;
  };
  productSync: {
    status: "healthy" | "degraded" | "error";
    lastBatchUtc: string;
    totalBatches24h: number;
    successBatches24h: number;
    errorBatches24h: number;
  };
  orderSync: {
    status: "healthy" | "degraded" | "error";
    lastOrderUtc: string;
    totalOrders24h: number;
    pendingErpDownload: number;
    failedIntegration: number;
  };
  alerts: Array<{
    id: string;
    severity: "critical" | "warning" | "info";
    title: string;
    description: string;
    timestampUtc: string;
    actionUrl?: string;
    actionLabel?: string;
  }>;
}

export interface OrderItemDto {
  id: string;
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerOrderDto {
  id: string;
  marketplaceOrderId: string;
  channel: string;
  channelName: string;
  customerName: string;
  customerDocument: string;
  totalAmount: number;
  itemsCount: number;
  status: "APROVADO" | "PENDENTE" | "FATURADO" | "ENTREGUE" | "CANCELADO";
  erpDownloadStatus: "PENDENTE" | "BAIXADO" | "ERRO";
  createdAtUtc: string;
  updatedAtUtc: string;
  items: OrderItemDto[];
  shippingAddress: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  version: number;
}

export interface ProductBatchDto {
  id: string;
  batchNumber: string;
  fileName: string;
  totalItems: number;
  processedItems: number;
  successItems: number;
  errorItems: number;
  status: "CONCLUIDO" | "PROCESSANDO" | "PENDENTE" | "ERRO";
  startedAtUtc: string;
  finishedAtUtc?: string;
  channelName: string;
  errorLog?: string[];
  version: number;
}

export interface CatalogItemDto {
  id: string;
  sku: string;
  title: string;
  category: string;
  price: number;
  promotionalPrice?: number;
  stock: number;
  channels: Array<{
    channel: string;
    status: "ATIVO" | "PAUSADO" | "ERRO";
    channelSku: string;
    lastSyncUtc: string;
  }>;
  version: number;
}
