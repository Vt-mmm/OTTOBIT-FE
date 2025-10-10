import { useEffect } from "react";
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

  useEffect(() => {
    // Only fetch cart if user is authenticated
    if (!isAuthenticated) return;

    // Check if we already tried and got CART_NOT_FOUND error
    if (summary.error === 'CART_NOT_FOUND') {
      // Don't keep polling if cart doesn't exist
      return;
    }

    // Fetch cart summary on mount
    dispatch(getCartSummaryThunk());

    // Only refresh periodically if cart exists (has data or is loading)
    if (summary.data) {
      const interval = setInterval(() => {
        dispatch(getCartSummaryThunk());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [dispatch, isAuthenticated, summary.data, summary.error]);

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
