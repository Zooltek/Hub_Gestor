import { useState, useEffect, useMemo, Fragment } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  RefreshCw,
  Search,
  Eye,
  Layers,
  FileCode,
  CheckSquare,
  Square,
  PackageX,
  GitCompare,
  Layers3,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ConcurrencyBanner } from "@/components/shared/concurrency-banner";
import { StatusBadge } from "@/components/shared/status-badge";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useConcurrencyLock } from "@/hooks/use-concurrency-lock";
import { useAuth } from "@/app/providers/auth-provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchProductBatchById,
  approveProductChangesBatch,
  forceDispatchProductChange,
} from "@/lib/api/hub-client";
import type { ProductBatchDto, ProductChangeDto, ProductChangeVariationDto } from "@/lib/api/types";
import type { StatusTone } from "@/lib/status";
import { cn, formatCurrency, formatDateTime, formatNumber } from "@/lib/utils";
import { toast } from "sonner";

function getBatchStatusTone(statusLabel: string): StatusTone {
  const norm = statusLabel.toLowerCase();
  if (norm.includes("sem altera") || norm.includes("aprovado") || norm.includes("despachado")) {
    return "default";
  }
  if (norm.includes("pendente") || norm.includes("despachando")) {
    return "warning";
  }
  if (norm.includes("erro") || norm.includes("rejeitado")) {
    return "danger";
  }
  return "default";
}

export function ProductImportBatchPage() {
  const { batchId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedReferences, setExpandedReferences] = useState<string[]>([]);
  const [inspectedItem, setInspectedItem] = useState<ProductChangeDto | null>(null);
  const [inspectTab, setInspectTab] = useState<"diff" | "snapshots" | "raw">("diff");
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  const {
    data: batchData,
    isLoading,
    isFetching,
    refetch: refetchBatchDetails,
  } = useQuery({
    queryKey: ["batch-details", batchId],
    queryFn: () => (batchId ? fetchProductBatchById(batchId) : Promise.resolve(null)),
    enabled: Boolean(batchId),
    staleTime: 30000,
  });

  const batch = batchData?.batch || null;
  const items = batchData?.items || [];

  const { activeLock, isLockedByMe, isLockedByOther } = useConcurrencyLock(
    "batch",
    batchId,
    false
  );

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.statusLabel === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const groupedItems = useMemo(() => {
    const map = new Map<string, {
      reference: string;
      representativeItem: ProductChangeDto;
      items: ProductChangeDto[];
      variations: ProductChangeVariationDto[];
    }>();

    filteredItems.forEach((item) => {
      const ref = (item.reference || item.sku || "").trim();
      const lookupKey = ref.toLowerCase();

      const itemVariations: ProductChangeVariationDto[] =
        item.variations && item.variations.length > 0
          ? item.variations
          : [
              {
                sku: item.sku,
                variationName: "Padrão",
                stock: item.stock,
                price: item.price,
                statusLabel: item.statusLabel,
                reviewLabel: item.reviewLabel || (item.requiresReview ? "Manual" : "Automática"),
                dispatchTargets: [item.dispatchTarget || "Shopify"],
                createdAtUtc: item.createdAtUtc,
              },
            ];

      if (!map.has(lookupKey)) {
        map.set(lookupKey, {
          reference: ref,
          representativeItem: item,
          items: [item],
          variations: [...itemVariations],
        });
      } else {
        const group = map.get(lookupKey)!;
        group.items.push(item);

        itemVariations.forEach((v) => {
          const exists = group.variations.some(
            (gv) => gv.sku?.toLowerCase() === v.sku?.toLowerCase() && gv.variationName === v.variationName
          );
          if (!exists) {
            group.variations.push(v);
          }
        });
      }
    });

    return Array.from(map.values());
  }, [filteredItems]);

  const toggleExpanded = (ref: string) => {
    setExpandedReferences((prev) =>
      prev.includes(ref) ? prev.filter((r) => r !== ref) : [...prev, ref]
    );
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const handleApproveSelected = async () => {
    if (selectedIds.length === 0 || !user?.customerId) return;
    if (isLockedByOther) {
      toast.error("Ação bloqueada: Outro operador está com o lock deste lote.");
      return;
    }

    setIsActionInProgress(true);
    try {
      await approveProductChangesBatch(selectedIds, user.customerId);
      queryClient.invalidateQueries({ queryKey: ["batch-details", batchId] });
      toast.success(`${selectedIds.length} produto(s) aprovados na esteira com sucesso!`);
      setSelectedIds([]);
    } catch {
      toast.error("Erro ao aprovar alterações na API.");
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleForceDispatchBatch = async () => {
    if (!batchId || isActionInProgress) return;
    if (isLockedByOther) {
      toast.error("Ação bloqueada: Outro operador está com o lock deste lote.");
      return;
    }

    setIsActionInProgress(true);
    try {
      const firstItem = items[0];
      if (firstItem) {
        await forceDispatchProductChange(firstItem.id);
      }
      queryClient.invalidateQueries({ queryKey: ["batch-details", batchId] });
      toast.success("Despacho disparado para os canais integrados!");
    } catch {
      toast.error("Erro ao forçar despacho na API.");
    } finally {
      setIsActionInProgress(false);
    }
  };

  const currentBatch = batch || {
    id: batchId || "lote",
    batchNumber: "Produtos.csv",
    fileName: "Produtos.csv",
    totalItems: items.length,
    processedItems: items.length,
    successItems: items.length,
    errorItems: 0,
    status: "CONCLUIDO" as const,
    startedAtUtc: new Date().toISOString(),
    channelName: "Esteira",
    version: 1,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs de Navegação */}
      <Breadcrumbs
        items={[
          { label: "Lotes & Pipeline", href: "/lotes-produtos" },
          { label: currentBatch.fileName || currentBatch.batchNumber },
        ]}
      />

      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="size-8">
            <Link to="/lotes-produtos">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                Lote {currentBatch.fileName || currentBatch.batchNumber}
              </h1>
              <Badge variant={currentBatch.status === "ERRO" ? "destructive" : "success"} className="text-[10px]">
                {currentBatch.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              ID: {currentBatch.id} • Iniciado em: {formatDateTime(currentBatch.startedAtUtc)}
            </p>
          </div>
        </div>

        {/* Global Batch Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchBatchDetails()}
            disabled={isFetching}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Atualizando..." : "Atualizar"}
          </Button>

          <Button
            size="sm"
            onClick={handleApproveSelected}
            disabled={selectedIds.length === 0 || isActionInProgress}
            className="h-8 text-xs gap-1.5"
          >
            <CheckCircle className="size-3.5" />
            Aprovar selecionados ({selectedIds.length})
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleForceDispatchBatch}
            disabled={isActionInProgress}
            className="h-8 text-xs gap-1.5"
          >
            <Send className="size-3.5" />
            Forçar Despacho
          </Button>
        </div>
      </div>

      {/* Anti-collision Banner */}
      <ConcurrencyBanner
        lock={activeLock}
        isLockedByMe={isLockedByMe}
      />

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/80">
          <CardContent className="p-3 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Layers className="size-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Total de Itens</p>
              <p className="text-base font-bold text-foreground">{currentBatch.totalItems || items.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-3 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="size-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Prontos / Aprovados</p>
              <p className="text-base font-bold text-emerald-400">
                {items.filter((i) => i.statusLabel === "Aprovado" || i.statusLabel === "Despachado" || i.statusLabel === "Sem alteração").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-3 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="size-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Pendentes de Revisão</p>
              <p className="text-base font-bold text-amber-400">
                {items.filter((i) => i.requiresReview || i.statusLabel === "Pendente").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-3 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <XCircle className="size-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Erros / Bloqueados</p>
              <p className="text-base font-bold text-rose-400">
                {items.filter((i) => i.statusLabel === "Erro" || i.statusLabel === "Rejeitado").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border-border/80">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por SKU, referência ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">Todos os Status</option>
              <option value="Sem alteração">Sem alteração</option>
              <option value="Pendente">Pendente</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Despachado">Despachado</option>
              <option value="Erro">Erro</option>
              <option value="Rejeitado">Rejeitado</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card className="border-border/80">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
              <div className="relative">
                <RefreshCw className="size-8 animate-spin text-primary" />
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              </div>
              <p className="text-sm font-semibold text-foreground mt-2">Processando e sincronizando itens do lote...</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Carregando registros e snapshots dos produtos deste lote.
              </p>
            </div>
          ) : groupedItems.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <PackageX className="size-8 text-muted-foreground/60" />
              <p className="text-sm font-medium text-foreground">Nenhum produto neste lote</p>
              <p className="text-xs text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Este lote não possui registros de alteração de produtos."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center">
                    <button onClick={handleSelectAll} className="cursor-pointer">
                      {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                        <CheckSquare className="size-4 text-primary" />
                      ) : (
                        <Square className="size-4 text-muted-foreground" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead>Nome do produto / Descrição</TableHead>
                  <TableHead className="text-center">Variações</TableHead>
                  <TableHead>Destinos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Revisão</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedItems.map((group) => {
                  const rep = group.representativeItem;
                  const isSelected = selectedIds.includes(rep.id);
                  const isExpanded = expandedReferences.includes(group.reference);
                  const hasMultipleVariations = group.variations.length > 1;

                  return (
                    <Fragment key={group.reference}>
                      <TableRow className="hover:bg-muted/30">
                        <TableCell className="text-center">
                          <button onClick={() => handleToggleSelect(rep.id)} className="cursor-pointer">
                            {isSelected ? (
                              <CheckSquare className="size-4 text-primary" />
                            ) : (
                              <Square className="size-4 text-muted-foreground" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-foreground">
                          <div className="flex items-center gap-1.5">
                            {hasMultipleVariations ? (
                              <button
                                type="button"
                                onClick={() => toggleExpanded(group.reference)}
                                className="p-0.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                              >
                                <ChevronRight className={cn("size-4 transition-transform duration-200", isExpanded && "rotate-90")} />
                              </button>
                            ) : (
                              <span className="w-5" />
                            )}
                            <span>{group.reference}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-foreground max-w-xs truncate">
                          {rep.title}
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs text-foreground font-semibold">
                          {group.variations.length}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {rep.dispatchTarget || "Shopify"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge tone={getBatchStatusTone(rep.statusLabel)}>
                            {rep.statusLabel}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {rep.reviewLabel || (rep.requiresReview ? "Manual" : "Automática")}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(rep.createdAtUtc)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setInspectedItem(rep);
                              setInspectTab("diff");
                            }}
                            className="h-7 text-xs gap-1"
                          >
                            <Eye className="size-3.5" />
                            Inspecionar
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Variations Sub-table */}
                      {hasMultipleVariations && isExpanded && (
                        <TableRow className="hover:bg-transparent border-t-0">
                          <TableCell colSpan={9} className="p-0">
                            <div className="bg-muted/20 border-y border-border/70 px-4 py-3 pl-12">
                              <Table>
                                <TableHeader>
                                  <TableRow className="hover:bg-transparent border-b border-border/40">
                                    <TableHead className="text-xs font-semibold">SKU</TableHead>
                                    <TableHead className="text-xs font-semibold">Variação</TableHead>
                                    <TableHead className="text-xs font-semibold">Destinos</TableHead>
                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                    <TableHead className="text-xs font-semibold">Revisão</TableHead>
                                    <TableHead className="text-xs font-semibold">Criado em</TableHead>
                                    <TableHead className="text-right text-xs font-semibold"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {group.variations.map((v, vIdx) => (
                                    <TableRow key={vIdx} className="hover:bg-muted/40 border-b border-border/20">
                                      <TableCell className="font-mono text-xs font-medium text-foreground">
                                        {v.sku}
                                      </TableCell>
                                      <TableCell className="text-xs font-semibold text-foreground">
                                        {v.variationName}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="text-[10px]">
                                          {v.dispatchTargets?.join(", ") || rep.dispatchTarget || "Shopify"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <StatusBadge tone={getBatchStatusTone(v.statusLabel || rep.statusLabel)}>
                                          {v.statusLabel || rep.statusLabel}
                                        </StatusBadge>
                                      </TableCell>
                                      <TableCell className="text-xs text-muted-foreground">
                                        {v.reviewLabel || rep.reviewLabel || "Automática"}
                                      </TableCell>
                                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDateTime(v.createdAtUtc || rep.createdAtUtc)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setInspectedItem(rep);
                                            setInspectTab("diff");
                                          }}
                                          className="h-6 text-xs text-muted-foreground hover:text-foreground"
                                        >
                                          Detalhes
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {filteredItems.length > 0 && (
          <CardFooter className="p-3 border-t border-border/80 text-xs text-muted-foreground flex justify-between">
            <span>
              Mostrando 1-{groupedItems.length} de {groupedItems.length} referência(s) filtradas
            </span>
            <span>{selectedIds.length} selecionado(s) entre todas as referências filtradas</span>
          </CardFooter>
        )}
      </Card>

      {/* Item Inspector / Diff Modal */}
      {inspectedItem && (
        <Dialog open={Boolean(inspectedItem)} onOpenChange={(open) => !open && setInspectedItem(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="size-4 text-primary" />
                  Produto: {inspectedItem.title}
                </DialogTitle>
                <Badge variant="outline" className="text-xs font-mono">
                  Ref: {inspectedItem.reference}
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Preço: <strong>{formatCurrency(inspectedItem.price)}</strong> • Estoque: <strong>{formatNumber(inspectedItem.stock)} un</strong> • Status: <strong>{inspectedItem.statusLabel}</strong>
              </DialogDescription>
            </DialogHeader>

            <Tabs value={inspectTab} onValueChange={(v) => setInspectTab(v as any)} className="w-full flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid grid-cols-3 mb-3">
                <TabsTrigger value="diff" className="text-xs flex items-center gap-1.5">
                  <GitCompare className="size-3.5" />
                  Diferenças (Diff)
                </TabsTrigger>
                <TabsTrigger value="snapshots" className="text-xs flex items-center gap-1.5">
                  <Layers3 className="size-3.5" />
                  Snapshots (Antes x Depois)
                </TabsTrigger>
                <TabsTrigger value="raw" className="text-xs flex items-center gap-1.5">
                  <FileCode className="size-3.5" />
                  JSON Bruto
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Diff */}
              <TabsContent value="diff" className="flex-1 overflow-y-auto pr-1">
                {inspectedItem.diff && inspectedItem.diff.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campo Modificado</TableHead>
                          <TableHead>Valor Anterior (Salvo)</TableHead>
                          <TableHead>Novo Valor (Importado)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inspectedItem.diff.map((d, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-semibold text-xs text-foreground">{d.field}</TableCell>
                            <TableCell className="text-xs text-rose-400 bg-rose-500/5 font-mono">{d.oldValue || "-"}</TableCell>
                            <TableCell className="text-xs text-emerald-400 bg-emerald-500/5 font-mono">{d.newValue || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <CheckCircle className="size-7 text-emerald-400" />
                    <p className="text-xs font-semibold text-foreground">Nenhuma divergência detectada</p>
                    <p className="text-[11px]">Os dados deste produto no arquivo importado são idênticos aos cadastrados no catálogo do Hub.</p>
                  </div>
                )}
              </TabsContent>

              {/* Tab 2: Snapshots */}
              <TabsContent value="snapshots" className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pr-1">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Snapshot Anterior (Salvo no Hub)</span>
                  <pre className="p-3 rounded-lg bg-black/60 border border-border/60 text-[11px] font-mono text-muted-foreground overflow-x-auto h-64">
                    {JSON.stringify(inspectedItem.savedSnapshot || {}, null, 2)}
                  </pre>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-emerald-400">Snapshot Recebido (Novo Arquivo)</span>
                  <pre className="p-3 rounded-lg bg-black/60 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 overflow-x-auto h-64">
                    {JSON.stringify(inspectedItem.incomingSnapshot || inspectedItem.rawJson || {}, null, 2)}
                  </pre>
                </div>
              </TabsContent>

              {/* Tab 3: Raw JSON */}
              <TabsContent value="raw" className="flex-1 overflow-y-auto pr-1">
                <pre className="p-3 rounded-lg bg-black/70 border border-border/60 text-xs font-mono text-foreground overflow-x-auto h-72">
                  {JSON.stringify(inspectedItem, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4">
              <Button variant="outline" size="sm" onClick={() => setInspectedItem(null)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
