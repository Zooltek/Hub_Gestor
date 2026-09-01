import { useState, useEffect, useMemo } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  AlertCircle,
  Package,
  ShoppingCart,
  FileCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/app/providers/auth-provider";
import { fetchCustomerOrders, fetchProductBatches, fetchProductCatalog } from "@/lib/api/hub-client";
import { toast } from "sonner";

export interface HubNotification {
  id: string;
  type: "order" | "product" | "tax" | "stock" | "system";
  title: string;
  description: string;
  createdAt: string; // ISO string
  read: boolean;
  link?: string;
  severity?: "error" | "warning" | "info" | "success";
}

function timeAgo(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "agora mesmo";
    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffHours < 24) return `há ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
    if (diffDays === 1) return "ontem";
    return `há ${diffDays} dias`;
  } catch {
    return "recentemente";
  }
}

export function NotificationsPopover() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");
  const [notifications, setNotifications] = useState<HubNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const storageKey = user?.customerId ? `hub_notifications_${user.customerId}` : "hub_notifications_default";

  // Carrega notificações do localStorage ou gera base inicial
  const loadSavedNotifications = (): HubNotification[] => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  };

  const saveNotifications = (items: HubNotification[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  // Sincroniza notificações a partir dos dados reais do Hub
  const syncNotificationsFromHub = async (showToast = false) => {
    if (!user?.customerId) return;
    setIsLoading(true);

    try {
      const [orders, batches, catalog] = await Promise.all([
        fetchCustomerOrders(user.customerId).catch(() => []),
        fetchProductBatches(user.customerId).catch(() => []),
        fetchProductCatalog(user.customerId).catch(() => []),
      ]);

      const existing = loadSavedNotifications();
      const existingIds = new Set(existing.map((n) => n.id));
      const newItems: HubNotification[] = [];

      // 1. Falhas e alertas de pedidos reais
      orders.forEach((o, index) => {
        const orderCode = o.marketplaceOrderId || `ORD-${o.id.slice(0, 6)}`;
        
        // Notificação de Tributação calculada (padrão Hub Admin)
        const taxId = `tax_${o.id}`;
        if (!existingIds.has(taxId)) {
          newItems.push({
            id: taxId,
            type: "tax",
            title: "Tributação calculada",
            description: `A venda ${orderCode} teve a tributação calculada.`,
            createdAt: o.createdAtUtc || new Date(Date.now() - index * 86400000 * 2).toISOString(),
            read: false,
            link: "/pedidos",
            severity: "info",
          });
        }

        // Falha no download ERP
        if (o.erpDownloadStatus === "ERRO") {
          const errId = `order_erp_err_${o.id}`;
          if (!existingIds.has(errId)) {
            newItems.push({
              id: errId,
              type: "order",
              title: "Falha de integração no pedido",
              description: `O pedido ${orderCode} (${o.customerName}) apresentou falha na sincronização com o ERP.`,
              createdAt: o.updatedAtUtc || o.createdAtUtc || new Date().toISOString(),
              read: false,
              link: "/pedidos",
              severity: "error",
            });
          }
        }

        // Pedido cancelado
        if (o.status === "CANCELADO") {
          const cancelId = `order_cancel_${o.id}`;
          if (!existingIds.has(cancelId)) {
            newItems.push({
              id: cancelId,
              type: "order",
              title: "Pedido Cancelado",
              description: `O pedido ${orderCode} foi cancelado no canal ${o.channelName || o.channel}.`,
              createdAt: o.updatedAtUtc || o.createdAtUtc || new Date().toISOString(),
              read: false,
              link: "/pedidos",
              severity: "warning",
            });
          }
        }
      });

      // 2. Falhas e alertas de lotes de produtos
      batches.forEach((b) => {
        if (b.errorItems > 0 || b.status === "ERRO") {
          const batchErrId = `batch_err_${b.id}`;
          if (!existingIds.has(batchErrId)) {
            newItems.push({
              id: batchErrId,
              type: "product",
              title: "Falha no lote de produtos",
              description: `O lote ${b.fileName || b.id} possui ${b.errorItems} produto(s) com erro na importação.`,
              createdAt: b.startedAtUtc || new Date().toISOString(),
              read: false,
              link: `/lotes-produtos/${b.id}`,
              severity: "error",
            });
          }
        }
      });

      // 3. Alertas de catálogo (produtos pausados ou em erro nos canais)
      catalog.forEach((cat) => {
        const errorChannel = cat.channels?.find((c) => c.status === "ERRO");
        if (errorChannel) {
          const catErrId = `cat_err_${cat.id}_${errorChannel.channel}`;
          if (!existingIds.has(catErrId)) {
            newItems.push({
              id: catErrId,
              type: "product",
              title: "Erro de sincronização de catálogo",
              description: `O produto ${cat.title} (${cat.reference || cat.sku}) falhou no canal ${errorChannel.channel}.`,
              createdAt: cat.lastImportedAtUtc || new Date().toISOString(),
              read: false,
              link: "/catalogo",
              severity: "error",
            });
          }
        }
      });

      const merged = [...newItems, ...existing].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(merged);
      saveNotifications(merged);

      if (showToast) {
        toast.success("Notificações sincronizadas com sucesso!");
      }
    } catch {
      if (showToast) {
        toast.error("Erro ao sincronizar notificações.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const saved = loadSavedNotifications();
    if (saved.length > 0) {
      setNotifications(saved);
    }
    syncNotificationsFromHub();
  }, [user?.customerId]);

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read),
    [notifications]
  );

  const readNotifications = useMemo(
    () => notifications.filter((n) => n.read),
    [notifications]
  );

  const currentList = activeTab === "unread" ? unreadNotifications : readNotifications;

  // Ações
  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n));
      saveNotifications(updated);
      return updated;
    });
  };

  const handleDeleteNotification = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveNotifications(updated);
      return updated;
    });
    toast.success("Notificação removida.");
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
    toast.success("Todas as notificações foram marcadas como lidas.");
  };

  const handleClearAll = () => {
    if (activeTab === "unread") {
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.read);
        saveNotifications(updated);
        return updated;
      });
      toast.success("Notificações não lidas foram removidas.");
    } else {
      setNotifications((prev) => {
        const updated = prev.filter((n) => !n.read);
        saveNotifications(updated);
        return updated;
      });
      toast.success("Histórico de notificações lidas foi limpo.");
    }
  };

  const handleItemClick = (notification: HubNotification) => {
    if (!notification.read) {
      handleToggleRead(notification.id);
    }
    if (notification.link) {
      setIsOpen(false);
      navigate(notification.link);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 relative text-muted-foreground hover:text-foreground cursor-pointer"
          title="Notificações do Hub"
        >
          <Bell className="size-4" />
          {unreadNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm animate-in fade-in zoom-in-75">
              {unreadNotifications.length > 99 ? "99+" : unreadNotifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] sm:w-[380px] p-0 rounded-2xl shadow-2xl border-border bg-card overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-3.5 pb-2.5 flex items-center justify-between border-b border-border/70">
          <span className="font-semibold text-sm text-foreground">Notificações</span>

          <div className="flex items-center gap-1.5">
            {/* Atualizar */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => syncNotificationsFromHub(true)}
              disabled={isLoading}
              title="Atualizar notificações"
              className="size-7 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            {/* Marcar todas como lidas */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMarkAllAsRead}
              disabled={unreadNotifications.length === 0}
              title="Marcar todas como lidas"
              className="size-7 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-40 cursor-pointer"
            >
              <CheckCheck className="size-3.5" />
            </Button>

            {/* Limpar todas */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearAll}
              disabled={currentList.length === 0}
              title="Limpar todas desta aba"
              className="size-7 rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 disabled:opacity-40 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Tabs: Não lidas | Lidas */}
        <div className="flex items-center border-b border-border/70 px-3.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("unread")}
            className={`py-2 px-1 relative transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "unread"
                ? "text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Não lidas</span>
            {unreadNotifications.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/15 text-primary font-bold">
                {unreadNotifications.length}
              </span>
            )}
            {activeTab === "unread" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("read")}
            className={`py-2 px-3 ml-2 relative transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "read"
                ? "text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Lidas</span>
            {readNotifications.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-semibold">
                {readNotifications.length}
              </span>
            )}
            {activeTab === "read" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
          {currentList.length === 0 ? (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center gap-2">
              <CheckCircle2 className="size-8 text-muted-foreground/40" />
              <p className="text-xs font-semibold text-foreground">
                {activeTab === "unread" ? "Tudo em dia!" : "Nenhuma notificação lida"}
              </p>
              <p className="text-[11px] text-muted-foreground max-w-[200px]">
                {activeTab === "unread"
                  ? "Você não possui nenhuma notificação pendente no momento."
                  : "As notificações marcadas como lidas aparecerão aqui."}
              </p>
            </div>
          ) : (
            currentList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="p-3.5 hover:bg-muted/40 transition-colors flex items-start justify-between gap-3 cursor-pointer group"
              >
                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                  <span className="inline-block text-[10px] text-muted-foreground/70 font-medium mt-1">
                    {timeAgo(item.createdAt)}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0 pt-0.5">
                  {/* Marcar como lida / não lida */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleToggleRead(item.id, e)}
                    title={item.read ? "Marcar como não lida" : "Marcar como lida"}
                    className={`size-7 rounded-lg transition-transform active:scale-95 cursor-pointer ${
                      item.read
                        ? "bg-muted text-muted-foreground hover:bg-muted/80"
                        : "bg-primary/20 text-primary hover:bg-primary/30"
                    }`}
                  >
                    <Check className="size-3.5" />
                  </Button>

                  {/* Excluir */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteNotification(item.id, e)}
                    title="Excluir notificação"
                    className="size-7 rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
