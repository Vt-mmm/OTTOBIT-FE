import { Route } from "common/@types";
import OttobitDashboardPage from "pages/admin/OttobitDashboardPage";
import { PATH_ADMIN } from "routes/paths";

export const adminRoutes: Route[] = [
  {
    path: PATH_ADMIN.dashboard,
    component: <OttobitDashboardPage />,
    index: true,
  },

];
