import type {
  SalesOverviewKPIs,
  SalesEvolutionPoint,
  ChannelPerformance,
  TopProduct,
  IntegrationHealthStatus,
  CustomerOrderDto,
  ProductBatchDto,
  CatalogItemDto,
} from "./types";

export const MOCK_SALES_KPIS: SalesOverviewKPIs = {
  revenue: {
    current: 248650.0,
    previous: 216200.0,
    changePercent: 15.01,
  },
  orders: {
    current: 1420,
    previous: 1290,
    changePercent: 10.08,
  },
  itemsSold: {
    current: 3120,
    previous: 2840,
    changePercent: 9.86,
  },
  averageTicket: {
    current: 175.1,
    previous: 167.6,
    changePercent: 4.47,
  },
};

export const MOCK_EVOLUTION_HOJE: SalesEvolutionPoint[] = [
  { date: "08:00", label: "08h", currentRevenue: 1850, previousRevenue: 1200, currentOrders: 11, previousOrders: 8 },
  { date: "10:00", label: "10h", currentRevenue: 4200, previousRevenue: 3400, currentOrders: 25, previousOrders: 20 },
  { date: "12:00", label: "12h", currentRevenue: 6800, previousRevenue: 5100, currentOrders: 39, previousOrders: 31 },
  { date: "14:00", label: "14h", currentRevenue: 11400, previousRevenue: 8900, currentOrders: 65, previousOrders: 52 },
  { date: "16:00", label: "16h", currentRevenue: 17200, previousRevenue: 13800, currentOrders: 98, previousOrders: 80 },
  { date: "18:00", label: "18h", currentRevenue: 21500, previousRevenue: 18200, currentOrders: 122, previousOrders: 106 },
  { date: "20:00", label: "20h", currentRevenue: 24350, previousRevenue: 19800, currentOrders: 140, previousOrders: 118 },
];

export const MOCK_EVOLUTION_7D: SalesEvolutionPoint[] = [
  { date: "24/08", label: "Segunda", currentRevenue: 32400, previousRevenue: 28900, currentOrders: 185, previousOrders: 170 },
  { date: "25/08", label: "Terça", currentRevenue: 36200, previousRevenue: 31000, currentOrders: 210, previousOrders: 180 },
  { date: "26/08", label: "Quarta", currentRevenue: 38900, previousRevenue: 34500, currentOrders: 225, previousOrders: 205 },
  { date: "27/08", label: "Quinta", currentRevenue: 41200, previousRevenue: 35800, currentOrders: 240, previousOrders: 215 },
  { date: "28/08", label: "Sexta", currentRevenue: 45800, previousRevenue: 39000, currentOrders: 260, previousOrders: 230 },
  { date: "29/08", label: "Sábado", currentRevenue: 29800, previousRevenue: 27200, currentOrders: 160, previousOrders: 150 },
  { date: "30/08", label: "Domingo", currentRevenue: 24350, previousRevenue: 19800, currentOrders: 140, previousOrders: 140 },
];

export const MOCK_EVOLUTION_15D: SalesEvolutionPoint[] = Array.from({ length: 15 }, (_, i) => {
  const day = i + 16;
  const currRev = Math.floor(22000 + Math.sin(i / 2) * 9000 + (day % 7 === 5 ? 12000 : 0));
  const prevRev = Math.floor(19000 + Math.sin(i / 2) * 7500);
  return {
    date: `${day.toString().padStart(2, "0")}/08`,
    label: `Dia ${day}`,
    currentRevenue: currRev,
    previousRevenue: prevRev,
    currentOrders: Math.floor(currRev / 175),
    previousOrders: Math.floor(prevRev / 168),
  };
});

export const MOCK_EVOLUTION_30D: SalesEvolutionPoint[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const currRev = Math.floor(18000 + Math.sin(i / 2) * 8000 + Math.random() * 6000 + (day > 20 ? 8000 : 0));
  const prevRev = Math.floor(16000 + Math.sin(i / 2) * 7000 + Math.random() * 5000);
  return {
    date: `${day.toString().padStart(2, "0")}/08`,
    label: `Dia ${day}`,
    currentRevenue: currRev,
    previousRevenue: prevRev,
    currentOrders: Math.floor(currRev / 175),
    previousOrders: Math.floor(prevRev / 168),
  };
});

export const MOCK_EVOLUTION_90D: SalesEvolutionPoint[] = [
  { date: "Semana 1", label: "Sem 1", currentRevenue: 198000, previousRevenue: 172000, currentOrders: 1120, previousOrders: 1010 },
  { date: "Semana 3", label: "Sem 3", currentRevenue: 215000, previousRevenue: 189000, currentOrders: 1240, previousOrders: 1100 },
  { date: "Semana 5", label: "Sem 5", currentRevenue: 232000, previousRevenue: 201000, currentOrders: 1310, previousOrders: 1180 },
  { date: "Semana 7", label: "Sem 7", currentRevenue: 248000, previousRevenue: 215000, currentOrders: 1420, previousOrders: 1250 },
  { date: "Semana 9", label: "Sem 9", currentRevenue: 265000, previousRevenue: 228000, currentOrders: 1510, previousOrders: 1320 },
  { date: "Semana 11", label: "Sem 11", currentRevenue: 282000, previousRevenue: 240000, currentOrders: 1610, previousOrders: 1390 },
];

export const MOCK_EVOLUTION_ANO: SalesEvolutionPoint[] = [
  { date: "Jan", label: "Janeiro", currentRevenue: 680000, previousRevenue: 540000, currentOrders: 3900, previousOrders: 3200 },
  { date: "Fev", label: "Fevereiro", currentRevenue: 720000, previousRevenue: 590000, currentOrders: 4100, previousOrders: 3500 },
  { date: "Mar", label: "Março", currentRevenue: 810000, previousRevenue: 680000, currentOrders: 4600, previousOrders: 3900 },
  { date: "Abr", label: "Abril", currentRevenue: 850000, previousRevenue: 710000, currentOrders: 4850, previousOrders: 4100 },
  { date: "Mai", label: "Maio", currentRevenue: 920000, previousRevenue: 790000, currentOrders: 5200, previousOrders: 4450 },
  { date: "Jun", label: "Junho", currentRevenue: 890000, previousRevenue: 760000, currentOrders: 5050, previousOrders: 4300 },
  { date: "Jul", label: "Julho", currentRevenue: 960000, previousRevenue: 810000, currentOrders: 5400, previousOrders: 4600 },
  { date: "Ago", label: "Agosto", currentRevenue: 1040000, previousRevenue: 860000, currentOrders: 5900, previousOrders: 4900 },
];

export const MOCK_CHANNELS: ChannelPerformance[] = [
  { channel: "mercadolivre", name: "Mercado Livre", revenue: 114380, orders: 650, sharePercent: 46.0, color: "#FFE600" },
  { channel: "shopee", name: "Shopee", revenue: 64650, orders: 420, sharePercent: 26.0, color: "#EE4D2D" },
  { channel: "amazon", name: "Amazon", revenue: 39780, orders: 190, sharePercent: 16.0, color: "#FF9900" },
  { channel: "magalu", name: "Magalu", revenue: 19890, orders: 110, sharePercent: 8.0, color: "#0086FF" },
  { channel: "outros", name: "Outros Canais", revenue: 9950, orders: 50, sharePercent: 4.0, color: "#8B5CF6" },
];

export const MOCK_TOP_PRODUCTS: TopProduct[] = [
  {
    id: "prod_1",
    sku: "KIT-FERR-001",
    title: "Kit Ferramentas Profissional 128 Peças Aço Cromo",
    category: "Ferramentas",
    unitsSold: 284,
    revenue: 42316.0,
    stock: 85,
    price: 149.0,
    trendPercent: 22.4,
  },
  {
    id: "prod_2",
    sku: "FURAD-IMP-750W",
    title: "Furadeira de Impacto 750W Reversível 1/2 Pol. 220V",
    category: "Ferramentas Elétricas",
    unitsSold: 215,
    revenue: 38485.0,
    stock: 42,
    price: 179.0,
    trendPercent: 14.8,
  },
  {
    id: "prod_3",
    sku: "PARAFUS-12V-BIV",
    title: "Parafusadeira e Furadeira Bateria 12V Bivolt com Maleta",
    category: "Ferramentas Elétricas",
    unitsSold: 198,
    revenue: 35442.0,
    stock: 120,
    price: 179.0,
    trendPercent: 18.5,
  },
  {
    id: "prod_4",
    sku: "DISCO-DIAM-110",
    title: "Disco de Corte Diamantado Turbo Porcelanato 110mm",
    category: "Acessórios",
    unitsSold: 412,
    revenue: 16438.8,
    stock: 450,
    price: 39.9,
    trendPercent: -3.2,
  },
  {
    id: "prod_5",
    sku: "TRENA-LASER-40M",
    title: "Trena a Laser Digital Profissional 40 Metros com Nível",
    category: "Medição",
    unitsSold: 110,
    revenue: 14190.0,
    stock: 35,
    price: 129.0,
    trendPercent: 8.9,
  },
];

export const MOCK_INTEGRATION_HEALTH: IntegrationHealthStatus = {
  desktop: {
    status: "online",
    lastPingUtc: new Date(Date.now() - 45000).toISOString(),
    version: "2.19.0",
    machineName: "API-REST-CLOUD",
    pendingQueueCount: 0,
  },
  productSync: {
    status: "healthy",
    lastBatchUtc: new Date(Date.now() - 15 * 60000).toISOString(),
    totalBatches24h: 38,
    successBatches24h: 37,
    errorBatches24h: 1,
  },
  orderSync: {
    status: "healthy",
    lastOrderUtc: new Date(Date.now() - 4 * 60000).toISOString(),
    totalOrders24h: 215,
    pendingErpDownload: 0,
    failedIntegration: 0,
  },
  alerts: [
    {
      id: "alt_1",
      severity: "warning",
      title: "Lote de produtos #LOTE-2026-088 com 2 SKUs com aviso",
      description: "SKU 'TRENA-LASER-40M' está sem NCM preenchido no ERP para a Shopee.",
      timestampUtc: new Date(Date.now() - 35 * 60000).toISOString(),
      actionUrl: "/lotes-produtos",
      actionLabel: "Ver Lote",
    },
    {
      id: "alt_2",
      severity: "info",
      title: "Sincronização Mercado Livre concluída",
      description: "Catálogo de 1.450 produtos atualizado com sucesso.",
      timestampUtc: new Date(Date.now() - 120 * 60000).toISOString(),
    },
  ],
};

export const MOCK_ORDERS: CustomerOrderDto[] = [
  {
    id: "ord_1001",
    marketplaceOrderId: "MLB-2026-9817234",
    channel: "mercadolivre",
    channelName: "Mercado Livre",
    customerName: "Rafael Albuquerque Silveira",
    customerDocument: "123.456.789-00",
    totalAmount: 328.0,
    itemsCount: 2,
    status: "APROVADO",
    erpDownloadStatus: "BAIXADO",
    createdAtUtc: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAtUtc: new Date(Date.now() - 10 * 60000).toISOString(),
    items: [
      { id: "i1", sku: "KIT-FERR-001", title: "Kit Ferramentas Profissional 128 Peças", quantity: 1, unitPrice: 149.0, totalPrice: 149.0 },
      { id: "i2", sku: "FURAD-IMP-750W", title: "Furadeira de Impacto 750W Reversível", quantity: 1, unitPrice: 179.0, totalPrice: 179.0 },
    ],
    shippingAddress: {
      street: "Av. Paulista",
      number: "1578",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-200",
    },
    paymentMethod: "Cartão de Crédito",
    version: 1,
  },
  {
    id: "ord_1002",
    marketplaceOrderId: "SHP-260830-44910",
    channel: "shopee",
    channelName: "Shopee",
    customerName: "Mariana Souza Gomes",
    customerDocument: "987.654.321-11",
    totalAmount: 179.0,
    itemsCount: 1,
    status: "APROVADO",
    erpDownloadStatus: "PENDENTE",
    createdAtUtc: new Date(Date.now() - 32 * 60000).toISOString(),
    updatedAtUtc: new Date(Date.now() - 30 * 60000).toISOString(),
    items: [
      { id: "i3", sku: "PARAFUS-12V-BIV", title: "Parafusadeira e Furadeira Bateria 12V Bivolt", quantity: 1, unitPrice: 179.0, totalPrice: 179.0 },
    ],
    shippingAddress: {
      street: "Rua das Flores",
      number: "450",
      neighborhood: "Centro",
      city: "Curitiba",
      state: "PR",
      zipCode: "80010-000",
    },
    paymentMethod: "Pix",
    version: 1,
  },
  {
    id: "ord_1003",
    marketplaceOrderId: "AMZ-702-9918231-1029",
    channel: "amazon",
    channelName: "Amazon",
    customerName: "Lucas Mendes Oliveira",
    customerDocument: "456.789.012-33",
    totalAmount: 79.8,
    itemsCount: 2,
    status: "FATURADO",
    erpDownloadStatus: "BAIXADO",
    createdAtUtc: new Date(Date.now() - 90 * 60000).toISOString(),
    updatedAtUtc: new Date(Date.now() - 45 * 60000).toISOString(),
    items: [
      { id: "i4", sku: "DISCO-DIAM-110", title: "Disco de Corte Diamantado Turbo 110mm", quantity: 2, unitPrice: 39.9, totalPrice: 79.8 },
    ],
    shippingAddress: {
      street: "Rua do Catete",
      number: "120",
      neighborhood: "Catete",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "22220-000",
    },
    paymentMethod: "Cartão de Crédito",
    version: 1,
  },
  {
    id: "ord_1004",
    marketplaceOrderId: "MGL-99812-2026",
    channel: "magalu",
    channelName: "Magalu",
    customerName: "Juliana Castro Ribeiro",
    customerDocument: "321.654.987-44",
    totalAmount: 149.0,
    itemsCount: 1,
    status: "ENTREGUE",
    erpDownloadStatus: "BAIXADO",
    createdAtUtc: new Date(Date.now() - 360 * 60000).toISOString(),
    updatedAtUtc: new Date(Date.now() - 180 * 60000).toISOString(),
    items: [
      { id: "i5", sku: "KIT-FERR-001", title: "Kit Ferramentas Profissional 128 Peças", quantity: 1, unitPrice: 149.0, totalPrice: 149.0 },
    ],
    shippingAddress: {
      street: "Av. Afonso Pena",
      number: "800",
      neighborhood: "Centro",
      city: "Belo Horizonte",
      state: "MG",
      zipCode: "30130-003",
    },
    paymentMethod: "Boleto",
    version: 1,
  },
  {
    id: "ord_1005",
    marketplaceOrderId: "MLB-2026-9816001",
    channel: "mercadolivre",
    channelName: "Mercado Livre",
    customerName: "Eduardo Freitas",
    customerDocument: "555.444.333-22",
    totalAmount: 129.0,
    itemsCount: 1,
    status: "CANCELADO",
    erpDownloadStatus: "BAIXADO",
    createdAtUtc: new Date(Date.now() - 500 * 60000).toISOString(),
    updatedAtUtc: new Date(Date.now() - 480 * 60000).toISOString(),
    items: [
      { id: "i6", sku: "TRENA-LASER-40M", title: "Trena a Laser Digital Profissional 40 Metros", quantity: 1, unitPrice: 129.0, totalPrice: 129.0 },
    ],
    shippingAddress: {
      street: "Rua 15 de Novembro",
      number: "300",
      neighborhood: "Centro",
      city: "Joinville",
      state: "SC",
      zipCode: "89201-601",
    },
    paymentMethod: "Cartão de Crédito",
    version: 1,
  },
];

export const MOCK_PRODUCT_BATCHES: ProductBatchDto[] = [
  {
    id: "batch_101",
    batchNumber: "LOTE-2026-089",
    fileName: "produtos_sinc_20260830_1200.json",
    totalItems: 145,
    processedItems: 145,
    successItems: 145,
    errorItems: 0,
    status: "CONCLUIDO",
    startedAtUtc: new Date(Date.now() - 25 * 60000).toISOString(),
    finishedAtUtc: new Date(Date.now() - 24 * 60000).toISOString(),
    channelName: "Mercado Livre",
    version: 1,
  },
  {
    id: "batch_102",
    batchNumber: "LOTE-2026-088",
    fileName: "produtos_sinc_20260830_1130.json",
    totalItems: 80,
    processedItems: 80,
    successItems: 78,
    errorItems: 2,
    status: "CONCLUIDO",
    startedAtUtc: new Date(Date.now() - 55 * 60000).toISOString(),
    finishedAtUtc: new Date(Date.now() - 54 * 60000).toISOString(),
    channelName: "Shopee",
    errorLog: [
      "SKU 'TRENA-LASER-40M': Código NCM ausente na tabela de tributação.",
      "SKU 'DISCO-DIAM-110': Preço promocional deve ser menor que o preço de tabela.",
    ],
    version: 1,
  },
  {
    id: "batch_103",
    batchNumber: "LOTE-2026-087",
    fileName: "produtos_sinc_20260830_0900.json",
    totalItems: 250,
    processedItems: 250,
    successItems: 250,
    errorItems: 0,
    status: "CONCLUIDO",
    startedAtUtc: new Date(Date.now() - 200 * 60000).toISOString(),
    finishedAtUtc: new Date(Date.now() - 198 * 60000).toISOString(),
    channelName: "Amazon",
    version: 1,
  },
  {
    id: "batch_104",
    batchNumber: "LOTE-2026-086",
    fileName: "produtos_sinc_20260829_1800.json",
    totalItems: 310,
    processedItems: 310,
    successItems: 310,
    errorItems: 0,
    status: "CONCLUIDO",
    startedAtUtc: new Date(Date.now() - 1100 * 60000).toISOString(),
    finishedAtUtc: new Date(Date.now() - 1097 * 60000).toISOString(),
    channelName: "Magalu",
    version: 1,
  },
];

export const MOCK_CATALOG: CatalogItemDto[] = [
  {
    id: "cat_1",
    sku: "KIT-FERR-001",
    title: "Kit Ferramentas Profissional 128 Peças Aço Cromo",
    category: "Ferramentas Manuais",
    price: 149.0,
    promotionalPrice: 139.9,
    stock: 85,
    channels: [
      { channel: "Mercado Livre", status: "ATIVO", channelSku: "MLB-10029312", lastSyncUtc: new Date(Date.now() - 25 * 60000).toISOString() },
      { channel: "Shopee", status: "ATIVO", channelSku: "SHP-992182", lastSyncUtc: new Date(Date.now() - 55 * 60000).toISOString() },
      { channel: "Amazon", status: "ATIVO", channelSku: "B091823XYZ", lastSyncUtc: new Date(Date.now() - 200 * 60000).toISOString() },
    ],
    version: 1,
  },
  {
    id: "cat_2",
    sku: "FURAD-IMP-750W",
    title: "Furadeira de Impacto 750W Reversível 1/2 Pol. 220V",
    category: "Ferramentas Elétricas",
    price: 179.0,
    stock: 42,
    channels: [
      { channel: "Mercado Livre", status: "ATIVO", channelSku: "MLB-10029313", lastSyncUtc: new Date(Date.now() - 25 * 60000).toISOString() },
      { channel: "Shopee", status: "ATIVO", channelSku: "SHP-992183", lastSyncUtc: new Date(Date.now() - 55 * 60000).toISOString() },
      { channel: "Amazon", status: "ATIVO", channelSku: "B091823XYW", lastSyncUtc: new Date(Date.now() - 200 * 60000).toISOString() },
    ],
    version: 1,
  },
  {
    id: "cat_3",
    sku: "PARAFUS-12V-BIV",
    title: "Parafusadeira e Furadeira Bateria 12V Bivolt com Maleta",
    category: "Ferramentas Elétricas",
    price: 179.0,
    stock: 120,
    channels: [
      { channel: "Mercado Livre", status: "ATIVO", channelSku: "MLB-10029314", lastSyncUtc: new Date(Date.now() - 25 * 60000).toISOString() },
      { channel: "Shopee", status: "ATIVO", channelSku: "SHP-992184", lastSyncUtc: new Date(Date.now() - 55 * 60000).toISOString() },
    ],
    version: 1,
  },
  {
    id: "cat_4",
    sku: "DISCO-DIAM-110",
    title: "Disco de Corte Diamantado Turbo Porcelanato 110mm",
    category: "Acessórios",
    price: 39.9,
    stock: 450,
    channels: [
      { channel: "Mercado Livre", status: "ATIVO", channelSku: "MLB-10029315", lastSyncUtc: new Date(Date.now() - 25 * 60000).toISOString() },
      { channel: "Shopee", status: "ERRO", channelSku: "SHP-992185", lastSyncUtc: new Date(Date.now() - 55 * 60000).toISOString() },
      { channel: "Magalu", status: "ATIVO", channelSku: "MGL-338291", lastSyncUtc: new Date(Date.now() - 1100 * 60000).toISOString() },
    ],
    version: 1,
  },
  {
    id: "cat_5",
    sku: "TRENA-LASER-40M",
    title: "Trena a Laser Digital Profissional 40 Metros com Nível",
    category: "Medição",
    price: 129.0,
    stock: 35,
    channels: [
      { channel: "Mercado Livre", status: "ATIVO", channelSku: "MLB-10029316", lastSyncUtc: new Date(Date.now() - 25 * 60000).toISOString() },
      { channel: "Shopee", status: "ERRO", channelSku: "SHP-992186", lastSyncUtc: new Date(Date.now() - 55 * 60000).toISOString() },
      { channel: "Amazon", status: "ATIVO", channelSku: "B091823XYK", lastSyncUtc: new Date(Date.now() - 200 * 60000).toISOString() },
    ],
    version: 1,
  },
];
