import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationsPopover } from "@/components/notifications/notifications-popover";

const ROUTE_LABELS: Record<string, string> = {
  "": "Dashboard",
  pedidos: "Pedidos",
  "lotes-produtos": "Lotes de Produtos",
  catalogo: "Catálogo & Estoque",
  "mapeamento-marketplaces": "Mapeamento de Marketplaces",
  "conexoes-erp": "Conexão ERP Online",
  saude: "Saúde & Conexões",
  equipe: "Equipe e Usuários",
};

export function AppShell() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const currentTitle = segments.length > 0 ? ROUTE_LABELS[segments[0]] || segments[0] : "Dashboard";

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar with Responsive Drawer */}
      <AppSidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-border/70 bg-card/40 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs">
            {/* Mobile Hamburger Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="size-8 lg:hidden -ml-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Menu className="size-5" />
            </Button>

            <Link to="/" className="text-muted-foreground hover:text-foreground hidden sm:inline">
              Hub Gerencial
            </Link>
            {segments.length > 0 && (
              <>
                <ChevronRight className="size-3.5 text-muted-foreground/60 hidden sm:inline" />
                <span className="font-semibold text-foreground">{currentTitle}</span>
              </>
            )}
            {segments.length === 0 && (
              <span className="font-semibold text-foreground sm:hidden">Dashboard</span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/conexoes-erp"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
            >
              <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">API REST Cloud Conectada</span>
              <span className="sm:hidden">Online</span>
            </Link>

            <ThemeToggle />

            <NotificationsPopover />
          </div>
        </header>

        {/* Page View Container */}
        <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
