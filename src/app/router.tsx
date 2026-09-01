import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./layout/app-shell";
import { AuthGuard } from "@/components/shared/auth-guard";
import { LoginPage } from "@/features/auth/pages/login-page";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { OrdersPage } from "@/features/orders/pages/orders-page";
import { ProductsPipelinePage } from "@/features/products-pipeline/pages/products-pipeline-page";
import { ProductImportBatchPage } from "@/features/products-pipeline/pages/product-import-batch-page";
import { CatalogPage } from "@/features/catalog/pages/catalog-page";
import { MarketplaceMappingPage } from "@/features/marketplace-mapping/pages/marketplace-mapping-page";
import { ErpConnectionsPage } from "@/features/erp-connections/pages/erp-connections-page";
import { HealthPage } from "@/features/health/pages/health-page";
import { TeamPage } from "@/features/team/pages/team-page";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: "/",
            element: <DashboardPage />,
          },
          {
            path: "/pedidos",
            element: <OrdersPage />,
          },
          {
            path: "/lotes-produtos",
            element: <ProductsPipelinePage />,
          },
          {
            path: "/lotes-produtos/:batchId",
            element: <ProductImportBatchPage />,
          },
          {
            path: "/catalogo",
            element: <CatalogPage />,
          },
          {
            path: "/mapeamento-marketplaces",
            element: <MarketplaceMappingPage />,
          },
          {
            path: "/conexoes-erp",
            element: <ErpConnectionsPage />,
          },
          {
            path: "/saude",
            element: <HealthPage />,
          },
          {
            path: "/equipe",
            element: <TeamPage />,
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
