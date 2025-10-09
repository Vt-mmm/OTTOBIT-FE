import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Pagination,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { VoucherUsage, VoucherUsageListParams } from "../../../types/voucher";
import { useNotification } from "../../../hooks/useNotification";
import { axiosClient } from "../../../axiosClient";
import { ROUTES_API_VOUCHER_USAGE } from "../../../constants/routesApiKeys";

interface Props {
  onViewDetails?: (usageId: string) => void;
}

export default function VoucherUsageSection({ onViewDetails }: Props) {
  const { showNotification, NotificationComponent } = useNotification();

  const [usages, setUsages] = useState<VoucherUsage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usedAtFrom, setUsedAtFrom] = useState("");
  const [usedAtTo, setUsedAtTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsages = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        PageNumber: page.toString(),
        PageSize: pageSize.toString(),
        IncludeDeleted: "true",
      });

      if (usedAtFrom) {
        params.append("UsedAtFrom", new Date(usedAtFrom).toISOString());
      }

      if (usedAtTo) {
        params.append("UsedAtTo", new Date(usedAtTo).toISOString());
      }

      const response = await axiosClient.get(
        `${ROUTES_API_VOUCHER_USAGE.GET_ALL}?${params.toString()}`
      );

      if (response.data?.data) {
        setUsages(response.data.data.items || []);
        setTotal(response.data.data.total || 0);
        setTotalPages(response.data.data.totalPages || 1);
      }
    } catch (error: any) {
      showNotification(
        error?.response?.data?.message ||
          "Lỗi khi tải danh sách sử dụng voucher",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsages();
  }, [page, pageSize, usedAtFrom, usedAtTo]);

  const handleDateChange =
    (field: "from" | "to") => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (field === "from") {
        setUsedAtFrom(e.target.value);
      } else {
        setUsedAtTo(e.target.value);
      }
      setPage(1); // Reset to first page when filter changes
    };

  const handleRefresh = () => {
    fetchUsages();
  };

  const handlePageSizeChange = (event: any) => {
    setPageSize(Number(event.target.value));
    setPage(1); // Reset to first page when changing page size
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusChip = (status: number) => {
    switch (status) {
      case 1:
        return <Chip label="Đang xử lý" color="warning" size="small" />;
      case 2:
        return <Chip label="Thành công" color="success" size="small" />;
      case 3:
        return <Chip label="Thất bại" color="error" size="small" />;
      default:
        return <Chip label="Không xác định" color="default" size="small" />;
    }
  };

  return (
    <Box>
      <NotificationComponent />

      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="h2">
          Lịch sử sử dụng Voucher ({total})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Làm mới
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Bộ lọc
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Từ ngày"
                type="datetime-local"
                value={usedAtFrom}
                onChange={handleDateChange("from")}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Đến ngày"
                type="datetime-local"
                value={usedAtTo}
                onChange={handleDateChange("to")}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Mã Voucher</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tên Voucher</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Người dùng</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mã đơn hàng</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Thời gian sử dụng
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ngày tạo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usages.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        sx={{ textAlign: "center", py: 4 }}
                      >
                        <Typography color="text.secondary">
                          Không có dữ liệu sử dụng voucher
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    usages.map((usage) => (
                      <TableRow key={usage.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {usage.voucherCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {usage.voucherName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {usage.userName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {usage.userId.slice(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace" }}
                          >
                            {usage.orderId.slice(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(usage.usedAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>{getStatusChip(usage.status)}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(usage.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {onViewDetails && (
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                onClick={() => onViewDetails(usage.id)}
                                color="primary"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          <FormControl size="small">
            <InputLabel>Page size</InputLabel>
            <Select
              label="Page size"
              value={pageSize}
              onChange={handlePageSizeChange}
              sx={{ minWidth: 120 }}
            >
              {[6, 12, 24, 48].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            shape="rounded"
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
