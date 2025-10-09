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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import {
  getLessons,
  deleteLesson,
  restoreLesson,
} from "../../../redux/lesson/lessonSlice";
import { getCoursesForAdmin } from "../../../redux/course/courseSlice";
import { LessonResult } from "../../../common/@types/lesson";
import useLocales from "hooks/useLocales";

interface Props {
  onCreateNew: (courseId: string) => void;
  onEditLesson: (lesson: LessonResult) => void;
  onViewDetails: (lesson: LessonResult) => void;
}

export default function LessonListSection({
  onCreateNew,
  onEditLesson,
  onViewDetails,
}: Props) {
  const dispatch = useAppDispatch();
  const { translate } = useLocales();
  const { data, isLoading, error } = useAppSelector((s) => s.lesson.lessons);
  const { data: coursesData } = useAppSelector((s) => s.course.adminCourses);

  const [searchTerm, setSearchTerm] = useState(""); // Input state
  const [committedSearch, setCommittedSearch] = useState(""); // Actual search term sent to API
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [courseId, setCourseId] = useState("");
  const [sortDirection, setSortDirection] = useState(1); // 0 = asc, 1 = desc
  const [sortBy, setSortBy] = useState(3); // Default: CreatedAt (0..4)
  const [confirmDelete, setConfirmDelete] = useState<LessonResult | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<LessonResult | null>(
    null
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    dispatch(
      getLessons({
        searchTerm: committedSearch || undefined,
        pageNumber: page,
        pageSize,
        courseId: courseId || undefined,
        includeDeleted: true,
        sortBy,
        sortDirection,
      })
    );
    dispatch(getCoursesForAdmin({ pageSize: 100 } as any));
  }, [
    dispatch,
    committedSearch,
    page,
    pageSize,
    courseId,
    sortBy,
    sortDirection,
  ]);

  useEffect(() => {
    const meta = data;
    if (meta?.totalPages) setTotalPages(meta.totalPages);
    else if (meta?.total && meta?.size)
      setTotalPages(Math.max(1, Math.ceil(meta.total / meta.size)));
  }, [data]);

  const items = data?.items || [];
  const courses = coursesData?.items || [];

  const refreshList = () => {
    dispatch(
      getLessons({
        searchTerm: committedSearch || undefined,
        pageNumber: page,
        pageSize,
        courseId: courseId || undefined,
        includeDeleted: true,
        sortBy,
        sortDirection,
      })
    );
  };

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
      await dispatch(deleteLesson(confirmDelete.id)).unwrap();
      setSnackbar({
        open: true,
        message: "Xóa bài học thành công",
        severity: "success",
      });
      refreshList();
    } catch (e: any) {
      setSnackbar({
        open: true,
        message: e?.message || "Không thể xóa bài học",
        severity: "error",
      });
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleRestore = async () => {
    if (!confirmRestore) return;
    try {
      await dispatch(restoreLesson(confirmRestore.id)).unwrap();
      setSnackbar({
        open: true,
        message: "Khôi phục bài học thành công",
        severity: "success",
      });
      refreshList();
    } catch (e: any) {
      setSnackbar({
        open: true,
        message: e?.message || "Không thể khôi phục bài học",
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
              placeholder="Tìm kiếm bài học theo tên hoặc mô tả..."
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter") triggerSearch();
              }}
              sx={{ "& .MuiInputBase-root": { pr: 4 } }}
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
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>{translate("admin.course")}</InputLabel>
              <Select
                value={courseId}
                label={translate("admin.course")}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <MenuItem value="">{translate("admin.allCourses")}</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{translate("admin.sortBy")}</InputLabel>
              <Select
                label={translate("admin.sortBy")}
                value={sortBy}
                onChange={(e) => setSortBy(Number(e.target.value))}
              >
                <MenuItem value={0}>{translate("admin.sortByTitle")}</MenuItem>
                <MenuItem value={1}>{translate("admin.sortByOrder")}</MenuItem>
                <MenuItem value={2}>{translate("admin.sortByDuration")}</MenuItem>
                <MenuItem value={3}>{translate("admin.sortByCreatedAt")}</MenuItem>
                <MenuItem value={4}>{translate("admin.sortByUpdatedAt")}</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{translate("admin.direction")}</InputLabel>
              <Select
                label={translate("admin.direction")}
                value={sortDirection}
                onChange={(e) => setSortDirection(Number(e.target.value))}
              >
                <MenuItem value={0}>{translate("admin.asc")}</MenuItem>
                <MenuItem value={1}>{translate("admin.desc")}</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => onCreateNew(courseId)}
              sx={{ flexShrink: 0, whiteSpace: "nowrap", minWidth: "auto" }}
            >
              Tạo bài học
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
        <Alert severity="info">Chưa có bài học nào</Alert>
      ) : (
        <Grid container spacing={2}>
          {items.map((lesson) => (
            <Grid item xs={12} md={6} lg={4} key={lesson.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  opacity: lesson.isDeleted ? 0.6 : 1,
                  border: lesson.isDeleted
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
                      {lesson.title}
                    </Typography>
                    {lesson.isDeleted && (
                      <Chip
                        size="small"
                        label={translate("admin.deleted")}
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
                    title={lesson.content || "Chưa có nội dung"}
                  >
                    {lesson.content || "Chưa có nội dung"}
                  </Typography>

                  {/* Course and Order Info */}
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <Chip
                        label={translate("admin.lessonNumber", {
                          number: lesson.order,
                        })}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={lesson.courseTitle || "Không xác định"}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Duration */}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <AccessTimeIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {lesson.durationInMinutes} {translate("admin.minutes")}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                {/* Actions */}
                <Box
                  sx={{
                    p: 1.5,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 0.5,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    bgcolor: "grey.50",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => onViewDetails(lesson)}
                    title="Xem chi tiết"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {!lesson.isDeleted && (
                    <IconButton
                      size="small"
                      onClick={() => onEditLesson(lesson)}
                      title="Chỉnh sửa"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {lesson.isDeleted ? (
                    <IconButton
                      size="small"
                      onClick={() => setConfirmRestore(lesson)}
                      color="success"
                      title="Khôi phục"
                    >
                      <RestoreIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => setConfirmDelete(lesson)}
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
      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
          }}
        >
          <FormControl size="small">
            <InputLabel>Page size</InputLabel>
            <Select
              label="Page size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
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
      )}

      {/* Dialogs */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc muốn xóa bài học "{confirmDelete?.title}"?
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
          Bạn có chắc muốn khôi phục bài học "{confirmRestore?.title}"?
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
