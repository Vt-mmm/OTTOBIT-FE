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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getCourses, deleteCourse } from "../../../redux/course/courseSlice";
import { CourseResult } from "../../../common/@types/course";

interface Props {
  onCreateNew: () => void;
  onEditCourse: (course: CourseResult) => void;
  onViewDetails: (course: CourseResult) => void;
}

export default function CourseListSection({
  onCreateNew,
  onEditCourse,
  onViewDetails,
}: Props) {
  const dispatch = useAppDispatch();
  const { data, isLoading, error } = useAppSelector((s) => s.course.courses);

  const [query, setQuery] = useState({
    pageNumber: 1,
    pageSize: 12,
    searchTerm: "",
  });
  const [confirmDelete, setConfirmDelete] = useState<CourseResult | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    dispatch(getCourses(query as any));
  }, [dispatch, query.pageNumber, query.pageSize, query.searchTerm]);

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await dispatch(deleteCourse(confirmDelete.id)).unwrap();
      setSnackbar({
        open: true,
        message: "Xóa khóa học thành công",
        severity: "success",
      });
    } catch (e: any) {
      setSnackbar({
        open: true,
        message: e?.message || "Không thể xóa khóa học",
        severity: "error",
      });
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <TextField
          size="small"
          placeholder="Tìm kiếm khóa học..."
          value={query.searchTerm}
          onChange={(e) =>
            setQuery((q) => ({
              ...q,
              searchTerm: e.target.value,
              pageNumber: 1,
            }))
          }
          sx={{ maxWidth: 360 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateNew}
        >
          Tạo khóa học
        </Button>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : items.length === 0 ? (
        <Alert severity="info">Chưa có khóa học nào</Alert>
      ) : (
        <Grid container spacing={2}>
          {items.map((course) => (
            <Grid item xs={12} md={6} lg={4} key={course.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {course.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {course.description}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => onViewDetails(course)}
                    >
                      Chi tiết
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => onEditCourse(course)}
                    >
                      Sửa
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => setConfirmDelete(course)}
                    >
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
        <DialogContent>
          Bạn có chắc muốn xóa khóa học "{confirmDelete?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Hủy</Button>
          <Button color="error" onClick={handleDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
