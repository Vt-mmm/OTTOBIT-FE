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
import PopupSelect from "../../../components/common/PopupSelect";

interface Props {
  onCreateNew: (courseId: string) => void;
  onEditLesson: (lesson: LessonResult) => void;
  onViewDetails: (lessonId: string) => void;
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
  const [coursePage, setCoursePage] = useState(1);
  const [courseLoading, setCourseLoading] = useState(false);
  const [sortDirection, setSortDirection] = useState(1); // 0 = asc, 1 = desc
  const [sortBy, setSortBy] = useState(3); // Default: CreatedAt (0..4)
  const [status, setStatus] = useState<"all" | "active">("all");
  const [durationFrom, setDurationFrom] = useState<string>("");
  const [durationTo, setDurationTo] = useState<string>("");

  // Committed filter states (only sent to API when search is triggered)
  const [committedCourseId, setCommittedCourseId] = useState("");
  const [committedSortDirection, setCommittedSortDirection] = useState(1);
  const [committedSortBy, setCommittedSortBy] = useState(3);
  const [committedStatus, setCommittedStatus] = useState<"all" | "active">(
    "all"
  );
  const [committedDurationFrom, setCommittedDurationFrom] =
    useState<string>("");
  const [committedDurationTo, setCommittedDurationTo] = useState<string>("");
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

  // Fetch courses with pagination
  useEffect(() => {
    const fetchCourses = async () => {
      setCourseLoading(true);
      try {
        await dispatch(
          getCoursesForAdmin({
            pageNumber: coursePage,
            pageSize: 12,
            includeDeleted: false, // Only active courses for filter
          })
        );
      } finally {
        setCourseLoading(false);
      }
    };
    fetchCourses();
  }, [dispatch, coursePage]);

  useEffect(() => {
    dispatch(
      getLessons({
        searchTerm: committedSearch || undefined,
        pageNumber: page,
        pageSize,
        courseId: committedCourseId || undefined,
        includeDeleted: committedStatus === "all",
        sortBy: committedSortBy,
        sortDirection: committedSortDirection,
        durationFrom:
          committedDurationFrom !== ""
            ? Number(committedDurationFrom)
            : undefined,
        durationTo:
          committedDurationTo !== "" ? Number(committedDurationTo) : undefined,
      })
    );
  }, [
    dispatch,
    committedSearch,
    page,
    pageSize,
    committedCourseId,
    committedSortBy,
    committedSortDirection,
    committedStatus,
    committedDurationFrom,
    committedDurationTo,
  ]);

  useEffect(() => {
    const meta = data;
    if (meta?.totalPages) {
      setTotalPages(meta.totalPages);
    } else if (meta?.total && meta?.size) {
      const calculatedPages = Math.ceil(meta.total / meta.size);
      setTotalPages(calculatedPages > 0 ? calculatedPages : 1);
    }
  }, [data]);

  const items = data?.items || [];
  const courses = coursesData?.items || [];

  const handleCourseChange = (newCourseId: string) => {
    setCourseId(newCourseId);
    setPage(1); // Reset to first page when course changes
    setCoursePage(1); // Reset course page when course changes
  };

  const refreshList = () => {
    dispatch(
      getLessons({
        searchTerm: committedSearch || undefined,
        pageNumber: page,
        pageSize,
        courseId: committedCourseId || undefined,
        includeDeleted: committedStatus === "all",
        sortBy: committedSortBy,
        sortDirection: committedSortDirection,
        durationFrom:
          committedDurationFrom !== ""
            ? Number(committedDurationFrom)
            : undefined,
        durationTo:
          committedDurationTo !== "" ? Number(committedDurationTo) : undefined,
      })
    );
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const triggerSearch = () => {
    setCommittedSearch(searchTerm.trim());
    setCommittedCourseId(courseId);
    setCommittedSortBy(sortBy);
    setCommittedSortDirection(sortDirection);
    setCommittedStatus(status);
    setCommittedDurationFrom(durationFrom);
    setCommittedDurationTo(durationTo);
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
              display: "grid",
              gap: 2,
              alignItems: "center",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
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
              sx={{
                gridColumn: { xs: "1 / -1", md: "auto" },
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
            <PopupSelect
              label={translate("admin.course")}
              value={courseId}
              onChange={handleCourseChange}
              items={courses}
              loading={courseLoading}
              currentPage={coursePage}
              onPageChange={setCoursePage}
              totalPages={coursesData?.totalPages || 1}
              getItemLabel={(course) => course.title}
              getItemValue={(course) => course.id}
              noDataMessage="Không có khóa học nào"
              pageSize={12}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{translate("admin.status")}</InputLabel>
              <Select
                label={translate("admin.status")}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as any);
                  setPage(1);
                }}
              >
                <MenuItem value="all">{translate("admin.all")}</MenuItem>
                <MenuItem value="active">{translate("admin.active")}</MenuItem>
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
                <MenuItem value={2}>
                  {translate("admin.sortByDuration")}
                </MenuItem>
                <MenuItem value={3}>
                  {translate("admin.sortByCreatedAt")}
                </MenuItem>
                <MenuItem value={4}>
                  {translate("admin.sortByUpdatedAt")}
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Thứ tự</InputLabel>
              <Select
                label="Thứ tự"
                value={sortDirection}
                onChange={(e) => setSortDirection(Number(e.target.value))}
              >
                <MenuItem value={0}>{translate("admin.oldestFirst")}</MenuItem>
                <MenuItem value={1}>{translate("admin.newestFirst")}</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                size="small"
                label="Từ (phút)"
                type="number"
                value={durationFrom}
                onChange={(e) => setDurationFrom(e.target.value)}
                sx={{ width: 130 }}
                inputProps={{ min: 0 }}
              />
              <TextField
                size="small"
                label="Đến (phút)"
                type="number"
                value={durationTo}
                onChange={(e) => setDurationTo(e.target.value)}
                sx={{ width: 130 }}
                inputProps={{ min: 0 }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => onCreateNew(courseId)}
              sx={{
                flexShrink: 0,
                whiteSpace: "nowrap",
                minWidth: "auto",
                justifySelf: { xs: "stretch", sm: "start" },
              }}
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
                    onClick={() => onViewDetails(lesson.id)}
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
      {totalPages > 1 && items.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
          }}
        >
          <FormControl size="small">
            <InputLabel>Số mục mỗi trang</InputLabel>
            <Select
              label="Số mục mỗi trang"
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
