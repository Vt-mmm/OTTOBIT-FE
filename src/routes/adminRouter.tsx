import { useState, useEffect } from "react";
import { Role } from "common/enums";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "store/config";
import { getRefreshToken } from "utils";
import { PATH_AUTH } from "./paths";

// Loading component
const AdminLoading = () => (
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
    <div style={{ marginBottom: "16px" }}>Đang tải trang quản trị...</div>
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

function AdminRouter() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [localRefreshToken, setLocalRefreshToken] = useState<string | null>(
    null
  );
  const { isAuthenticated, userAuth } = useAppSelector((state) => state.auth);

  console.log("[AdminRouter] Render with location:", location.pathname);
  console.log("[AdminRouter] Auth state:", {
    isAuthenticated,
    hasUserAuth: !!userAuth,
    localRefreshToken: !!localRefreshToken,
  });

  // Check refreshToken instead of accessToken
  // accessToken can expire but user is still authenticated if refreshToken exists
  useEffect(() => {
    console.log(
      "[AdminRouter] useEffect triggered for path:",
      location.pathname
    );
    const token = getRefreshToken();
    setLocalRefreshToken(token || null);
    console.log("[AdminRouter] Refresh token from cookie:", !!token);

    // Đặt một timeout ngắn để đảm bảo Redux store đã được hydrate
    const timer = setTimeout(() => {
      console.log("[AdminRouter] Loading complete");
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Hiển thị loading khi đang kiểm tra authentication
  if (isLoading) {
    console.log("[AdminRouter] Still loading...");
    return <AdminLoading />;
  }

  // Check refreshToken instead of accessToken
  // User is authenticated as long as they have valid refreshToken
  // AccessToken can expire and will be refreshed automatically by interceptor
  const hasAdminAccess =
    isAuthenticated &&
    localRefreshToken &&
    userAuth?.roles?.includes(Role.OTTOBIT_ADMIN);

  console.log("[AdminRouter] Access check:", {
    hasAdminAccess,
    isAuthenticated,
    hasRefreshToken: !!localRefreshToken,
    hasRole: userAuth?.roles?.includes(Role.OTTOBIT_ADMIN),
  });

  if (hasAdminAccess) {
    console.log("[AdminRouter] Access granted - rendering Outlet");
    return <Outlet />;
  } else {
    console.log("[AdminRouter] Access denied - redirecting to login");
    // Redirect to login instead of 403 page
    return <Navigate to={PATH_AUTH.login} state={{ from: location }} replace />;
  }
}

export default AdminRouter;
