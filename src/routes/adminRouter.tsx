import { useMemo, useEffect } from "react";
import { Role } from "common/enums";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "store/config";
import { getRefreshToken } from "utils";
import { logout } from "store/auth/authSlice";
import { PATH_AUTH } from "./paths";

function AdminRouter() {
  const dispatch = useAppDispatch();
  const refreshToken = getRefreshToken();
  const { isAuthenticated, userAuth } = useAppSelector((state) => state.auth);

  // If authenticated but no refresh token, logout to clear stale state
  useEffect(() => {
    if (isAuthenticated && !refreshToken) {
      dispatch(logout());
    }
  }, [isAuthenticated, refreshToken, dispatch]);

  // Check both Redux state AND refreshToken (the source of truth for authentication)
  // AccessToken can be missing (will be refreshed), but refreshToken must exist
  const hasAccess = useMemo(() => {
    return (
      isAuthenticated &&
      !!refreshToken &&
      userAuth?.roles?.includes(Role.OTTOBIT_ADMIN)
    );
  }, [isAuthenticated, refreshToken, userAuth?.roles]);

  if (!hasAccess) {
    return <Navigate to={PATH_AUTH.login} replace />;
  }

  return <Outlet />;
}

export default AdminRouter;
