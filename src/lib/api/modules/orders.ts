import { http, toErrorMessage } from "../http";
import { logger } from "../../logger";
import { getOrderBackendStatusLabel, getOrderImportStatusLabel } from "../../status";
import type { CustomerOrderDto } from "../types";

/**
 * Consulta de Pedidos Reais do Hub de Produção
 */
export async function fetchCustomerOrders(customerId: string): Promise<CustomerOrderDto[]> {
  try {
    const { data } = await http.get(`/api/admin/orders/${encodeURIComponent(customerId)}/get-json`);
    if (Array.isArray(data)) {
      return data.map((o: any) => parseOrderFromApi(o));
    }
  } catch (error) {
    logger.warn("Falha ao buscar pedidos em /api/admin/orders, tentando rota /api/order/get-json:", toErrorMessage(error));
    try {
      const { data } = await http.get("/api/order/get-json");
      if (Array.isArray(data)) {
        return data.map((o: any) => parseOrderFromApi(o));
      }
    } catch (fallbackError) {
      logger.error("Erro ao buscar pedidos na API de produção:", toErrorMessage(fallbackError));
    }
  }

  return [];
}

/**
 * Normaliza o payload de pedidos vindo do MongoDB/API do Hub
 */
export function parseOrderFromApi(raw: any): CustomerOrderDto {
  let orderDataObj: any = null;
  if (raw.orderData && typeof raw.orderData === "string") {
    try {
      orderDataObj = JSON.parse(raw.orderData);
    } catch {
      // ignore
    }
  } else if (typeof raw.orderData === "object" && raw.orderData) {
    orderDataObj = raw.orderData;
  }

  const orderSection =
    orderDataObj?.Order ||
    orderDataObj?.order ||
    orderDataObj?.pedido ||
    orderDataObj?.Pedido ||
    orderDataObj?.dadosPedido ||
    {};

  const customerSection =
    orderDataObj?.Customer ||
    orderDataObj?.customer ||
    orderDataObj?.cliente ||
    orderDataObj?.Cliente ||
    {};

  const shippingSection =
    orderDataObj?.ShippingAddress ||
    orderDataObj?.shippingAddress ||
    orderDataObj?.entrega ||
    orderDataObj?.Entrega ||
    orderDataObj?.enderecoEntrega ||
    {};

  const paymentsSection =
    (Array.isArray(orderDataObj?.Payments) && orderDataObj.Payments) ||
    (Array.isArray(orderDataObj?.payments) && orderDataObj.payments) ||
    (Array.isArray(orderDataObj?.pagamentos) && orderDataObj.pagamentos) ||
    [];

  const itemsSection =
    (Array.isArray(orderDataObj?.Itens) && orderDataObj.Itens) ||
    (Array.isArray(orderDataObj?.itens) && orderDataObj.itens) ||
    (Array.isArray(orderDataObj?.items) && orderDataObj.items) ||
    (Array.isArray(orderDataObj?.Items) && orderDataObj.Items) ||
    (Array.isArray(orderDataObj?.Produtos) && orderDataObj.Produtos) ||
    (Array.isArray(orderDataObj?.produtos) && orderDataObj.produtos) ||
    (Array.isArray(orderDataObj?.orderItems) && orderDataObj.orderItems) ||
    (Array.isArray(orderDataObj?.orderItens) && orderDataObj.orderItens) ||
    (Array.isArray(raw?.items) && raw.items) ||
    (Array.isArray(raw?.itens) && raw.itens) ||
    (Array.isArray(orderDataObj) && orderDataObj) ||
    [];

  const marketplaceOrderId =
    orderSection.Pedido ||
    orderSection.pedido ||
    orderSection.numero ||
    raw.orderId ||
    raw.marketplaceOrderId ||
    (raw.fileName ? raw.fileName.split("_")[0] : `ORD-${raw.id?.slice(0, 8) || "100"}`);

  const items = itemsSection.map((item: any, idx: number) => {
    const rawProd = typeof item.produto === "object" && item.produto !== null ? item.produto : (typeof item.Produto === "object" && item.Produto !== null ? item.Produto : null);
    const rawProduct = typeof item.product === "object" && item.product !== null ? item.product : (typeof item.Product === "object" && item.Product !== null ? item.Product : null);
    const rawItem = typeof item.item === "object" && item.item !== null ? item.item : (typeof item.Item === "object" && item.Item !== null ? item.Item : null);

    const extractStr = (val: any): string => {
      if (typeof val === "string" && val.trim() && val.trim() !== "[object Object]") {
        return val.trim();
      }
      if (typeof val === "number" && !isNaN(val)) {
        return String(val);
      }
      return "";
    };

    const sku =
      extractStr(item.Sku || item.sku || item.SKU || item.CodigoBarras || item.codigoBarras || item.Codigo || item.codigo || item.Referencia || item.referencia) ||
      extractStr(rawProd?.sku || rawProd?.Sku || rawProd?.codigo || rawProd?.Codigo || rawProd?.codigoBarras || rawProd?.CodigoBarras || rawProd?.referencia || rawProd?.Referencia) ||
      extractStr(rawProduct?.sku || rawProduct?.Sku || rawProduct?.code || rawProduct?.id) ||
      extractStr(rawItem?.sku || rawItem?.codigo) ||
      `SKU-${idx + 1}`;

    const reference =
      extractStr(item.Referencia || item.referencia || item.CodProduto || item.codProduto || item.Codigo || item.codigo) ||
      extractStr(rawProd?.referencia || rawProd?.Referencia || rawProd?.codigo || rawProd?.Codigo || rawProd?.codProduto || rawProd?.CodProduto) ||
      extractStr(rawProduct?.reference || rawProduct?.Reference || rawProduct?.code) ||
      sku;

    const color = extractStr(
      item.Cor || item.cor || item.NomeCor || item.nomeCor || item.descricaoCor || item.DescricaoCor ||
      rawProd?.cor || rawProd?.Cor || rawProd?.nomeCor || rawProd?.NomeCor
    );

    const size = extractStr(
      item.Tamanho || item.tamanho || item.Grade || item.grade || item.Tam || item.tam ||
      rawProd?.tamanho || rawProd?.Tamanho || rawProd?.grade || rawProd?.Grade
    );

    const variation =
      extractStr(item.Variacao || item.variacao || item.NomeVariacao || item.nomeVariacao || rawProd?.variacao || rawProd?.nomeVariacao) ||
      [color, size].filter(Boolean).join(" - ") ||
      "";

    const title =
      extractStr(
        item.Descricao || item.descricao ||
        item.DescricaoProduto || item.descricaoProduto ||
        item.NomeProduto || item.nomeProduto ||
        item.nome || item.Nome ||
        item.name || item.Name ||
        item.title || item.Title ||
        item.productName || item.ProductName ||
        item.productTitle || item.ProductTitle ||
        item.itemName || item.ItemName ||
        item.itemTitle || item.ItemTitle ||
        rawProd?.descricao || rawProd?.Descricao ||
        rawProd?.descricaoProduto || rawProd?.DescricaoProduto ||
        rawProd?.nome || rawProd?.Nome ||
        rawProd?.nomeProduto || rawProd?.NomeProduto ||
        rawProd?.title || rawProd?.Title ||
        rawProd?.name || rawProd?.Name ||
        rawProduct?.name || rawProduct?.title || rawProduct?.description ||
        rawItem?.descricao || rawItem?.nome || rawItem?.title ||
        (typeof item.Produto === "string" ? item.Produto : "") ||
        (typeof item.produto === "string" ? item.produto : "")
      ) ||
      reference ||
      sku;

    const quantity =
      parseInt(String(item.Quantidade || item.quantidade || item.qty || item.quantity || item.qtd || item.Qtd || "1"), 10) || 1;

    const unitPrice =
      parseFloat(String(item.PrecoUnitario || item.precoUnitario || item.price || item.unitPrice || item.valorUnitario || item.ValorUnitario || item.preco || item.Preco || "0").replace(",", ".")) || 0;

    const totalPrice =
      parseFloat(String(item.PrecoTotal || item.precoTotal || item.totalPrice || item.total || (unitPrice * quantity)).replace(",", ".")) || (unitPrice * quantity);

    return {
      id: item.id || `item_${idx + 1}`,
      sku,
      reference,
      title,
      variation,
      color,
      size,
      quantity,
      unitPrice,
      totalPrice,
    };
  });

  const calculatedTotal = items.reduce((acc: number, i: { totalPrice: number }) => acc + (i.totalPrice || 0), 0);

  const totalAmount =
    parseFloat(String(orderSection.TotalPedido || orderSection.total || raw.totalAmount || "0").replace(",", ".")) ||
    calculatedTotal ||
    0;

  const customerName =
    customerSection.Nome ||
    customerSection.nome ||
    orderSection.NomeCliente ||
    orderSection.nomeCliente ||
    raw.customerName ||
    "Cliente";

  const customerDocument =
    customerSection.CPF_CNPJ ||
    customerSection.cpfCnpj ||
    customerSection.cpf ||
    orderSection.DocCliente ||
    orderSection.docCliente ||
    raw.customerDocument ||
    "";

  const paymentMethod =
    paymentsSection[0]?.FormaPagamento ||
    paymentsSection[0]?.formaPagamento ||
    paymentsSection[0]?.nome ||
    raw.paymentMethod ||
    "Não informado";

  const statusOrder = raw.statusOrder ?? orderSection.CodStatus ?? orderSection.codStatus ?? 1;
  const importStatus = raw.importStatus ?? (raw.status ? "imported" : "not_downloaded");
  const status = getOrderBackendStatusLabel(statusOrder);
  const erpDownloadStatus = getOrderImportStatusLabel(importStatus);
  const channelName = raw.integrationName || raw.channelName || raw.channel || "Canal Integrado";

  return {
    id: raw.id || raw.importId || `ord_${Math.random().toString(36).slice(2, 9)}`,
    marketplaceOrderId,
    orderId: raw.orderId || marketplaceOrderId,
    fileName: raw.fileName || "",
    integrationName: channelName,
    channel: channelName.toLowerCase().replace(/\s+/g, ""),
    channelName,
    customerName,
    customerDocument,
    totalAmount,
    itemsCount: items.length || 0,
    statusOrder,
    importStatus,
    status,
    erpDownloadStatus,
    createdAtUtc: raw.createdAt || raw.createdOnUtc || new Date().toISOString(),
    updatedAtUtc: raw.updatedAt || raw.createdAt || new Date().toISOString(),
    items,
    shippingAddress: {
      street: shippingSection.Endereco || shippingSection.endereco || "",
      number: shippingSection.Numero || shippingSection.numero || "",
      neighborhood: shippingSection.Bairro || shippingSection.bairro || "",
      city: shippingSection.Cidade || shippingSection.cidade || "",
      state: shippingSection.Estado || shippingSection.estado || "",
      zipCode: shippingSection.CEP || shippingSection.cep || "",
    },
    paymentMethod,
    version: 1,
    rawJson: raw.orderData || JSON.stringify(raw, null, 2),
  };
}

/**
 * Atualização de Pedido no Hub de Produção
 */
export async function saveCustomerOrder(importId: string, orderData: string): Promise<boolean> {
  const { data } = await http.put(`/api/admin/orders/${encodeURIComponent(importId)}`, { orderData });
  return !!data;
}
