import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layers, RefreshCw, Search, ChevronRight, FileBox, PackageX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { DataErrorState } from "@/components/shared/data-error-state";
import { useAuth } from "@/app/providers/auth-provider";
import { fetchProductBatches } from "@/lib/api/hub-client";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export function ProductsPipelinePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: batches = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["product-batches", user?.customerId],
    queryFn: () => (user?.customerId ? fetchProductBatches(user.customerId) : Promise.resolve([])),
    enabled: Boolean(user?.customerId),
    staleTime: 30000,
  });

  const handleManualSync = async () => {
    try {
      await refetch();
      toast.success("Lotes sincronizados com sucesso!");
    } catch {
      toast.error("Erro ao sincronizar lotes da API de produção.");
    }
  };

  const filteredBatches = batches.filter((b) =>
    b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.channelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="size-6 text-primary" />
            Lotes & Pipeline de Produtos
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe os arquivos de sincronização enviados pelo seu ERP e o status de processamento por marketplace.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleManualSync}
          disabled={isFetching}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Sincronizando..." : "Atualizar Lotes"}
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="border-border/80">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por lote ou arquivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Batches Table */}
      {isError ? (
        <DataErrorState
          title="Erro ao carregar lotes"
          message="Não foi possível obter o histórico de lotes da esteira. Tente novamente."
          onRetry={handleManualSync}
          isRetrying={isFetching}
        />
      ) : (
        <Card className="border-border/80">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b border-border/50">
            <div>
              <CardTitle className="text-sm font-semibold">Histórico de Arquivos e Lotes</CardTitle>
              <CardDescription className="text-xs">
                Total de <strong>{filteredBatches.length}</strong> lote{filteredBatches.length !== 1 ? "s" : ""}{" "}
                encontrado{filteredBatches.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
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
                {isLoading ? (
                  <TableSkeleton
                    rows={6}
                    columns={7}
                    columnWidths={["180px", "60px", "60px", "50px", "110px", "80px", "80px"]}
                  />
                ) : filteredBatches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <PackageX className="size-8 text-muted-foreground/60" />
                        <p className="text-sm font-medium text-foreground">Nenhum lote encontrado</p>
                        <p className="text-xs text-muted-foreground">
                          {searchTerm
                            ? "Tente buscar por outro termo ou nome de arquivo."
                            : "Nenhum arquivo de produto foi enviado para processamento ainda."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBatches.map((batch) => (
                    <TableRow key={batch.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        <Link
                          to={`/lotes-produtos/${batch.id}`}
                          className="text-primary hover:underline flex items-center gap-1.5"
                        >
                          <FileBox className="size-3.5" />
                          {batch.fileName || batch.batchNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center font-medium text-xs">
                        {batch.totalItems}
                      </TableCell>
                      <TableCell className="text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {batch.successItems}
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {batch.errorItems > 0 ? (
                          <span className="font-bold text-amber-600 dark:text-amber-400">{batch.errorItems}</span>
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
                        <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
                          <Link to={`/lotes-produtos/${batch.id}`}>
                            Abrir Lote
                            <ChevronRight className="size-3.5 ml-1" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
