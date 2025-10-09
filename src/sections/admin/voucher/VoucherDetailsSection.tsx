import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import { Voucher } from "../../../types/voucher";

interface Props {
  voucher: Voucher | null;
  onBack: () => void;
  onEdit: (voucher: Voucher) => void;
}

export default function VoucherDetailsSection({
  voucher,
  onBack,
  onEdit,
}: Props) {
  if (!voucher) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          Không tìm thấy voucher
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mt: 2 }}>
          Quay lại
        </Button>
      </Box>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusChip = (voucher: Voucher) => {
    if (voucher.isDeleted) {
      return <Chip label="Đã xóa" color="error" />;
    }
    if (voucher.isExpired) {
      return <Chip label="Hết hạn" color="warning" />;
    }
    if (!voucher.isActive) {
      return <Chip label="Không hoạt động" color="default" />;
    }
    if (voucher.isAvailable) {
      return <Chip label="Có sẵn" color="success" />;
    }
    return <Chip label="Không có sẵn" color="error" />;
  };

  const getTypeText = (type: number) => {
    return type === 1 ? "Giảm giá cố định (VNĐ)" : "Giảm giá phần trăm";
  };

  const getTargetText = (target: number) => {
    return target === 1 ? "Tất cả người dùng" : "Người dùng cụ thể";
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Quay lại
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Chi tiết Voucher
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => onEdit(voucher)}
          disabled={voucher.isDeleted}
        >
          Chỉnh sửa
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Thông tin cơ bản
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Mã Voucher
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {voucher.code}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tên Voucher
                  </Typography>
                  <Typography variant="body1">{voucher.name}</Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Mô tả
                  </Typography>
                  <Typography variant="body1">{voucher.description}</Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ghi chú
                  </Typography>
                  <Typography variant="body1">
                    {voucher.note || "Không có ghi chú"}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Discount Information */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Thông tin giảm giá
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Loại giảm giá
                  </Typography>
                  <Typography variant="body1">
                    {getTypeText(voucher.type)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Giá trị giảm giá
                  </Typography>
                  <Typography
                    variant="body1"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                  >
                    {voucher.type === 1
                      ? formatCurrency(voucher.discountValue)
                      : `${voucher.discountValue}%`}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Đơn hàng tối thiểu
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(voucher.minOrderAmount)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Đối tượng áp dụng
                  </Typography>
                  <Typography variant="body1">
                    {getTargetText(voucher.target)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Settings & Usage */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Trạng thái & Sử dụng
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Box sx={{ mt: 1 }}>{getStatusChip(voucher)}</Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Giới hạn sử dụng
                  </Typography>
                  <Typography variant="body1">
                    {voucher.usageCount} / {voucher.usageLimit}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Giới hạn per user
                  </Typography>
                  <Typography variant="body1">
                    {voucher.usageLimitPerUser} lần
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Số lần đã sử dụng
                  </Typography>
                  <Typography variant="body1">
                    {voucher.voucherUsagesCount} lần
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Thời gian hiệu lực
                  </Typography>
                  <Typography variant="body2">
                    Từ: {formatDate(voucher.startDate)}
                  </Typography>
                  <Typography variant="body2">
                    Đến: {formatDate(voucher.endDate)}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Người tạo
                  </Typography>
                  <Typography variant="body2">
                    {voucher.createdByName}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ngày tạo
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(voucher.createdAt)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật lần cuối
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(voucher.updatedAt)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
