import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { VoucherUsageDetail } from "../../../types/voucher";
import { useNotification } from "../../../hooks/useNotification";
import { axiosClient } from "../../../axiosClient";
import { ROUTES_API_VOUCHER_USAGE } from "../../../constants/routesApiKeys";

interface Props {
  usageId: string;
  onBack: () => void;
}

export default function VoucherUsageDetailSection({ usageId, onBack }: Props) {
  const { showNotification, NotificationComponent } = useNotification();

  const [usage, setUsage] = useState<VoucherUsageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsageDetail = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get(
        ROUTES_API_VOUCHER_USAGE.GET_BY_ID(usageId)
      );

      if (response.data?.data) {
        setUsage(response.data.data);
      }
    } catch (error: any) {
      showNotification(
        error?.response?.data?.message ||
          "Lỗi khi tải chi tiết sử dụng voucher",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageDetail();
  }, [usageId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusChip = (status: number) => {
    switch (status) {
      case 1:
        return <Chip label="Đang xử lý" color="warning" />;
      case 2:
        return <Chip label="Thành công" color="success" />;
      case 3:
        return <Chip label="Thất bại" color="error" />;
      default:
        return <Chip label="Không xác định" color="default" />;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!usage) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          Không tìm thấy thông tin sử dụng voucher
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mt: 2 }}>
          Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <NotificationComponent />

      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Quay lại
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Chi tiết sử dụng Voucher
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {/* Voucher Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Thông tin Voucher
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Mã Voucher
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {usage.voucherCode}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tên Voucher
                  </Typography>
                  <Typography variant="body1">{usage.voucherName}</Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    ID Voucher
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {usage.voucherId}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Usage Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Thông tin sử dụng
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Box sx={{ mt: 1 }}>{getStatusChip(usage.status)}</Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Thời gian sử dụng
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(usage.usedAt)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Mã đơn hàng
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                    {usage.orderId}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* User Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Thông tin người dùng
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tên người dùng
                  </Typography>
                  <Typography variant="body1">{usage.userName}</Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    ID người dùng
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {usage.userId}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Thông tin hệ thống
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    ID sử dụng
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {usage.id}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ngày tạo
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(usage.createdAt)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật lần cuối
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(usage.updatedAt)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Trạng thái xóa
                  </Typography>
                  <Typography variant="body2">
                    {usage.isDeleted ? "Đã xóa" : "Chưa xóa"}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Order Information */}
        {usage.discountAmount && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Thông tin đơn hàng
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Số tiền giảm giá
                    </Typography>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ fontWeight: "bold" }}
                    >
                      {formatCurrency(usage.discountAmount)}
                    </Typography>
                  </Grid>

                  {usage.orderTotal && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Tổng đơn hàng
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {formatCurrency(usage.orderTotal)}
                      </Typography>
                    </Grid>
                  )}

                  {usage.orderStatus && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Trạng thái đơn hàng
                      </Typography>
                      <Typography variant="body1">
                        {usage.orderStatus}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
