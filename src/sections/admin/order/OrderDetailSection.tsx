import { useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { getOrderByIdForAdminThunk } from "store/order/orderThunks";
import { OrderStatus } from "common/@types/order";
import { PaymentMethod, PaymentStatus } from "common/@types/payment";
import { useNavigate, useParams } from "react-router-dom";
import { PATH_ADMIN } from "routes/paths";

// Order status color mapping
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Pending:
      return "warning";
    case OrderStatus.Paid:
      return "success";
    case OrderStatus.Failed:
      return "error";
    case OrderStatus.Cancelled:
      return "default";
    case OrderStatus.Refunded:
      return "info";
    default:
      return "default";
  }
};

// Order status label mapping
const getStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Pending:
      return "Pending";
    case OrderStatus.Paid:
      return "Paid";
    case OrderStatus.Failed:
      return "Failed";
    case OrderStatus.Cancelled:
      return "Cancelled";
    case OrderStatus.Refunded:
      return "Refunded";
    default:
      return "Unknown";
  }
};

// Payment method label mapping
const getPaymentMethodLabel = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.PayOS:
      return "PayOS";
    case PaymentMethod.Cash:
      return "Cash";
    case PaymentMethod.BankTransfer:
      return "Bank Transfer";
    default:
      return "Unknown";
  }
};

// Payment status label mapping
const getPaymentStatusLabel = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.Pending:
      return "Pending";
    case PaymentStatus.Succeeded:
      return "Succeeded";
    case PaymentStatus.Failed:
      return "Failed";
    case PaymentStatus.Cancelled:
      return "Cancelled";
    default:
      return "Unknown";
  }
};

export default function OrderDetailSection() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentOrder } = useAppSelector((state) => state.order);

  const order = currentOrder.data;
  const isLoading = currentOrder.isLoading;
  const error = currentOrder.error;

  useEffect(() => {
    if (id) {
      dispatch(getOrderByIdForAdminThunk(id));
    }
  }, [id, dispatch]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleBack = () => {
    navigate(PATH_ADMIN.orders);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Order not found
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back
          </Button>
          <Typography variant="h4" fontWeight={600} sx={{ flexGrow: 1 }}>
            Order Details
          </Typography>
          <Chip
            label={getStatusLabel(order.status)}
            color={getStatusColor(order.status)}
            size="medium"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Grid container spacing={3}>
          {/* Order Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Stack spacing={3}>
                  {/* Order Summary */}
                  <Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <ReceiptIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Order Summary
                      </Typography>
                    </Stack>
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Order ID:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {order.id}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Created At:
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Last Updated:
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(order.updatedAt)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Divider />

                  {/* User Information */}
                  <Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <PersonIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        User Information
                      </Typography>
                    </Stack>
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          User ID:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {order.userId}
                        </Typography>
                      </Box>
                      {order.userFullName && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Name:
                          </Typography>
                          <Typography variant="body2">
                            {order.userFullName}
                          </Typography>
                        </Box>
                      )}
                      {order.userEmail && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Email:
                          </Typography>
                          <Typography variant="body2">
                            {order.userEmail}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Order Items */}
                  <Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <ShoppingCartIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Order Items
                      </Typography>
                    </Stack>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Course</TableCell>
                            <TableCell align="right">Price</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {order.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Typography variant="body2">
                                  {item.courseTitle}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontFamily: "monospace" }}
                                >
                                  {item.courseId}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight={500}>
                                  {formatCurrency(item.unitPrice)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  {/* Payment Transactions */}
                  {order.paymentTransactions &&
                    order.paymentTransactions.length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mb: 2 }}
                          >
                            <PaymentIcon color="primary" />
                            <Typography variant="h6" fontWeight={600}>
                              Payment Transactions
                            </Typography>
                          </Stack>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Transaction ID</TableCell>
                                  <TableCell>Method</TableCell>
                                  <TableCell align="right">Amount</TableCell>
                                  <TableCell>Status</TableCell>
                                  <TableCell>Order Code</TableCell>
                                  <TableCell>Date</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {order.paymentTransactions.map((txn) => (
                                  <TableRow key={txn.id}>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        sx={{ fontFamily: "monospace" }}
                                      >
                                        {txn.id.substring(0, 8)}...
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {getPaymentMethodLabel(txn.method)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography variant="body2">
                                        {formatCurrency(txn.amount)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={getPaymentStatusLabel(
                                          txn.status
                                        )}
                                        size="small"
                                        color={
                                          txn.status === PaymentStatus.Succeeded
                                            ? "success"
                                            : txn.status ===
                                              PaymentStatus.Failed
                                            ? "error"
                                            : txn.status ===
                                              PaymentStatus.Cancelled
                                            ? "default"
                                            : "warning"
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {txn.orderCode || "N/A"}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {formatDate(txn.createdAt)}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </>
                    )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Price Summary Sidebar */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Price Summary
                </Typography>
                <Stack spacing={2}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Subtotal:
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(order.subtotal)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Discount:
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      -{formatCurrency(order.discountAmount)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Total:
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      {formatCurrency(order.total)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
