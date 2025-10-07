import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import { getCartThunk } from "store/cart/cartThunks";
import { createOrderFromCartThunk } from "store/order/orderThunks";
import { initiatePaymentThunk } from "store/payment/paymentThunks";
import { clearLastCreatedOrder } from "store/order/orderSlice";
import { clearPaymentLink } from "store/payment/paymentSlice";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import { PaymentMethod } from "common/@types/payment";
import { PATH_USER } from "routes/paths";
import LockIcon from "@mui/icons-material/Lock";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.cart);
  const { operations: orderOps } = useAppSelector((state) => state.order);
  const { paymentLink, operations: paymentOps } = useAppSelector(
    (state) => state.payment
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.PayOS
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch cart on mount
    dispatch(getCartThunk());

    // Cleanup on unmount
    return () => {
      dispatch(clearLastCreatedOrder());
      dispatch(clearPaymentLink());
    };
  }, [dispatch]);

  // Redirect to payment URL when payment link is ready
  useEffect(() => {
    if (paymentLink.data?.paymentUrl) {
      // Redirect to PayOS payment page
      window.location.href = paymentLink.data.paymentUrl;
    }
  }, [paymentLink.data]);

  const handleCheckout = async () => {
    try {
      setError(null);

      // Validate cart exists
      if (!cartData || !cartData.id) {
        throw new Error("Cart not found");
      }

      // Step 1: Create order from cart
      const orderResult = await dispatch(
        createOrderFromCartThunk({ cartId: cartData.id })
      ).unwrap();

      if (!orderResult || !orderResult.id) {
        throw new Error("Failed to create order");
      }

      // Step 2: Get payment transaction ID from order
      const paymentTransaction = orderResult.paymentTransactions?.[0];
      if (!paymentTransaction || !paymentTransaction.id) {
        throw new Error("Payment transaction not created");
      }

      // Step 3: Initiate payment (create PayOS link)
      await dispatch(
        initiatePaymentThunk({
          paymentTransactionId: paymentTransaction.id,
          description: `DH ${orderResult.id.substring(0, 8)}`, // Max 25 chars for PayOS
        })
      ).unwrap();

      // PayLink will trigger redirect in useEffect
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to process checkout");
    }
  };

  const cartData = cart.data;
  const isEmpty = !cartData || cartData.itemsCount === 0;
  const isProcessing = orderOps.isCreating || paymentOps.isInitiating;

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.data && isEmpty) {
      navigate(PATH_USER.cart);
    }
  }, [cart.data, isEmpty, navigate]);

  if (cart.isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Box sx={{ flexGrow: 1, bgcolor: "#f5f5f5", pt: 12, pb: 8 }}>
        <Container maxWidth="xl">
          {/* Page Title */}
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h3"
              fontWeight={700}
              color="text.primary"
              sx={{ mb: 1 }}
            >
              Thanh Toán
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hoàn tất đơn hàng của bạn
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* 2 Column Layout */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 400px" },
              gap: 4,
            }}
          >
            {/* LEFT COLUMN - Order Details & Configuration */}
            <Box>
              {/* Order Items */}
              <Card
                sx={{
                  mb: 3,
                  bgcolor: "white",
                  borderRadius: 3,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ mb: 3 }}
                  >
                    Chi Tiết Đơn Hàng
                  </Typography>

                  {cartData &&
                    cartData.items &&
                    cartData.items.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          display: "flex",
                          gap: 2,
                          p: 2.5,
                          mb: 2,
                          borderRadius: 2,
                          bgcolor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          transition: "all 0.2s",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            borderColor: "#66BB6A",
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={
                            item.courseImageUrl || "/asset/default-course.png"
                          }
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: 2,
                            objectFit: "cover",
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            color="text.primary"
                            sx={{ mb: 0.5 }}
                          >
                            {item.courseTitle}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1.5 }}
                          >
                            {item.courseDescription}
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ color: "#43A047" }}
                          >
                            {item.unitPrice.toLocaleString("vi-VN")} ₫
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card
                sx={{
                  bgcolor: "white",
                  borderRadius: 3,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ mb: 3 }}
                  >
                    Phương Thức Thanh Toán
                  </Typography>

                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) =>
                        setPaymentMethod(
                          Number(e.target.value) as PaymentMethod
                        )
                      }
                    >
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          border: "2px solid #66BB6A",
                          bgcolor: "rgba(102, 187, 106, 0.05)",
                        }}
                      >
                        <FormControlLabel
                          value={PaymentMethod.PayOS}
                          control={
                            <Radio
                              sx={{
                                color: "#66BB6A",
                                "&.Mui-checked": { color: "#66BB6A" },
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography fontWeight={600} color="text.primary">
                                Thanh toán qua PayOS
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Chuyển khoản ngân hàng qua cổng PayOS
                              </Typography>
                            </Box>
                          }
                        />
                      </Box>
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            </Box>

            {/* RIGHT COLUMN - Summary & Payment */}
            <Box>
              <Card
                sx={{
                  bgcolor: "white",
                  borderRadius: 3,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  position: "sticky",
                  top: 100,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ mb: 3 }}
                  >
                    Tóm Tắt Đơn Hàng
                  </Typography>

                  {cartData && (
                    <>
                      <Box sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Typography color="text.secondary">
                            Số lượng khóa học:
                          </Typography>
                          <Typography fontWeight={600} color="text.primary">
                            {cartData.itemsCount}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Typography color="text.secondary">
                            Tạm tính:
                          </Typography>
                          <Typography fontWeight={600} color="text.primary">
                            {cartData.subtotal.toLocaleString("vi-VN")} ₫
                          </Typography>
                        </Box>

                        {cartData.discountAmount > 0 && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 2,
                            }}
                          >
                            <Typography color="error.main">
                              Giảm giá:
                            </Typography>
                            <Typography fontWeight={600} color="error.main">
                              -{cartData.discountAmount.toLocaleString("vi-VN")}{" "}
                              ₫
                            </Typography>
                          </Box>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="text.primary"
                          >
                            Tổng cộng:
                          </Typography>
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            sx={{ color: "#43A047" }}
                          >
                            {cartData.total.toLocaleString("vi-VN")} ₫
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 3 }} />

                      {/* Action Buttons */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <Button
                          variant="contained"
                          size="large"
                          onClick={handleCheckout}
                          disabled={isProcessing || isEmpty}
                          fullWidth
                          sx={{
                            py: 1.8,
                            fontSize: "1.1rem",
                            fontWeight: 600,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
                            boxShadow: "0 4px 14px rgba(67, 160, 71, 0.4)",
                            textTransform: "none",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #388E3C 0%, #43A047 100%)",
                              boxShadow: "0 6px 20px rgba(67, 160, 71, 0.5)",
                            },
                            "&:disabled": {
                              background: "rgba(102, 187, 106, 0.3)",
                            },
                          }}
                        >
                          {isProcessing ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            <>
                              <LockIcon sx={{ mr: 1, fontSize: 20 }} />
                              Thanh Toán An Toàn
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outlined"
                          size="large"
                          onClick={() => navigate(PATH_USER.cart)}
                          disabled={isProcessing}
                          fullWidth
                          sx={{
                            py: 1.8,
                            fontSize: "1rem",
                            fontWeight: 600,
                            borderRadius: 2,
                            borderWidth: 2,
                            borderColor: "#e0e0e0",
                            color: "text.secondary",
                            textTransform: "none",
                            "&:hover": {
                              borderWidth: 2,
                              borderColor: "#43A047",
                              bgcolor: "rgba(67, 160, 71, 0.04)",
                            },
                          }}
                        >
                          Quay Lại Giỏ Hàng
                        </Button>
                      </Box>

                      {/* Security Info */}
                      <Box
                        sx={{
                          mt: 3,
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: "rgba(67, 160, 71, 0.08)",
                          border: "1px solid rgba(67, 160, 71, 0.2)",
                          textAlign: "center",
                        }}
                      >
                        <LockIcon
                          sx={{ fontSize: 28, color: "#43A047", mb: 1 }}
                        />
                        <Typography
                          variant="body2"
                          color="text.primary"
                          fontWeight={600}
                          sx={{ mb: 0.5 }}
                        >
                          Thanh toán được bảo mật bởi PayOS
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Giao dịch an toàn và được mã hóa
                        </Typography>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
