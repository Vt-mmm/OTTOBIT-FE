import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getCoursesForAdmin } from "../../../redux/course/courseSlice";
import { getLessons } from "../../../redux/lesson/lessonSlice";
import PopupSelect from "components/common/PopupSelect";
import { axiosClient } from "axiosClient";
import { ROUTES_API_LESSON_RESOURCE as LR } from "constants/routesApiKeys";
import { extractApiErrorMessage } from "utils/errorHandler";

export default function LessonResourceFormSection({
  onCancel,
  onSuccess,
  id: resourceId,
}: {
  onCancel?: () => void;
  onSuccess?: () => void;
  id?: string;
}) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const params = useParams();
  const id = resourceId || (params as any).id;

  const adminCourses = useAppSelector(
    (s) => (s as any).course.adminCourses?.data
  );
  const lessonsState = useAppSelector((s) => (s as any).lesson.lessons?.data);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState<string>("");
  const [displayLessonTitle, setDisplayLessonTitle] = useState<string>("");
  const [displayCourseTitle, setDisplayCourseTitle] = useState<string>("");

  // Pagination states
  const [coursePage, setCoursePage] = useState(1);
  const [lessonPage, setLessonPage] = useState(1);
  const [courseLoading, setCourseLoading] = useState(false);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [form, setForm] = useState({
    lessonId: "",
    title: "",
    description: "",
    type: "1",
    fileUrl: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch courses with pagination
  useEffect(() => {
    const fetchCourses = async () => {
      setCourseLoading(true);
      try {
        await dispatch(
          getCoursesForAdmin({
            pageNumber: coursePage,
            pageSize: 12,
            includeDeleted: true,
          }) as any
        );
      } finally {
        setCourseLoading(false);
      }
    };
    fetchCourses();
  }, [dispatch, coursePage]);

  // Fetch lessons when courseId changes
  useEffect(() => {
    if (courseId) {
      setForm((f) => ({ ...f, lessonId: "" })); // Reset lesson selection
      setLessonPage(1); // Reset lesson page
    }
  }, [courseId]);

  // Fetch lessons when courseId or lessonPage changes
  useEffect(() => {
    if (courseId) {
      const fetchLessons = async () => {
        setLessonLoading(true);
        try {
          await dispatch(
            getLessons({
              pageNumber: lessonPage,
              pageSize: 12,
              includeDeleted: true,
              courseId,
            }) as any
          );
        } finally {
          setLessonLoading(false);
        }
      };
      fetchLessons();
    }
  }, [dispatch, courseId, lessonPage]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await axiosClient.get(LR.ADMIN_GET_BY_ID(id as string));
        const data = res?.data?.data;
        setForm({
          lessonId: data.lessonId || "",
          title: data.title || "",
          description: data.description || "",
          type: String(data.type ?? "1"),
          fileUrl: data.fileUrl || "",
        });
        setCourseId(data.courseId || "");
        setDisplayLessonTitle(data.lessonTitle || "");
        setDisplayCourseTitle(data.courseTitle || "");
        if (data.courseId) {
          await dispatch(
            getLessons({
              pageNumber: 1,
              pageSize: 10,
              includeDeleted: true,
              courseId: data.courseId,
            }) as any
          );
        }
      } catch (e: any) {
        setSnackbar({
          open: true,
          message: extractApiErrorMessage(e, "Không thể tải chi tiết"),
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, dispatch]);

  const isValidUrl = (url: string) => {
    try {
      const u = new URL(url);
      return !!u.protocol && !!u.host;
    } catch (_) {
      return false;
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.lessonId) errs.lessonId = "Vui lòng chọn bài học";
    if (!form.title?.trim()) errs.title = "Tiêu đề là bắt buộc";
    if (!form.description?.trim()) errs.description = "Mô tả là bắt buộc";
    if (!form.type) errs.type = "Loại tài nguyên là bắt buộc";
    if (!form.fileUrl?.trim()) errs.fileUrl = "URL là bắt buộc";
    else if (!isValidUrl(form.fileUrl.trim()))
      errs.fileUrl = "URL không hợp lệ";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      if (id) {
        await axiosClient.put(LR.UPDATE(id as string), {
          title: form.title.trim(),
          description: form.description.trim(),
          type: Number(form.type),
          fileUrl: form.fileUrl.trim(),
        });
        setSnackbar({
          open: true,
          message: "Cập nhật tài nguyên thành công",
          severity: "success",
        });
      } else {
        await axiosClient.post(LR.CREATE, {
          lessonId: form.lessonId,
          title: form.title.trim(),
          description: form.description.trim(),
          type: Number(form.type),
          fileUrl: form.fileUrl.trim(),
        });
        setSnackbar({
          open: true,
          message: "Tạo tài nguyên thành công",
          severity: "success",
        });
      }
      if (onSuccess) onSuccess();
      else navigate(-1);
    } catch (e: any) {
      setSnackbar({
        open: true,
        message: extractApiErrorMessage(
          e,
          id ? "Không thể cập nhật" : "Không thể tạo"
        ),
        severity: "error",
      });
    }
  };

  return (
    <Card sx={{ boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          {id ? "Chỉnh sửa tài nguyên học tập" : "Thêm tài nguyên học tập"}
        </Typography>

        <Box sx={{ display: "grid", gap: 2.5, maxWidth: 720 }}>
          {id ? (
            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "grey.50",
              }}
            >
              <Typography variant="overline" color="text.secondary">
                Thông tin liên kết
              </Typography>
              <Box sx={{ display: "grid", gap: 0.5 }}>
                <Typography variant="body2">
                  <strong>Khóa học:</strong>{" "}
                  {displayCourseTitle || "(Không có)"}
                </Typography>
                <Typography variant="body2">
                  <strong>Bài học:</strong> {displayLessonTitle || "(Không có)"}
                </Typography>
              </Box>
            </Box>
          ) : (
            <>
              <PopupSelect
                label="Khóa học"
                value={courseId}
                onChange={(value) => {
                  setCourseId(value);
                  setForm((f) => ({ ...f, lessonId: "" }));
                }}
                items={adminCourses?.items || []}
                loading={courseLoading}
                pageSize={12}
                getItemLabel={(course) => course.title}
                getItemValue={(course) => course.id}
                noDataMessage="Không có khóa học nào"
                currentPage={coursePage}
                onPageChange={setCoursePage}
                totalPages={adminCourses?.totalPages || 1}
                title="Chọn khóa học"
              />

              <PopupSelect
                label="Bài học"
                value={form.lessonId}
                onChange={(value) =>
                  setForm((f) => ({
                    ...f,
                    lessonId: value,
                  }))
                }
                items={lessonsState?.items || []}
                loading={lessonLoading}
                error={!!formErrors.lessonId}
                helperText={formErrors.lessonId}
                disabled={!courseId}
                pageSize={12}
                getItemLabel={(lesson) => lesson.title}
                getItemValue={(lesson) => lesson.id}
                noDataMessage={
                  !courseId
                    ? "Vui lòng chọn khóa học trước"
                    : "Không có bài học nào cho khóa học này"
                }
                currentPage={lessonPage}
                onPageChange={setLessonPage}
                totalPages={lessonsState?.totalPages || 1}
                title="Chọn bài học"
              />
            </>
          )}

          <TextField
            size="small"
            label="Tiêu đề"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            error={!!formErrors.title}
            helperText={formErrors.title}
            fullWidth
            placeholder="Nhập tiêu đề tài nguyên"
          />

          <TextField
            size="small"
            label="Mô tả"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            error={!!formErrors.description}
            helperText={formErrors.description}
            fullWidth
            multiline
            minRows={3}
            placeholder="Mô tả ngắn gọn về tài nguyên"
          />

          <FormControl size="small" fullWidth error={!!formErrors.type}>
            <InputLabel>Loại tài nguyên</InputLabel>
            <Select
              label="Loại tài nguyên"
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as string }))
              }
            >
              <MenuItem value="1">Video</MenuItem>
              <MenuItem value="2">Document</MenuItem>
              <MenuItem value="3">Image</MenuItem>
              <MenuItem value="4">Audio</MenuItem>
              <MenuItem value="5">External Link</MenuItem>
              <MenuItem value="6">Interactive</MenuItem>
              <MenuItem value="7">Slides</MenuItem>
            </Select>
            {formErrors.type && (
              <Typography variant="caption" color="error">
                {formErrors.type}
              </Typography>
            )}
          </FormControl>

          <TextField
            size="small"
            label="File URL"
            value={form.fileUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, fileUrl: e.target.value }))
            }
            error={!!formErrors.fileUrl}
            helperText={formErrors.fileUrl}
            fullWidth
            placeholder="https://..."
          />

          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "flex-end",
              mt: 2,
              pt: 1.5,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "grey.50",
            }}
          >
            <Button onClick={() => (onCancel ? onCancel() : navigate(-1))}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {id ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </Box>
        </Box>
      </CardContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}
