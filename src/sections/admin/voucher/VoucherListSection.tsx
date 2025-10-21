import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Pagination,
  TextField,
  Typography,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import { Voucher } from "../../../types/voucher";
import { useNotification } from "../../../hooks/useNotification";
import { axiosClient } from "../../../axiosClient";
import { ROUTES_API_VOUCHER } from "../../../constants/routesApiKeys";

interface Props {
  onCreateNew: () => void;
  onEditVoucher: (voucher: Voucher) => void;
  onViewDetails: (voucherId: string) => void;
}

export default function VoucherListSection({
  onCreateNew,
  onEditVoucher,
  onViewDetails,
}: Props) {
  const { showNotification, NotificationComponent } = useNotification();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"all" | "active">("all");

  // Committed filter states (only sent to API when search is triggered)
  const [committedStartDate, setCommittedStartDate] = useState("");
  const [committedEndDate, setCommittedEndDate] = useState("");
  const [committedStatus, setCommittedStatus] = useState<"all" | "active">(
    "all"
  );
  const [confirmDelete, setConfirmDelete] = useState<Voucher | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<Voucher | null>(null);

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        PageNumber: page.toString(),
        PageSize: pageSize.toString(),
        IncludeDeleted: committedStatus === "all" ? "true" : "false",
      });

      if (committedSearch) {
        params.append("SearchTerm", committedSearch);
      }

      if (committedStartDate) {
        params.append("StartDate", new Date(committedStartDate).toISOString());
      }

      if (committedEndDate) {
        params.append("EndDate", new Date(committedEndDate).toISOString());
      }

      const response = await axiosClient.get(
        `${ROUTES_API_VOUCHER.GET_ALL}?${params.toString()}`
      );

      if (response.data?.data) {
        const raw = response.data.data.items || [];
        setVouchers(raw);
        setTotal(response.data.data.total || 0);
        setTotalPages(response.data.data.totalPages || 1);
      }
    } catch (error: any) {
      showNotification(
        error?.response?.data?.message || "Lỗi khi tải danh sách voucher",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [
    page,
    committedSearch,
    committedStartDate,
    committedEndDate,
    committedStatus,
  ]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const triggerSearch = () => {
    setCommittedSearch(searchTerm.trim());
    setCommittedStartDate(startDate);
    setCommittedEndDate(endDate);
    setCommittedStatus(status);
    setPage(1);
  };

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStartDate(event.target.value);
    setPage(1);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
    setPage(1);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      triggerSearch();
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      await axiosClient.delete(ROUTES_API_VOUCHER.DELETE(confirmDelete.id));
      showNotification("Xóa voucher thành công", "success");
      fetchVouchers();
    } catch (error: any) {
      showNotification(
        error?.response?.data?.message || "Không thể xóa voucher",
        "error"
      );
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleRestore = async () => {
    if (!confirmRestore) return;

    try {
      await axiosClient.post(ROUTES_API_VOUCHER.RESTORE(confirmRestore.id));
      showNotification("Khôi phục voucher thành công", "success");
      fetchVouchers();
    } catch (error: any) {
      showNotification(
        error?.response?.data?.message || "Không thể khôi phục voucher",
        "error"
      );
    } finally {
      setConfirmRestore(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusChip = (voucher: Voucher) => {
    if (voucher.isDeleted) {
      return <Chip label="Đã xóa" color="error" size="small" />;
    }
    if (voucher.isExpired) {
      return <Chip label="Hết hạn" color="warning" size="small" />;
    }
    if (voucher.isAvailable) {
      return <Chip label="Có sẵn" color="success" size="small" />;
    }
    return <Chip label="Không có sẵn" color="default" size="small" />;
  };

  const getTypeText = (type: number) => {
    return type === 1 ? "Giảm giá cố định (VNĐ)" : "Giảm giá phần trăm";
  };

  return (
    <Box>
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
          Danh sách Voucher ({total})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateNew}
          sx={{ minWidth: 140 }}
        >
          Tạo Voucher Mới
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo tên, mã voucher..."
                value={searchTerm}
                onChange={handleSearch}
                onKeyPress={handleKeyPress}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={triggerSearch} edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Ngày bắt đầu"
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Ngày kết thúc"
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl size="small" fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  label="Trạng thái"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as any);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="active">Đang hoạt động</MenuItem>
                </Select>
              </FormControl>
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
          ) : vouchers.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {committedSearch
                  ? "Không tìm thấy voucher nào phù hợp"
                  : "Chưa có voucher nào"}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã Voucher</TableCell>
                    <TableCell>Tên</TableCell>
                    <TableCell>Loại</TableCell>
                    <TableCell>Giá trị</TableCell>
                    <TableCell>Đơn tối thiểu</TableCell>
                    <TableCell>Giới hạn</TableCell>
                    <TableCell>Ngày hết hạn</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {voucher.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{voucher.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getTypeText(voucher.type)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="primary">
                          {formatCurrency(voucher.discountValue)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatCurrency(voucher.minOrderAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {voucher.usageCount}/{voucher.usageLimit}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(voucher.endDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(voucher)}</TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "flex-end",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => onViewDetails(voucher.id)}
                            title="Xem chi tiết"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => onEditVoucher(voucher)}
                            title="Chỉnh sửa"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {voucher.isDeleted ? (
                            <IconButton
                              size="small"
                              onClick={() => setConfirmRestore(voucher)}
                              title="Khôi phục"
                              color="success"
                            >
                              <RestoreIcon fontSize="small" />
                            </IconButton>
                          ) : (
                            <IconButton
                              size="small"
                              onClick={() => setConfirmDelete(voucher)}
                              title="Xóa"
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Xác nhận xóa voucher</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa voucher "{confirmDelete?.name}"? Hành động
            này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={!!confirmRestore} onClose={() => setConfirmRestore(null)}>
        <DialogTitle>Xác nhận khôi phục voucher</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn khôi phục voucher "{confirmRestore?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRestore(null)}>Hủy</Button>
          <Button onClick={handleRestore} color="success" variant="contained">
            Khôi phục
          </Button>
        </DialogActions>
      </Dialog>

      <NotificationComponent />
    </Box>
  );
}
