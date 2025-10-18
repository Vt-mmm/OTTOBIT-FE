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
const ResendEmailConfirmationPage = lazy(
  () => import("pages/auth/ResendEmailConfirmationPage")
);
// Define lazy-loaded components for user routes
const SharedHomePage = lazy(() => import("pages/user/Homepage"));
const CoursesPage = lazy(() => import("pages/user/CoursesPage"));
const CourseDetailPage = lazy(() => import("pages/user/CourseDetailPage"));
const CourseLearningPage = lazy(() => import("pages/user/CourseLearningPage"));
const LessonDetailPage = lazy(() => import("pages/user/LessonDetailPage"));
const ChallengeDetailPage = lazy(
  () => import("pages/user/ChallengeDetailPage")
);
const RobotStudioPage = lazy(() => import("pages/studio/RobotStudioPage"));
const UserProfilePage = lazy(() => import("pages/user/UserProfilePage"));
const StudentProfilePage = lazy(() => import("pages/user/StudentProfilePage"));
const SecuritySettingsPage = lazy(
  () => import("pages/user/SecuritySettingsPage")
);
const BlogDetailPage = lazy(() => import("pages/user/BlogDetailPage"));
const BlogListPage = lazy(() => import("pages/user/BlogListPage"));
// Store pages
const StorePage = lazy(() => import("pages/user/store/StorePage"));
const RobotListPage = lazy(() => import("pages/user/store/RobotListPage"));
const ComponentListPage = lazy(
  () => import("pages/user/store/ComponentListPage")
);
const RobotDetailPage = lazy(() => import("pages/user/store/RobotDetailPage"));
const ComponentDetailPage = lazy(
  () => import("pages/user/store/ComponentDetailPage")
);
// Cart page
const CartPage = lazy(() => import("pages/user/CartPage"));
// Checkout page
const CheckoutPage = lazy(() => import("pages/user/CheckoutPage"));
// Orders page
const OrdersPage = lazy(() => import("pages/user/OrdersPage"));
const OrderDetailPage = lazy(() => import("pages/user/OrderDetailPage"));
// My Robots page
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

  // Add a short delay to ensure auth state is fully loaded
  // Don't auto-logout here - let the interceptor handle it when API calls fail
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 50); // Minimal delay just for Redux rehydration

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Show loading screen during initialization
  if (isInitializing) {
    return <Loader />;
  }

  // Root path redirect handler based on authentication status and role
  const RootRedirect = () => {
    if (isAuthenticated) {
      if (isAdmin) {
        return <Navigate to={PATH_ADMIN.dashboard} replace />;
      }
      return <Navigate to={PATH_USER.homepage} replace />;
    }
    // For non-authenticated users, show the public homepage
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
          {/* Public Store Routes */}
          <ReactRoute path="/product" element={<StorePage />} />
          <ReactRoute path="/product/robots" element={<RobotListPage />} />
          <ReactRoute path="/product/robots/:id" element={<RobotDetailPage />} />
          <ReactRoute
            path="/product/components"
            element={<ComponentListPage />}
          />
          <ReactRoute
            path="/product/components/:id"
            element={<ComponentDetailPage />}
          />
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

        {/* Admin section - Direct access for development */}
        <ReactRoute
          path="/admin"
          element={<Navigate to={PATH_ADMIN.dashboard} replace />}
        />

        {/* Studio Route - Public Access (Bypass Authentication) */}
        <ReactRoute path={PATH_USER.studio} element={<RobotStudioPage />} />
        <ReactRoute
          path={PATH_USER.studioWithChallenge}
          element={<RobotStudioPage />}
        />

        {/* User Routes - Protected */}
        <ReactRoute element={<UserRouter />}>
          {/* Các trang dành riêng cho user */}
          <ReactRoute path={PATH_USER.homepage} element={<SharedHomePage />} />

          {/* Shopping Cart */}
          <ReactRoute path={PATH_USER.cart} element={<CartPage />} />

          {/* Checkout */}
          <ReactRoute path={PATH_USER.checkout} element={<CheckoutPage />} />

          {/* Orders */}
          <ReactRoute path={PATH_USER.orders} element={<OrdersPage />} />
          <ReactRoute
            path={PATH_USER.orderDetail}
            element={<OrderDetailPage />}
          />

          {/* User Store Routes */}
          <ReactRoute path={PATH_USER.store} element={<StorePage />} />
          <ReactRoute path={PATH_USER.robots} element={<RobotListPage />} />
          <ReactRoute
            path={PATH_USER.robotDetail}
            element={<RobotDetailPage />}
          />
          <ReactRoute
            path={PATH_USER.components}
            element={<ComponentListPage />}
          />
          <ReactRoute
            path={PATH_USER.componentDetail}
            element={<ComponentDetailPage />}
          />

          {/* Other User Routes */}
          <ReactRoute path={PATH_USER.courses} element={<CoursesPage />} />
          <ReactRoute path={PATH_USER.blogs} element={<BlogListPage />} />
          <ReactRoute
            path={PATH_USER.blogDetail}
            element={<BlogDetailPage />}
          />
          <ReactRoute path={PATH_USER.blogs} element={<BlogListPage />} />

          <ReactRoute
            path={PATH_USER.courseDetail}
            element={<CourseDetailPage />}
          />
          {/* Course Learning Page - Only for enrolled students */}
          <ReactRoute
            path={PATH_USER.courseLearn}
            element={<CourseLearningPage />}
          />
          <ReactRoute
            path={PATH_USER.lessonDetail}
            element={<LessonDetailPage />}
          />
          <ReactRoute
            path={PATH_USER.challengeDetail}
            element={<ChallengeDetailPage />}
          />
          <ReactRoute path={PATH_USER.profile} element={<UserProfilePage />} />
          <ReactRoute
            path={PATH_USER.security}
            element={<SecuritySettingsPage />}
          />
          <ReactRoute
            path={PATH_USER.studentProfile}
            element={<StudentProfilePage />}
          />
        </ReactRoute>

        {/* Auth Routes */}
        <ReactRoute
          path={PATH_AUTH.login}
          element={
            isAuthenticated ? (
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
            isAuthenticated ? (
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
            isAuthenticated ? (
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
            isAuthenticated ? (
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
        <ReactRoute
          path={PATH_AUTH.resendEmailConfirmation}
          element={
            isAuthenticated ? (
              <Navigate
                to={isAdmin ? PATH_ADMIN.dashboard : PATH_USER.homepage}
                replace
              />
            ) : (
              <ResendEmailConfirmationPage />
            )
          }
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
