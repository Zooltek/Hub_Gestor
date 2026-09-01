import { useState, useEffect } from "react";
import { Layers, RefreshCw, AlertTriangle, CheckCircle, FileText, ArrowRight, Eye, ShieldAlert, PackageX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/app/providers/auth-provider";
import { fetchProductBatches } from "@/lib/api/hub-client";
import type { ProductBatchDto } from "@/lib/api/types";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export function ProductBatchesPage() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<ProductBatchDto[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ProductBatchDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadBatches = async (showToast = false) => {
    if (!user?.customerId) return;
    setIsLoading(true);
    try {
      const data = await fetchProductBatches(user.customerId);
      setBatches(data || []);
      if (showToast) {
        toast.success(`Lotes sincronizados com o Hub de Produção! (${data?.length || 0} lotes)`);
      }
    } catch (error) {
      if (showToast) {
        toast.error("Erro ao sincronizar lotes da API.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, [user?.customerId]);

  const { activeLock, isLockedByMe, isLockedByOther, acquireLock, releaseLock } = useConcurrencyLock(
    "batch",
    selectedBatch?.id,
    isEditing
  );

  const handleOpenBatch = (batch: ProductBatchDto) => {
    setSelectedBatch(batch);
    setIsEditing(true);
  };

  const handleCloseBatch = () => {
    setIsEditing(false);
    releaseLock();
    setSelectedBatch(null);
  };

  const handleRetryBatch = () => {
    if (!selectedBatch) return;
    if (isLockedByOther) {
      toast.error("Outro usuário está processando ou editando este lote.");
      return;
    }

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: `Reprocessando ${selectedBatch.batchNumber}...`,
        success: () => {
          setBatches((prev) =>
            prev.map((b) =>
              b.id === selectedBatch.id
                ? {
                    ...b,
                    errorItems: 0,
                    successItems: b.totalItems,
                    errorLog: [],
                    status: "CONCLUIDO",
                    version: b.version + 1,
                  }
                : b
            )
          );
          handleCloseBatch();
          return `Lote ${selectedBatch.batchNumber} reprocessado com sucesso na API!`;
        },
        error: "Falha ao reprocessar lote.",
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Lotes & Envio de Produtos
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o pipeline de sincronização de produtos enviados do seu ERP para os marketplaces em tempo real.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadBatches(true)}
          disabled={isLoading}
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Sincronizando..." : "Atualizar Lotes"}
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total de Lotes</p>
              <p className="text-xl font-bold text-foreground">{batches.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lotes com 100% Sucesso</p>
              <p className="text-xl font-bold text-emerald-400">
                {batches.filter((b) => b.errorItems === 0).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lotes com Alertas/Erros</p>
              <p className="text-xl font-bold text-amber-400">
                {batches.filter((b) => b.errorItems > 0).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batches Table */}
      <Card className="border-border/80">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
              <div className="relative">
                <RefreshCw className="size-8 animate-spin text-primary" />
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              </div>
              <p className="text-sm font-semibold text-foreground mt-2">Processando e sincronizando lotes com o Hub Central...</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Verificando histórico de arquivos importados e validações da esteira. Aguarde um instante.
              </p>
            </div>
          ) : batches.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <PackageX className="size-8 text-muted-foreground/60" />
              <p className="text-sm font-medium text-foreground">Nenhum lote registrado</p>
              <p className="text-xs text-muted-foreground">
                Nenhum arquivo de lote foi importado ainda pelo Hub.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo de Origem / Lote</TableHead>
                  <TableHead className="text-center">Total Itens</TableHead>
                  <TableHead className="text-center">Sucesso</TableHead>
                  <TableHead className="text-center">Erros</TableHead>
                  <TableHead>Data / Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {batch.fileName || batch.batchNumber}
                    </TableCell>
                    <TableCell className="text-center font-medium text-xs">
                      {batch.totalItems}
                    </TableCell>
                    <TableCell className="text-center text-xs font-semibold text-emerald-400">
                      {batch.successItems}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {batch.errorItems > 0 ? (
                        <span className="font-bold text-amber-400">{batch.errorItems}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(batch.startedAtUtc)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          batch.status === "CONCLUIDO" && batch.errorItems === 0
                            ? "success"
                            : batch.errorItems > 0
                            ? "warning"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {batch.errorItems > 0 ? "Com Alertas" : batch.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenBatch(batch)}
                        className="h-8 text-xs"
                      >
                        <Eye className="size-3.5 mr-1" />
                        Diagnóstico
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Batch Details / Diagnostic Modal */}
      {selectedBatch && (
        <Dialog open={Boolean(selectedBatch)} onOpenChange={(open) => !open && handleCloseBatch()}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <span>Diagnóstico do {selectedBatch.batchNumber}</span>
                <Badge variant="outline">{selectedBatch.channelName}</Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Arquivo: {selectedBatch.fileName} • Iniciado em {formatDateTime(selectedBatch.startedAtUtc)}
              </DialogDescription>
            </DialogHeader>

            <ConcurrencyBanner lock={activeLock} isLockedByMe={isLockedByMe} />

            <div className="flex flex-col gap-3 py-2 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/40 p-2.5 border border-border/50">
                  <p className="text-muted-foreground text-[11px]">Total de SKUs</p>
                  <p className="text-base font-bold text-foreground">{selectedBatch.totalItems}</p>
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-2.5 border border-emerald-500/20">
                  <p className="text-emerald-300 text-[11px]">Processados OK</p>
                  <p className="text-base font-bold text-emerald-400">{selectedBatch.successItems}</p>
                </div>
                <div className="rounded-lg bg-amber-500/10 p-2.5 border border-amber-500/20">
                  <p className="text-amber-300 text-[11px]">Com Erro</p>
                  <p className="text-base font-bold text-amber-400">{selectedBatch.errorItems}</p>
                </div>
              </div>

              {selectedBatch.errorLog && selectedBatch.errorLog.length > 0 ? (
                <div className="flex flex-col gap-2 mt-2">
                  <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="size-4 text-amber-400" />
                    Itens com Rejeição de Validação
                  </p>
                  <div className="rounded-lg bg-card border border-border/80 divide-y divide-border/50 p-2 font-mono text-[11px] text-muted-foreground">
                    {selectedBatch.errorLog.map((err, i) => (
                      <div key={i} className="py-1.5 text-amber-200">
                        • {err}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  <CheckCircle className="size-4 text-emerald-400 shrink-0" />
                  <span>Todos os SKUs deste lote foram sincronizados com sucesso no marketplace!</span>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <span className="text-xs text-muted-foreground">Versão: v{selectedBatch.version}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCloseBatch}>
                  Fechar
                </Button>
                {selectedBatch.errorItems > 0 && (
                  <Button
                    size="sm"
                    onClick={handleRetryBatch}
                    disabled={isLockedByOther}
                  >
                    Reprocessar Lote
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
