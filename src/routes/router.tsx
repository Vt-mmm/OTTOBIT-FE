import { Suspense, lazy, useState, useEffect } from "react";
import { Navigate, Route as ReactRoute, Routes } from "react-router-dom";

// Routers
import PublicRouter from "routes/publicRouter";
import UserRouter from "routes/userRouter";
import AdminRouter from "routes/adminRouter";

// Routes config
import { useAppSelector } from "store/config";
import { PATH_AUTH, PATH_ERROR, PATH_USER, PATH_ADMIN } from "routes/paths";
import { publicRoutes } from "routes/config/publicRoutes.tsx";
import { adminRoutes } from "routes/config/adminRoutes.tsx";
import type { Route } from "common/@types";
import { Role } from "common/enums";
import { getAccessToken } from "utils";

// Lazy load pages
const LoginPage = lazy(() => import("pages/auth/LoginPage"));
const SignUp = lazy(() => import("pages/auth/SignUp"));
const ForgotPassword = lazy(() => import("pages/auth/ForgotpasswordPage"));
const ResetPassword = lazy(() => import("pages/auth/ResetPasswordPage"));
const EmailVerification = lazy(
  () => import("pages/auth/EmailVerificationPage")
);
const EmailConfirmation = lazy(
  () => import("pages/auth/EmailConfirmationPage")
);
// Define lazy-loaded components for user routes
const SharedHomePage = lazy(() => import("pages/user/Homepage"));
const RobotStudioPage = lazy(() => import("pages/studio/RobotStudioPage"));
const UserProfilePage = lazy(() => import("pages/user/UserProfilePage"));
// Error pages
const Page404 = lazy(() => import("pages/error/Page404"));
const Page500 = lazy(() => import("pages/error/Page500"));

// Enhanced loader component
const Loader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
      fontSize: "18px",
      color: "#333",
      flexDirection: "column",
      backgroundColor: "#f5f5f5",
    }}
  >
    <div style={{ marginBottom: "16px" }}>Đang tải...</div>
    <div
      style={{
        width: "50px",
        height: "50px",
        border: "5px solid #f3f3f3",
        borderTop: "5px solid #6ACCD9",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    ></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function AppRouter() {
  const { isAuthenticated, userAuth } = useAppSelector((state) => state.auth);
  const isAdmin = userAuth?.roles?.includes(Role.OTTOBIT_ADMIN);
  const [isInitializing, setIsInitializing] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Add a short delay to ensure auth state is fully loaded
  useEffect(() => {
    // Đọc token từ localStorage
    const token = getAccessToken();
    setAccessToken(token || null);

    // Đặt một timeout để đảm bảo state được khởi tạo đầy đủ
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, userAuth]);

  // Show loading screen during initialization
  if (isInitializing) {
    return <Loader />;
  }

  // Root path redirect handler based on authentication status and role
  const RootRedirect = () => {
    // Check both Redux state and token for more reliable authentication check
    const hasValidAuth = isAuthenticated && accessToken && userAuth;

    if (hasValidAuth) {
      if (isAdmin) {
        return <Navigate to={PATH_ADMIN.dashboard} replace />;
      }
      // Kiểm tra role Psychologist để redirect về dashboard tương ứng
      return <Navigate to={PATH_USER.homepage} replace />;
    }
    // For non-authenticated users, always show the public homepage
    return <SharedHomePage />;
  };

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Root path special handling */}
        <ReactRoute path="/" element={<RootRedirect />} />

        {/* Public Routes */}
        <ReactRoute element={<PublicRouter />}>
          {/* Map all public routes except root path */}
          {publicRoutes
            .filter((route) => route.path !== "/")
            .map((route: Route) => (
              <ReactRoute
                key={route.path}
                path={route.path}
                element={route.component}
                index={route.index}
              />
            ))}
        </ReactRoute>

        {/* Admin Routes - Protected */}
        <ReactRoute element={<AdminRouter />}>
          {/* Map all admin routes */}
          {adminRoutes.map((route: Route) => (
            <ReactRoute
              key={route.path}
              path={route.path}
              element={route.component}
              index={route.index}
            />
          ))}
        </ReactRoute>

        {/* Login Redirect Logic for Admin section */}
        <ReactRoute
          path="/admin"
          element={
            isAuthenticated && isAdmin && accessToken ? (
              <Navigate to={PATH_ADMIN.dashboard} replace />
            ) : (
              <Navigate to={PATH_AUTH.login} replace />
            )
          }
        />

        {/* Studio Route - Public Access (Bypass Authentication) */}
        <ReactRoute path={PATH_USER.studio} element={<RobotStudioPage />} />

        {/* User Routes - Protected */}
        <ReactRoute element={<UserRouter />}>
          {/* Các trang dành riêng cho user */}
          <ReactRoute path={PATH_USER.homepage} element={<SharedHomePage />} />
          <ReactRoute path={PATH_USER.profile} element={<UserProfilePage />} />
        </ReactRoute>

        {/* Auth Routes */}
        <ReactRoute
          path={PATH_AUTH.login}
          element={
            isAuthenticated && accessToken ? (
              <Navigate
                to={isAdmin ? PATH_ADMIN.dashboard : PATH_USER.homepage}
                replace
              />
            ) : (
              <LoginPage />
            )
          }
        />
        <ReactRoute
          path={PATH_AUTH.register}
          element={
            isAuthenticated && accessToken ? (
              <Navigate
                to={isAdmin ? PATH_ADMIN.dashboard : PATH_USER.homepage}
                replace
              />
            ) : (
              <SignUp />
            )
          }
        />
        <ReactRoute
          path={PATH_AUTH.forgotPassword}
          element={
            isAuthenticated && accessToken ? (
              <Navigate
                to={isAdmin ? PATH_ADMIN.dashboard : PATH_USER.homepage}
                replace
              />
            ) : (
              <ForgotPassword />
            )
          }
        />
        <ReactRoute
          path={PATH_AUTH.resetPassword}
          element={
            isAuthenticated && accessToken ? (
              <Navigate
                to={isAdmin ? PATH_ADMIN.dashboard : PATH_USER.homepage}
                replace
              />
            ) : (
              <ResetPassword />
            )
          }
        />
        <ReactRoute
          path={PATH_AUTH.verifyEmail}
          element={<EmailVerification />}
        />
        <ReactRoute
          path={PATH_AUTH.confirmEmail}
          element={<EmailConfirmation />}
        />

        {/* Error Routes - Removed 403 route since we're handling it with redirects now */}
        <ReactRoute path={PATH_ERROR.notFound} element={<Page404 />} />
        <ReactRoute path={PATH_ERROR.serverError} element={<Page500 />} />

        {/* Catch-all route - redirect to 404 page */}
        <ReactRoute
          path="*"
          element={<Navigate to={PATH_ERROR.notFound} replace />}
        />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
