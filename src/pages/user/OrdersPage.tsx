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
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "layout/sidebar";
import { UserProfileHeader } from "layout/components/header";
import { useAppDispatch, useAppSelector } from "store/config";
import { getOrdersThunk } from "store/order/orderThunks";
import { OrderStatus, PaymentStatus } from "common/@types/order";
import { PATH_USER } from "routes/paths";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import VisibilityIcon from "@mui/icons-material/Visibility";

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.order);

  useEffect(() => {
    // Fetch orders on mount
    dispatch(getOrdersThunk({ page: 1, size: 20 }));
  }, [dispatch]);

  const handleViewOrderDetail = (orderId: string) => {
    navigate(PATH_USER.orderDetail.replace(":id", orderId));
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
        return "Đã thanh toán";
      case OrderStatus.Pending:
        return "Chờ xử lý";
      case OrderStatus.Cancelled:
        return "Đã hủy";
      case OrderStatus.Failed:
        return "Thất bại";
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Succeeded:
        return "Đã thanh toán";
      case PaymentStatus.Pending:
        return "Chờ thanh toán";
      case PaymentStatus.Failed:
        return "Thanh toán thất bại";
      case PaymentStatus.Cancelled:
        return "Đã hủy";
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

  const isEmpty = !orders.data || orders.data.items.length === 0;
  const isLoading = orders.isLoading;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "common.white" }}>
      <UserProfileHeader title="Đơn hàng của tôi" />
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
                {orders.error && !isLoading && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {orders.error}
                  </Alert>
                )}

                {/* Empty State */}
                {isEmpty && !isLoading && (
                  <Paper
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
                      <ShoppingBagIcon
                        sx={{ fontSize: 48, color: "#9e9e9e" }}
                      />
                    </Box>
                    <Typography
                      variant="h5"
                      fontWeight={600}
                      gutterBottom
                      sx={{ mb: 2 }}
                    >
                      Chưa có đơn hàng nào
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
                    >
                      Bạn chưa có đơn hàng nào. Hãy khám phá các khóa học và bắt
                      đầu mua sắm!
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate(PATH_USER.courses)}
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
                  </Paper>
                )}

                {/* Orders List */}
                {!isEmpty && !isLoading && (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    {orders.data?.items.map(
                      (order: import("common/@types").OrderResult) => {
                        // Compute paymentStatus from paymentTransactions
                        const paymentStatus =
                          order.paymentTransactions?.[0]?.status ??
                          PaymentStatus.Pending;

                        return (
                          <Card
                            key={order.id}
                            sx={{
                              bgcolor: "white",
                              borderRadius: 2,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                              transition: "all 0.3s",
                              "&:hover": {
                                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                              },
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              {/* Order Header */}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  mb: 2,
                                  flexWrap: "wrap",
                                  gap: 2,
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="h6"
                                    fontWeight={600}
                                    sx={{ mb: 0.5 }}
                                  >
                                    Đơn hàng #
                                    {order.orderCode ||
                                      order.id.substring(0, 8)}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {formatDate(order.createdAt)}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <Chip
                                    label={getStatusText(order.status)}
                                    color={getStatusColor(order.status)}
                                    size="small"
                                  />
                                  <Chip
                                    label={getPaymentStatusText(paymentStatus)}
                                    color={getPaymentStatusColor(paymentStatus)}
                                    size="small"
                                  />
                                </Box>
                              </Box>

                              <Divider sx={{ my: 2 }} />

                              {/* Order Info */}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  gap: 2,
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Tổng tiền
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    fontWeight={600}
                                    color="primary.main"
                                  >
                                    {order.total.toLocaleString("vi-VN")} ₫
                                  </Typography>
                                </Box>
                                <Button
                                  variant="outlined"
                                  startIcon={<VisibilityIcon />}
                                  onClick={() =>
                                    handleViewOrderDetail(order.id)
                                  }
                                  sx={{
                                    textTransform: "none",
                                    borderColor: "#43A047",
                                    color: "#43A047",
                                    "&:hover": {
                                      borderColor: "#388E3C",
                                      bgcolor: "rgba(67, 160, 71, 0.04)",
                                    },
                                  }}
                                >
                                  Xem chi tiết
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      }
                    )}
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

export default OrdersPage;
