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
  TextField,
  Typography,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import {
  getCoursesForAdmin,
  deleteCourse,
  restoreCourse,
} from "../../../redux/course/courseSlice";
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
  const { data, isLoading, error } = useAppSelector(
    (s) => s.course.adminCourses
  );

  const [searchTerm, setSearchTerm] = useState(""); // Input state
  const [committedSearch, setCommittedSearch] = useState(""); // Actual search term sent to API
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [sortDirection, setSortDirection] = useState(1); // 0 = oldest first, 1 = newest first
  const [confirmDelete, setConfirmDelete] = useState<CourseResult | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<CourseResult | null>(
    null
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    dispatch(
      getCoursesForAdmin({
        searchTerm: committedSearch || undefined,
        pageNumber: page,
        pageSize,
        includeDeleted: true,
        sortBy: 1, // Mặc định sortBy = 1
        sortDirection, // 0 = oldest first, 1 = newest first (default)
      })
    );
  }, [dispatch, committedSearch, page, pageSize, sortDirection]);

  useEffect(() => {
    const meta = data;
    if (meta?.totalPages) setTotalPages(meta.totalPages);
    else if (meta?.total && meta?.size)
      setTotalPages(Math.max(1, Math.ceil(meta.total / meta.size)));
  }, [data]);

  const items = data?.items || [];

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const triggerSearch = () => {
    setCommittedSearch(searchTerm.trim());
    setPage(1);
  };

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

  const handleRestore = async () => {
    if (!confirmRestore) return;
    try {
      await dispatch(restoreCourse(confirmRestore.id)).unwrap();
      setSnackbar({
        open: true,
        message: "Khôi phục khóa học thành công",
        severity: "success",
      });
    } catch (e: any) {
      setSnackbar({
        open: true,
        message: e?.message || "Không thể khôi phục khóa học",
        severity: "error",
      });
    } finally {
      setConfirmRestore(null);
    }
  };

  return (
    <Box>
      {/* Search and Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: { xs: "wrap", sm: "nowrap" },
            }}
          >
            <TextField
              fullWidth
              placeholder="Tìm kiếm khóa học theo tên hoặc mô tả..."
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter") triggerSearch();
              }}
              sx={{
                "& .MuiInputBase-root": { pr: 4 },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={triggerSearch}
                      sx={{ mr: 0 }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                label="Sắp xếp"
                value={sortDirection}
                onChange={(e) => setSortDirection(Number(e.target.value))}
              >
                <MenuItem value={0}>Cũ nhất trước</MenuItem>
                <MenuItem value={1}>Mới nhất trước</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateNew}
              sx={{
                flexShrink: 0,
                whiteSpace: "nowrap",
                minWidth: "auto",
              }}
            >
              Tạo khóa học
            </Button>
          </Box>
        </CardContent>
      </Card>

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
                  opacity: course.isDeleted ? 0.6 : 1,
                  border: course.isDeleted
                    ? "2px dashed #f44336"
                    : "1px solid #e0e0e0",
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="h2"
                      noWrap
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                        maxWidth: "100%",
                      }}
                    >
                      {course.title}
                    </Typography>
                    {course.isDeleted && (
                      <Chip
                        size="small"
                        label="Deleted"
                        color="error"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      height: 40,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      wordBreak: "break-word",
                    }}
                    title={course.description || "No description"}
                  >
                    {course.description || "No description"}
                  </Typography>

                  {/* Created Info */}
                  <Box sx={{ mb: 2 }}>
                    {/* Created Date */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <AccessTimeIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Tạo:{" "}
                        {new Date(course.createdAt).toLocaleDateString(
                          "vi-VN",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Typography>
                    </Box>

                    {/* Created By */}
                    {course.createdByName && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <PersonIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Bởi: {course.createdByName}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>

                {/* Actions */}
                <Box
                  sx={{
                    p: 1,
                    pt: 0,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => onViewDetails(course)}
                    title="Xem chi tiết"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {!course.isDeleted && (
                    <IconButton
                      size="small"
                      onClick={() => onEditCourse(course)}
                      title="Chỉnh sửa"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {course.isDeleted ? (
                    <IconButton
                      size="small"
                      onClick={() => setConfirmRestore(course)}
                      color="success"
                      title="Khôi phục"
                    >
                      <RestoreIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => setConfirmDelete(course)}
                      color="error"
                      title="Xóa"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <FormControl size="small">
          <InputLabel>Page size</InputLabel>
          <Select
            label="Page size"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            sx={{ minWidth: 120 }}
          >
            {[6, 12, 24, 48].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, v) => setPage(v)}
          shape="rounded"
          color="primary"
        />
      </Box>

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

      <Dialog open={!!confirmRestore} onClose={() => setConfirmRestore(null)}>
        <DialogTitle>Xác nhận khôi phục</DialogTitle>
        <DialogContent>
          Bạn có chắc muốn khôi phục khóa học "{confirmRestore?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRestore(null)}>Hủy</Button>
          <Button color="success" onClick={handleRestore}>
            Khôi phục
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
