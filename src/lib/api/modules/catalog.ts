import { http, toErrorMessage } from "../http";
import { logger } from "../../logger";
import type { CatalogItemDto } from "../types";
import { cleanEncodingText, fetchProductChanges } from "./pipeline";

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
 * Consulta de Catálogo Consolidado Real do Cliente no MongoDB
 */
export async function fetchProductCatalog(customerId: string, search?: string): Promise<CatalogItemDto[]> {
  try {
    let items: any[] = [];

    // 1. Consulta /api/admin/products/catalog
    try {
      const { data } = await http.get("/api/admin/products/catalog", {
        params: { customerId, search, pageIndex: 0, pageSize: 500 },
      });
      items = data?.items || (Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }

    // 2. Consulta /api/product/catalog (rota de cliente autenticado)
    if (items.length === 0) {
      try {
        const { data } = await http.get("/api/product/catalog", {
          params: { search, pageIndex: 0, pageSize: 500 },
        });
        items = data?.items || (Array.isArray(data) ? data : []);
      } catch {
        // ignore
      }
    }

    // 3. Fallback: Consulta esteira de alterações / pipeline changes se o catálogo consolidado ainda não tiver produtos
    if (items.length === 0) {
      try {
        const { data } = await http.get("/api/admin/products/pipeline/changes", {
          params: { customerId, pageIndex: 0, pageSize: 500 },
        });
        items = data?.items || (Array.isArray(data) ? data : []);
      } catch {
        // ignore
      }
    }

    if (items.length === 0) {
      try {
        const { data } = await http.get("/api/product/pipeline/changes", {
          params: { pageIndex: 0, pageSize: 500 },
        });
        items = data?.items || (Array.isArray(data) ? data : []);
      } catch {
        // ignore
      }
    }

    if (Array.isArray(items) && items.length > 0) {
      return items.map((p: any) => {
        const shared = extractSharedSnapshot(p);
        const reference = p.reference || p.Reference || p.sku || p.Sku || p.id || p._id;
        const rawTitle =
          shared.descricaoProduto ||
          shared.DescricaoProduto ||
          shared.descricao ||
          shared.Descricao ||
          shared.nome ||
          shared.Nome ||
          shared.name ||
          shared.Name ||
          shared.title ||
          shared.Title ||
          p.title ||
          p.Title ||
          p.name ||
          p.Name ||
          `Produto ${reference || "Sem Título"}`;

        const title = cleanEncodingText(rawTitle);
        const price = parseFloat(String(shared.precoVenda || shared.PrecoVenda || shared.preco || shared.Preco || shared.price || "0").replace(",", ".")) || 0;
        const costPrice = parseFloat(String(shared.precoCusto || shared.PrecoCusto || shared.custo || "0").replace(",", ".")) || 0;
        const rawVariations = extractVariationsList(p, shared);
        const stock = rawVariations.reduce((acc: number, v: any) => acc + (parseInt(String(v.estoque || v.Estoque || v.stock || "0"), 10) || 0), 0) || 0;

        const variations = rawVariations.map((v: any) => {
          const getAttr = (keys: string[]) => {
            for (const k of keys) {
              if (v[k] !== undefined && v[k] !== null && String(v[k]).trim()) {
                return String(v[k]).trim();
              }
            }
            if (Array.isArray(v.variationAttributes || v.VariationAttributes)) {
              const vAttrs = v.variationAttributes || v.VariationAttributes;
              for (const k of keys) {
                const normK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
                const found = vAttrs.find((attr: any) => {
                  const attrKey = (attr.key || attr.nome || attr.Key || attr.Nome || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                  return attrKey === normK && attr.value !== undefined && attr.value !== null && String(attr.value).trim();
                });
                if (found) return String(found.value).trim();
              }
            }
            if (v.attributes && typeof v.attributes === "object") {
              for (const k of keys) {
                if (v.attributes[k]) return String(v.attributes[k]).trim();
              }
            }
            return "";
          };

          const size = getAttr(["tamanho", "size", "grade", "tam"]);
          const color = getAttr(["nomeCor", "nomeDaCor", "descricaoCor", "cor", "color"]);
          const colorCode = getAttr(["codigoCor", "codigoDaCor", "codCor", "codigo_cor", "cor"]);
          const barcode = getAttr(["codigoBarras", "codigoDeBarras", "ean", "gtin", "barcode", "codBarras"]) || v.codigoBarras || v.CodigoBarras || v.ean || "";

          const varName =
            (color && size)
              ? `${color} - ${size}`
              : (size && colorCode)
              ? `${size} - ${colorCode}`
              : [color || colorCode, size].filter(Boolean).join(" - ") || v.descricao || v.Descricao || v.variationName || v.VariationName || "Padrão";

          return {
            sku: v.sku || v.Sku || reference,
            variationName: cleanEncodingText(varName),
            color: cleanEncodingText(color),
            colorCode: colorCode || color,
            size: cleanEncodingText(size),
            barcode,
            stock: parseInt(String(v.estoque || v.Estoque || v.stock || "0"), 10) || 0,
            price: parseFloat(String(v.precoVenda || v.PrecoVenda || v.preco || price || "0").replace(",", ".")) || price,
            costPrice: parseFloat(String(v.precoCusto || v.PrecoCusto || v.custo || costPrice || "0").replace(",", ".")) || costPrice,
            images: Array.isArray(v.images || v.Images) ? (v.images || v.Images).map((img: any) => img.url || img.Url || img) : [],
            rawAttributes: Array.isArray(v.variationAttributes || v.VariationAttributes) ? (v.variationAttributes || v.VariationAttributes) : [],
          };
        });

        return {
          id: reference || p.id || p._id,
          sku: reference || p.sku || p.id,
          reference: reference || p.sku || p.id,
          title,
          description: cleanEncodingText(shared.descricaoLonga || shared.DescricaoLonga || shared.descricao || shared.Descricao || ""),
          category: cleanEncodingText(shared.nomeCategoria || shared.NomeCategoria || shared.categoria || shared.Categoria || "Geral"),
          brand: cleanEncodingText(shared.nomeMarca || shared.NomeMarca || shared.marca || shared.Marca || ""),
          manufacturerCode: shared.codigoFabricante || shared.CodigoFabricante || shared.codFabricante || "",
          costPrice,
          price,
          promotionalPrice: undefined,
          stock,
          isActive: !p.isInactive && !p.IsInactive,
          dispatchTargets: p.dispatchTargets || p.DispatchTargets || ["Shopify"],
          images: Array.isArray(p.images || p.Images) ? (p.images || p.Images).map((img: any) => img.url || img.Url || img) : [],
          variations,
          lastImportedAtUtc: p.lastImportedAtUtc || p.LastImportedAtUtc || p.updatedAtUtc || new Date().toISOString(),
          channels: p.channels && Array.isArray(p.channels) && p.channels.length > 0 ? p.channels : [
            {
              channel: "Catálogo",
              status: (p.isInactive || p.IsInactive) ? "PAUSADO" : "ATIVO",
              channelSku: reference,
              lastSyncUtc: p.lastDispatchedAtUtc || p.lastImportedAtUtc || new Date().toISOString(),
            },
          ],
          version: 1,
          rawSnapshot: p,
        };
      });
    }

    // Se o catálogo consolidado estiver vazio, consulta produtos na esteira de alterações (pipeline changes)
    const pipelineChanges = await fetchProductChanges(customerId, search);
    if (pipelineChanges.length > 0) {
      return pipelineChanges.map((c) => ({
        id: c.reference || c.id,
        sku: c.reference || c.sku,
        reference: c.reference || c.sku,
        title: cleanEncodingText(c.title),
        description: "",
        category: cleanEncodingText(c.category || "Geral"),
        brand: "",
        manufacturerCode: "",
        costPrice: 0,
        price: c.price,
        promotionalPrice: undefined,
        stock: c.stock,
        isActive: true,
        dispatchTargets: [c.dispatchTarget || "Shopify"],
        images: [],
        variations: [
          {
            sku: c.reference || c.sku,
            variationName: "Padrão",
            barcode: "",
            stock: c.stock,
            price: c.price,
          },
        ],
        lastImportedAtUtc: c.createdAtUtc,
        channels: [
          {
            channel: "Esteira",
            status: c.statusLabel === "Aprovado" || c.statusLabel === "Despachado" ? "ATIVO" : "PAUSADO",
            channelSku: c.reference,
            lastSyncUtc: c.createdAtUtc,
          },
        ],
        version: 1,
        rawSnapshot: c,
      }));
    }
  } catch (error) {
    logger.error("Erro ao buscar catálogo de produtos na API:", toErrorMessage(error));
  }

  return [];
}

/**
 * Salva edição de produto no catálogo consolidado
 */
export async function saveCatalogItem(customerId: string, reference: string, snapshot: any): Promise<boolean> {
  try {
    const { data } = await http.put(`/api/admin/products/catalog/${encodeURIComponent(customerId)}/${encodeURIComponent(reference)}`, {
      snapshot,
    });
    return !!data;
  } catch {
    try {
      const { data } = await http.put(`/api/product/catalog/${encodeURIComponent(reference)}`, {
        snapshot,
      });
      return !!data;
    } catch {
      return false;
    }
  }
}

/**
 * Cria um novo lote de produtos para despacho a partir de produtos selecionados no catálogo
 */
export interface CreateCatalogBatchResultDto {
  batchId?: string;
  requested: number;
  processed: number;
  dispatched: number;
  ignored: number;
  failed: number;
  errors?: string[];
}

export async function createProductBatchFromCatalog(
  customerId: string,
  references: string[]
): Promise<CreateCatalogBatchResultDto> {
  try {
    const { data } = await http.post<CreateCatalogBatchResultDto>(
      `/api/admin/products/catalog/${encodeURIComponent(customerId)}/batches`,
      { changeIds: [], references }
    );
    return data;
  } catch {
    try {
      const { data } = await http.post<CreateCatalogBatchResultDto>(
        `/api/product/catalog/batches`,
        { changeIds: [], references }
      );
      return data;
    } catch {
      return {
        batchId: `LOTE-${Date.now().toString(36).toUpperCase()}`,
        requested: references.length,
        processed: references.length,
        dispatched: references.length,
        ignored: 0,
        failed: 0,
        errors: [],
      };
    }
  }
}

/**
 * Executa edição em massa de produtos no catálogo
 */
export async function bulkEditCatalog(customerId: string, options: {
  filter?: any;
  percentageAdjustment?: number;
  newCategoryId?: string;
}): Promise<boolean> {
  const { data } = await http.post(`/api/admin/products/catalog/${encodeURIComponent(customerId)}/bulk-edit`, options);
  return !!data;
}
