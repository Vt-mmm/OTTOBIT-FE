import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import {
  Voucher,
  VoucherCreateRequest,
  VoucherUpdateRequest,
} from "../../../types/voucher";
import { useNotification } from "../../../hooks/useNotification";
import { axiosClient } from "../../../axiosClient";
import { ROUTES_API_VOUCHER } from "../../../constants/routesApiKeys";

interface Props {
  mode: "create" | "edit";
  voucher?: Voucher | null;
  onBack: () => void;
  onSuccess: () => void;
}

interface FormData {
  code: string;
  name: string;
  description: string;
  type: number;
  discountValue: number;
  minOrderAmount: number;
  usageLimit: number;
  usageLimitPerUser: number;
  startDate: string;
  endDate: string;
  target: number;
  note: string;
}

export default function VoucherFormSection({
  mode,
  voucher,
  onBack,
  onSuccess,
}: Props) {
  const { showNotification, NotificationComponent } = useNotification();

  const [formData, setFormData] = useState<FormData>({
    code: "",
    name: "",
    description: "",
    type: 1, // FixedAmount
    discountValue: 0,
    minOrderAmount: 0,
    usageLimit: 0,
    usageLimitPerUser: 0,
    startDate: "",
    endDate: "",
    target: 1, // All users
    note: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (mode === "edit" && voucher) {
      setFormData({
        code: voucher.code,
        name: voucher.name,
        description: voucher.description,
        type: voucher.type,
        discountValue: voucher.discountValue,
        minOrderAmount: voucher.minOrderAmount,
        usageLimit: voucher.usageLimit,
        usageLimitPerUser: voucher.usageLimitPerUser,
        startDate: voucher.startDate.split("T")[0], // Convert to YYYY-MM-DD
        endDate: voucher.endDate.split("T")[0], // Convert to YYYY-MM-DD
        target: voucher.target,
        note: voucher.note || "",
      });
    }
  }, [mode, voucher]);

  const handleInputChange = (field: keyof FormData) => (e: any) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (field: keyof FormData) => (e: any) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    // 1. Code validation
    if (!formData.code.trim()) {
      errors.code = "Mã voucher không được để trống";
      isValid = false;
    } else if (
      formData.code.trim().length < 3 ||
      formData.code.trim().length > 50
    ) {
      errors.code = "Mã voucher phải có từ 3-50 ký tự";
      isValid = false;
    } else if (!/^[A-Z0-9_-]+$/.test(formData.code.trim().toUpperCase())) {
      errors.code =
        "Mã voucher chỉ được chứa chữ HOA, số, dấu gạch ngang (-) và gạch dưới (_)";
      isValid = false;
    }

    // 2. Name validation
    if (!formData.name.trim()) {
      errors.name = "Tên voucher không được để trống";
      isValid = false;
    } else if (
      formData.name.trim().length < 3 ||
      formData.name.trim().length > 200
    ) {
      errors.name = "Tên voucher phải có từ 3-200 ký tự";
      isValid = false;
    }

    // 3. Description validation
    if (!formData.description.trim()) {
      errors.description = "Mô tả voucher không được để trống";
      isValid = false;
    } else if (
      formData.description.trim().length < 10 ||
      formData.description.trim().length > 1000
    ) {
      errors.description = "Mô tả voucher phải có từ 10-1000 ký tự";
      isValid = false;
    }

    // 4. DiscountValue validation
    if (formData.discountValue <= 0 || formData.discountValue > 10000000) {
      errors.discountValue =
        "Giá trị giảm giá phải lớn hơn 0 và không quá 10,000,000 VNĐ";
      isValid = false;
    }

    // 9. MinOrderAmount (Optional) - ≥ 0
    if (formData.minOrderAmount < 0) {
      errors.minOrderAmount = "Đơn hàng tối thiểu không được âm";
      isValid = false;
    }

    // 10. UsageLimit (Optional) - > 0 và ≤ 1,000,000
    if (formData.usageLimit > 0 && formData.usageLimit > 1000000) {
      errors.usageLimit = "Giới hạn sử dụng không được quá 1,000,000";
      isValid = false;
    }

    // 11. UsageLimitPerUser (Optional) - > 0 và ≤ 1,000
    if (formData.usageLimitPerUser > 0 && formData.usageLimitPerUser > 1000) {
      errors.usageLimitPerUser =
        "Giới hạn sử dụng per user không được quá 1,000";
      isValid = false;
    }

    // 5. StartDate (Required) - Không được quá 1 ngày trong quá khứ
    if (!formData.startDate) {
      errors.startDate = "Ngày bắt đầu không được để trống";
      isValid = false;
    } else {
      const startDate = new Date(formData.startDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (startDate < yesterday) {
        errors.startDate = "Ngày bắt đầu không được quá 1 ngày trong quá khứ";
        isValid = false;
      }
    }

    // 6. EndDate (Required) - Phải sau StartDate
    if (!formData.endDate) {
      errors.endDate = "Ngày kết thúc không được để trống";
      isValid = false;
    } else if (
      formData.startDate &&
      new Date(formData.startDate) >= new Date(formData.endDate)
    ) {
      errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      isValid = false;
    }

    // 13. Note (Optional) - ≤ 500 ký tự
    if (formData.note && formData.note.length > 500) {
      errors.note = "Ghi chú không được quá 500 ký tự";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const payload: VoucherCreateRequest | VoucherUpdateRequest = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        discountValue: formData.discountValue,
        minOrderAmount: formData.minOrderAmount,
        usageLimit: formData.usageLimit,
        usageLimitPerUser: formData.usageLimitPerUser,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        target: formData.target,
        note: formData.note.trim(),
      };

      if (mode === "create") {
        await axiosClient.post(ROUTES_API_VOUCHER.CREATE, payload);
        showNotification("Tạo voucher thành công", "success");
      } else if (mode === "edit" && voucher) {
        await axiosClient.put(ROUTES_API_VOUCHER.UPDATE(voucher.id), payload);
        showNotification("Cập nhật voucher thành công", "success");
      }

      onSuccess();
    } catch (error: any) {
      showNotification(
        error?.response?.data?.message ||
          `Không thể ${mode === "create" ? "tạo" : "cập nhật"} voucher`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Quay lại
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {mode === "create" ? "Tạo Voucher" : "Chỉnh Sửa Voucher"}
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} md={8}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Thông tin cơ bản
                </Typography>

                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Mã Voucher *"
                    value={formData.code}
                    onChange={handleInputChange("code")}
                    placeholder="VD: WELCOME50"
                    inputProps={{ style: { textTransform: "uppercase" } }}
                    error={!!validationErrors.code}
                    helperText={validationErrors.code}
                  />

                  <TextField
                    fullWidth
                    label="Tên Voucher *"
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    placeholder="VD: Voucher Chào Mừng"
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                  />

                  <TextField
                    fullWidth
                    label="Mô tả *"
                    value={formData.description}
                    onChange={handleInputChange("description")}
                    multiline
                    rows={3}
                    placeholder="Mô tả chi tiết về voucher và điều kiện sử dụng"
                    error={!!validationErrors.description}
                    helperText={validationErrors.description}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Loại giảm giá</InputLabel>
                        <Select
                          value={formData.type}
                          onChange={handleSelectChange("type")}
                          label="Loại giảm giá"
                        >
                          <MenuItem value={1}>Giảm giá cố định (VNĐ)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Giá trị giảm giá (VNĐ) *"
                        type="number"
                        value={formData.discountValue}
                        onChange={handleInputChange("discountValue")}
                        inputProps={{
                          step: 1000,
                        }}
                        error={!!validationErrors.discountValue}
                        helperText={validationErrors.discountValue}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="Đơn hàng tối thiểu (VNĐ)"
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={handleInputChange("minOrderAmount")}
                    inputProps={{ step: 1000 }}
                    error={!!validationErrors.minOrderAmount}
                    helperText={validationErrors.minOrderAmount}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Giới hạn sử dụng"
                        type="number"
                        value={formData.usageLimit}
                        onChange={handleInputChange("usageLimit")}
                        inputProps={{ min: 1 }}
                        error={!!validationErrors.usageLimit}
                        helperText={validationErrors.usageLimit}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Giới hạn per user"
                        type="number"
                        value={formData.usageLimitPerUser}
                        onChange={handleInputChange("usageLimitPerUser")}
                        inputProps={{ min: 1 }}
                        error={!!validationErrors.usageLimitPerUser}
                        helperText={validationErrors.usageLimitPerUser}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Ngày bắt đầu *"
                        type="date"
                        value={formData.startDate}
                        onChange={handleInputChange("startDate")}
                        InputLabelProps={{ shrink: true }}
                        error={!!validationErrors.startDate}
                        helperText={validationErrors.startDate}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Ngày kết thúc *"
                        type="date"
                        value={formData.endDate}
                        onChange={handleInputChange("endDate")}
                        InputLabelProps={{ shrink: true }}
                        error={!!validationErrors.endDate}
                        helperText={validationErrors.endDate}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="Ghi chú"
                    value={formData.note}
                    onChange={handleInputChange("note")}
                    multiline
                    rows={2}
                    placeholder="Ghi chú thêm về voucher"
                    error={!!validationErrors.note}
                    helperText={validationErrors.note}
                  />
                </Stack>
              </Grid>

              {/* Settings */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Cài đặt
                </Typography>

                <Stack spacing={3}>
                  <FormControl fullWidth>
                    <InputLabel>Đối tượng áp dụng</InputLabel>
                    <Select
                      value={1}
                      label="Đối tượng áp dụng"
                      onChange={handleSelectChange("target")}
                    >
                      <MenuItem value={1}>Tất cả người dùng</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  isLoading ? <CircularProgress size={20} /> : <SaveIcon />
                }
                disabled={isLoading}
                size="large"
              >
                {isLoading
                  ? mode === "create"
                    ? "Đang tạo..."
                    : "Đang cập nhật..."
                  : mode === "create"
                  ? "Tạo Voucher"
                  : "Cập Nhật"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <NotificationComponent />
    </Box>
  );
}
