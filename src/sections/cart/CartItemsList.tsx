import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { useAppSelector } from "store/config";
import { useLocales } from "../../hooks";
import { CartItemCard } from "sections/cart";

export default function CartItemsList() {
  const { translate } = useLocales();
  const { cart, items } = useAppSelector((state) => state.cart);

  const isLoading = cart.isLoading || items.isLoading;
  const error = items.error;
  const cartItems = cart.data?.items || [];

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (cartItems.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          backgroundColor: "white",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {translate("cart.NoCoursesInCart")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
        {translate("cart.CoursesInCart", { count: cartItems.length })}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {cartItems.map((item) => (
          <CartItemCard key={item.id} item={item} />
        ))}
      </Box>
    </Box>
  );
}
