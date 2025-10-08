import React, { useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "layout/sidebar";
import { UserProfileHeader } from "layout/components/header";
import { LanguageSwitcher } from "components/common";
import { useAppDispatch, useAppSelector } from "store/config";
import { useLocales } from "hooks";
import { getOrderByIdThunk } from "store/order/orderThunks";
import { getOrderItemsThunk } from "store/orderItem/orderItemThunks";
import { OrderStatus, PaymentStatus } from "common/@types/order";
import { OrderItem } from "common/@types/orderItem";
import { PATH_USER } from "routes/paths";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

const OrderDetailPage: React.FC = () => {
  const { translate } = useLocales();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id: orderId } = useParams<{ id: string }>();
  const { currentOrder } = useAppSelector((state) => state.order);
  const {
    items,
    isLoading: itemsLoading,
    error: itemsError,
  } = useAppSelector((state) => state.orderItem);

  useEffect(() => {
    if (orderId) {
      // Fetch order details
      dispatch(getOrderByIdThunk(orderId));
      // Fetch order items
      dispatch(getOrderItemsThunk({ orderId }));
    }
  }, [dispatch, orderId]);

  const handleBackToOrders = () => {
    navigate(PATH_USER.orders);
  };

  const handleGoToCourse = (courseId: string) => {
    navigate(PATH_USER.courseDetail.replace(":id", courseId));
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Paid:
        return "success";
      case OrderStatus.Pending:
        return "warning";
      case OrderStatus.Cancelled:
        return "error";
      case OrderStatus.Failed:
        return "error";
      default:
        return "default";
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Succeeded:
        return "success";
      case PaymentStatus.Pending:
        return "warning";
      case PaymentStatus.Failed:
        return "error";
      case PaymentStatus.Cancelled:
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Paid:
        return translate("orders.StatusPaid");
      case OrderStatus.Pending:
        return translate("orders.StatusPending");
      case OrderStatus.Cancelled:
        return translate("orders.StatusCancelled");
      case OrderStatus.Failed:
        return translate("orders.StatusFailed");
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Succeeded:
        return translate("orders.PaymentSucceeded");
      case PaymentStatus.Pending:
        return translate("orders.PaymentPending");
      case PaymentStatus.Failed:
        return translate("orders.PaymentFailed");
      case PaymentStatus.Cancelled:
        return translate("orders.StatusCancelled");
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isLoading = currentOrder.isLoading || itemsLoading;
  const orderData = currentOrder.data;

  // Compute missing fields from backend data
  const paymentStatus =
    orderData?.paymentTransactions?.[0]?.status ?? PaymentStatus.Pending;
  const itemsCount = items?.length ?? 0;

  return (
    <Box
      sx={{ minHeight: "100vh", bgcolor: "common.white", position: "relative" }}
    >
      <UserProfileHeader title={translate("orders.OrderDetailTitle")} />

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
      <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        {/* Sidebar */}
        <Sidebar openNav={false} onCloseNav={() => {}} />

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { lg: `calc(100% - 280px)` },
            bgcolor: "#f5f5f5",
            pl: { xs: 3, md: 4 },
          }}
        >
          <Container
            maxWidth={false}
            disableGutters
            sx={{ pt: { xs: 3, md: 4 }, pb: 6, px: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                sx={{
                  maxWidth: 1200,
                  mx: "auto",
                  px: { xs: 2, md: 4 },
                }}
              >
                {/* Back Button */}
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBackToOrders}
                  sx={{
                    mb: 3,
                    color: "#43A047",
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "rgba(67, 160, 71, 0.04)",
                    },
                  }}
                >
                  {translate("orders.BackToOrders")}
                </Button>

                {/* Loading State */}
                {isLoading && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      py: 10,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}

                {/* Error State */}
                {(currentOrder.error || itemsError) && !isLoading && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {currentOrder.error || itemsError}
                  </Alert>
                )}

                {/* Order Details */}
                {orderData && !isLoading && (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    {/* Order Header Card */}
                    <Card
                      sx={{
                        bgcolor: "white",
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 3,
                            flexWrap: "wrap",
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h4"
                              fontWeight={700}
                              sx={{ mb: 1 }}
                            >
                              {translate("orders.OrderPrefix")}
                              {orderData.id.substring(0, 8)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {translate("orders.OrderCreated")}:{" "}
                              {formatDate(orderData.createdAt)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                          >
                            <Chip
                              label={getStatusText(orderData.status)}
                              color={getStatusColor(orderData.status)}
                              size="medium"
                            />
                            <Chip
                              label={getPaymentStatusText(paymentStatus)}
                              color={getPaymentStatusColor(paymentStatus)}
                              size="medium"
                            />
                          </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* Order Summary */}
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {translate("orders.SubTotal")}
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {orderData.subtotal.toLocaleString("vi-VN")} ₫
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {translate("orders.Discount")}
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight={600}
                              color="error.main"
                            >
                              -
                              {orderData.discountAmount.toLocaleString("vi-VN")}{" "}
                              ₫
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {translate("orders.ItemsCount")}
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {itemsCount}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {translate("orders.Total")}
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight={600}
                              color="primary.main"
                            >
                              {orderData.total.toLocaleString("vi-VN")} ₫
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Order Items Card */}
                    <Card
                      sx={{
                        bgcolor: "white",
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          sx={{ mb: 3 }}
                        >
                          {translate("orders.OrderItems")} ({itemsCount})
                        </Typography>

                        {/* No items */}
                        {(!items || items.length === 0) && !itemsLoading && (
                          <Box
                            sx={{
                              textAlign: "center",
                              py: 6,
                            }}
                          >
                            <ShoppingBagIcon
                              sx={{ fontSize: 48, color: "#9e9e9e", mb: 2 }}
                            />
                            <Typography variant="body1" color="text.secondary">
                              {translate("orders.NoCourses")}
                            </Typography>
                          </Box>
                        )}

                        {/* Items list */}
                        {items && items.length > 0 && (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            {items.map((item: OrderItem) => (
                              <Paper
                                key={item.id}
                                sx={{
                                  p: 2,
                                  display: "flex",
                                  gap: 2,
                                  alignItems: "center",
                                  border: "1px solid #e0e0e0",
                                  borderRadius: 2,
                                  transition: "all 0.3s",
                                  "&:hover": {
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                  },
                                }}
                              >
                                {/* Course Image */}
                                <Box
                                  component="img"
                                  src={
                                    item.courseImageUrl ||
                                    "/images/placeholder-course.png"
                                  }
                                  alt={item.courseTitle}
                                  sx={{
                                    width: 120,
                                    height: 80,
                                    objectFit: "cover",
                                    borderRadius: 1,
                                    flexShrink: 0,
                                  }}
                                />

                                {/* Course Info */}
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography
                                    variant="h6"
                                    fontWeight={600}
                                    sx={{ mb: 0.5 }}
                                  >
                                    {item.courseTitle}
                                  </Typography>
                                  {item.courseDescription && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                      }}
                                    >
                                      {item.courseDescription}
                                    </Typography>
                                  )}
                                </Box>

                                {/* Price & Action */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    gap: 1,
                                    minWidth: 150,
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    fontWeight={600}
                                    color="primary.main"
                                  >
                                    {item.unitPrice.toLocaleString("vi-VN")} ₫
                                  </Typography>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<PlayCircleOutlineIcon />}
                                    onClick={() =>
                                      handleGoToCourse(item.courseId)
                                    }
                                    sx={{
                                      textTransform: "none",
                                      bgcolor: "#43A047",
                                      "&:hover": {
                                        bgcolor: "#388E3C",
                                      },
                                    }}
                                  >
                                    {translate("orders.GoToCourse")}
                                  </Button>
                                </Box>
                              </Paper>
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </Box>
            </motion.div>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default OrderDetailPage;
