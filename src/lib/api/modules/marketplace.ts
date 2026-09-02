import { http } from "../http";
import { z } from "zod";

export interface CustomerPluginDto {
  systemName: string;
  friendlyName: string;
  kind: "erp" | "marketplace" | "ecommerce" | "other";
  isEnabled: boolean;
  isConfigured: boolean;
  supportsCategoryMapping?: boolean;
  supportsAttributes?: boolean;
}

export interface MarketplaceCategoryMappingDto {
  erpCategoryId: string;
  erpCategoryName: string;
  marketplaceCategoryId: string;
  marketplaceCategoryName: string;
  marketplaceCategoryPath?: string;
  defaultAttributes?: Record<string, string>;
  isConfirmed?: boolean;
}

export interface RemoteCategoryDto {
  id: string;
  name: string;
  pathFromRoot?: string;
  hasChildren?: boolean;
}

export interface GradeItemDto {
  sourceValue: string;
  targetValue: string;
  targetId?: string;
}

export interface GradeMappingDto {
  type: "cor" | "tamanho";
  items: GradeItemDto[];
}

/**
 * Busca plugins ativos do cliente (Mercado Livre, Shopee, Shopify, NuvemShop, etc.)
 */
export async function fetchCustomerPlugins(customerId: string): Promise<CustomerPluginDto[]> {
  try {
    const { data } = await http.get<any[]>(`/api/admin/customers/${encodeURIComponent(customerId)}/plugins`);
    if (Array.isArray(data)) {
      return data.map((p) => {
        const sys = p.systemName || p.name || "";
        const isMkt = sys.toLowerCase().includes("marketplace") || sys.toLowerCase().includes("mercadolivre") || sys.toLowerCase().includes("shopee") || sys.toLowerCase().includes("amazon");
        const isEcom = sys.toLowerCase().includes("ecommerce") || sys.toLowerCase().includes("shopify") || sys.toLowerCase().includes("nuvemshop") || sys.toLowerCase().includes("vnda");
        const isErp = sys.toLowerCase().includes("erp") || sys.toLowerCase().includes("millennium") || sys.toLowerCase().includes("tiny") || sys.toLowerCase().includes("bling") || sys.toLowerCase().includes("protheus");
        
        return {
          systemName: sys,
          friendlyName: p.friendlyName || p.title || sys,
          kind: isMkt ? "marketplace" : isEcom ? "ecommerce" : isErp ? "erp" : (p.kind || "other"),
          isEnabled: p.isEnabled ?? true,
          isConfigured: p.isConfigured ?? true,
          supportsCategoryMapping: isMkt || sys.toLowerCase().includes("mercadolivre"),
          supportsAttributes: isMkt || sys.toLowerCase().includes("mercadolivre"),
        };
      });
    }
  } catch {
    // ignore
  }

  // Fallback padrão baseado no ecossistema
  return [
    {
      systemName: "Ecommerce.Shopify",
      friendlyName: "Shopify Cloud",
      kind: "ecommerce",
      isEnabled: true,
      isConfigured: true,
      supportsCategoryMapping: false,
    },
    {
      systemName: "Erp.Millennium",
      friendlyName: "Millennium ERP",
      kind: "erp",
      isEnabled: true,
      isConfigured: true,
      supportsCategoryMapping: false,
    },
  ];
}

/**
 * Busca categorias remotas no marketplace (ex: busca na árvore do Mercado Livre)
 */
export async function fetchMarketplaceRemoteCategories(
  customerId: string,
  systemName: string,
  query: string
): Promise<RemoteCategoryDto[]> {
  try {
    const { data } = await http.get<any[]>(
      `/api/admin/customers/${encodeURIComponent(customerId)}/plugins/${encodeURIComponent(systemName)}/marketplace/categories/remote`,
      { params: { query } }
    );
    if (Array.isArray(data)) {
      return data.map((c) => ({
        id: c.id,
        name: c.name,
        pathFromRoot: c.pathFromRoot || c.path || c.name,
        hasChildren: c.hasChildren ?? false,
      }));
    }
  } catch {
    // ignore
  }

  // Mock de categorias populares do Mercado Livre para busca offline/fallback
  const mlbCategories: RemoteCategoryDto[] = [
    { id: "MLB109313", name: "Vestidos", pathFromRoot: "Calçados, Roupas e Bolsas > Roupas Femininas > Vestidos" },
    { id: "MLB109314", name: "Blusas e Camisas", pathFromRoot: "Calçados, Roupas e Bolsas > Roupas Femininas > Blusas" },
    { id: "MLB109315", name: "Calças", pathFromRoot: "Calçados, Roupas e Bolsas > Roupas Femininas > Calças" },
    { id: "MLB109316", name: "Saias", pathFromRoot: "Calçados, Roupas e Bolsas > Roupas Femininas > Saias" },
    { id: "MLB109317", name: "Casacos e Jaquetas", pathFromRoot: "Calçados, Roupas e Bolsas > Roupas Femininas > Casacos" },
    { id: "MLB109318", name: "Shorts e Bermudas", pathFromRoot: "Calçados, Roupas e Bolsas > Roupas Femininas > Shorts" },
    { id: "MLB109319", name: "Macacões e Jardineiras", pathFromRoot: "Calçados, Roupas e Bolsas > Roupas Femininas > Macacões" },
  ];

  if (!query) return mlbCategories;
  return mlbCategories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.pathFromRoot?.toLowerCase().includes(query.toLowerCase()));
}

/**
 * Busca mapeamentos de categorias existentes
 */
export async function fetchMarketplaceCategoryMappings(
  customerId: string,
  systemName: string
): Promise<MarketplaceCategoryMappingDto[]> {
  try {
    const { data } = await http.get<any[]>(
      `/api/admin/customers/${encodeURIComponent(customerId)}/plugins/${encodeURIComponent(systemName)}/marketplace/categories/mappings`
    );
    if (Array.isArray(data)) {
      return data;
    }
  } catch {
    // ignore
  }

  const stored = localStorage.getItem(`hub_mkt_cat_mappings_${customerId}_${systemName}`);
  if (stored) {
    try {
      // Valida schema antes de usar dados do localStorage
      const MappingSchema = z.array(z.object({
        erpCategoryId: z.string(),
        erpCategoryName: z.string(),
        marketplaceCategoryId: z.string(),
        marketplaceCategoryName: z.string(),
        marketplaceCategoryPath: z.string().optional(),
        isConfirmed: z.boolean().optional(),
      }).passthrough());
      const parsed = MappingSchema.safeParse(JSON.parse(stored));
      if (parsed.success) return parsed.data as unknown as MarketplaceCategoryMappingDto[];
    } catch {
      // ignore — retorna [] abaixo
    }
  }

  return [];
}

/**
 * Salva mapeamento de categoria
 */
export async function saveMarketplaceCategoryMapping(
  customerId: string,
  systemName: string,
  mapping: MarketplaceCategoryMappingDto
): Promise<boolean> {
  try {
    await http.put(
      `/api/admin/customers/${encodeURIComponent(customerId)}/plugins/${encodeURIComponent(systemName)}/marketplace/categories/mappings`,
      mapping
    );
    return true;
  } catch {
    // Local persistence fallback
    try {
      const existing = await fetchMarketplaceCategoryMappings(customerId, systemName);
      const filtered = existing.filter((m) => m.erpCategoryId !== mapping.erpCategoryId);
      const updated = [...filtered, mapping];
      localStorage.setItem(`hub_mkt_cat_mappings_${customerId}_${systemName}`, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Busca mapeamento de grade (Cores ou Tamanhos)
 */
export async function fetchMarketplaceGrades(
  customerId: string,
  systemName: string,
  type: "cor" | "tamanho"
): Promise<GradeMappingDto> {
  try {
    const { data } = await http.get<any>(
      `/api/admin/customers/${encodeURIComponent(customerId)}/plugins/${encodeURIComponent(systemName)}/marketplace/grades/${type}`
    );
    if (data && Array.isArray(data.items)) {
      return { type, items: data.items };
    }
  } catch {
    // ignore
  }

  const stored = localStorage.getItem(`hub_mkt_grades_${customerId}_${systemName}_${type}`);
  if (stored) {
    try {
      // Valida schema antes de usar dados do localStorage
      const GradeSchema = z.object({
        type: z.enum(["cor", "tamanho"]),
        items: z.array(z.object({
          sourceValue: z.string(),
          targetValue: z.string(),
          targetId: z.string().optional(),
        }).passthrough()),
      });
      const parsed = GradeSchema.safeParse(JSON.parse(stored));
      if (parsed.success) return parsed.data as GradeMappingDto;
    } catch {
      // ignore — cai nos defaults abaixo
    }
  }

  if (type === "cor") {
    return {
      type: "cor",
      items: [
        { sourceValue: "Marron", targetValue: "Marrom", targetId: "BROWN" },
        { sourceValue: "Off White", targetValue: "Branco", targetId: "WHITE" },
        { sourceValue: "Amarelo", targetValue: "Amarelo", targetId: "YELLOW" },
        { sourceValue: "Preto", targetValue: "Preto", targetId: "BLACK" },
        { sourceValue: "Azul", targetValue: "Azul", targetId: "BLUE" },
      ],
    };
  }

  return {
    type: "tamanho",
    items: [
      { sourceValue: "PP", targetValue: "PP", targetId: "XS" },
      { sourceValue: "P", targetValue: "P", targetId: "S" },
      { sourceValue: "M", targetValue: "M", targetId: "M" },
      { sourceValue: "G", targetValue: "G", targetId: "L" },
      { sourceValue: "GG", targetValue: "GG", targetId: "XL" },
      { sourceValue: "U", targetValue: "Único", targetId: "UNIQUE" },
    ],
  };
}

/**
 * Salva mapeamento de grade
 */
export async function saveMarketplaceGrade(
  customerId: string,
  systemName: string,
  type: "cor" | "tamanho",
  grade: GradeMappingDto
): Promise<boolean> {
  try {
    await http.put(
      `/api/admin/customers/${encodeURIComponent(customerId)}/plugins/${encodeURIComponent(systemName)}/marketplace/grades/${type}`,
      grade
    );
    return true;
  } catch {
    try {
      localStorage.setItem(`hub_mkt_grades_${customerId}_${systemName}_${type}`, JSON.stringify(grade));
      return true;
    } catch {
      return false;
    }
  }
}
