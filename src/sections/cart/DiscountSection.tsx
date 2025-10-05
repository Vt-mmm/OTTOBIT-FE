import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAppDispatch, useAppSelector } from "store/config";
import { applyDiscountThunk, removeDiscountThunk } from "store/cart/cartThunks";
import { showSuccessToast, showErrorToast } from "utils/toast";

export default function DiscountSection() {
  const dispatch = useAppDispatch();
  const { cart, operations } = useAppSelector((state) => state.cart);
  const [discountCode, setDiscountCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cartData = cart.data;
  const hasDiscount = cartData && cartData.discountAmount > 0;
  const isApplying = operations.isApplyingDiscount;
  const isRemoving = operations.isRemovingDiscount;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setError("Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      setError(null);
      // For now, convert discount code to amount (this should be handled by backend)
      // TODO: Backend should validate discount code and return discount amount
      const discountAmount = parseFloat(discountCode);

      if (isNaN(discountAmount) || discountAmount < 0) {
        setError("Mã giảm giá không hợp lệ");
        return;
      }

      await dispatch(applyDiscountThunk({ discountAmount })).unwrap();
      setDiscountCode("");
      showSuccessToast("Áp dụng mã giảm giá thành công!");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        err ||
        "Không thể áp dụng mã giảm giá";
      setError(errorMessage);
      showErrorToast(errorMessage);
    }
  };

  const handleRemoveDiscount = async () => {
    try {
      setError(null);
      await dispatch(removeDiscountThunk()).unwrap();
      showSuccessToast("Đã xóa mã giảm giá!");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        err ||
        "Không thể xóa mã giảm giá";
      setError(errorMessage);
      showErrorToast(errorMessage);
    }
  };

  return (
    <Card sx={{ boxShadow: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Mã Giảm Giá
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {hasDiscount ? (
          /* Discount Applied State */
          <Box>
            <Alert
              severity="success"
              action={
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={handleRemoveDiscount}
                  disabled={isRemoving}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              <Typography variant="body2">
                Đã áp dụng giảm giá:{" "}
                <strong>
                  {cartData?.discountAmount.toLocaleString("vi-VN")} ₫
                </strong>
              </Typography>
            </Alert>
          </Box>
        ) : (
          /* Discount Input State */
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Nhập mã giảm giá"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              disabled={isApplying}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleApplyDiscount();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleApplyDiscount}
              disabled={isApplying || !discountCode.trim()}
              sx={{
                minWidth: 100,
                textTransform: "none",
              }}
            >
              {isApplying ? "Đang áp dụng..." : "Áp dụng"}
            </Button>
          </Box>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1.5 }}
        >
          Nhập mã giảm giá hoặc voucher của bạn tại đây
        </Typography>
      </CardContent>
    </Card>
  );
}
