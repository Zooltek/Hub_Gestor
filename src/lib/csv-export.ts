import type { CustomerOrderDto, TopProduct } from "@/lib/api/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  if (stringValue.includes('"') || stringValue.includes(";") || stringValue.includes("\n") || stringValue.includes(",")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Gera e dispara o download de um relatório CSV completo com os dados reais de vendas e produtos.
 * Utiliza o separador ponto-e-vírgula (;) e BOM UTF-8 (\uFEFF) para compatibilidade nativa com Excel pt-BR.
 */
export function exportSalesReportToCsv(
  orders: CustomerOrderDto[],
  topProducts: TopProduct[],
  customerName: string = "Amura Teste"
) {
  const lines: string[] = [];

  // Cabeçalho institucional
  lines.push("HUB GESTOR - RELATÓRIO GERENCIAL DE VENDAS");
  lines.push(`Cliente;${escapeCsvCell(customerName)}`);
  lines.push(`Data de Extração;${escapeCsvCell(formatDateTime(new Date()))}`);
  lines.push(`Total de Pedidos;${orders.length}`);
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  lines.push(`Faturamento Consolidado;${escapeCsvCell(formatCurrency(totalRevenue))}`);
  lines.push(""); // Linha em branco

  // Seção 1: Top Produtos Campeões de Venda
  lines.push("--- PRODUTOS CAMPEÕES DE VENDA ---");
  lines.push("Posição;Título do Produto;SKU;Referência;Unidades Vendidas;Faturamento (R$);Preço Médio (R$)");

  topProducts.forEach((product, idx) => {
    lines.push(
      [
        idx + 1,
        escapeCsvCell(product.title),
        escapeCsvCell(product.sku),
        escapeCsvCell(product.reference || "-"),
        product.unitsSold,
        escapeCsvCell(product.revenue.toFixed(2).replace(".", ",")),
        escapeCsvCell(product.price.toFixed(2).replace(".", ",")),
      ].join(";")
    );
  });

  lines.push(""); // Linha em branco

  // Seção 2: Lista Detalhada de Pedidos
  lines.push("--- DETALHAMENTO DE PEDIDOS ---");
  lines.push("ID Hub;Pedido Marketplace;Canal;Data Pedido;Cliente;Documento;Status;Itens;Total (R$)");

  orders.forEach((order) => {
    lines.push(
      [
        escapeCsvCell(order.id),
        escapeCsvCell(order.marketplaceOrderId || order.orderId || "-"),
        escapeCsvCell(order.channelName || order.channel),
        escapeCsvCell(formatDateTime(order.createdAtUtc)),
        escapeCsvCell(order.customerName),
        escapeCsvCell(order.customerDocument || "-"),
        escapeCsvCell(order.status),
        order.itemsCount || order.items?.length || 0,
        escapeCsvCell((order.totalAmount || 0).toFixed(2).replace(".", ",")),
      ].join(";")
    );
  });

  // BOM UTF-8 para garantir abertura correta de acentuação no Excel
  const csvContent = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  const fileName = `Relatorio_Vendas_${customerName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
