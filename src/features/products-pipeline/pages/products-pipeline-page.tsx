import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layers, RefreshCw, Search, ChevronRight, FileBox, Eye, CheckCircle2, AlertTriangle, PackageX } from "lucide-react";
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
import { useAuth } from "@/app/providers/auth-provider";
import { fetchProductBatches } from "@/lib/api/hub-client";
import type { ProductBatchDto } from "@/lib/api/types";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export function ProductsPipelinePage() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<ProductBatchDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadBatches = async (showToast = false) => {
    if (!user?.customerId) return;
    setIsLoading(true);
    try {
      const data = await fetchProductBatches(user.customerId);
      setBatches(data || []);
      if (showToast) {
        toast.success(`Lotes sincronizados! (${data?.length || 0} encontrados)`);
      }
    } catch (error) {
      if (showToast) {
        toast.error("Erro ao sincronizar lotes da API de produção.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, [user?.customerId]);

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
          onClick={() => loadBatches(true)}
          disabled={isLoading}
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Sincronizando..." : "Atualizar Lotes"}
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
                Consultando histórico de arquivos importados e validações da esteira. Aguarde um instante.
              </p>
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <PackageX className="size-8 text-muted-foreground/60" />
              <p className="text-sm font-medium text-foreground">Nenhum lote encontrado</p>
              <p className="text-xs text-muted-foreground">
                {searchTerm
                  ? "Tente buscar por outro termo ou nome de arquivo."
                  : "Nenhum arquivo de produto foi enviado para processamento ainda."}
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
                {filteredBatches.map((batch) => (
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
                      <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
                        <Link to={`/lotes-produtos/${batch.id}`}>
                          Abrir Lote
                          <ChevronRight className="size-3.5 ml-1" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
