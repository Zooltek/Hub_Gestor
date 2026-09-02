import { describe, it, expect } from "vitest";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import { calculateSalesMetrics, isPaidOrder } from "@/lib/api/modules/metrics";
import { deduplicateOrders } from "@/lib/api/modules/orders";
import type { CustomerOrderDto } from "@/lib/api/types";

describe("KPI Calculations & Formatting", () => {
  it("formats BRL currency correctly", () => {
    expect(formatCurrency(248650)).toContain("248.650");
    expect(formatCurrency(175.1)).toContain("175,10");
  });

  it("calculates percentage changes correctly", () => {
    expect(formatPercent(15.01)).toBe("+15,0%");
    expect(formatPercent(-3.2)).toBe("-3,2%");
  });

  it("formats large numbers correctly", () => {
    expect(formatNumber(1420)).toContain("1.420");
    expect(formatNumber(3120)).toContain("3.120");
  });

  it("calculates dynamic sales metrics from real orders list", () => {
    const mockOrders: CustomerOrderDto[] = [
      {
        id: "ord_1",
        marketplaceOrderId: "MLB-101",
        channel: "mercadolivre",
        channelName: "Mercado Livre",
        customerName: "Cliente 1",
        customerDocument: "111.222.333-44",
        totalAmount: 200.0,
        itemsCount: 2,
        status: "APROVADO",
        erpDownloadStatus: "BAIXADO",
        createdAtUtc: new Date().toISOString(),
        updatedAtUtc: new Date().toISOString(),
        items: [
          { id: "i1", sku: "SKU-A", title: "Produto A", quantity: 2, unitPrice: 100.0, totalPrice: 200.0 },
        ],
        shippingAddress: {
          street: "Rua 1",
          number: "10",
          neighborhood: "Bairro",
          city: "São Paulo",
          state: "SP",
          zipCode: "01000-000",
        },
        paymentMethod: "Mercado Pago",
        version: 1,
      },
      {
        id: "ord_2",
        marketplaceOrderId: "MLB-102",
        channel: "mercadolivre",
        channelName: "Mercado Livre",
        customerName: "Cliente 2",
        customerDocument: "555.666.777-88",
        totalAmount: 150.0,
        itemsCount: 1,
        status: "FATURADO",
        erpDownloadStatus: "BAIXADO",
        createdAtUtc: new Date().toISOString(),
        updatedAtUtc: new Date().toISOString(),
        items: [
          { id: "i2", sku: "SKU-B", title: "Produto B", quantity: 1, unitPrice: 150.0, totalPrice: 150.0 },
        ],
        shippingAddress: {
          street: "Rua 2",
          number: "20",
          neighborhood: "Bairro",
          city: "Rio de Janeiro",
          state: "RJ",
          zipCode: "20000-000",
        },
        paymentMethod: "Mercado Pago",
        version: 1,
      },
    ];

    const { kpis, topProducts, channels } = calculateSalesMetrics(mockOrders);

    expect(kpis.revenue.current).toBe(350.0);
    expect(kpis.orders.current).toBe(2);
    expect(kpis.averageTicket.current).toBe(175.0);
    expect(topProducts.length).toBe(2);
    expect(channels[0].revenue).toBe(350.0);
  });

  it("deduplicates orders with the same marketplaceOrderId", () => {
    const ordersWithDuplicates: CustomerOrderDto[] = [
      {
        id: "doc_1",
        marketplaceOrderId: "MLB-999",
        channel: "mercadolivre",
        channelName: "Mercado Livre",
        customerName: "Cliente Duplicado",
        customerDocument: "000.000.000-00",
        totalAmount: 500.0,
        itemsCount: 1,
        status: "PAGO",
        erpDownloadStatus: "BAIXADO",
        createdAtUtc: "2026-09-01T10:00:00Z",
        updatedAtUtc: "2026-09-01T10:00:00Z",
        items: [{ id: "i1", sku: "SKU-DUP", title: "Item Duplicado", quantity: 1, unitPrice: 500.0, totalPrice: 500.0 }],
        shippingAddress: { street: "", number: "", neighborhood: "", city: "", state: "", zipCode: "" },
        paymentMethod: "PIX",
        version: 1,
      },
      {
        id: "doc_2",
        marketplaceOrderId: "MLB-999", // Mesmo marketplaceOrderId
        channel: "mercadolivre",
        channelName: "Mercado Livre",
        customerName: "Cliente Duplicado",
        customerDocument: "000.000.000-00",
        totalAmount: 500.0,
        itemsCount: 1,
        status: "PAGO",
        erpDownloadStatus: "BAIXADO",
        createdAtUtc: "2026-09-01T10:00:00Z",
        updatedAtUtc: "2026-09-01T10:05:00Z", // Mais recente
        items: [{ id: "i1", sku: "SKU-DUP", title: "Item Duplicado", quantity: 1, unitPrice: 500.0, totalPrice: 500.0 }],
        shippingAddress: { street: "", number: "", neighborhood: "", city: "", state: "", zipCode: "" },
        paymentMethod: "PIX",
        version: 2,
      },
    ];

    const deduplicated = deduplicateOrders(ordersWithDuplicates);
    expect(deduplicated.length).toBe(1);

    const { kpis } = calculateSalesMetrics(ordersWithDuplicates);
    // Deve somar apenas uma vez R$ 500 (e não R$ 1.000)
    expect(kpis.revenue.current).toBe(500.0);
    expect(kpis.orders.current).toBe(1);
  });

  it("filters out status 5 (Pedido em analise), cancelled and unpaid orders from revenue", () => {
    const mixedOrders: CustomerOrderDto[] = [
      {
        id: "ord_paid",
        marketplaceOrderId: "ORD-PAID-01",
        channel: "mercadolivre",
        channelName: "Mercado Livre",
        customerName: "Cliente Pago",
        customerDocument: "",
        totalAmount: 300.0,
        itemsCount: 1,
        statusOrder: 3, // pagamento_recebido
        status: "Pagamento recebido",
        erpDownloadStatus: "BAIXADO",
        createdAtUtc: new Date().toISOString(),
        updatedAtUtc: new Date().toISOString(),
        paymentMethod: "Cartão",
        items: [{ id: "i1", sku: "SKU-PAID", title: "Item Pago", quantity: 1, unitPrice: 300.0, totalPrice: 300.0 }],
        shippingAddress: { street: "", number: "", neighborhood: "", city: "", state: "", zipCode: "" },
        version: 1,
      },
      {
        id: "ord_analise",
        marketplaceOrderId: "ORD-ANALISE-02",
        channel: "mercadolivre",
        channelName: "Mercado Livre",
        customerName: "Cliente Em Análise",
        customerDocument: "",
        totalAmount: 1200.0,
        itemsCount: 1,
        statusOrder: 5, // pedido_analise -> deve ser IGNORADO!
        status: "Pedido em análise",
        erpDownloadStatus: "BAIXADO",
        createdAtUtc: new Date().toISOString(),
        updatedAtUtc: new Date().toISOString(),
        paymentMethod: "Cartão",
        items: [{ id: "i2", sku: "SKU-ANALISE", title: "Item Analise", quantity: 1, unitPrice: 1200.0, totalPrice: 1200.0 }],
        shippingAddress: { street: "", number: "", neighborhood: "", city: "", state: "", zipCode: "" },
        version: 1,
      },
      {
        id: "ord_cancelled",
        marketplaceOrderId: "ORD-CANCEL-03",
        channel: "mercadolivre",
        channelName: "Mercado Livre",
        customerName: "Cliente Cancelado",
        customerDocument: "",
        totalAmount: 850.0,
        itemsCount: 1,
        statusOrder: 10, // pedido_cancelado -> deve ser IGNORADO!
        status: "Pedido cancelado",
        erpDownloadStatus: "BAIXADO",
        createdAtUtc: new Date().toISOString(),
        updatedAtUtc: new Date().toISOString(),
        paymentMethod: "Cartão",
        items: [{ id: "i3", sku: "SKU-CANCEL", title: "Item Cancelado", quantity: 1, unitPrice: 850.0, totalPrice: 850.0 }],
        shippingAddress: { street: "", number: "", neighborhood: "", city: "", state: "", zipCode: "" },
        version: 1,
      },
      {
        id: "ord_unpaid",
        marketplaceOrderId: "ORD-UNPAID-04",
        channel: "mercadolivre",
        channelName: "Mercado Livre",
        customerName: "Cliente Boleto Pendente",
        customerDocument: "",
        totalAmount: 400.0,
        itemsCount: 1,
        statusOrder: 2, // aguardando_pagamento -> deve ser IGNORADO!
        status: "Aguardando pagamento",
        erpDownloadStatus: "BAIXADO",
        createdAtUtc: new Date().toISOString(),
        updatedAtUtc: new Date().toISOString(),
        paymentMethod: "Boleto",
        items: [{ id: "i4", sku: "SKU-UNPAID", title: "Item Boleto", quantity: 1, unitPrice: 400.0, totalPrice: 400.0 }],
        shippingAddress: { street: "", number: "", neighborhood: "", city: "", state: "", zipCode: "" },
        version: 1,
      },
    ];

    expect(isPaidOrder(mixedOrders[0])).toBe(true);
    expect(isPaidOrder(mixedOrders[1])).toBe(false); // status 5
    expect(isPaidOrder(mixedOrders[2])).toBe(false); // status 10
    expect(isPaidOrder(mixedOrders[3])).toBe(false); // status 2

    const { kpis, topProducts } = calculateSalesMetrics(mixedOrders);

    // Deve computar SOMENTE o pedido pago de R$ 300,00!
    expect(kpis.revenue.current).toBe(300.0);
    expect(kpis.orders.current).toBe(1);
    expect(kpis.averageTicket.current).toBe(300.0);

    // E o Top Produto NÃO pode conter o produto cancelado ou em análise
    expect(topProducts.length).toBe(1);
    expect(topProducts[0].sku).toBe("SKU-PAID");
  });
});
