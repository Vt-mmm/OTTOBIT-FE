import { useEffect, useRef } from "react";
import { IconButton, Badge } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import { getCartSummaryThunk } from "store/cart/cartThunks";
import { PATH_USER } from "routes/paths";

export default function CartButton() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { summary } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const hasCartNotFoundError = useRef(false);

  // Track CART_NOT_FOUND error to stop polling
  useEffect(() => {
    if (summary.error === 'CART_NOT_FOUND') {
      hasCartNotFoundError.current = true;
    } else if (summary.data) {
      // Reset flag if cart data is received (cart was created)
      hasCartNotFoundError.current = false;
    }
  }, [summary.error, summary.data]);

  useEffect(() => {
    // Only fetch cart if user is authenticated
    if (!isAuthenticated) return;

    // Don't keep polling if cart doesn't exist
    if (hasCartNotFoundError.current) {
      return;
    }

    // Fetch cart summary on mount
    dispatch(getCartSummaryThunk());

    // Refresh periodically (30 seconds)
    const interval = setInterval(() => {
      // Check flag before each interval call
      if (!hasCartNotFoundError.current) {
        dispatch(getCartSummaryThunk());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated]);

  const itemCount = summary.data?.itemsCount || 0;

  const handleClick = () => {
    navigate(PATH_USER.cart);
  };

  return (
    <IconButton
      onClick={handleClick}
      sx={{
        mr: 2,
        color: "#374151",
        "&:hover": {
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          color: "#22c55e",
        },
      }}
    >
      <Badge badgeContent={itemCount} color="error" max={99}>
        <ShoppingCartIcon sx={{ fontSize: "1.5rem" }} />
      </Badge>
    </IconButton>
  );
}
