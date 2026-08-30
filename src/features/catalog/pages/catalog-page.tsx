import { useState, useMemo, useEffect } from "react";
import {
  Package,
  Search,
  RefreshCw,
  Edit,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Save,
  Tag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { fetchProductCatalog } from "@/lib/api/hub-client";
import { MOCK_CATALOG } from "@/lib/api/mock-data";
import type { CatalogItemDto } from "@/lib/api/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export function CatalogPage() {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<CatalogItemDto[]>(MOCK_CATALOG);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [onlyPending, setOnlyPending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user?.customerId) return;
      setIsLoading(true);
      try {
        const data = await fetchProductCatalog(user.customerId, searchTerm);
        if (data && data.length > 0) {
          setCatalog(data);
        }
      } catch {
        // fallback
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user?.customerId]);

  // Item editor drawer state
  const [editingItem, setEditingItem] = useState<CatalogItemDto | null>(null);
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemPromoPrice, setItemPromoPrice] = useState<number | undefined>(undefined);
  const [itemStock, setItemStock] = useState<number>(0);
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState("mercadolivre");

  // Bulk edit state
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkPriceAdjustment, setBulkPriceAdjustment] = useState("");

  const categories = useMemo(() => Array.from(new Set(catalog.map((i) => i.category))), [catalog]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());

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
    setItemPrice(item.price);
    setItemPromoPrice(item.promotionalPrice);
    setItemStock(item.stock);
  };

  const handleSaveItem = () => {
    if (!editingItem) return;
    setCatalog((prev) =>
      prev.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              price: Number(itemPrice),
              promotionalPrice: itemPromoPrice ? Number(itemPromoPrice) : undefined,
              stock: Number(itemStock),
              version: i.version + 1,
            }
          : i
      )
    );
    toast.success(`Produto ${editingItem.sku} atualizado com sucesso!`);
    setEditingItem(null);
  };

  const handleApplyBulkPrice = () => {
    const percent = parseFloat(bulkPriceAdjustment);
    if (isNaN(percent) || selectedSkus.length === 0) {
      toast.error("Informe um percentual válido.");
      return;
    }

    setCatalog((prev) =>
      prev.map((item) => {
        if (selectedSkus.includes(item.sku)) {
          const newPrice = Number((item.price * (1 + percent / 100)).toFixed(2));
          return { ...item, price: newPrice, version: item.version + 1 };
        }
        return item;
      })
    );

    toast.success(`Reajuste de ${percent}% aplicado a ${selectedSkus.length} produto(s)!`);
    setIsBulkEditOpen(false);
    setSelectedSkus([]);
    setBulkPriceAdjustment("");
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
            Gerencie o catálogo unificado de produtos sincronizados com seus marketplaces e ERP Online.
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
            onClick={() => toast.success("Catálogo sincronizado com a nuvem!")}
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Sincronizar Catálogo
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="border-border/80">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por Título ou SKU..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 text-xs"
              />
            </div>

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
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyPending}
              onChange={(e) => setOnlyPending(e.target.checked)}
              className="size-4 rounded-sm border-input text-primary focus:ring-ring"
            />
            <span>Apenas produtos com alertas/pendências</span>
          </label>
        </CardContent>
      </Card>

      {/* Catalog Table with Multi-select */}
      <Card className="border-border/80">
        <CardContent className="p-0">
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
                <TableHead>SKU</TableHead>
                <TableHead>Produto / Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Preço Venda</TableHead>
                <TableHead className="text-center">Estoque ERP</TableHead>
                <TableHead>Canais / Marketplaces</TableHead>
                <TableHead className="text-right">Ação</TableHead>
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
                      {item.sku}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground max-w-xs truncate">
                      {item.title}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.category}
                    </TableCell>
                    <TableCell className="text-right text-xs font-semibold text-foreground">
                      {formatCurrency(item.price)}
                      {item.promotionalPrice && (
                        <span className="block text-[10px] text-emerald-400 font-normal">
                          Promo: {formatCurrency(item.promotionalPrice)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-xs font-semibold">
                      <span className={item.stock < 50 ? "text-amber-400" : "text-foreground"}>
                        {item.stock} un
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {item.channels.map((ch) => (
                          <Badge
                            key={ch.channel}
                            variant={ch.status === "ATIVO" ? "success" : ch.status === "ERRO" ? "destructive" : "secondary"}
                            className="text-[10px] gap-1 px-1.5 py-0"
                          >
                            {ch.channel}
                            {ch.status === "ATIVO" && <CheckCircle2 className="size-2.5" />}
                            {ch.status === "ERRO" && <AlertCircle className="size-2.5" />}
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
        </CardContent>

        {/* Pagination Controls */}
        <CardFooter className="flex items-center justify-between p-4 border-t border-border/60 text-xs text-muted-foreground">
          <span>
            Mostrando {paginatedCatalog.length} de {filteredCatalog.length} produtos
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="h-8 px-2"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-8 px-2"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Product Item Edit Drawer / Modal */}
      {editingItem && (
        <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center justify-between pr-6">
                <span>Editar Produto: {editingItem.sku}</span>
                <Badge variant="outline">{editingItem.category}</Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {editingItem.title}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-3 py-2 text-xs">
              <div>
                <label className="font-semibold text-foreground">Preço de Tabela (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(Number(e.target.value))}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-foreground">Preço Promocional (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={itemPromoPrice ?? ""}
                  onChange={(e) => setItemPromoPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Opcional"
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-foreground">Saldo em Estoque (ERP)</label>
                <Input
                  type="number"
                  value={itemStock}
                  onChange={(e) => setItemStock(Number(e.target.value))}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            {/* Marketplace Specific Status and Channel Mapping */}
            <div className="border-t border-border/60 pt-3">
              <p className="font-semibold text-xs text-foreground mb-2">Publicação por Canal</p>
              <div className="divide-y divide-border/40 rounded-lg border border-border/60 p-2 text-xs">
                {editingItem.channels.map((ch) => (
                  <div key={ch.channel} className="flex items-center justify-between py-2">
                    <span className="font-medium text-foreground">{ch.channel}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-muted-foreground">{ch.channelSku}</span>
                      <Badge
                        variant={ch.status === "ATIVO" ? "success" : ch.status === "ERRO" ? "destructive" : "secondary"}
                        className="text-[10px]"
                      >
                        {ch.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setEditingItem(null)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveItem} className="gap-1.5">
                <Save className="size-3.5" />
                Salvar Alterações
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
                <span>Edição em Massa ({selectedSkus.length} produtos)</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Aplique reajustes percentuais de preço a todos os produtos selecionados.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-2 text-xs">
              <div>
                <label className="font-semibold text-foreground">Ajuste de Preço (%)</label>
                <Input
                  type="number"
                  value={bulkPriceAdjustment}
                  onChange={(e) => setBulkPriceAdjustment(e.target.value)}
                  placeholder="Ex: 5 para +5%, -10 para -10%"
                  className="mt-1 text-xs"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Valores positivos aumentam o preço; valores negativos dão desconto.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsBulkEditOpen(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleApplyBulkPrice}>
                Aplicar aos {selectedSkus.length} Produtos
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
