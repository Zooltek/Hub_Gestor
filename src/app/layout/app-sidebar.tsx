import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Layers,
  Package,
  Activity,
  Users,
  LogOut,
  Building2,
  Plug,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import { useAuth } from "@/app/providers/auth-provider";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Pedidos",
    href: "/pedidos",
    icon: ShoppingCart,
  },
  {
    title: "Lotes de Produtos",
    href: "/lotes-produtos",
    icon: Layers,
  },
  {
    title: "Catálogo & Estoque",
    href: "/catalogo",
    icon: Package,
  },
  {
    title: "Mapeamento Canais",
    href: "/mapeamento-marketplaces",
    icon: Store,
  },
  {
    title: "Conexão ERP Online",
    href: "/conexoes-erp",
    icon: Plug,
  },
  {
    title: "Saúde & Conexões",
    href: "/saude",
    icon: Activity,
  },
  {
    title: "Equipe / Usuários",
    href: "/equipe",
    icon: Users,
  },
];

interface AppSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AppSidebar({ isMobileOpen = false, onMobileClose }: AppSidebarProps) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container (Fixed on Desktop, Slide-over on Mobile) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-border/80 bg-sidebar flex flex-col justify-between h-screen transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-sidebar-border flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl overflow-hidden shadow-md shadow-primary/20 bg-primary/10">
                <img src="/ICONE.png" alt="Hub Gerencial" className="size-9 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-sidebar-foreground tracking-tight">
                  Hub Gerencial
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Portal do Lojista (Cloud)
                </span>
              </div>
            </div>

            {/* Close Button on Mobile */}
            {onMobileClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMobileClose}
                className="size-7 lg:hidden text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          {/* Client context card */}
          <div className="rounded-lg bg-sidebar-accent/50 border border-sidebar-border p-2.5 flex items-center gap-2.5">
            <Building2 className="size-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">
                {user?.customerName || "Minha Loja"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.email || "Conta Ativa"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1">
            Menu Principal
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/"}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`
                }
              >
                <Icon className="size-4" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer & User Profile */}
        <div className="p-3 border-t border-sidebar-border flex flex-col gap-2 bg-sidebar">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-sidebar-accent/30">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-sidebar-foreground truncate">
                {user?.displayName || user?.username}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {user?.role === "Manager" ? "Gestor da Loja" : "Operador"}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Sair da Conta"
              className="size-7 text-muted-foreground hover:text-destructive cursor-pointer"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
