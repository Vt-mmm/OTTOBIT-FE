import { Role } from "common/enums";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "store/config";
import { getAccessToken } from "utils";
import { PATH_USER, PATH_PUBLIC, PATH_AUTH } from "routes/paths";

export default function PublicRouter() {
  const accessToken = getAccessToken();
  const { isAuthenticated, userAuth } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Allow these public routes regardless of authentication status
  const alwaysPublicPaths = [
    // Video Call routes - must be accessible by both authenticated and non-authenticated users
    PATH_PUBLIC.homepage,
    // Payment callback routes - must be accessible after PayOS redirect
    PATH_AUTH.returnUrl,
    PATH_AUTH.cancelUrl,
  ];

  // Check if current path is in the always public paths list or starts with these paths
  // (for dynamic routes like psychologistDetail with ID)
  const isAlwaysPublicPath = alwaysPublicPaths.some((path) => {
    // Handle exact paths
    if (location.pathname === path) return true;

    // Handle dynamic paths with parameters (e.g., /psychologist/:id, /video-call/room/:meetingId)
    if (path.includes(":")) {
      const basePath = path.split("/:")[0];
      return location.pathname.startsWith(basePath);
    }

    // Handle video call paths that start with /video-call/
    if (
      path.startsWith("/video-call/") &&
      location.pathname.startsWith("/video-call/")
    ) {
      return true;
    }

    return false;
  });

  // Always allow access to psychologist-related pages
  if (isAlwaysPublicPath) {
    return <Outlet />;
  }

  // Temporarily disable admin redirect for development
  // TODO: Re-enable when ready for production
  /*
  // Check for authenticated admin access to other public routes
  if (
    isAuthenticated &&
    accessToken &&
    userAuth?.roles?.includes(Role.OTTOBIT_ADMIN)
  ) {
    // Redirect admin users to admin dashboard when they try to access public routes
    return <Navigate to={PATH_ADMIN.dashboard} />;
  }
  */

  // Check for authenticated regular user access to other public routes
  if (
    isAuthenticated &&
    accessToken &&
    userAuth?.roles?.includes(Role.OTTOBIT_USER)
  ) {
    // Redirect regular users to user homepage
    return <Navigate to={PATH_USER.homepage} />;
  }

  // Allow access to all public routes for non-authenticated users
  return <Outlet />;
}
