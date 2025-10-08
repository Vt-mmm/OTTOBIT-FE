import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useAppSelector } from "store/config";
import { useLocales } from "../../hooks";

interface CartSummaryCardProps {
  onCheckout: () => void;
}

export default function CartSummaryCard({ onCheckout }: CartSummaryCardProps) {
  const { translate } = useLocales();
  const { cart } = useAppSelector((state) => state.cart);
  const { operations } = useAppSelector((state) => state.cart);

  const cartData = cart.data;
  const isLoading =
    cart.isLoading ||
    operations.isApplyingDiscount ||
    operations.isRemovingDiscount;

  if (!cartData) {
    return null;
  }

  const hasDiscount = cartData.discountAmount > 0;

  return (
    <Card
      sx={{
        position: "sticky",
        top: 90,
        boxShadow: 3,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Tổng Đơn Hàng
        </Typography>

        <Divider sx={{ my: 2 }} />

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {/* Items Count */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}
            >
              <Typography color="text.secondary">
                {translate("cart.CourseQuantity")}
              </Typography>
              <Typography fontWeight={500}>{cartData.itemsCount}</Typography>
            </Box>

            {/* Subtotal */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}
            >
              <Typography color="text.secondary">
                {translate("cart.Subtotal")}
              </Typography>
              <Typography fontWeight={500}>
                {cartData.subtotal.toLocaleString("vi-VN")} ₫
              </Typography>
            </Box>

            {/* Discount */}
            {hasDiscount && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Typography color="error.main">
                  {translate("cart.Discount")}
                </Typography>
                <Typography fontWeight={500} color="error.main">
                  -{cartData.discountAmount.toLocaleString("vi-VN")} ₫
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Total */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Typography variant="h6" fontWeight={600}>
                {translate("cart.Total")}
              </Typography>
              <Typography variant="h6" fontWeight={600} color="primary.main">
                {cartData.total.toLocaleString("vi-VN")} ₫
              </Typography>
            </Box>

            {/* Checkout Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={onCheckout}
              disabled={cartData.itemsCount === 0}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                bgcolor: "#43A047",
                "&:hover": {
                  bgcolor: "#388E3C",
                },
              }}
            >
              {translate("cart.Checkout")}
            </Button>

            {/* Info Text */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 2, textAlign: "center" }}
            >
              {translate("cart.CheckoutAgreement")}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}
