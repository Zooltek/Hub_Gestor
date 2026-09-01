import { describe, it, expect } from "vitest";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import { calculateSalesMetrics } from "@/lib/api/hub-client";
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
});
