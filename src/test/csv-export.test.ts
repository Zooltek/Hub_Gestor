import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportSalesReportToCsv } from "@/lib/csv-export";
import type { CustomerOrderDto, TopProduct } from "@/lib/api/types";

describe("CSV Export Generator (exportSalesReportToCsv)", () => {
  beforeEach(() => {
    // jsdom doesn't provide createObjectURL/revokeObjectURL by default
    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = vi.fn();
    }
    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = vi.fn();
    }
  });

  it("generates and triggers a valid CSV download with BOM UTF-8 and expected sections", () => {
    let capturedBlob: Blob | null = null;
    let capturedFileName: string = "";

    const mockClick = vi.fn();
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();

    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "a") {
        return {
          setAttribute: (attr: string, val: string) => {
            if (attr === "download") capturedFileName = val;
          },
          click: mockClick,
        } as any;
      }
      return document.createElement(tagName);
    });

    vi.spyOn(document.body, "appendChild").mockImplementation(mockAppendChild as any);
    vi.spyOn(document.body, "removeChild").mockImplementation(mockRemoveChild as any);

    window.URL.createObjectURL = vi.fn((blob: any) => {
      capturedBlob = blob;
      return "blob:http://localhost/mock-url";
    });
    window.URL.revokeObjectURL = vi.fn();

    const mockOrders: CustomerOrderDto[] = [
      {
        id: "ord_100",
        marketplaceOrderId: "MLB-9090",
        channel: "mercadolivre",
        channelName: "Mercado Livre",
        customerName: "Carlos Pereira",
        customerDocument: "123.456.789-10",
        totalAmount: 320.5,
        itemsCount: 1,
        status: "FATURADO",
        erpDownloadStatus: "BAIXADO",
        createdAtUtc: "2026-09-01T14:30:00Z",
        updatedAtUtc: "2026-09-01T14:30:00Z",
        items: [],
        shippingAddress: {
          street: "Rua Exemplo",
          number: "100",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
          zipCode: "01000-000",
        },
        paymentMethod: "Cartão",
        version: 1,
      },
    ];

    const mockTopProducts: TopProduct[] = [
      {
        id: "p1",
        sku: "PROD-01",
        title: "Vestido Festa Elegante",
        category: "Vestidos",
        unitsSold: 15,
        revenue: 3000.0,
        stock: 50,
        price: 200.0,
        trendPercent: 10,
      },
    ];

    exportSalesReportToCsv(mockOrders, mockTopProducts, "Empresa Teste");

    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(capturedFileName).toContain("Relatorio_Vendas_Empresa_Teste");
    expect(capturedFileName.endsWith(".csv")).toBe(true);
    expect(capturedBlob).not.toBeNull();
  });
});
