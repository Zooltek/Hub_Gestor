import { describe, it, expect } from "vitest";
import { parseOrderFromApi } from "@/lib/api/modules/orders";

describe("Order Parsing (parseOrderFromApi)", () => {
  it("parses order with stringified orderData JSON", () => {
    const rawApiPayload = {
      id: "raw_order_123",
      orderData: JSON.stringify({
        Order: {
          Pedido: "MLB-998877",
          TotalPedido: "450.50",
          CodStatus: 7,
        },
        Customer: {
          Nome: "Maria da Silva",
          CPF_CNPJ: "123.456.789-00",
        },
        Itens: [
          {
            Sku: "VEST-AZUL-M",
            Descricao: "Vestido Floral Azul",
            Quantidade: 2,
            PrecoUnitario: "225.25",
            PrecoTotal: "450.50",
          },
        ],
      }),
      channelName: "Mercado Livre",
    };

    const parsed = parseOrderFromApi(rawApiPayload);

    expect(parsed.id).toBe("raw_order_123");
    expect(parsed.marketplaceOrderId).toBe("MLB-998877");
    expect(parsed.customerName).toBe("Maria da Silva");
    expect(parsed.customerDocument).toBe("123.456.789-00");
    expect(parsed.totalAmount).toBe(450.5);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].sku).toBe("VEST-AZUL-M");
    expect(parsed.items[0].title).toBe("Vestido Floral Azul");
    expect(parsed.items[0].quantity).toBe(2);
  });

  it("handles complex nested product object without rendering [object Object]", () => {
    const rawApiPayload = {
      id: "ord_nested_object",
      orderData: {
        order: { numero: "TRAY-5544" },
        cliente: { nome: "João Souza" },
        produtos: [
          {
            produto: {
              sku: "SAPATO-COURO-41",
              descricaoProduto: "Sapato Social Couro",
              cor: "Preto",
              tamanho: "41",
            },
            quantidade: "1",
            precoUnitario: "199.90",
          },
        ],
      },
      channelName: "Tray",
    };

    const parsed = parseOrderFromApi(rawApiPayload);

    expect(parsed.marketplaceOrderId).toBe("TRAY-5544");
    expect(parsed.customerName).toBe("João Souza");
    expect(parsed.items[0].sku).toBe("SAPATO-COURO-41");
    expect(parsed.items[0].title).toBe("Sapato Social Couro");
    expect(parsed.items[0].title).not.toContain("[object Object]");
    expect(parsed.items[0].color).toBe("Preto");
    expect(parsed.items[0].size).toBe("41");
  });

  it("extracts variation correctly when only color and size are present", () => {
    const rawApiPayload = {
      orderData: {
        Itens: [
          {
            sku: "CAMISA-BRANCA-G",
            Cor: "Branco",
            Tamanho: "G",
            Quantidade: 3,
            PrecoUnitario: 50,
          },
        ],
      },
    };

    const parsed = parseOrderFromApi(rawApiPayload);
    expect(parsed.items[0].variation).toBe("Branco - G");
    expect(parsed.items[0].totalPrice).toBe(150);
  });
});
