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
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { createCourse, updateCourse } from "../../../redux/course/courseSlice";
import { SimpleImageUploader } from "../../../components/common/SimpleImageUploader";
import { useLocales } from "hooks";
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
  const { translate } = useLocales();
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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = translate("admin.courseNameRequired");
      setErrors(newErrors);
      return false;
    }
    if (!formData.description.trim()) {
      newErrors.description = translate("admin.courseDescriptionRequired");
      setErrors(newErrors);
      return false;
    }
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = translate("admin.courseImageRequired");
      setErrors(newErrors);
      return false;
    }
    if (formData.price < 0) {
      newErrors.price = translate("admin.invalidPrice");
      setErrors(newErrors);
      return false;
    }
    setErrors({});
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
      }

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      console.error("Course operation error:", err);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          {translate("admin.back")}
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {mode === "create"
            ? translate("admin.createNewCourse")
            : translate("admin.editCourseTitle")}
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
                <SimpleImageUploader
                  entityId={course?.id}
                  entityType="course"
                  currentImageUrl={formData.imageUrl || undefined}
                  onImageChange={(url: string | null) =>
                    setFormData((prev) => ({ ...prev, imageUrl: url || "" }))
                  }
                  title="Hình ảnh khóa học *"
                  description="Tải lên hình ảnh cho khóa học (bắt buộc)"
                  height={280}
                  disabled={isLoading}
                />
                {errors.imageUrl && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 1, display: "block", px: 2 }}
                  >
                    {errors.imageUrl}
                  </Typography>
                )}

                <Card variant="outlined" sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Xem trước
                    </Typography>

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
    </Box>
  );
}
