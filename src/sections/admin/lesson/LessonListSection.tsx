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
  Snackbar,
  Alert,
  Stack,
  TextField,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getLessons, deleteLesson } from "../../../redux/lesson/lessonSlice";
import { getCourses } from "../../../redux/course/courseSlice";
import { LessonResult } from "../../../common/@types/lesson";

interface Props {
  onCreateNew: (courseId: string) => void;
  onEditLesson: (lesson: LessonResult) => void;
  onViewDetails: (lesson: LessonResult) => void;
}

export default function LessonListSection({ onCreateNew, onEditLesson, onViewDetails }: Props) {
  const dispatch = useAppDispatch();
  const { data, isLoading, error } = useAppSelector((s) => s.lesson.lessons);
  const { data: coursesData } = useAppSelector((s) => s.course.courses);

  const [query, setQuery] = useState({ pageNumber: 1, pageSize: 12, searchTerm: "", courseId: "" });
  const [confirmDelete, setConfirmDelete] = useState<LessonResult | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ 
    open: false, 
    message: "", 
    severity: "success" 
  });

  useEffect(() => {
    dispatch(getLessons(query as any));
    dispatch(getCourses({ pageSize: 100 } as any));
  }, [dispatch, query.pageNumber, query.pageSize, query.searchTerm, query.courseId]);

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const courses = coursesData?.items || [];

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await dispatch(deleteLesson(confirmDelete.id)).unwrap();
      setSnackbar({ open: true, message: "Xóa bài học thành công", severity: "success" });
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.message || "Không thể xóa bài học", severity: "error" });
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flex: 1 }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm bài học..."
            value={query.searchTerm}
            onChange={(e) => setQuery((q) => ({ ...q, searchTerm: e.target.value, pageNumber: 1 }))}
            sx={{ maxWidth: 300 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Khóa học</InputLabel>
            <Select
              value={query.courseId}
              label="Khóa học"
              onChange={(e) => setQuery((q) => ({ ...q, courseId: e.target.value, pageNumber: 1 }))}
            >
              <MenuItem value="">Tất cả khóa học</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => onCreateNew(query.courseId)}
        >
          Tạo bài học
        </Button>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : items.length === 0 ? (
        <Alert severity="info">Chưa có bài học nào</Alert>
      ) : (
        <Grid container spacing={2}>
          {items.map((lesson) => (
            <Grid item xs={12} md={6} lg={4} key={lesson.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Chip
                      label={`Bài ${lesson.order}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={lesson.courseTitle || "Không xác định"}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {lesson.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {lesson.content && lesson.content.length > 100 
                      ? `${lesson.content.substring(0, 100)}...` 
                      : lesson.content || "Chưa có nội dung"}
                  </Typography>
                  
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {lesson.durationInMinutes} phút
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => onViewDetails(lesson)}>
                      Chi tiết
                    </Button>
                    <Button size="small" variant="contained" startIcon={<EditIcon />} onClick={() => onEditLesson(lesson)}>
                      Sửa
                    </Button>
                    <IconButton color="error" onClick={() => setConfirmDelete(lesson)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={query.pageNumber}
            onChange={(_, p) => setQuery((q) => ({ ...q, pageNumber: p }))}
            color="primary"
          />
        </Box>
      )}

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>Bạn có chắc muốn xóa bài học "{confirmDelete?.title}"?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Hủy</Button>
          <Button color="error" onClick={handleDelete}>Xóa</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}