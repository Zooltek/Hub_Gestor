import { useState, useMemo, useEffect } from "react";
import {
  ClipboardList,
  Search,
  RefreshCw,
  Eye,
  FileCode,
  FileText,
  Save,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  PackageX,
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
import { ConcurrencyBanner } from "@/components/shared/concurrency-banner";
import { useConcurrencyLock } from "@/hooks/use-concurrency-lock";
import { useAuth } from "@/app/providers/auth-provider";
import { fetchCustomerOrders, saveCustomerOrder } from "@/lib/api/hub-client";
import type { CustomerOrderDto } from "@/lib/api/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<CustomerOrderDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const loadOrders = async (showToast = false) => {
    if (!user?.customerId) return;
    setIsLoadingOrders(true);
    try {
      const data = await fetchCustomerOrders(user.customerId);
      setOrders(data || []);
      if (showToast) {
        toast.success(`Pedidos sincronizados! (${data?.length || 0} encontrados)`);
      }
    } catch (error) {
      if (showToast) {
        toast.error("Erro ao sincronizar pedidos da API de produção.");
      }
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user?.customerId]);

  // Order editor state
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrderDto | null>(null);
  const [editorTab, setEditorTab] = useState<"form" | "json">("form");
  const [rawJsonText, setRawJsonText] = useState("");
  const [formCustomerName, setFormCustomerName] = useState("");
  const [formStatus, setFormStatus] = useState<CustomerOrderDto["status"]>("APROVADO");
  const [formPaymentMethod, setFormPaymentMethod] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Concurrency Lock
  const { activeLock, isLockedByMe, isLockedByOther, acquireLock, releaseLock } = useConcurrencyLock(
    "order",
    selectedOrder?.id,
    isEditing
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.marketplaceOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerDocument.includes(searchTerm) ||
        order.items.some((i) => i.title.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesChannel = channelFilter === "all" || order.channel === channelFilter;
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [orders, searchTerm, channelFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleOpenOrder = (order: CustomerOrderDto) => {
    setSelectedOrder(order);
    setFormCustomerName(order.customerName);
    setFormStatus(order.status);
    setFormPaymentMethod(order.paymentMethod);
    setRawJsonText(order.rawJson || JSON.stringify(order, null, 2));
    setEditorTab("form");
    setIsEditing(true);
  };

  const handleCloseOrder = () => {
    setIsEditing(false);
    releaseLock();
    setSelectedOrder(null);
  };

  const handleSaveOrder = async () => {
    if (!selectedOrder) return;
    if (isLockedByOther) {
      toast.error("Ação bloqueada: Outro usuário está com o lock deste pedido.");
      return;
    }

    setIsSaving(true);
    try {
      let updatedJsonString = rawJsonText;
      let updatedOrderDto: CustomerOrderDto;

      if (editorTab === "json") {
        const parsed = JSON.parse(rawJsonText);
        updatedOrderDto = {
          ...parsed,
          version: (selectedOrder.version || 1) + 1,
          updatedAtUtc: new Date().toISOString(),
        };
        updatedJsonString = JSON.stringify(parsed);
      } else {
        updatedOrderDto = {
          ...selectedOrder,
          customerName: formCustomerName,
          status: formStatus,
          paymentMethod: formPaymentMethod,
          version: (selectedOrder.version || 1) + 1,
          updatedAtUtc: new Date().toISOString(),
        };
        updatedJsonString = JSON.stringify(updatedOrderDto);
      }

      await saveCustomerOrder(selectedOrder.id, updatedJsonString);
      setOrders((prev) => prev.map((o) => (o.id === updatedOrderDto.id ? updatedOrderDto : o)));
      toast.success(`Pedido #${updatedOrderDto.marketplaceOrderId} salvo na API de produção!`);
      handleCloseOrder();
    } catch {
      toast.error("Erro ao salvar pedido na API.");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadgeVariant = (status: CustomerOrderDto["status"]) => {
    switch (status) {
      case "APROVADO":
        return "success";
      case "FATURADO":
      case "ENTREGUE":
        return "info";
      case "PENDENTE":
        return "warning";
      case "CANCELADO":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardList className="size-6 text-primary" />
            Pedidos do Cliente
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe pedidos recebidos dos marketplaces, detalhes de itens e status de download no ERP em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadOrders(true)}
            disabled={isLoadingOrders}
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${isLoadingOrders ? "animate-spin" : ""}`} />
            {isLoadingOrders ? "Sincronizando..." : "Atualizar Lista"}
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="border-border/80">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID, Cliente, Documento ou SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">Todos os Canais</option>
              {Array.from(new Set(orders.map((o) => o.channelName).filter(Boolean))).map((ch) => (
                <option key={ch} value={ch.toLowerCase().replace(/\s+/g, "")}>
                  {ch}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">Todos os Status</option>
              <option value="APROVADO">Aprovado</option>
              <option value="PENDENTE">Pendente</option>
              <option value="FATURADO">Faturado</option>
              <option value="ENTREGUE">Entregue</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-border/80">
        <CardContent className="p-0">
          {isLoadingOrders ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
              <div className="relative">
                <RefreshCw className="size-8 animate-spin text-primary" />
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              </div>
              <p className="text-sm font-semibold text-foreground mt-2">Processando e sincronizando pedidos com o Hub Central...</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Conectando ao banco de dados em nuvem do Hub. Isso pode levar alguns segundos dependendo do volume de dados.
              </p>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <PackageX className="size-8 text-muted-foreground/60" />
              <p className="text-sm font-medium text-foreground">Nenhum pedido encontrado</p>
              <p className="text-xs text-muted-foreground">
                {searchTerm || channelFilter !== "all" || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Aguardando novos pedidos dos canais de venda integrados."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido / Marketplace</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Cliente / CPF</TableHead>
                  <TableHead className="text-center">Itens</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead>Status Venda</TableHead>
                  <TableHead>Status ERP</TableHead>
                  <TableHead>Data / Hora</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {order.marketplaceOrderId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {order.channelName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-xs text-foreground">{order.customerName}</span>
                        <span className="text-[10px] text-muted-foreground">{order.customerDocument}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs font-semibold">
                      {order.itemsCount}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs text-foreground">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)} className="text-[10px]">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={order.erpDownloadStatus === "BAIXADO" ? "success" : "secondary"}
                        className="text-[10px]"
                      >
                        {order.erpDownloadStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(order.createdAtUtc)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenOrder(order)}
                        className="h-8 text-xs gap-1"
                      >
                        <Eye className="size-3.5" />
                        Ver / Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {filteredOrders.length > PAGE_SIZE && (
          <CardFooter className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Mostrando {(currentPage - 1) * PAGE_SIZE + 1} a{" "}
              {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} de {filteredOrders.length} pedidos
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

      {/* Order Details & Editor Modal */}
      {selectedOrder && (
        <Dialog open={isEditing} onOpenChange={(open) => !open && handleCloseOrder()}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="size-5 text-primary" />
                  Pedido #{selectedOrder.marketplaceOrderId}
                </DialogTitle>
                <Badge variant="outline" className="text-xs">
                  {selectedOrder.channelName}
                </Badge>
              </div>
              <DialogDescription className="text-xs">
                Visualize os dados do pedido, edite as informações de despacho ou o JSON bruto sincronizado.
              </DialogDescription>
            </DialogHeader>

            {/* Anti-collision Banner */}
            <ConcurrencyBanner
              lock={activeLock}
              isLockedByMe={isLockedByMe}
            />

            <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as any)} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="form" className="text-xs flex items-center gap-1.5">
                  <FileText className="size-3.5" />
                  Formulário Visual
                </TabsTrigger>
                <TabsTrigger value="json" className="text-xs flex items-center gap-1.5">
                  <FileCode className="size-3.5" />
                  Payload JSON Bruto
                </TabsTrigger>
              </TabsList>

              {/* Form View Tab */}
              <TabsContent value="form" className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-3 border border-border/50">
                  <div>
                    <label className="font-semibold text-foreground">Nome do Comprador</label>
                    <Input
                      value={formCustomerName}
                      onChange={(e) => setFormCustomerName(e.target.value)}
                      className="mt-1 text-xs"
                      disabled={isLockedByOther}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-foreground">Status da Venda</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      disabled={isLockedByOther}
                      className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="APROVADO">APROVADO</option>
                      <option value="PENDENTE">PENDENTE</option>
                      <option value="FATURADO">FATURADO</option>
                      <option value="ENTREGUE">ENTREGUE</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-foreground">Forma de Pagamento</label>
                    <Input
                      value={formPaymentMethod}
                      onChange={(e) => setFormPaymentMethod(e.target.value)}
                      className="mt-1 text-xs"
                      disabled={isLockedByOther}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-foreground">Endereço de Entrega</label>
                    <p className="text-muted-foreground mt-1 text-[11px]">
                      {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.number} - {selectedOrder.shippingAddress.city}/{selectedOrder.shippingAddress.state}
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <p className="font-semibold text-foreground mb-2">Itens do Pedido ({selectedOrder.items.length})</p>
                  <div className="rounded-lg border border-border/60 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead className="text-center">Qtd</TableHead>
                          <TableHead className="text-right">Unitário</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-muted-foreground">{item.sku}</TableCell>
                            <TableCell className="font-medium text-foreground">{item.title}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(item.totalPrice)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center bg-card p-3 rounded-lg border border-border/60">
                  <span className="text-muted-foreground font-medium">Valor Total do Pedido:</span>
                  <span className="text-base font-bold text-foreground">{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </TabsContent>

              {/* Raw JSON Tab */}
              <TabsContent value="json" className="flex flex-col gap-2">
                <textarea
                  value={rawJsonText}
                  onChange={(e) => setRawJsonText(e.target.value)}
                  disabled={isLockedByOther}
                  rows={16}
                  className="w-full rounded-lg border border-input bg-black/70 p-3 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button variant="outline" size="sm" onClick={handleCloseOrder}>
                Fechar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveOrder}
                disabled={isLockedByOther || isSaving}
                className="gap-1.5"
              >
                <Save className="size-3.5" />
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
