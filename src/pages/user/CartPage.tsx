import { useEffect, useState } from "react";
import { Box, Container, Typography, Button, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import { getCartThunk, validateCartThunk } from "store/cart/cartThunks";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import { CartItemsList, CartSummaryCard, DiscountSection } from "sections/cart";
import { PATH_USER } from "routes/paths";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

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
        navigate(PATH_USER.checkout);
      } else {
        setShowValidationErrors(true);
      }
    } catch (error) {
      console.error("Cart validation failed:", error);
      setShowValidationErrors(true);
    }
  };

  const handleContinueShopping = () => {
    navigate(PATH_USER.courses);
  };

  const cartData = cart.data;
  const isEmpty = !cartData || cartData.itemsCount === 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "#f5f5f5",
          pt: 12,
          pb: 8,
        }}
      >
        <Container maxWidth="lg">
          {/* Page Title */}
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ mb: 1, color: "#1a1a1a" }}
            >
              Giỏ Hàng
            </Typography>
            {!isEmpty && (
              <Typography variant="body1" color="text.secondary">
                {cartData?.itemsCount} khóa học đang chờ bạn
              </Typography>
            )}
          </Box>

          {/* Validation Errors */}
          {showValidationErrors &&
            validation.cartValidation &&
            !validation.cartValidation.isValid && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                }}
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
                py: 10,
                px: 4,
                background: "white",
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  margin: "0 auto 24px",
                  borderRadius: "50%",
                  bgcolor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 48, color: "#9e9e9e" }} />
              </Box>
              <Typography
                variant="h5"
                fontWeight={600}
                gutterBottom
                sx={{ mb: 2 }}
              >
                Giỏ hàng trống
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
              >
                Hãy khám phá các khóa học STEM thú vị và thêm vào giỏ hàng để
                bắt đầu hành trình học tập!
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleContinueShopping}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  bgcolor: "#43A047",
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "#388E3C",
                  },
                }}
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
