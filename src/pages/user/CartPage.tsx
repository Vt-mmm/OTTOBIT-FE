import { useEffect, useState } from "react";
import { Box, Container, Typography, Button, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import { getCartThunk, validateCartThunk } from "store/cart/cartThunks";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import { CartItemsList, CartSummaryCard, DiscountSection } from "sections/cart";

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart, validation } = useAppSelector((state) => state.cart);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  useEffect(() => {
    // Fetch cart on mount
    dispatch(getCartThunk());
  }, [dispatch]);

  const handleCheckout = async () => {
    try {
      // Validate cart before proceeding to checkout
      const result = await dispatch(validateCartThunk()).unwrap();

      if (result.isValid) {
        // Navigate to checkout page
        navigate("/checkout");
      } else {
        setShowValidationErrors(true);
      }
    } catch (error) {
      console.error("Cart validation failed:", error);
      setShowValidationErrors(true);
    }
  };

  const handleContinueShopping = () => {
    navigate("/user/courses");
  };

  const cartData = cart.data;
  const isEmpty = !cartData || cartData.itemsCount === 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Box sx={{ flexGrow: 1, backgroundColor: "#f5f5f5", py: 4 }}>
        <Container maxWidth="lg">
          {/* Page Title */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Giỏ Hàng Của Bạn
            </Typography>
          </Box>

          {/* Validation Errors */}
          {showValidationErrors &&
            validation.cartValidation &&
            !validation.cartValidation.isValid && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => setShowValidationErrors(false)}
              >
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Không thể tiếp tục thanh toán:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {validation.cartValidation.errors?.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

          {isEmpty ? (
            /* Empty Cart State */
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                backgroundColor: "white",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Giỏ hàng của bạn đang trống
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Hãy khám phá các khóa học thú vị và thêm vào giỏ hàng!
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleContinueShopping}
                sx={{ px: 4 }}
              >
                Khám Phá Khóa Học
              </Button>
            </Box>
          ) : (
            /* Cart Content */
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 350px" },
                gap: 3,
              }}
            >
              {/* Left Column - Cart Items & Discount */}
              <Box>
                <CartItemsList />

                <Box sx={{ mt: 3 }}>
                  <DiscountSection />
                </Box>
              </Box>

              {/* Right Column - Summary */}
              <Box>
                <CartSummaryCard onCheckout={handleCheckout} />
              </Box>
            </Box>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
