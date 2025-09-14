import { Route } from "common/@types";
import { lazy } from "react";
import OttobitDashboardPage from "pages/admin/OttobitDashboardPage";
import { PATH_ADMIN } from "routes/paths";

// Lazy load admin pages
const MapDesignerPage = lazy(() => import("pages/admin/MapDesignerPage"));

export const adminRoutes: Route[] = [
  {
    path: PATH_ADMIN.dashboard,
    component: <OttobitDashboardPage />,
    index: true,
  },
  {
    path: PATH_ADMIN.mapDesigner,
    component: <MapDesignerPage />,
    index: false,
  },
];
