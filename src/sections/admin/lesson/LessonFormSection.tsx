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
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Pagination,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { createLesson, updateLesson } from "../../../redux/lesson/lessonSlice";
import { getCoursesForAdmin } from "../../../redux/course/courseSlice";
import { getLessonsByCourseThunk } from "../../../redux/lesson/lessonThunks";
import {
  LessonResult,
  CreateLessonRequest,
  UpdateLessonRequest,
} from "../../../common/@types/lesson";
import PopupSelect from "../../../components/common/PopupSelect";

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

export default function LessonFormSection({
  mode,
  lesson,
  courseId = "",
  onBack,
  onSuccess,
}: Props) {
  const dispatch = useAppDispatch();
  const { isCreating, isUpdating, createError, updateError } = useAppSelector(
    (s) => s.lesson.operations
  );
  const { data: coursesData } = useAppSelector((s) => s.course.adminCourses);

  const [formData, setFormData] = useState<FormData>({
    courseId: courseId,
    title: "",
    content: "",
    durationInMinutes: 30,
    order: 1,
  });

  const [coursePage, setCoursePage] = useState(1);
  const [courseLoading, setCourseLoading] = useState(false);

  // State for lessons in selected course
  const [courseLessons, setCourseLessons] = useState<LessonResult[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [showLessonsDialog, setShowLessonsDialog] = useState(false);
  const [lessonsPage, setLessonsPage] = useState(1);
  const [lessonsTotalPages, setLessonsTotalPages] = useState(1);
  const [lessonsTotalItems, setLessonsTotalItems] = useState(0);
  const [lessonsPageSize] = useState(12);

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;
  const courses = coursesData?.items || [];

  // Fetch courses with pagination
  useEffect(() => {
    const fetchCourses = async () => {
      setCourseLoading(true);
      try {
        await dispatch(
          getCoursesForAdmin({
            pageNumber: coursePage,
            pageSize: 12,
            includeDeleted: false, // Only active courses for form
          })
        );
      } finally {
        setCourseLoading(false);
      }
    };
    fetchCourses();
  }, [dispatch, coursePage]);

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

  const handleInputChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleDurationChange = (_: Event, value: number | number[]) => {
    setFormData((prev) => ({ ...prev, durationInMinutes: value as number }));
  };

  const handleViewLessons = async () => {
    if (!formData.courseId) return;

    setLessonsPage(1);
    setLessonsLoading(true);
    try {
      const result = await dispatch(
        getLessonsByCourseThunk({
          courseId: formData.courseId,
          pageNumber: 1,
          pageSize: lessonsPageSize,
        })
      ).unwrap();
      setCourseLessons(result.items || []);
      setLessonsTotalPages(result.totalPages || 1);
      setLessonsTotalItems(result.total || 0);
      setShowLessonsDialog(true);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setCourseLessons([]);
      setLessonsTotalPages(1);
    } finally {
      setLessonsLoading(false);
    }
  };

  const handleLessonsPageChange = async (page: number) => {
    if (!formData.courseId) return;

    setLessonsPage(page);
    setLessonsLoading(true);
    try {
      const result = await dispatch(
        getLessonsByCourseThunk({
          courseId: formData.courseId,
          pageNumber: page,
          pageSize: lessonsPageSize,
        })
      ).unwrap();
      setCourseLessons(result.items || []);
      setLessonsTotalPages(result.totalPages || 1);
      setLessonsTotalItems(result.total || 0);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setCourseLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  };

  const validate = (): boolean => {
    if (!formData.courseId) {
      return false;
    }
    if (!formData.title.trim()) {
      return false;
    }
    if (!formData.content.trim()) {
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
      } else if (lesson) {
        const updateData: UpdateLessonRequest = {
          courseId: formData.courseId,
          title: formData.title.trim(),
          content: formData.content.trim(),
          durationInMinutes: formData.durationInMinutes,
          order: formData.order,
        };
        await dispatch(
          updateLesson({ id: lesson.id, data: updateData })
        ).unwrap();
      }

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      // Error handling is done by Redux thunks
    }
  };

  const selectedCourse = courses.find((c) => c.id === formData.courseId);

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Quay lại
        </Button>
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
                  <PopupSelect
                    label="Khóa học *"
                    value={formData.courseId}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, courseId: value }))
                    }
                    items={courses}
                    loading={courseLoading}
                    currentPage={coursePage}
                    onPageChange={setCoursePage}
                    totalPages={coursesData?.totalPages || 1}
                    getItemLabel={(course) => course.title}
                    getItemValue={(course) => course.id}
                    noDataMessage="Không có khóa học nào"
                    pageSize={12}
                    error={!!error && error.includes("courseId")}
                    title="Chọn khóa học"
                  />

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

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    <TextField
                      fullWidth
                      type="number"
                      label="Thứ tự trong khóa học *"
                      value={formData.order || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          order: value === "" ? 0 : parseInt(value, 10),
                        }));
                      }}
                      onFocus={(e) => {
                        // Auto-select for easy replacement
                        setTimeout(() => e.target.select(), 0);
                      }}
                      onBlur={(e) => {
                        // Set to 1 if empty or less than 1 on blur
                        const value = parseInt(e.target.value, 10);
                        if (
                          e.target.value === "" ||
                          isNaN(value) ||
                          value < 1
                        ) {
                          setFormData((prev) => ({ ...prev, order: 1 }));
                        }
                      }}
                      inputProps={{ min: 1, step: 1 }}
                      helperText="Vị trí của bài học trong khóa học"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleViewLessons}
                      disabled={!formData.courseId || lessonsLoading}
                      sx={{
                        whiteSpace: "nowrap",
                        minWidth: 120,
                        height: 40,
                        fontSize: "0.875rem",
                        mt: 0.5, // Căn với phần input của TextField
                      }}
                    >
                      {lessonsLoading ? (
                        <CircularProgress size={16} />
                      ) : (
                        "Xem danh sách"
                      )}
                    </Button>
                  </Box>
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
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {selectedCourse.description}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Số bài học:</strong>{" "}
                        {selectedCourse.lessonsCount || 0}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Học viên:</strong>{" "}
                        {selectedCourse.enrollmentsCount || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                <Card variant="outlined" sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Xem trước
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {formData.title || "Tên bài học"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Thời lượng: {formData.durationInMinutes} phút
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Thứ tự: {formData.order}
                    </Typography>
                    <Typography variant="body2">
                      {formData.content
                        ? formData.content.length > 150
                          ? `${formData.content.substring(0, 150)}...`
                          : formData.content
                        : "Nội dung bài học sẽ hiển thị ở đây"}
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
                {mode === "create" ? "Tạo mới" : "Cập nhật"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog hiển thị danh sách lesson */}
      <Dialog
        open={showLessonsDialog}
        onClose={() => setShowLessonsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Danh sách bài học hiện có trong khóa học
          {courseLessons.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {lessonsTotalItems} bài học
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          {lessonsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : courseLessons.length > 0 ? (
            <List>
              {courseLessons
                .filter((lesson) => !lesson.isDeleted)
                .sort((a, b) => a.order - b.order)
                .map((lesson) => (
                  <ListItem key={lesson.id} divider>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {lesson.order}. {lesson.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Thời lượng: {lesson.durationInMinutes} phút
                          </Typography>
                          {lesson.content && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              {lesson.content.length > 100
                                ? `${lesson.content.substring(0, 100)}...`
                                : lesson.content}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
            </List>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              Khóa học này chưa có bài học nào
            </Typography>
          )}
        </DialogContent>

        {/* Pagination cố định ở dưới */}
        {courseLessons.length > 0 && lessonsTotalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Pagination
              count={lessonsTotalPages}
              page={lessonsPage}
              onChange={(_, page) => handleLessonsPageChange(page)}
              size="small"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
        <DialogActions>
          <Button onClick={() => setShowLessonsDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
