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
  Slider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { createLesson, updateLesson } from "../../../redux/lesson/lessonSlice";
import { getCourses } from "../../../redux/course/courseSlice";
import { LessonResult, CreateLessonRequest, UpdateLessonRequest } from "../../../common/@types/lesson";

interface Props {
  mode: "create" | "edit";
  lesson?: LessonResult | null;
  courseId?: string;
  onBack: () => void;
  onSuccess: () => void;
}

interface FormData {
  courseId: string;
  title: string;
  content: string;
  durationInMinutes: number;
  order: number;
}

export default function LessonFormSection({ mode, lesson, courseId = "", onBack, onSuccess }: Props) {
  const dispatch = useAppDispatch();
  const { isCreating, isUpdating, createError, updateError } = useAppSelector((s) => s.lesson.operations);
  const { data: coursesData } = useAppSelector((s) => s.course.courses);

  const [formData, setFormData] = useState<FormData>({
    courseId: courseId,
    title: "",
    content: "",
    durationInMinutes: 30,
    order: 1,
  });

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ 
    open: false, 
    message: "", 
    severity: "success" 
  });

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;
  const courses = coursesData?.items || [];

  useEffect(() => {
    dispatch(getCourses({ pageSize: 100 } as any));
  }, [dispatch]);

  useEffect(() => {
    if (mode === "edit" && lesson) {
      setFormData({
        courseId: lesson.courseId,
        title: lesson.title,
        content: lesson.content,
        durationInMinutes: lesson.durationInMinutes,
        order: lesson.order,
      });
    }
  }, [mode, lesson]);

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field: keyof FormData) => (e: any) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleDurationChange = (_: Event, value: number | number[]) => {
    setFormData(prev => ({ ...prev, durationInMinutes: value as number }));
  };

  const validate = (): boolean => {
    if (!formData.courseId) {
      setSnackbar({ open: true, message: "Vui lòng chọn khóa học", severity: "error" });
      return false;
    }
    if (!formData.title.trim()) {
      setSnackbar({ open: true, message: "Tên bài học không được để trống", severity: "error" });
      return false;
    }
    if (!formData.content.trim()) {
      setSnackbar({ open: true, message: "Nội dung bài học không được để trống", severity: "error" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (mode === "create") {
        const createData: CreateLessonRequest = {
          courseId: formData.courseId,
          title: formData.title.trim(),
          content: formData.content.trim(),
          durationInMinutes: formData.durationInMinutes,
          order: formData.order,
        };
        await dispatch(createLesson(createData)).unwrap();
        setSnackbar({ open: true, message: "Tạo bài học thành công", severity: "success" });
      } else if (lesson) {
        const updateData: UpdateLessonRequest = {
          courseId: formData.courseId,
          title: formData.title.trim(),
          content: formData.content.trim(),
          durationInMinutes: formData.durationInMinutes,
          order: formData.order,
        };
        await dispatch(updateLesson({ id: lesson.id, data: updateData })).unwrap();
        setSnackbar({ open: true, message: "Cập nhật bài học thành công", severity: "success" });
      }
      
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.message || "Có lỗi xảy ra", severity: "error" });
    }
  };

  const selectedCourse = courses.find(c => c.id === formData.courseId);

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Quay lại
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {mode === "create" ? "Tạo bài học mới" : "Chỉnh sửa bài học"}
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Thông tin bài học
                </Typography>
                
                <Stack spacing={3}>
                  <FormControl fullWidth>
                    <InputLabel>Khóa học *</InputLabel>
                    <Select
                      value={formData.courseId}
                      label="Khóa học *"
                      onChange={handleSelectChange("courseId")}
                      error={!!error && error.includes("courseId")}
                    >
                      {courses.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                          {course.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Tên bài học *"
                    value={formData.title}
                    onChange={handleInputChange("title")}
                    error={!!error && error.includes("title")}
                    helperText="Nhập tên bài học rõ ràng và dễ hiểu"
                  />

                  <TextField
                    fullWidth
                    label="Nội dung *"
                    value={formData.content}
                    onChange={handleInputChange("content")}
                    multiline
                    rows={8}
                    error={!!error && error.includes("content")}
                    helperText="Nội dung chi tiết của bài học"
                  />

                  <Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Thời lượng: {formData.durationInMinutes} phút
                    </Typography>
                    <Slider
                      value={formData.durationInMinutes}
                      onChange={handleDurationChange}
                      min={5}
                      max={180}
                      step={5}
                      marks={[
                        { value: 5, label: "5min" },
                        { value: 30, label: "30min" },
                        { value: 60, label: "1h" },
                        { value: 120, label: "2h" },
                        { value: 180, label: "3h" },
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Box>

                  <TextField
                    fullWidth
                    type="number"
                    label="Thứ tự trong khóa học *"
                    value={formData.order}
                    onChange={handleInputChange("order")}
                    inputProps={{ min: 1 }}
                    helperText="Vị trí của bài học trong khóa học"
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Thông tin khóa học
                </Typography>
                
                {selectedCourse && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {selectedCourse.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {selectedCourse.description}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Số bài học:</strong> {selectedCourse.lessonsCount || 0}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Học viên:</strong> {selectedCourse.enrollmentsCount || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                <Card variant="outlined" sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Xem trước
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {formData.title || "Tên bài học"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Thời lượng: {formData.durationInMinutes} phút
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Thứ tự: {formData.order}
                    </Typography>
                    <Typography variant="body2">
                      {formData.content ? 
                        (formData.content.length > 150 
                          ? `${formData.content.substring(0, 150)}...`
                          : formData.content
                        ) : "Nội dung bài học sẽ hiển thị ở đây"
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={onBack} disabled={isLoading}>
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                disabled={isLoading}
              >
                {mode === "create" ? "Tạo bài học" : "Cập nhật"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}