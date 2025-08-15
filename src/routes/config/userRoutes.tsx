import { Route } from "common/@types/route";
import { PATH_PUBLIC, PATH_USER } from "routes/paths";
import HomePage from "pages/user/Homepage";

import { lazy } from "react";

// Public routes - accessible without authentication
export const publicRoutes: Route[] = [
  {
    path: PATH_PUBLIC.homepage,
    component: <HomePage />,
    index: true,
  },

];

// Private routes - only for authenticated users
export const userRoutes: Route[] = [
  {
    path: PATH_USER.homepage,
    component: <HomePage />,
    index: true,
  },

];
