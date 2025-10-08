import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "@mui/icons-material";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import { LanguageSwitcher } from "components/common";
import { PATH_USER } from "routes/paths";
import { useLocales } from "hooks";

export default function PaymentReturnPage() {
  const { translate } = useLocales();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get payment result params from URL
  const code = searchParams.get("code");
  const id = searchParams.get("id");
  const orderCode = searchParams.get("orderCode");
  const status = searchParams.get("status");
  const cancel = searchParams.get("cancel");

  useEffect(() => {
    console.log("[PaymentReturn] Query params:", {
      code,
      id,
      orderCode,
      status,
      cancel,
    });

    // Simulate processing (webhook should handle the actual update)
    const timer = setTimeout(() => {
      setIsProcessing(false);

      // Check if payment was cancelled (string comparison)
      if (cancel === "true" || status === "CANCELLED") {
        setError(translate("payment.PaymentCancelled"));
        return;
      }

      // If cancel="false", payment is successful - don't check code/status
      if (cancel === "false") {
        // Payment successful
        return;
      }

      // Fallback: Check if payment was successful by code/status
      // PayOS returns code="00" for success, or status="PAID"
      if (code !== "00" && status !== "PAID") {
        setError(translate("payment.PaymentFailed"));
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [code, status, cancel, id, orderCode]);

  const handleViewOrders = () => {
    navigate(PATH_USER.profile + "?tab=orders");
  };

  const handleContinueShopping = () => {
    navigate(PATH_USER.courses);
  };

  if (isProcessing) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          {translate("payment.ProcessingPayment")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {translate("payment.PleaseWait")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <Header />

      {/* Language Switcher - Top right */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 80, md: 90 },
          right: { xs: 16, md: 32 },
          zIndex: 999,
        }}
      >
        <LanguageSwitcher />
      </Box>

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
              {error ? (
                <>
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                  <Typography variant="h5" gutterBottom>
                    {translate("payment.PaymentError")}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 4 }}>
                    {translate("payment.PaymentProcessingError")}
                    {orderCode && (
                      <>
                        <br />
                        {translate("payment.OrderNumber")}:{" "}
                        <strong>{orderCode}</strong>
                      </>
                    )}
                  </Typography>
                  <Box
                    sx={{ display: "flex", gap: 2, justifyContent: "center" }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => navigate(PATH_USER.cart)}
                    >
                      {translate("payment.BackToCart")}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleContinueShopping}
                    >
                      {translate("payment.ContinueShopping")}
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      margin: "0 auto 24px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 24px rgba(67, 160, 71, 0.35)",
                    }}
                  >
                    <CheckCircle
                      sx={{
                        fontSize: 72,
                        color: "white",
                      }}
                    />
                  </Box>
                  <Typography variant="h3" fontWeight={700} gutterBottom>
                    {translate("payment.PaymentSuccessful")}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {translate("payment.ThankYouPurchase")}
                  </Typography>
                  {orderCode && (
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 4 }}
                    >
                      {translate("payment.OrderNumber")}:{" "}
                      <strong>{orderCode}</strong>
                    </Typography>
                  )}
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    {translate("payment.CanStartLearning")}
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
                      onClick={handleViewOrders}
                      fullWidth
                      sx={{
                        py: 1.8,
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        borderRadius: 3,
                        background:
                          "linear-gradient(135deg, #43A047 0%, #66BB6A 100%)",
                        boxShadow: "0 6px 20px rgba(67, 160, 71, 0.35)",
                        textTransform: "none",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #388E3C 0%, #43A047 100%)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 24px rgba(67, 160, 71, 0.45)",
                        },
                      }}
                    >
                      {translate("payment.ViewOrders")}
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
                      {translate("payment.ContinueExploring")}
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          {!error && (
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
                  fontWeight={600}
                  color="text.secondary"
                  gutterBottom
                >
                  {translate("payment.TransactionDetails")}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {id && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        ID Giao dịch:
                      </Typography>
                      <Typography variant="body2">{id}</Typography>
                    </Box>
                  )}
                  {orderCode && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Mã đơn hàng:
                      </Typography>
                      <Typography variant="body2">{orderCode}</Typography>
                    </Box>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Trạng thái:
                    </Typography>
                    <Typography
                      variant="body2"
                      color="success.main"
                      fontWeight={500}
                    >
                      Thành công
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
