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
import { MOCK_ORDERS } from "@/lib/api/mock-data";
import type { CustomerOrderDto } from "@/lib/api/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<CustomerOrderDto[]>(MOCK_ORDERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user?.customerId) return;
      setIsLoadingOrders(true);
      try {
        const data = await fetchCustomerOrders(user.customerId);
        if (data && data.length > 0) {
          setOrders(data);
        }
      } catch {
        // fallback
      } finally {
        setIsLoadingOrders(false);
      }
    }
    load();
  }, [user?.customerId]);

  // Order editor state
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrderDto | null>(null);
  const [editorTab, setEditorTab] = useState<"form" | "json">("form");
  const [rawJsonText, setRawJsonText] = useState("");
  const [formCustomerName, setFormCustomerName] = useState("");
  const [formStatus, setFormStatus] = useState<CustomerOrderDto["status"]>("APROVADO");
  const [formPaymentMethod, setFormPaymentMethod] = useState("");
  const [isEditing, setIsEditing] = useState(false);

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
    setRawJsonText(JSON.stringify(order, null, 2));
    setEditorTab("form");
    setIsEditing(true);
  };

  const handleCloseOrder = () => {
    setIsEditing(false);
    releaseLock();
    setSelectedOrder(null);
  };

  const handleSaveOrder = () => {
    if (!selectedOrder) return;
    if (isLockedByOther) {
      toast.error("Ação bloqueada: Outro usuário está com o lock deste pedido.");
      return;
    }

    try {
      let updated: CustomerOrderDto;

      if (editorTab === "json") {
        const parsed = JSON.parse(rawJsonText);
        updated = {
          ...parsed,
          version: (selectedOrder.version || 1) + 1,
          updatedAtUtc: new Date().toISOString(),
        };
      } else {
        updated = {
          ...selectedOrder,
          customerName: formCustomerName,
          status: formStatus,
          paymentMethod: formPaymentMethod,
          version: (selectedOrder.version || 1) + 1,
          updatedAtUtc: new Date().toISOString(),
        };
      }

      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      toast.success(`Pedido #${updated.marketplaceOrderId} salvo com sucesso!`);
      handleCloseOrder();
    } catch {
      toast.error("JSON inválido. Corrija a formatação antes de salvar.");
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
            Acompanhe pedidos recebidos dos marketplaces, detalhes de itens e status de download no ERP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Fila de pedidos sincronizada!")}
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Atualizar Lista
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
              <option value="mercadolivre">Mercado Livre</option>
              <option value="shopee">Shopee</option>
              <option value="amazon">Amazon</option>
              <option value="magalu">Magalu</option>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido / Marketplace</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Cliente / Documento</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total (R$)</TableHead>
                <TableHead>Status Venda</TableHead>
                <TableHead>Envio ERP</TableHead>
                <TableHead>Data / Hora</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium font-mono text-xs text-foreground">
                      {order.marketplaceOrderId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {order.channelName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>
                        <p className="font-medium text-foreground">{order.customerName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{order.customerDocument}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {order.items.length} un ({order.items[0]?.title.slice(0, 24)}...)
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-foreground">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={order.erpDownloadStatus === "BAIXADO" ? "success" : "warning"}
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
                        className="h-8 text-xs"
                      >
                        <Eye className="size-3.5 mr-1" />
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination Controls */}
        <CardFooter className="flex items-center justify-between p-4 border-t border-border/60 text-xs text-muted-foreground">
          <span>
            Mostrando {paginatedOrders.length} de {filteredOrders.length} pedidos
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

      {/* Order Editor Modal (Tabs: Form & Raw JSON) */}
      {selectedOrder && (
        <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && handleCloseOrder()}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center justify-between pr-6">
                <div className="flex items-center gap-2">
                  <span>Pedido #{selectedOrder.marketplaceOrderId}</span>
                  <Badge variant="outline">{selectedOrder.channelName}</Badge>
                </div>
                <span className="text-xs font-mono text-muted-foreground font-normal">
                  Versão v{selectedOrder.version}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Criado em {formatDateTime(selectedOrder.createdAtUtc)} • Última alteração: {formatDateTime(selectedOrder.updatedAtUtc)}
              </DialogDescription>
            </DialogHeader>

            {/* Concurrency Lock Banner */}
            <ConcurrencyBanner lock={activeLock} isLockedByMe={isLockedByMe} />

            {/* Tabs for Form / Raw JSON */}
            <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as any)} className="w-full">
              <TabsList className="grid grid-cols-2 w-48 mb-3">
                <TabsTrigger value="form" className="text-xs gap-1.5">
                  <FileText className="size-3.5" />
                  Formulário
                </TabsTrigger>
                <TabsTrigger value="json" className="text-xs gap-1.5">
                  <FileCode className="size-3.5" />
                  JSON Bruto
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
                disabled={isLockedByOther}
                className="gap-1.5"
              >
                <Save className="size-3.5" />
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
