import { Route } from "common/@types";
import HomePage from "pages/user/Homepage";
import PaymentReturnPage from "pages/user/PaymentReturnPage";
import PaymentCancelPage from "pages/user/PaymentCancelPage";
import { Page403, Page404, Page500 } from "pages/error";
import { PATH_ERROR, PATH_PUBLIC, PATH_AUTH } from "routes/paths";

export const publicRoutes: Route[] = [
  {
    path: "/", // PATH_PUBLIC.homepage = "/"
    component: <HomePage />,
    index: true,
  },

  // Public Video Call routes - accessible by both authenticated and non-authenticated users
  {
    path: PATH_PUBLIC.homepage,
    component: <HomePage />,
    index: false,
  },
  // Payment callback routes - accessible without authentication
  // URLs match Backend: /auth/return-url and /auth/cancel-url
  {
    path: PATH_AUTH.returnUrl,
    component: <PaymentReturnPage />,
    index: false,
  },
  {
    path: PATH_AUTH.cancelUrl,
    component: <PaymentCancelPage />,
    index: false,
  },
];

export const errorRoutes: Route[] = [
  {
    path: PATH_ERROR.noPermission,
    component: <Page403 />,
    index: true,
  },
  {
    path: PATH_ERROR.notFound,
    component: <Page404 />,
    index: false,
  },
  {
    path: PATH_ERROR.serverError,
    component: <Page500 />,
    index: false,
  },
];
