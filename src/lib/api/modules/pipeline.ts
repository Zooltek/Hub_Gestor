import { http, toErrorMessage } from "../http";
import { logger } from "../../logger";
import type { ProductBatchDto, ProductChangeDto, ProductChangeVariationDto } from "../types";

/**
 * Sanitiza textos com erros de codificação de caracteres (ex: 200c -> 200°C)
 */
export function cleanEncodingText(text?: string | null): string {
  if (!text) return "";
  return String(text)
    .replace(/[\uFFFD\u0080-\u009F\uFFFE\uFFFF]\s*c/gi, "°C")
    .replace(/[\uFFFD\u0080-\u009F\uFFFE\uFFFF]/g, "°")
    .replace(/\?\s*c\b/gi, "°C")
    .replace(/\b([0-9]+)\s*c\b/gi, "$1°C")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Helper para extrair o snapshot compartilhado (Shared) de qualquer formato retornado pela API/MongoDB
 */
function extractSharedSnapshot(p: any): any {
  if (!p) return {};
  return (
    p.effectiveSharedSnapshot ||
    p.publishedSharedSnapshot ||
    p.editedSnapshot?.shared ||
    p.EditedSnapshot?.Shared ||
    p.incomingSnapshot?.shared ||
    p.IncomingSnapshot?.Shared ||
    p.snapshot?.shared ||
    p.Snapshot?.Shared ||
    p.originalSnapshot?.shared ||
    p.OriginalSnapshot?.Shared ||
    p.rawSnapshot?.shared ||
    p.rawSnapshot?.Shared ||
    p.Shared ||
    p.shared ||
    {}
  );
}

/**
 * Helper para extrair variações de qualquer formato de produto
 */
function extractVariationsList(p: any, sharedObj?: any): any[] {
  if (!p) return [];
  const list =
    p.effectiveVariations ||
    p.editedSnapshot?.variations ||
    p.EditedSnapshot?.Variations ||
    p.incomingSnapshot?.variations ||
    p.IncomingSnapshot?.Variations ||
    p.snapshot?.variations ||
    p.Snapshot?.Variations ||
    p.originalSnapshot?.variations ||
    p.OriginalSnapshot?.Variations ||
    p.rawSnapshot?.variations ||
    p.variations ||
    p.Variations ||
    [];
  return Array.isArray(list) ? list : [];
}

/**
 * Consulta de Lotes da Esteira de Produtos no MongoDB
 */
export async function fetchProductBatches(customerId: string): Promise<ProductBatchDto[]> {
  try {
    let rawItems: any[] = [];
    try {
      const { data } = await http.get("/api/admin/products/pipeline/imports", {
        params: { customerId, pageIndex: 0, pageSize: 100 },
      });
      rawItems = data?.items || (Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }

    if (rawItems.length === 0) {
      try {
        const { data } = await http.get("/api/product/pipeline/imports", {
          params: { pageIndex: 0, pageSize: 100 },
        });
        rawItems = data?.items || (Array.isArray(data) ? data : []);
      } catch {
        // ignore
      }
    }

    if (Array.isArray(rawItems) && rawItems.length > 0) {
      return rawItems.map((b: any) => {
        const errorList = Array.isArray(b.errors)
          ? b.errors.filter(Boolean)
          : typeof b.errors === "string" && b.errors.trim()
          ? [b.errors.trim()]
          : [];
        const dispatchFailed = Number(b.dispatchFailed || 0);
        const received = Number(b.received || b.totalItems || 0);
        const changed = Number(b.changed || b.processedItems || 0);
        const errorCount = dispatchFailed + errorList.length;
        const successCount = Math.max(0, received - errorCount);

        let status: "CONCLUIDO" | "PROCESSANDO" | "PENDENTE" | "ERRO" = "CONCLUIDO";
        const rawStatus = b.status !== undefined && b.status !== null ? String(b.status).toUpperCase() : "";
        if (rawStatus === "ERRO" || rawStatus === "ERROR" || rawStatus === "6" || (errorCount > 0 && !["CONCLUIDO", "0", "SUCCESS"].includes(rawStatus))) {
          status = "ERRO";
        } else if (rawStatus === "PROCESSANDO" || rawStatus === "PROCESSING") {
          status = "PROCESSANDO";
        } else if (rawStatus === "PENDENTE" || rawStatus === "PENDING" || rawStatus === "1") {
          status = "PENDENTE";
        } else {
          status = "CONCLUIDO";
        }

        return {
          id: b.id,
          batchNumber: b.fileName ? `LOTE-${b.fileName.replace(/\.csv|\.manual/g, "").slice(0, 16)}` : `LOTE-${b.id?.slice(0, 8) || "NOVO"}`,
          fileName: b.fileName || "Produtos.csv",
          totalItems: received,
          processedItems: changed,
          successItems: successCount,
          errorItems: errorCount,
          status,
          startedAtUtc: b.createdAt || new Date().toISOString(),
          finishedAtUtc: b.createdAt || new Date().toISOString(),
          channelName: b.integrationName || b.channelName || b.channel || "Esteira de Produtos",
          errorLog: errorList,
          version: 1,
          received,
          changed,
          dispatched: b.dispatched,
          dispatchFailed,
        };
      });
    }
  } catch (error) {
    logger.error("Erro ao carregar lotes de produtos da API:", toErrorMessage(error));
  }

  return [];
}

/**
 * Consulta de Detalhes de um Lote específico por ID
 */
export async function fetchProductBatchById(batchId: string): Promise<{ batch: ProductBatchDto; items: ProductChangeDto[] } | null> {
  try {
    let data: any = null;
    try {
      const res = await http.get(`/api/admin/products/pipeline/imports/${encodeURIComponent(batchId)}`);
      data = res.data;
    } catch {
      // ignore
    }

    if (!data) {
      try {
        const res = await http.get(`/api/product/pipeline/imports/${encodeURIComponent(batchId)}`);
        data = res.data;
      } catch {
        // ignore
      }
    }

    if (data) {
      const batchObj = data.batch || data;
      const rawItems = Array.isArray(data.items) ? data.items : [];
      const fileName = batchObj.fileName || "Produtos.csv";

      const errorList = Array.isArray(batchObj.errors)
        ? batchObj.errors.filter(Boolean)
        : typeof batchObj.errors === "string" && batchObj.errors.trim()
        ? [batchObj.errors.trim()]
        : [];
      const dispatchFailed = Number(batchObj.dispatchFailed || 0);
      const received = Number(batchObj.received || rawItems.length || 0);
      const changed = Number(batchObj.changed || 0);
      const errorCount = dispatchFailed + errorList.length;
      const successCount = Math.max(0, received - errorCount);

      let batchStatus: "CONCLUIDO" | "PROCESSANDO" | "PENDENTE" | "ERRO" = "CONCLUIDO";
      const rawBatchStatus = batchObj.status !== undefined && batchObj.status !== null ? String(batchObj.status).toUpperCase() : "";
      if (rawBatchStatus === "ERRO" || rawBatchStatus === "ERROR" || rawBatchStatus === "6" || (errorCount > 0 && !["CONCLUIDO", "0", "SUCCESS"].includes(rawBatchStatus))) {
        batchStatus = "ERRO";
      } else if (rawBatchStatus === "PROCESSANDO" || rawBatchStatus === "PROCESSING") {
        batchStatus = "PROCESSANDO";
      } else if (rawBatchStatus === "PENDENTE" || rawBatchStatus === "PENDING" || rawBatchStatus === "1") {
        batchStatus = "PENDENTE";
      } else {
        batchStatus = "CONCLUIDO";
      }

      const batchDto: ProductBatchDto = {
        id: batchObj.id || batchId,
        batchNumber: fileName,
        fileName,
        totalItems: received,
        processedItems: changed,
        successItems: successCount,
        errorItems: errorCount,
        status: batchStatus,
        startedAtUtc: batchObj.createdAt || new Date().toISOString(),
        finishedAtUtc: batchObj.createdAt || new Date().toISOString(),
        channelName: batchObj.integrationName || batchObj.channelName || "Esteira",
        errorLog: errorList,
        version: 1,
        received,
        changed,
        dispatched: batchObj.dispatched,
        dispatchFailed,
      };

      const mappedItems: ProductChangeDto[] = rawItems.map((item: any) => {
        const incoming = item.incomingSnapshot || item.snapshot || item.rawSnapshot || {};
        const saved = item.savedSnapshot || {};
        const shared = incoming.shared || saved.shared || incoming || saved || item.effectiveSharedSnapshot || {};
        const variations: any[] = incoming.variations || saved.variations || incoming.itens || saved.itens || item.effectiveVariations || item.variations || [];

        const title =
          shared.descricaoProduto ||
          shared.descricao ||
          shared.nome ||
          shared.title ||
          incoming.descricaoProduto ||
          incoming.descricao ||
          incoming.nome ||
          saved.descricaoProduto ||
          saved.descricao ||
          saved.nome ||
          item.title ||
          `Produto ${item.reference || item.sku || ""}`;

        // Extração precisa de Preço
        const rawPrice =
          shared.precoVenda ??
          shared.preco ??
          shared.price ??
          variations[0]?.precoVenda ??
          variations[0]?.preco ??
          variations[0]?.price ??
          incoming.precoVenda ??
          incoming.preco ??
          incoming.price ??
          saved.precoVenda ??
          saved.preco ??
          saved.price ??
          item.precoVenda ??
          item.preco ??
          item.price ??
          "0";

        let price = 0;
        if (typeof rawPrice === "number") {
          price = rawPrice;
        } else if (typeof rawPrice === "string") {
          price = parseFloat(rawPrice.replace(",", ".")) || 0;
        }

        // Extração precisa de Estoque
        let stock = 0;
        if (Array.isArray(variations) && variations.length > 0) {
          stock = variations.reduce((acc: number, v: any) => {
            const vStock = v.estoque ?? v.stock ?? v.quantidade ?? v.qty ?? 0;
            return acc + (typeof vStock === "number" ? vStock : parseInt(String(vStock), 10) || 0);
          }, 0);
        } else {
          const directStock =
            incoming.estoque ??
            saved.estoque ??
            shared.estoque ??
            item.estoque ??
            item.stock ??
            0;
          stock = typeof directStock === "number" ? directStock : parseInt(String(directStock), 10) || 0;
        }

        // Se ainda for 0, inspeciona o diff de alterações
        if (price === 0 && Array.isArray(item.diff)) {
          const priceDiff = item.diff.find((d: any) => String(d.path || d.field || "").toLowerCase().includes("preco"));
          if (priceDiff?.to || priceDiff?.val || priceDiff?.value) {
            price = parseFloat(String(priceDiff.to || priceDiff.val || priceDiff.value).replace(",", ".")) || 0;
          }
        }

        if (stock === 0 && Array.isArray(item.diff)) {
          const stockDiff = item.diff.find((d: any) => String(d.path || d.field || "").toLowerCase().includes("estoque"));
          if (stockDiff?.to || stockDiff?.val || stockDiff?.value) {
            stock = parseInt(String(stockDiff.to || stockDiff.val || stockDiff.value), 10) || 0;
          }
        }

        const rawItemStatus = item.status !== undefined && item.status !== null ? item.status : item.Status;
        const diffList = Array.isArray(item.diff) ? item.diff : [];
        const hasDiff = diffList.length > 0;

        const statusMap: Record<string, string> = {
          "0": "Sem alteração",
          "1": "Pendente",
          "2": "Aprovado",
          "3": "Rejeitado",
          "4": "Despachando",
          "5": "Despachado",
          "6": "Erro",
          "7": "Ignorado",
          "SemAlteracao": "Sem alteração",
          "Sem alteração": "Sem alteração",
          "Unchanged": "Sem alteração",
          "Pendente": "Pendente",
          "Pending": "Pendente",
          "Aprovado": "Aprovado",
          "Approved": "Aprovado",
          "Rejeitado": "Rejeitado",
          "Rejected": "Rejeitado",
          "Despachando": "Despachando",
          "Dispatching": "Despachando",
          "Despachado": "Despachado",
          "Dispatched": "Despachado",
          "Erro": "Erro",
          "Error": "Erro",
          "Ignorado": "Ignorado",
          "Ignored": "Ignorado",
        };

        let statusLabel = "Sem alteração";
        if (rawItemStatus !== undefined && rawItemStatus !== null && statusMap[String(rawItemStatus)] !== undefined) {
          statusLabel = statusMap[String(rawItemStatus)];
        } else if (hasDiff) {
          statusLabel = item.requiresReview ? "Pendente" : "Alterado";
        } else {
          statusLabel = "Sem alteração";
        }

        const requiresReview = statusLabel === "Sem alteração" ? false : Boolean(item.requiresReview ?? (statusLabel === "Pendente"));
        const reviewLabel = rawItemStatus === 7 || statusLabel === "Ignorado" ? "Bloqueada" : requiresReview ? "Manual" : "Automática";
        const numericStatus = typeof rawItemStatus === "number" ? rawItemStatus : (rawItemStatus === "0" || statusLabel === "Sem alteração" ? 0 : 1);

        const reference = [
          item.reference,
          incoming.referencia,
          incoming.shared?.referencia,
          saved.referencia,
          item.sku,
        ].map((v) => (typeof v === "string" ? v.trim() : "")).find(Boolean) || item.sku || item.id || "";

        const sku = [
          item.sku,
          incoming.sku,
          incoming.variations?.[0]?.sku,
          saved.sku,
          item.reference,
        ].map((v) => (typeof v === "string" ? v.trim() : "")).find(Boolean) || reference;

        const size = incoming.tamanho || saved.tamanho || "";
        const color = incoming.nomeCor || incoming.cor || saved.nomeCor || saved.cor || "";
        const variationName = [size, color].filter(Boolean).join(" - ") || incoming.descricao || title || "Padrão";

        const parsedVariations: ProductChangeVariationDto[] = Array.isArray(variations) && variations.length > 0
          ? variations.map((v: any) => {
              const vAttrs = Array.isArray(v.variationAttributes) ? v.variationAttributes : [];
              const corObj = vAttrs.find((a: any) => a.key?.toLowerCase() === "cor" || a.key?.toLowerCase() === "nomecor");
              const tamObj = vAttrs.find((a: any) => a.key?.toLowerCase() === "tamanho" || a.key?.toLowerCase() === "grade");
              const vSize = v.tamanho || tamObj?.value || v.size || "";
              const vColor = v.nomeCor || corObj?.value || v.cor || v.color || "";
              const vColorCode = v.cor || v.colorCode || "";
              const vVariationName = [vSize, vColor].filter(Boolean).join(" - ") || v.descricao || v.nome || "Padrão";

              const vStockRaw = v.estoque ?? v.stock ?? v.quantidade ?? v.qty ?? 0;
              const vStock = typeof vStockRaw === "number" ? vStockRaw : parseInt(String(vStockRaw), 10) || 0;

              const vPriceRaw = v.precoVenda ?? v.preco ?? v.price ?? rawPrice;
              const vPrice = typeof vPriceRaw === "number" ? vPriceRaw : parseFloat(String(vPriceRaw).replace(",", ".")) || 0;

              return {
                sku: v.sku || sku,
                variationName: vVariationName,
                color: vColor,
                colorCode: vColorCode,
                size: vSize,
                barcode: v.codigoBarras || v.barcode || "",
                stock: vStock,
                price: vPrice,
                statusLabel: statusLabel,
                reviewLabel: reviewLabel,
                dispatchTargets: item.dispatchTargets || ["Shopify"],
                createdAtUtc: item.createdAt || batchObj.createdAt || new Date().toISOString(),
              };
            })
          : [
              {
                sku: sku,
                variationName,
                color,
                size,
                barcode: incoming.codigoBarras || "",
                stock,
                price,
                statusLabel,
                reviewLabel,
                dispatchTargets: item.dispatchTargets || ["Shopify"],
                createdAtUtc: item.createdAt || batchObj.createdAt || new Date().toISOString(),
              },
            ];

        return {
          id: item.id || item.reference || sku,
          customerId: item.customerId || batchObj.customerId,
          sku,
          reference,
          status: numericStatus,
          statusLabel,
          reviewLabel,
          title,
          category: shared.nomeCategoria || shared.categoria || incoming.nomeCategoria || "Geral",
          price,
          stock,
          dispatchTarget: item.dispatchTargets?.join(", ") || "Shopify",
          requiresReview,
          errorMessage: item.lastError || "",
          rawJson: item.incomingSnapshot || item.savedSnapshot || item,
          diff: diffList,
          savedSnapshot: item.savedSnapshot,
          incomingSnapshot: item.incomingSnapshot,
          variationsCount: parsedVariations.length || 1,
          variations: parsedVariations,
          createdAtUtc: item.createdAt || batchObj.createdAt || new Date().toISOString(),
        };
      });

      return { batch: batchDto, items: mappedItems };
    }
  } catch (error) {
    logger.error("Erro ao buscar lote por ID:", toErrorMessage(error));
  }

  return null;
}

/**
 * Consulta Alterações de Produtos na Esteira (Product Changes)
 */
export async function fetchProductChanges(customerId: string, reference?: string): Promise<ProductChangeDto[]> {
  try {
    let items: any[] = [];
    try {
      const { data } = await http.get("/api/admin/products/pipeline/changes", {
        params: { customerId, reference, pageIndex: 0, pageSize: 200 },
      });
      items = data?.items || (Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }

    if (items.length === 0) {
      try {
        const { data } = await http.get("/api/product/pipeline/changes", {
          params: { reference, pageIndex: 0, pageSize: 200 },
        });
        items = data?.items || (Array.isArray(data) ? data : []);
      } catch {
        // ignore
      }
    }

    if (Array.isArray(items) && items.length > 0) {
      return items.map((c: any) => {
        const shared = extractSharedSnapshot(c);
        const ref = c.reference || c.Reference || c.sku || c.Sku || c.id || "";
        const rawTitle =
          shared.descricaoProduto ||
          shared.DescricaoProduto ||
          shared.descricao ||
          shared.Descricao ||
          shared.nome ||
          shared.Nome ||
          shared.title ||
          shared.Title ||
          c.title ||
          c.Title ||
          `Produto ${ref || "Sem Título"}`;

        const title = cleanEncodingText(rawTitle);
        const price = parseFloat(String(shared.precoVenda || shared.PrecoVenda || shared.preco || shared.Preco || shared.price || "0").replace(",", ".")) || 0;
        const variations = extractVariationsList(c, shared);
        const stock = variations.reduce((acc: number, v: any) => acc + (parseInt(String(v.estoque || v.Estoque || v.stock || v.quantidade || "0"), 10) || 0), 0) || 0;

        const rawStatus = c.status !== undefined && c.status !== null ? c.status : c.Status;
        const statusMap: Record<string, ProductChangeDto["statusLabel"]> = {
          "0": "Sem alteração",
          "1": "Pendente",
          "2": "Aprovado",
          "3": "Rejeitado",
          "4": "Despachando",
          "5": "Despachado",
          "6": "Erro",
          "7": "Ignorado",
          "SemAlteracao": "Sem alteração",
          "Sem alteração": "Sem alteração",
          "Unchanged": "Sem alteração",
          "Pendente": "Pendente",
          "Pending": "Pendente",
          "Aprovado": "Aprovado",
          "Approved": "Aprovado",
          "Rejeitado": "Rejeitado",
          "Rejected": "Rejeitado",
          "Despachando": "Despachando",
          "Dispatching": "Despachando",
          "Despachado": "Despachado",
          "Dispatched": "Despachado",
          "Erro": "Erro",
          "Error": "Erro",
          "Ignorado": "Ignorado",
          "Ignored": "Ignorado",
        };

        const hasDiff = Array.isArray(c.diff) && c.diff.length > 0;
        let statusLabel: ProductChangeDto["statusLabel"] = "Sem alteração";
        if (rawStatus !== undefined && rawStatus !== null && statusMap[String(rawStatus)] !== undefined) {
          statusLabel = statusMap[String(rawStatus)] as ProductChangeDto["statusLabel"];
        } else if (hasDiff) {
          statusLabel = "Pendente";
        } else {
          statusLabel = "Sem alteração";
        }

        const statusCode = typeof rawStatus === "number" ? rawStatus : (rawStatus === "0" || statusLabel === "Sem alteração" ? 0 : 1);
        const requiresReview = statusLabel === "Sem alteração" ? false : Boolean(c.requiresReview ?? (statusCode === 1));

        return {
          id: c.id || c._id || ref,
          customerId: c.customerId || c.CustomerId || customerId,
          sku: ref,
          reference: ref,
          status: statusCode,
          statusLabel,
          title,
          category: cleanEncodingText(shared.nomeCategoria || shared.NomeCategoria || shared.categoria || shared.Categoria || "Geral"),
          price,
          stock,
          dispatchTarget: c.dispatchTargets?.join(", ") || c.DispatchTargets?.join(", ") || c.integrationName || "Esteira",
          requiresReview,
          errorMessage: c.lastError || c.LastError,
          rawJson: c.snapshot || c.Snapshot || c.rawSnapshot || c,
          createdAtUtc: c.createdAtUtc || c.CreatedAt || new Date().toISOString(),
        };
      });
    }
  } catch (error) {
    logger.error("Erro ao carregar alterações da esteira de produtos:", toErrorMessage(error));
  }

  return [];
}

/**
 * Aprova alteração de produto na esteira
 */
export async function approveProductChange(changeId: string): Promise<boolean> {
  const { data } = await http.post(`/api/admin/products/pipeline/changes/${encodeURIComponent(changeId)}/approve`);
  return !!data;
}

/**
 * Aprova lote de alterações
 */
export async function approveProductChangesBatch(changeIds: string[], customerId: string): Promise<boolean> {
  const { data } = await http.post("/api/admin/products/pipeline/changes/approve-batch", {
    changeIds,
    customerId,
  });
  return !!data;
}

/**
 * Força despacho de produto ignorado ou pendente
 */
export async function forceDispatchProductChange(changeId: string): Promise<boolean> {
  const { data } = await http.post(`/api/admin/products/pipeline/changes/${encodeURIComponent(changeId)}/force-dispatch`);
  return !!data;
}

/**
 * Tenta novamente o despacho de um produto
 */
export async function retryProductChange(changeId: string): Promise<boolean> {
  const { data } = await http.post(`/api/admin/products/pipeline/changes/${encodeURIComponent(changeId)}/retry`);
  return !!data;
}
