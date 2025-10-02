import { useState, useEffect } from "react";
import { Role } from "common/enums/role.enum";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "store/config";
import { getRefreshToken } from "utils/utils";
import { PATH_AUTH, PATH_PUBLIC } from "routes/paths";

// Loading component
const UserLoading = () => (
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

function UserRouter() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [localRefreshToken, setLocalRefreshToken] = useState<string | null>(
    null
  );
  const { isAuthenticated, userAuth } = useAppSelector((state) => state.auth);

  console.log("[UserRouter] Render with location:", location.pathname);
  console.log("[UserRouter] Auth state:", {
    isAuthenticated,
    hasUserAuth: !!userAuth,
    localRefreshToken: !!localRefreshToken,
  });

  // Check refreshToken instead of accessToken
  // accessToken can expire but user is still authenticated if refreshToken exists
  useEffect(() => {
    console.log(
      "[UserRouter] useEffect triggered for path:",
      location.pathname
    );
    const token = getRefreshToken();
    setLocalRefreshToken(token || null);
    console.log("[UserRouter] Refresh token from cookie:", !!token);

    // Đặt một timeout ngắn để đảm bảo Redux store đã được hydrate
    const timer = setTimeout(() => {
      console.log("[UserRouter] Loading complete");
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Các trang luôn cho phép truy cập không cần đăng nhập
  const alwaysPublicPaths = [PATH_PUBLIC.homepage];

  // Check if current path is in the always public paths list or starts with these paths
  const isPublicPath = alwaysPublicPaths.some((path) => {
    // Handle exact paths
    if (location.pathname === path) return true;

    // Handle dynamic paths with parameters
    if (path.includes(":")) {
      const basePath = path.split("/:")[0];
      return location.pathname.startsWith(basePath);
    }

    return false;
  });

  // Always allow access to public paths
  if (isPublicPath) {
    return <Outlet />;
  }

  // Hiển thị loading khi đang kiểm tra authentication
  if (isLoading) {
    console.log("[UserRouter] Still loading...");
    return <UserLoading />;
  }

  // Check refreshToken instead of accessToken
  // User is authenticated as long as they have valid refreshToken
  // AccessToken can expire and will be refreshed automatically by interceptor
  const hasUserAccess =
    isAuthenticated &&
    localRefreshToken &&
    userAuth?.roles?.includes(Role.OTTOBIT_USER);

  console.log("[UserRouter] Access check:", {
    hasUserAccess,
    isAuthenticated,
    hasRefreshToken: !!localRefreshToken,
    hasRole: userAuth?.roles?.includes(Role.OTTOBIT_USER),
  });

  if (hasUserAccess) {
    console.log("[UserRouter] Access granted - rendering Outlet");
    return <Outlet />;
  } else {
    console.log("[UserRouter] Access denied - redirecting to login");
    // Redirect to login
    return <Navigate to={PATH_AUTH.login} state={{ from: location }} replace />;
  }
}

export default UserRouter;
