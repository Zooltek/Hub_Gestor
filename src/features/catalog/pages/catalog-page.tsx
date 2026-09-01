import { useState, useMemo, useEffect } from "react";
import {
  Package,
  Search,
  RefreshCw,
  Edit,
  SlidersHorizontal,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Save,
  PackageX,
  Plus,
  Trash2,
  ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/app/providers/auth-provider";
import { fetchProductCatalog, saveCatalogItem, bulkEditCatalog } from "@/lib/api/hub-client";
import type { CatalogItemDto, CatalogItemVariationDto } from "@/lib/api/types";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export function CatalogPage() {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<CatalogItemDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [onlyPending, setOnlyPending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit Single Product state (Hub Admin standard)
  const [editingItem, setEditingItem] = useState<CatalogItemDto | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editManufacturerCode, setEditManufacturerCode] = useState("");
  const [editCostPrice, setEditCostPrice] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editDispatchTargets, setEditDispatchTargets] = useState<string[]>([]);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [editVariations, setEditVariations] = useState<CatalogItemVariationDto[]>([]);

  // Edit Variation state (Hub Admin standard)
  const [editingVariation, setEditingVariation] = useState<CatalogItemVariationDto | null>(null);
  const [varBarcode, setVarBarcode] = useState("");
  const [varColor, setVarColor] = useState("");
  const [varColorCode, setVarColorCode] = useState("");
  const [varSize, setVarSize] = useState("");
  const [varImages, setVarImages] = useState<string[]>([]);
  const [newVarImageUrl, setNewVarImageUrl] = useState("");
  const [isAddingVarImage, setIsAddingVarImage] = useState(false);

  // Bulk edit state
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkPriceAdjustment, setBulkPriceAdjustment] = useState("");

  const loadCatalog = async (showToast = false) => {
    if (!user?.customerId) return;
    setIsLoading(true);
    try {
      const data = await fetchProductCatalog(user.customerId, searchTerm);
      setCatalog(data || []);
      if (showToast) {
        toast.success(`Catálogo atualizado! (${data?.length || 0} produtos encontrados)`);
      }
    } catch (error) {
      if (showToast) {
        toast.error("Erro ao sincronizar catálogo com o Hub de Produção.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [user?.customerId, searchTerm]);

  const categories = useMemo(() => Array.from(new Set(catalog.map((i) => i.category))), [catalog]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.reference || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const hasErrorOrPending = item.channels.some((c) => c.status === "ERRO" || c.status === "PAUSADO");
      const matchesPending = !onlyPending || hasErrorOrPending;

      return matchesSearch && matchesCategory && matchesPending;
    });
  }, [catalog, searchTerm, categoryFilter, onlyPending]);

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / PAGE_SIZE));
  const paginatedCatalog = filteredCatalog.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleToggleSelect = (sku: string) => {
    setSelectedSkus((prev) =>
      prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku]
    );
  };

  const handleSelectAll = () => {
    if (selectedSkus.length === filteredCatalog.length) {
      setSelectedSkus([]);
    } else {
      setSelectedSkus(filteredCatalog.map((i) => i.sku));
    }
  };

  const handleOpenEditItem = (item: CatalogItemDto) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description || "");
    setEditCategory(item.category || "Geral");
    setEditBrand(item.brand || "");
    setEditManufacturerCode(item.manufacturerCode || "");
    setEditCostPrice(item.costPrice || 0);
    setEditPrice(item.price || 0);
    setEditIsActive(item.isActive ?? true);
    setEditDispatchTargets(item.dispatchTargets || ["Shopify"]);
    setEditImages(item.images || []);
    setEditVariations(item.variations || [
      {
        sku: item.sku,
        variationName: "Padrão",
        barcode: "",
        stock: item.stock,
        price: item.price,
        costPrice: item.costPrice,
      },
    ]);
    setIsAddingImage(false);
    setNewImageUrl("");
  };

  const handleOpenEditVariation = (v: CatalogItemVariationDto) => {
    setEditingVariation(v);
    setVarBarcode(v.barcode || "");
    setVarColor(v.color || "");
    setVarColorCode(v.colorCode || v.color || "");
    setVarSize(v.size || "");
    setVarImages(v.images || []);
    setIsAddingVarImage(false);
    setNewVarImageUrl("");
  };

  const handleSaveVariation = () => {
    if (!editingVariation) return;
    const varName =
      (varColor && varSize)
        ? `${varColor} - ${varSize}`
        : (varSize && varColorCode)
        ? `${varSize} - ${varColorCode}`
        : [varColor || varColorCode, varSize].filter(Boolean).join(" - ") || editingVariation.variationName || "Padrão";

    setEditVariations((prev) =>
      prev.map((v) =>
        v.sku === editingVariation.sku
          ? {
              ...v,
              barcode: varBarcode,
              color: varColor,
              colorCode: varColorCode,
              size: varSize,
              variationName: varName,
              images: varImages,
            }
          : v
      )
    );
    toast.success(`Variação ${editingVariation.sku} atualizada! Salve o produto para persistir.`);
    setEditingVariation(null);
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setEditImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
    setIsAddingImage(false);
  };

  const handleRemoveImage = (index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveItem = async () => {
    if (!editingItem || !user?.customerId) return;
    setIsSaving(true);
    try {
      const snapshot = {
        shared: {
          descricaoProduto: editTitle,
          descricaoLonga: editDescription,
          nomeCategoria: editCategory,
          nomeMarca: editBrand,
          codigoFabricante: editManufacturerCode,
          precoVenda: editPrice.toString(),
          precoCusto: editCostPrice.toString(),
        },
        variations: editVariations.map((v) => {
          const varAttrs = [
            { key: "tamanho", value: v.size || "" },
            { key: "cor", value: v.colorCode || v.color || "" },
            { key: "nomeCor", value: v.color || "" },
            { key: "codigoCor", value: v.colorCode || "" },
            { key: "codigoBarras", value: v.barcode || "" },
          ].filter((a) => Boolean(a.value));

          return {
            sku: v.sku,
            cor: v.colorCode || v.color || "",
            nomeCor: v.color || "",
            codigoCor: v.colorCode || "",
            tamanho: v.size || "",
            codigoBarras: v.barcode,
            estoque: v.stock,
            precoVenda: (v.price || editPrice).toString(),
            precoCusto: (v.costPrice || editCostPrice).toString(),
            images: (v.images || []).map((url) => ({ url })),
            variationAttributes: varAttrs,
          };
        }),
        images: editImages.map((url) => ({ url })),
        isInactive: !editIsActive,
        dispatchTargets: editDispatchTargets,
      };

      await saveCatalogItem(user.customerId, editingItem.reference || editingItem.sku, snapshot);

      setCatalog((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                title: editTitle,
                description: editDescription,
                category: editCategory,
                brand: editBrand,
                manufacturerCode: editManufacturerCode,
                isActive: editIsActive,
                dispatchTargets: editDispatchTargets,
                images: editImages,
                variations: editVariations,
                version: i.version + 1,
              }
            : i
        )
      );

      toast.success(`Produto ${editingItem.reference || editingItem.sku} atualizado com sucesso no Hub!`);
      setEditingItem(null);
    } catch {
      toast.error("Erro ao salvar produto no Hub.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyBulkPrice = async () => {
    const percent = parseFloat(bulkPriceAdjustment);
    if (isNaN(percent) || selectedSkus.length === 0 || !user?.customerId) {
      toast.error("Informe um percentual válido.");
      return;
    }

    setIsSaving(true);
    try {
      await bulkEditCatalog(user.customerId, {
        filter: { references: selectedSkus },
        percentageAdjustment: percent,
      });

      setCatalog((prev) =>
        prev.map((item) => {
          if (selectedSkus.includes(item.sku)) {
            const newPrice = Number((item.price * (1 + percent / 100)).toFixed(2));
            return { ...item, price: newPrice, version: item.version + 1 };
          }
          return item;
        })
      );

      toast.success(`Reajuste de ${percent}% aplicado a ${selectedSkus.length} produto(s) no Hub de Produção!`);
      setIsBulkEditOpen(false);
      setSelectedSkus([]);
      setBulkPriceAdjustment("");
    } catch {
      toast.error("Erro ao aplicar reajuste em massa na API.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="size-6 text-primary" />
            Catálogo & Estoque de Produtos
          </h1>
          <p className="text-sm text-muted-foreground">
            Catálogo unificado de produtos integrado com ERP e canais de venda em nuvem.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedSkus.length > 0 && (
            <Button
              size="sm"
              onClick={() => setIsBulkEditOpen(true)}
              className="h-9 gap-1.5 text-xs"
            >
              <SlidersHorizontal className="size-3.5" />
              Edição em Massa ({selectedSkus.length})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadCatalog(true)}
            disabled={isLoading}
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Sincronizando..." : "Atualizar Catálogo"}
          </Button>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <Card className="border-border/80">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por SKU ou título..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <Button
              variant={onlyPending ? "secondary" : "outline"}
              size="sm"
              onClick={() => setOnlyPending(!onlyPending)}
              className="text-xs h-9"
            >
              {onlyPending ? "Apenas com Alertas" : "Todos os Status"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-border/80">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
              <div className="relative">
                <RefreshCw className="size-8 animate-spin text-primary" />
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              </div>
              <p className="text-sm font-semibold text-foreground mt-2">Processando e sincronizando catálogo com o Hub Central...</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Buscando produtos consolidados e variações de estoque. Aguarde um instante.
              </p>
            </div>
          ) : paginatedCatalog.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <PackageX className="size-8 text-muted-foreground/60" />
              <p className="text-sm font-medium text-foreground">Nenhum produto encontrado</p>
              <p className="text-xs text-muted-foreground">
                {searchTerm || categoryFilter !== "all"
                  ? "Tente ajustar os termos de pesquisa."
                  : "Nenhum produto cadastrado no catálogo."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center">
                    <button onClick={handleSelectAll} className="cursor-pointer">
                      {selectedSkus.length === filteredCatalog.length && filteredCatalog.length > 0 ? (
                        <CheckSquare className="size-4 text-primary" />
                      ) : (
                        <Square className="size-4 text-muted-foreground" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>SKU / Referência</TableHead>
                  <TableHead>Título do Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-center">Estoque Total</TableHead>
                  <TableHead>Canais / Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCatalog.map((item) => {
                  const isSelected = selectedSkus.includes(item.sku);

                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="text-center">
                        <button onClick={() => handleToggleSelect(item.sku)} className="cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="size-4 text-primary" />
                          ) : (
                            <Square className="size-4 text-muted-foreground" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        {item.reference || item.sku}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-foreground max-w-sm truncate">
                            {item.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px]">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={item.stock > 0 ? "secondary" : "destructive"}
                          className="font-mono text-xs"
                        >
                          {formatNumber(item.stock)} un
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.channels.map((ch, idx) => (
                            <Badge
                              key={idx}
                              variant={
                                ch.status === "ATIVO"
                                  ? "success"
                                  : ch.status === "PAUSADO"
                                  ? "warning"
                                  : "destructive"
                              }
                              className="text-[10px]"
                            >
                              {ch.channel}: {ch.status}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditItem(item)}
                          className="h-8 text-xs gap-1"
                        >
                          <Edit className="size-3.5" />
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {filteredCatalog.length > PAGE_SIZE && (
          <CardFooter className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Mostrando {(currentPage - 1) * PAGE_SIZE + 1} a{" "}
              {Math.min(currentPage * PAGE_SIZE, filteredCatalog.length)} de {filteredCatalog.length} produtos
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-xs font-medium px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Edit Single Product Modal (Standard Hub Admin Layout) */}
      {editingItem && (
        <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">
                Editar {editTitle || editingItem.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Última importação em {formatDateTime(editingItem.lastImportedAtUtc)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 py-2 text-xs">
              {/* Row 1: Referência (Readonly) & Nome do Produto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground">Referência</label>
                  <Input
                    disabled
                    value={editingItem.reference || editingItem.sku}
                    className="mt-1 text-xs bg-muted/40 cursor-not-allowed text-muted-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Nome do produto</label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* Row 2: Descrição */}
              <div>
                <label className="font-semibold text-foreground">Descrição</label>
                <textarea
                  value={editDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescription(e.target.value)}
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  placeholder="Descrição do produto para os marketplaces..."
                />
              </div>

              {/* Row 3: Categoria & Marca */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground">Categoria</label>
                  <Input
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Marca</label>
                  <Input
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* Row 4: Codificação do Fabricante & Preço de custo (Readonly) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground">Codificação do fabricante</label>
                  <Input
                    value={editManufacturerCode}
                    onChange={(e) => setEditManufacturerCode(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Preço de custo (Sincronizado do ERP)</label>
                  <Input
                    disabled
                    value={formatCurrency(editCostPrice)}
                    className="mt-1 text-xs bg-muted/40 cursor-not-allowed text-muted-foreground font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Preço de venda (Readonly - Definido na esteira/ERP) */}
              <div>
                <label className="font-semibold text-foreground">Preço de venda (Sincronizado do ERP)</label>
                <Input
                  disabled
                  value={formatCurrency(editPrice)}
                  className="mt-1 text-xs bg-muted/40 cursor-not-allowed text-muted-foreground font-mono"
                />
              </div>

              {/* Row 6: Produto Ativo Checkbox Card */}
              <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                <input
                  type="checkbox"
                  id="product-active"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <div>
                  <label htmlFor="product-active" className="font-bold text-foreground cursor-pointer">
                    Produto ativo
                  </label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Desative para bloquear o envio deste produto aos plugins.
                  </p>
                </div>
              </div>

              {/* Row 7: Destinos do Envio */}
              <div>
                <label className="font-semibold text-foreground">Destinos do envio</label>
                <Input
                  value={editDispatchTargets.join(", ")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditDispatchTargets(
                      e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  placeholder="Ex: Shopify, Mercado Livre"
                  className="mt-1 text-xs"
                />
              </div>

              {/* Row 8: Imagens */}
              <Card className="border-border/80">
                <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                      <ImageIcon className="size-3.5 text-primary" />
                      Imagens
                    </CardTitle>
                    <CardDescription className="text-[11px]">
                      URLs públicas usadas no marketplace.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingImage(true)}
                    className="h-7 text-[11px] gap-1"
                  >
                    <Plus className="size-3" />
                    Adicionar imagem
                  </Button>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {isAddingImage && (
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        placeholder="https://exemplo.com/imagem.jpg"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="text-xs h-8"
                      />
                      <Button size="sm" onClick={handleAddImage} className="h-8 text-xs">
                        OK
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsAddingImage(false);
                          setNewImageUrl("");
                        }}
                        className="h-8 text-xs"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}

                  {editImages.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground py-1">
                      Nenhuma imagem configurada.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {editImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/60 text-xs font-mono"
                        >
                          <span className="truncate max-w-md">{img}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveImage(idx)}
                            className="size-6 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Row 9: Variações (Readonly Estoque) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-foreground text-sm">Variações</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {editVariations.length} SKU(s)
                  </span>
                </div>

                <div className="border border-border/80 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">SKU</TableHead>
                        <TableHead className="text-xs">Variação</TableHead>
                        <TableHead className="text-xs">Código de barras</TableHead>
                        <TableHead className="text-center text-xs">Estoque</TableHead>
                        <TableHead className="text-right text-xs"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editVariations.map((v, i) => (
                        <TableRow key={i} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs font-semibold text-foreground">
                            {v.sku}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-foreground">
                            {v.color && v.size
                              ? `${v.color} - ${v.size}`
                              : v.size && v.colorCode
                              ? `${v.size} - ${v.colorCode}`
                              : v.variationName || "-"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {v.barcode || "-"}
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs font-semibold text-foreground">
                            {formatNumber(v.stock)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditVariation(v)}
                              className="h-7 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10"
                            >
                              Editar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-end border-t border-border pt-3">
              <Button variant="outline" size="sm" onClick={() => setEditingItem(null)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveItem} disabled={isSaving} className="gap-1.5">
                <Save className="size-3.5" />
                {isSaving ? "Salvando..." : "Salvar no Hub"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Variation Modal (Hub Admin standard) */}
      {editingVariation && (
        <Dialog open={Boolean(editingVariation)} onOpenChange={(open) => !open && setEditingVariation(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                Editar variação {editingVariation.size && editingVariation.colorCode ? `${editingVariation.size} - ${editingVariation.colorCode}` : (editingVariation.variationName || editingVariation.sku)}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-mono">
                SKU: {editingVariation.sku}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 py-2 text-xs">
              {/* Row 1: SKU & Código da cor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground">SKU</label>
                  <Input
                    disabled
                    value={editingVariation.sku}
                    className="mt-1 text-xs bg-muted/40 cursor-not-allowed text-muted-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Código da cor</label>
                  <Input
                    disabled
                    value={varColorCode}
                    className="mt-1 text-xs bg-muted/40 cursor-not-allowed text-muted-foreground font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Cor & Tamanho */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground">Cor</label>
                  <Input
                    value={varColor}
                    onChange={(e) => setVarColor(e.target.value)}
                    placeholder="Ex: Marron"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Tamanho</label>
                  <Input
                    value={varSize}
                    onChange={(e) => setVarSize(e.target.value)}
                    placeholder="Ex: PP"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* Row 3: Código de barras & Estoque */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground">Código de barras</label>
                  <Input
                    value={varBarcode}
                    onChange={(e) => setVarBarcode(e.target.value)}
                    placeholder="Ex: 1145100011200"
                    className="mt-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Estoque</label>
                  <Input
                    disabled
                    value={editingVariation.stock}
                    className="mt-1 text-xs bg-muted/40 cursor-not-allowed text-muted-foreground font-mono"
                  />
                </div>
              </div>

              {/* Row 4: Imagens */}
              <Card className="border-border/80">
                <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                      <ImageIcon className="size-3.5 text-primary" />
                      Imagens
                    </CardTitle>
                    <CardDescription className="text-[11px]">
                      URLs públicas usadas no marketplace.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingVarImage(true)}
                    className="h-7 text-[11px] gap-1"
                  >
                    <Plus className="size-3" />
                    Adicionar imagem
                  </Button>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {isAddingVarImage && (
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        placeholder="https://exemplo.com/variacao.jpg"
                        value={newVarImageUrl}
                        onChange={(e) => setNewVarImageUrl(e.target.value)}
                        className="text-xs h-8"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (newVarImageUrl.trim()) {
                            setVarImages((prev) => [...prev, newVarImageUrl.trim()]);
                            setNewVarImageUrl("");
                            setIsAddingVarImage(false);
                          }
                        }}
                        className="h-8 text-xs"
                      >
                        OK
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsAddingVarImage(false);
                          setNewVarImageUrl("");
                        }}
                        className="h-8 text-xs"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}

                  {varImages.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground py-1">
                      Nenhuma imagem configurada.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {varImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/60 text-xs font-mono"
                        >
                          <span className="truncate max-w-md">{img}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setVarImages((prev) => prev.filter((_, i) => i !== idx))}
                            className="size-6 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="gap-2 sm:justify-end border-t border-border pt-3">
              <Button variant="outline" size="sm" onClick={() => setEditingVariation(null)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveVariation} className="gap-1.5">
                <Save className="size-3.5" />
                Salvar Variação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk Edit Modal */}
      {isBulkEditOpen && (
        <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-primary" />
                Edição em Massa ({selectedSkus.length} produtos)
              </DialogTitle>
              <DialogDescription className="text-xs">
                Ajuste os preços dos produtos selecionados aplicando uma porcentagem.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-2 text-xs">
              <div>
                <label className="font-semibold text-foreground">
                  Ajuste Percentual no Preço (%)
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 5 ou -10"
                    value={bulkPriceAdjustment}
                    onChange={(e) => setBulkPriceAdjustment(e.target.value)}
                    className="text-xs"
                  />
                  <span className="font-bold text-muted-foreground">%</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Use números positivos para aumento (ex: 10) ou negativos para desconto (ex: -5).
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button variant="outline" size="sm" onClick={() => setIsBulkEditOpen(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleApplyBulkPrice} disabled={isSaving} className="gap-1.5">
                <Sparkles className="size-3.5" />
                {isSaving ? "Aplicando..." : "Aplicar Reajuste"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
