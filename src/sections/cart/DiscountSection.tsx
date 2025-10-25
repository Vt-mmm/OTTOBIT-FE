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
import { axiosClient } from "../../axiosClient";
import { ROUTES_API_CART } from "../../constants/routesApiKeys";
import { getCartThunk } from "store/cart/cartThunks";
import { useLocales } from "../../hooks";
import { showSuccessToast, showErrorToast } from "utils/toast";

export default function DiscountSection() {
  const { translate } = useLocales();
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
      setError(translate("cart.EnterDiscountCode"));
      return;
    }

    try {
      setError(null);
      const code = discountCode.trim().toUpperCase();
      await axiosClient.post(ROUTES_API_CART.APPLY_DISCOUNT, {
        discountCode: code,
      });
      // Refetch cart from server so totals persist to checkout
      // We keep local UI code in input to show applied code
      await dispatch(getCartThunk()).unwrap();
      setDiscountCode(code);
      showSuccessToast(`${translate("cart.DiscountAppliedSuccess")} - ${code}`);
    } catch (err: any) {
      let errorMessage = translate("cart.CannotApplyDiscount");

      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message && typeof err.message === "string") {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
      showErrorToast(errorMessage);
    }
  };

  const handleRemoveDiscount = async () => {
    try {
      setError(null);
      await axiosClient.delete(ROUTES_API_CART.REMOVE_DISCOUNT);
      await dispatch(getCartThunk()).unwrap();
      showSuccessToast("Đã xóa mã giảm giá!");
    } catch (err: any) {
      let errorMessage = translate("cart.CannotRemoveDiscount");

      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message && typeof err.message === "string") {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
      showErrorToast(errorMessage);
    }
  };

  return (
    <Card sx={{ boxShadow: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {translate("cart.DiscountCode")}
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
                {translate("cart.DiscountApplied")}{" "}
                <strong>
                  {cartData?.discountAmount.toLocaleString("vi-VN")} ₫
                </strong>
                {cart.appliedVoucher && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 0.5 }}
                  >
                    Mã: <strong>{cart.appliedVoucher.code}</strong>
                  </Typography>
                )}
              </Typography>
            </Alert>
          </Box>
        ) : (
          /* Discount Input State */
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={translate("cart.EnterDiscountPlaceholder")}
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
              {isApplying
                ? translate("cart.Applying")
                : translate("cart.Apply")}
            </Button>
          </Box>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1.5 }}
        >
          {translate("cart.DiscountCodeInfo")}
        </Typography>
      </CardContent>
    </Card>
  );
}
