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

interface CartSummaryCardProps {
  onCheckout: () => void;
}

export default function CartSummaryCard({ onCheckout }: CartSummaryCardProps) {
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
              <Typography color="text.secondary">Số lượng khóa học:</Typography>
              <Typography fontWeight={500}>{cartData.itemsCount}</Typography>
            </Box>

            {/* Subtotal */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}
            >
              <Typography color="text.secondary">Tạm tính:</Typography>
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
                <Typography color="error.main">Giảm giá:</Typography>
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
                Tổng cộng:
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
              }}
            >
              Thanh Toán
            </Button>

            {/* Info Text */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 2, textAlign: "center" }}
            >
              Bằng việc tiếp tục thanh toán, bạn đồng ý với điều khoản sử dụng
              của chúng tôi
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}
