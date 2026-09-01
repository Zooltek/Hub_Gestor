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
  reference?: string;
  title: string;
  category: string;
  unitsSold: number;
  revenue: number;
  stock: number;
  price: number;
  topVariation?: string;
  topVariationUnits?: number;
  topVariationSku?: string;
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
  alerts?: Array<{
    id: string;
    severity: "critical" | "warning" | "info";
    title: string;
    description: string;
    timestampUtc: string;
    actionUrl?: string;
    actionLabel?: string;
  }>;
  actionItems?: Array<{
    id: string;
    type: "warning" | "error" | "info";
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
  reference?: string;
  title: string;
  variation?: string;
  color?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerOrderDto {
  id: string;
  marketplaceOrderId: string;
  orderId?: string;
  fileName?: string;
  integrationName?: string;
  channel: string;
  channelName: string;
  customerName: string;
  customerDocument: string;
  totalAmount: number;
  itemsCount: number;
  statusOrder?: number | string | null;
  importStatus?: string | null;
  status: string;
  erpDownloadStatus: string;
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
  rawJson?: string;
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
  received?: number;
  changed?: number;
  dispatched?: number;
  dispatchFailed?: number;
}

export interface ProductFieldDiffDto {
  field: string;
  oldValue: string;
  newValue: string;
  category?: string;
}

export interface ProductChangeDto {
  id: string;
  customerId: string;
  sku: string;
  reference: string;
  status: number;
  statusLabel: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  dispatchTarget: string;
  requiresReview: boolean;
  errorMessage?: string;
  rawJson?: any;
  diff?: ProductFieldDiffDto[];
  savedSnapshot?: any;
  incomingSnapshot?: any;
  variationsCount?: number;
  createdAtUtc: string;
}

export interface CatalogItemVariationDto {
  sku: string;
  variationName: string;
  color?: string;
  colorCode?: string;
  size?: string;
  barcode: string;
  stock: number;
  price?: number;
  costPrice?: number;
  images?: string[];
  rawAttributes?: Array<{ key: string; value: string }>;
}

export interface CatalogItemDto {
  id: string;
  sku: string;
  reference?: string;
  title: string;
  description?: string;
  category: string;
  brand?: string;
  manufacturerCode?: string;
  costPrice?: number;
  price: number;
  promotionalPrice?: number;
  stock: number;
  isActive?: boolean;
  dispatchTargets?: string[];
  images?: string[];
  variations?: CatalogItemVariationDto[];
  lastImportedAtUtc?: string;
  channels: Array<{
    channel: string;
    status: "ATIVO" | "PAUSADO" | "ERRO";
    channelSku: string;
    lastSyncUtc: string;
  }>;
  version: number;
  rawSnapshot?: any;
}
