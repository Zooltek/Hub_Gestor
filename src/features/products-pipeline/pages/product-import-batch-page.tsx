import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
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
  ShieldAlert,
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
import { ConcurrencyBanner } from "@/components/shared/concurrency-banner";
import { useConcurrencyLock } from "@/hooks/use-concurrency-lock";
import { MOCK_PRODUCT_BATCHES } from "@/lib/api/mock-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

interface BatchItemDetail {
  id: string;
  sku: string;
  parentSku?: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  pipelineStatus: "Aprovado" | "Pendente" | "Rejeitado" | "Despachado";
  dispatchTarget: string;
  requiresReview: boolean;
  errorMessage?: string;
  rawJson: any;
}

const MOCK_BATCH_ITEMS: BatchItemDetail[] = [
  {
    id: "item_1",
    sku: "KIT-FERR-001",
    title: "Kit Ferramentas Profissional 128 Peças Aço Cromo",
    category: "Ferramentas Manuais",
    price: 149.0,
    stock: 85,
    pipelineStatus: "Aprovado",
    dispatchTarget: "Mercado Livre, Shopee",
    requiresReview: false,
    rawJson: { sku: "KIT-FERR-001", title: "Kit Ferramentas Profissional 128 Peças", price: 149.0, stock: 85, ncm: "8206.00.00" },
  },
  {
    id: "item_2",
    sku: "FURAD-IMP-750W",
    title: "Furadeira de Impacto 750W Reversível 1/2 Pol. 220V",
    category: "Ferramentas Elétricas",
    price: 179.0,
    stock: 42,
    pipelineStatus: "Aprovado",
    dispatchTarget: "Mercado Livre, Amazon",
    requiresReview: false,
    rawJson: { sku: "FURAD-IMP-750W", title: "Furadeira de Impacto 750W Reversível", price: 179.0, stock: 42, ncm: "8467.21.00" },
  },
  {
    id: "item_3",
    sku: "TRENA-LASER-40M",
    title: "Trena a Laser Digital Profissional 40 Metros com Nível",
    category: "Medição",
    price: 129.0,
    stock: 35,
    pipelineStatus: "Pendente",
    dispatchTarget: "Shopee",
    requiresReview: true,
    errorMessage: "Código NCM ausente na tabela de tributação do ERP.",
    rawJson: { sku: "TRENA-LASER-40M", title: "Trena a Laser Digital Profissional 40 Metros", price: 129.0, stock: 35, ncm: "" },
  },
  {
    id: "item_4",
    sku: "DISCO-DIAM-110",
    title: "Disco de Corte Diamantado Turbo Porcelanato 110mm",
    category: "Acessórios",
    price: 39.9,
    stock: 450,
    pipelineStatus: "Pendente",
    dispatchTarget: "Shopee",
    requiresReview: true,
    errorMessage: "Preço promocional deve ser menor que o preço de tabela.",
    rawJson: { sku: "DISCO-DIAM-110", title: "Disco de Corte Diamantado Turbo Porcelanato", price: 39.9, stock: 450, promoPrice: 45.0 },
  },
];

export function ProductImportBatchPage() {
  const { batchId } = useParams();
  const batch = MOCK_PRODUCT_BATCHES.find((b) => b.id === batchId) || MOCK_PRODUCT_BATCHES[0];

  const [items, setItems] = useState<BatchItemDetail[]>(MOCK_BATCH_ITEMS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inspectedItem, setInspectedItem] = useState<BatchItemDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { activeLock, isLockedByMe, isLockedByOther, acquireLock, releaseLock } = useConcurrencyLock(
    "batch",
    batch.id,
    isEditing
  );

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.pipelineStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const handleApproveSelected = () => {
    if (selectedIds.length === 0) return;
    if (isLockedByOther) {
      toast.error("Ação bloqueada: Outro operador está com o lock deste lote.");
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id)
          ? { ...item, pipelineStatus: "Aprovado", requiresReview: false, errorMessage: undefined }
          : item
      )
    );
    toast.success(`${selectedIds.length} item(ns) aprovados para envio!`);
    setSelectedIds([]);
  };

  const handleForceDispatch = () => {
    if (isLockedByOther) {
      toast.error("Ação bloqueada: Outro operador está com o lock deste lote.");
      return;
    }

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: "Disparando lote para os marketplaces...",
        success: () => {
          setItems((prev) =>
            prev.map((i) => ({ ...i, pipelineStatus: "Despachado", errorMessage: undefined }))
          );
          return "Lote despachado com sucesso para os marketplaces!";
        },
        error: "Falha no despacho do lote.",
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Breadcrumb Back */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="size-8">
            <Link to="/lotes-produtos">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>Lote {batch.batchNumber}</span>
              <Badge variant="outline">{batch.channelName}</Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              Arquivo: {batch.fileName} • Iniciado em {formatDateTime(batch.startedAtUtc)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleForceDispatch}
            disabled={isLockedByOther}
            className="gap-1.5 text-xs"
          >
            <Send className="size-3.5" />
            Forçar Despacho do Lote
          </Button>
        </div>
      </div>

      {/* Concurrency Banner */}
      <ConcurrencyBanner lock={activeLock} isLockedByMe={isLockedByMe} />

      {/* Summary KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="border-border/80">
          <CardContent className="p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Total de Alterações</p>
            <p className="text-lg font-bold text-foreground">{items.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-emerald-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-[11px] text-emerald-400">Aprovadas / Prontas</p>
            <p className="text-lg font-bold text-emerald-400">
              {items.filter((i) => i.pipelineStatus === "Aprovado" || i.pipelineStatus === "Despachado").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-amber-500/5">
          <CardContent className="p-3 text-center">
            <p className="text-[11px] text-amber-400">Revisão Pendente</p>
            <p className="text-lg font-bold text-amber-400">
              {items.filter((i) => i.pipelineStatus === "Pendente").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80">
          <CardContent className="p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Destino dos Canais</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{batch.channelName}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Bulk Actions Bar */}
      <Card className="border-border/80">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por SKU ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">Todos os Status</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Pendente">Pendente</option>
              <option value="Despachado">Despachado</option>
            </select>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">
                {selectedIds.length} selecionado(s)
              </span>
              <Button size="sm" onClick={handleApproveSelected} className="h-8 text-xs gap-1">
                <CheckCircle className="size-3.5" />
                Aprovar Selecionados
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items Table with Reference Grouping */}
      <Card className="border-border/80">
        <CardContent className="p-0">
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
                <TableHead>SKU / Referência</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-center">Estoque</TableHead>
                <TableHead>Status Pipeline</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="text-center">
                      <button onClick={() => handleToggleSelect(item.id)} className="cursor-pointer">
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
                      {item.errorMessage && (
                        <span className="block text-[11px] text-amber-400 font-normal">
                          ⚠️ {item.errorMessage}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.category}
                    </TableCell>
                    <TableCell className="text-right text-xs font-semibold text-foreground">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell className="text-center text-xs font-semibold">
                      {item.stock} un
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.pipelineStatus === "Aprovado"
                            ? "success"
                            : item.pipelineStatus === "Despachado"
                            ? "info"
                            : "warning"
                        }
                        className="text-[10px]"
                      >
                        {item.pipelineStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.dispatchTarget}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setInspectedItem(item)}
                        className="h-8 text-xs"
                      >
                        <Eye className="size-3.5 mr-1" />
                        Snapshot
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Snapshot Inspection Modal */}
      {inspectedItem && (
        <Dialog open={Boolean(inspectedItem)} onOpenChange={(open) => !open && setInspectedItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center justify-between pr-6">
                <span>Snapshot do SKU: {inspectedItem.sku}</span>
                <Badge variant="outline">{inspectedItem.pipelineStatus}</Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {inspectedItem.title}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-2 text-xs">
              <p className="font-semibold text-foreground">Payload de Integração (JSON)</p>
              <textarea
                readOnly
                value={JSON.stringify(inspectedItem.rawJson, null, 2)}
                rows={12}
                className="w-full rounded-lg border border-input bg-black/70 p-3 font-mono text-xs text-foreground focus:outline-none"
              />
            </div>

            <DialogFooter>
              <Button size="sm" onClick={() => setInspectedItem(null)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
