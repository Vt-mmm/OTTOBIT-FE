import { useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Cancel } from "@mui/icons-material";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import { PATH_USER } from "routes/paths";

export default function PaymentCancelPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get payment params from URL
  const orderCode = searchParams.get("orderCode");
  const cancel = searchParams.get("cancel");

  useEffect(() => {
    // Log cancellation for analytics (optional)
    console.log("Payment cancelled", { orderCode, cancel });
  }, [orderCode, cancel]);

  const handleRetryCheckout = () => {
    navigate(PATH_USER.cart);
  };

  const handleContinueShopping = () => {
    navigate(PATH_USER.courses);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Box
        sx={{
          flexGrow: 1,
          background: "linear-gradient(180deg, #F5F7FA 0%, #FFFFFF 100%)",
          py: 8,
        }}
      >
        <Container maxWidth="sm">
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 6, px: 4 }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  margin: "0 auto 24px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(255, 107, 107, 0.35)",
                }}
              >
                <Cancel
                  sx={{
                    fontSize: 72,
                    color: "white",
                  }}
                />
              </Box>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                Thanh Toán Đã Bị Hủy
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Bạn đã hủy quá trình thanh toán.
              </Typography>
              {orderCode && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  Mã đơn hàng: <strong>{orderCode}</strong>
                </Typography>
              )}
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Các sản phẩm vẫn còn trong giỏ hàng của bạn. Bạn có thể thử lại
                bất cứ lúc nào.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: 4,
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleRetryCheckout}
                  fullWidth
                  sx={{
                    py: 1.8,
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    borderRadius: 3,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.35)",
                    textTransform: "none",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #5568d3 0%, #6a4193 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(102, 126, 234, 0.45)",
                    },
                  }}
                >
                  Quay Lại Giỏ Hàng
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleContinueShopping}
                  fullWidth
                  sx={{
                    py: 1.8,
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    borderRadius: 3,
                    borderWidth: 2,
                    textTransform: "none",
                    "&:hover": {
                      borderWidth: 2,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Tiếp Tục Khám Phá
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Help Text */}
          <Card
            sx={{
              mt: 3,
              borderRadius: 4,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                fontWeight={600}
                gutterBottom
              >
                Cần hỗ trợ?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nếu bạn gặp vấn đề trong quá trình thanh toán, vui lòng liên hệ
                với chúng tôi qua email:{" "}
                <strong style={{ color: "#667eea" }}>
                  support@ottobit.edu.vn
                </strong>
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
