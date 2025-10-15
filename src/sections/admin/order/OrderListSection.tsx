import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import {
  getOrdersForAdminThunk,
  updateOrderStatusThunk,
} from "store/order/orderThunks";
import { clearUpdateStatusSuccess } from "store/order/orderSlice";
import { OrderResult, OrderStatus } from "common/@types/order";
import { useNavigate } from "react-router-dom";
import { PATH_ADMIN } from "routes/paths";
import { useLocales } from "hooks";

export default function OrderListSection() {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { adminOrders, operations } = useAppSelector((state) => state.order);

  // Pagination & Filter states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    orderId: string | null;
    currentStatus: OrderStatus | null;
    newStatus: OrderStatus | null;
  }>({
    open: false,
    orderId: null,
    currentStatus: null,
    newStatus: null,
  });

  const items = adminOrders.data?.items || [];
  const total = adminOrders.data?.total || 0;
  const isLoading = adminOrders.isLoading;
  const error = adminOrders.error;

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, statusFilter]);

  const fetchData = () => {
    dispatch(
      getOrdersForAdminThunk({
        page: page + 1,
        size: rowsPerPage,
        status: statusFilter !== "" ? statusFilter : undefined,
      })
    );
  };

  // Handle update status success
  useEffect(() => {
    if (operations.updateStatusSuccess) {
      dispatch(clearUpdateStatusSuccess());
      fetchData();
    }
  }, [operations.updateStatusSuccess]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (orderId: string) => {
    navigate(PATH_ADMIN.orderDetail.replace(":id", orderId));
  };

  const handleStatusChangeRequest = (
    orderId: string,
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ) => {
    // Open confirmation dialog
    setConfirmDialog({
      open: true,
      orderId,
      currentStatus,
      newStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmDialog.orderId || confirmDialog.newStatus === null) return;

    await dispatch(
      updateOrderStatusThunk({
        orderId: confirmDialog.orderId,
        status: confirmDialog.newStatus,
      })
    );

    // Close dialog
    setConfirmDialog({
      open: false,
      orderId: null,
      currentStatus: null,
      newStatus: null,
    });
  };

  const handleCancelStatusChange = () => {
    setConfirmDialog({
      open: false,
      orderId: null,
      currentStatus: null,
      newStatus: null,
    });
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return translate("admin.pending");
      case OrderStatus.Paid:
        return translate("admin.paid");
      case OrderStatus.Failed:
        return translate("admin.failed");
      case OrderStatus.Cancelled:
        return translate("admin.cancelled");
      case OrderStatus.Refunded:
        return translate("admin.refunded");
      default:
        return translate("admin.unknown");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" fontWeight={600}>
            {translate("admin.orderManagement")}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={isLoading}
          >
            {translate("admin.refresh")}
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => {}}>
            {error}
          </Alert>
        )}

        {/* Update Status Error */}
        {operations.updateStatusError && (
          <Alert severity="error">{operations.updateStatusError}</Alert>
        )}

        {/* Filters */}
        <Card sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>{translate("admin.status")}</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as OrderStatus | "");
                  setPage(0);
                }}
                label={translate("admin.status")}
              >
                <MenuItem value="">{translate("admin.all")}</MenuItem>
                <MenuItem value={OrderStatus.Pending}>
                  {translate("admin.pending")}
                </MenuItem>
                <MenuItem value={OrderStatus.Paid}>
                  {translate("admin.paid")}
                </MenuItem>
                <MenuItem value={OrderStatus.Failed}>
                  {translate("admin.failed")}
                </MenuItem>
                <MenuItem value={OrderStatus.Cancelled}>
                  {translate("admin.cancelled")}
                </MenuItem>
                <MenuItem value={OrderStatus.Refunded}>
                  {translate("admin.refunded")}
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Card>

        {/* Table */}
        <Paper elevation={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{translate("admin.orderID")}</TableCell>
                  <TableCell>{translate("admin.user")}</TableCell>
                  <TableCell align="right">
                    {translate("admin.subtotal")}
                  </TableCell>
                  <TableCell align="right">
                    {translate("admin.discount")}
                  </TableCell>
                  <TableCell align="right">
                    {translate("admin.total")}
                  </TableCell>
                  <TableCell>{translate("admin.status")}</TableCell>
                  <TableCell>{translate("admin.createdAt")}</TableCell>
                  <TableCell align="center">
                    {translate("admin.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" color="text.secondary">
                        {translate("admin.noOrdersFound")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((order: OrderResult) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {order.id.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.userEmail || order.userFullName || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(order.subtotal)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          -{formatCurrency(order.discountAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(order.total)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChangeRequest(
                                order.id,
                                order.status,
                                e.target.value as OrderStatus
                              )
                            }
                            disabled={operations.isUpdatingStatus}
                            sx={{
                              "& .MuiSelect-select": {
                                py: 0.5,
                                px: 1,
                              },
                            }}
                          >
                            <MenuItem value={OrderStatus.Pending}>
                              <Chip
                                label={translate("admin.pending")}
                                size="small"
                                color="warning"
                              />
                            </MenuItem>
                            <MenuItem value={OrderStatus.Paid}>
                              <Chip
                                label={translate("admin.paid")}
                                size="small"
                                color="success"
                              />
                            </MenuItem>
                            <MenuItem value={OrderStatus.Failed}>
                              <Chip
                                label={translate("admin.failed")}
                                size="small"
                                color="error"
                              />
                            </MenuItem>
                            <MenuItem value={OrderStatus.Cancelled}>
                              <Chip
                                label={translate("admin.cancelled")}
                                size="small"
                                color="default"
                              />
                            </MenuItem>
                            <MenuItem value={OrderStatus.Refunded}>
                              <Chip
                                label={translate("admin.refunded")}
                                size="small"
                                color="info"
                              />
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewDetails(order.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelStatusChange}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{translate("admin.confirmStatusChange")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {translate("admin.confirmStatusChangeMessage", {
              currentStatus:
                confirmDialog.currentStatus !== null
                  ? getStatusLabel(confirmDialog.currentStatus)
                  : "",
              newStatus:
                confirmDialog.newStatus !== null
                  ? getStatusLabel(confirmDialog.newStatus)
                  : "",
            })}
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            {translate("admin.statusChangeWarning")}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelStatusChange}
            disabled={operations.isUpdatingStatus}
          >
            {translate("admin.cancel")}
          </Button>
          <Button
            onClick={handleConfirmStatusChange}
            variant="contained"
            color="primary"
            disabled={operations.isUpdatingStatus}
            autoFocus
          >
            {operations.isUpdatingStatus
              ? translate("admin.updating")
              : translate("admin.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
