import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./layout/app-shell";
import { AuthGuard } from "@/components/shared/auth-guard";

// Code splitting via lazy loading das páginas
const LoginPage = lazy(() => import("@/features/auth/pages/login-page").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/dashboard-page").then((m) => ({ default: m.DashboardPage })));
const OrdersPage = lazy(() => import("@/features/orders/pages/orders-page").then((m) => ({ default: m.OrdersPage })));
const ProductsPipelinePage = lazy(() => import("@/features/products-pipeline/pages/products-pipeline-page").then((m) => ({ default: m.ProductsPipelinePage })));
const ProductImportBatchPage = lazy(() => import("@/features/products-pipeline/pages/product-import-batch-page").then((m) => ({ default: m.ProductImportBatchPage })));
const CatalogPage = lazy(() => import("@/features/catalog/pages/catalog-page").then((m) => ({ default: m.CatalogPage })));
const MarketplaceMappingPage = lazy(() => import("@/features/marketplace-mapping/pages/marketplace-mapping-page").then((m) => ({ default: m.MarketplaceMappingPage })));
const ErpConnectionsPage = lazy(() => import("@/features/erp-connections/pages/erp-connections-page").then((m) => ({ default: m.ErpConnectionsPage })));
const HealthPage = lazy(() => import("@/features/health/pages/health-page").then((m) => ({ default: m.HealthPage })));
const TeamPage = lazy(() => import("@/features/team/pages/team-page").then((m) => ({ default: m.TeamPage })));
const HelpPage = lazy(() => import("@/features/help/pages/help-page").then((m) => ({ default: m.HelpPage })));

function RouteLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-3 p-6 animate-in fade-in duration-300">
      <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="text-xs text-muted-foreground font-medium">Carregando módulo...</span>
    </div>
  );
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: withSuspense(LoginPage),
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: "/",
            element: withSuspense(DashboardPage),
          },
          {
            path: "/pedidos",
            element: withSuspense(OrdersPage),
          },
          {
            path: "/lotes-produtos",
            element: withSuspense(ProductsPipelinePage),
          },
          {
            path: "/lotes-produtos/:batchId",
            element: withSuspense(ProductImportBatchPage),
          },
          {
            path: "/catalogo",
            element: withSuspense(CatalogPage),
          },
          {
            path: "/mapeamento-marketplaces",
            element: withSuspense(MarketplaceMappingPage),
          },
          {
            path: "/conexoes-erp",
            element: withSuspense(ErpConnectionsPage),
          },
          {
            path: "/saude",
            element: withSuspense(HealthPage),
          },
          {
            path: "/equipe",
            element: withSuspense(TeamPage),
          },
          {
            path: "/ajuda",
            element: withSuspense(HelpPage),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
