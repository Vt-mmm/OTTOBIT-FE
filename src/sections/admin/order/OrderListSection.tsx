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
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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

export default function OrderListSection() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { adminOrders, operations } = useAppSelector((state) => state.order);

  // Pagination & Filter states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [searchInput, setSearchInput] = useState("");

  const items = adminOrders.data?.items || [];
  const total = adminOrders.data?.total || 0;
  const isLoading = adminOrders.isLoading;
  const error = adminOrders.error;

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, searchTerm, statusFilter]);

  const fetchData = () => {
    dispatch(
      getOrdersForAdminThunk({
        page: page + 1,
        size: rowsPerPage,
        searchTerm: searchTerm || undefined,
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

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(0);
  };

  const handleViewDetails = (orderId: string) => {
    navigate(PATH_ADMIN.orderDetail.replace(":id", orderId));
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await dispatch(updateOrderStatusThunk({ orderId, status: newStatus }));
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
            Order Management
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={isLoading}
          >
            Refresh
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
            <TextField
              label="Search (User email, Order ID)"
              variant="outlined"
              size="small"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              sx={{ flexGrow: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as OrderStatus | "");
                  setPage(0);
                }}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value={OrderStatus.Pending}>Pending</MenuItem>
                <MenuItem value={OrderStatus.Paid}>Paid</MenuItem>
                <MenuItem value={OrderStatus.Failed}>Failed</MenuItem>
                <MenuItem value={OrderStatus.Cancelled}>Cancelled</MenuItem>
                <MenuItem value={OrderStatus.Refunded}>Refunded</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
          </Stack>
        </Card>

        {/* Table */}
        <Paper elevation={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="right">Discount</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="center">Actions</TableCell>
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
                        No orders found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((order: OrderResult) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
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
                              handleStatusChange(
                                order.id,
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
                                label="Pending"
                                size="small"
                                color="warning"
                              />
                            </MenuItem>
                            <MenuItem value={OrderStatus.Paid}>
                              <Chip label="Paid" size="small" color="success" />
                            </MenuItem>
                            <MenuItem value={OrderStatus.Failed}>
                              <Chip label="Failed" size="small" color="error" />
                            </MenuItem>
                            <MenuItem value={OrderStatus.Cancelled}>
                              <Chip
                                label="Cancelled"
                                size="small"
                                color="default"
                              />
                            </MenuItem>
                            <MenuItem value={OrderStatus.Refunded}>
                              <Chip label="Refunded" size="small" color="info" />
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
    </Box>
  );
}

