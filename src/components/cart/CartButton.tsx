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

    // Fetch cart summary on mount and periodically
    dispatch(getCartSummaryThunk());

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(getCartSummaryThunk());
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
