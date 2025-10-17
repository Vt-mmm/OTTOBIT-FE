import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Snackbar,
  Alert,
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
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { createCourse, updateCourse } from "../../../redux/course/courseSlice";
import {
  CourseResult,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseType,
} from "../../../common/@types/course";

interface Props {
  mode: "create" | "edit";
  course?: CourseResult | null;
  onBack: () => void;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  type: CourseType;
}

export default function CourseFormSection({
  mode,
  course,
  onBack,
  onSuccess,
}: Props) {
  const dispatch = useAppDispatch();
  const { isCreating, isUpdating, createError, updateError } = useAppSelector(
    (s) => s.course.operations
  );

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    imageUrl: "",
    price: 0,
    type: CourseType.Free,
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  useEffect(() => {
    if (mode === "edit" && course) {
      setFormData({
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl || "",
        price: (course as any).price ?? 0,
        type: (course as any).type ?? CourseType.Free,
      });
    }
  }, [mode, course]);

  const handleInputChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const validate = (): boolean => {
    if (!formData.title.trim()) {
      setSnackbar({
        open: true,
        message: "Tên khóa học không được để trống",
        severity: "error",
      });
      return false;
    }
    if (!formData.description.trim()) {
      setSnackbar({
        open: true,
        message: "Mô tả khóa học không được để trống",
        severity: "error",
      });
      return false;
    }
    if (formData.price < 0) {
      setSnackbar({
        open: true,
        message: "Giá không hợp lệ",
        severity: "error",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (mode === "create") {
        const createData: CreateCourseRequest = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          imageUrl: formData.imageUrl.trim() || undefined,
          price: Number(formData.price) || 0,
          type: formData.type,
        };
        await dispatch(createCourse(createData)).unwrap();
        setSnackbar({
          open: true,
          message: "Tạo khóa học thành công",
          severity: "success",
        });
      } else if (course) {
        const updateData: UpdateCourseRequest = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          imageUrl: formData.imageUrl.trim() || undefined,
          price: Number(formData.price) || 0,
          type: formData.type,
        };
        await dispatch(
          updateCourse({ id: course.id, data: updateData })
        ).unwrap();
        setSnackbar({
          open: true,
          message: "Cập nhật khóa học thành công",
          severity: "success",
        });
      }

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.message || "Có lỗi xảy ra",
        severity: "error",
      });
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Quay lại
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {mode === "create" ? "Tạo khóa học mới" : "Chỉnh sửa khóa học"}
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Thông tin cơ bản
                </Typography>

                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Tên khóa học *"
                    value={formData.title}
                    onChange={handleInputChange("title")}
                    error={!!error && error.includes("title")}
                    helperText="Nhập tên khóa học dễ hiểu và thu hút"
                  />

                  <TextField
                    fullWidth
                    label="Mô tả *"
                    value={formData.description}
                    onChange={handleInputChange("description")}
                    multiline
                    rows={4}
                    error={!!error && error.includes("description")}
                    helperText="Mô tả chi tiết về khóa học, mục tiêu học tập"
                  />

                  <TextField
                    fullWidth
                    label="URL Hình ảnh"
                    value={formData.imageUrl}
                    onChange={handleInputChange("imageUrl")}
                    placeholder="https://example.com/image.jpg"
                    helperText="Link hình đại diện cho khóa học (tùy chọn)"
                  />

                  <TextField
                    fullWidth
                    label="Giá (VND)"
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        price: value === "" ? 0 : parseFloat(value),
                      }));
                    }}
                    onFocus={(e) => {
                      // Auto-select for easy replacement
                      setTimeout(() => e.target.select(), 0);
                    }}
                    onBlur={(e) => {
                      // Set to 0 if empty or negative on blur
                      const value = parseFloat(e.target.value);
                      if (e.target.value === "" || isNaN(value) || value < 0) {
                        setFormData((prev) => ({ ...prev, price: 0 }));
                      }
                    }}
                    inputProps={{ min: 0, step: "any" }}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Loại khóa học</InputLabel>
                    <Select
                      label="Loại khóa học"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          type: Number(e.target.value) as CourseType,
                        }))
                      }
                    >
                      <MenuItem value={CourseType.Free}>Miễn phí</MenuItem>
                      <MenuItem value={CourseType.Premium}>Trả phí</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Xem trước
                </Typography>

                <Card variant="outlined">
                  <CardContent>
                    {formData.imageUrl && (
                      <Box sx={{ mb: 2 }}>
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          style={{
                            width: "100%",
                            height: "120px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </Box>
                    )}

                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {formData.title || "Tên khóa học"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {formData.description ||
                        "Mô tả khóa học sẽ hiển thị ở đây"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 4,
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
              }}
            >
              <Button variant="outlined" onClick={onBack} disabled={isLoading}>
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  isLoading ? <CircularProgress size={16} /> : <SaveIcon />
                }
                disabled={isLoading}
              >
                {mode === "create" ? "Tạo khóa học" : "Cập nhật"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
