import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MapIcon from "@mui/icons-material/Map";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getLessons } from "../../../redux/lesson/lessonSlice";
import { CourseResult } from "../../../common/@types/course";
import CourseRobotManagementSection from "./CourseRobotManagementSection";
import { axiosClient } from "axiosClient";
import { ROUTES_API_COURSE_MAP, ROUTES_API_MAP } from "constants/routesApiKeys";
import { extractApiErrorMessage } from "../../../utils/errorHandler";
import { useNotification } from "../../../hooks/useNotification";

interface Props {
  course: CourseResult | null;
  onBack: () => void;
}

export default function CourseDetailsSection({ course, onBack }: Props) {
  const dispatch = useAppDispatch();
  const { data: lessonsData, isLoading: lessonsLoading } = useAppSelector(
    (s) => s.lesson.lessons
  );

  // Sử dụng dữ liệu từ API lessons
  const lessons = lessonsData?.items || [];
  const lessonsPagination = lessonsData
    ? {
        page: lessonsData.page || 1,
        totalPages: lessonsData.totalPages || 1,
        totalItems: lessonsData.total || 0,
      }
    : {
        page: 1,
        totalPages: 1,
        totalItems: 0,
      };

  const activeLessons = lessons.filter((lesson) => !lesson.isDeleted);
  const lessonsCount = activeLessons.length;
  const enrollmentsCount = course?.enrollmentsCount || 0;
  const totalDuration = activeLessons.reduce(
    (sum, lesson) => sum + lesson.durationInMinutes,
    0
  );
  const price = (course as any)?.price ?? 0;
  const type = (course as any)?.type as number | undefined;
  const typeLabel = type === 2 ? "Trả phí" : "Miễn phí";

  // Get challenges count for each lesson (using challengesCount field from lesson)
  const getChallengesCountForLesson = (lesson: any) => {
    return lesson.challengesCount || 0;
  };

  // State for lessons pagination
  const [lessonsPage, setLessonsPage] = useState(1);
  const [lessonsPageSize] = useState(12);

  const fetchLessons = (page: number) => {
    if (course?.id) {
      dispatch(
        getLessons({
          courseId: course.id,
          includeDeleted: true,
          pageNumber: page,
          pageSize: lessonsPageSize,
        })
      );
    }
  };

  useEffect(() => {
    fetchLessons(1);
    setLessonsPage(1);
  }, [dispatch, course?.id]);

  // Update lessonsPage when pagination changes
  useEffect(() => {
    if (lessonsPagination.page !== lessonsPage) {
      setLessonsPage(lessonsPagination.page);
    }
  }, [lessonsPagination.page, lessonsPage]);

  // Fetch course detail by id (admin)
  const [detail, setDetail] = useState<CourseResult | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!course?.id) return;
      setDetailLoading(true);
      setDetailError(null);
      try {
        const res = await axiosClient.get(`/api/v1/courses/admin/${course.id}`);
        const data = (res as any)?.data?.data as CourseResult | undefined;
        if (data) setDetail(data);
      } catch (_e) {
        setDetailError("Không tải được chi tiết khóa học");
      } finally {
        setDetailLoading(false);
      }
    };
    fetchDetail();
  }, [course?.id]);

  // Fetch course maps for this course
  const [courseMaps, setCourseMaps] = useState<any[]>([]);
  const [courseMapsLoading, setCourseMapsLoading] = useState(false);
  const [courseMapsPagination, setCourseMapsPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 1,
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [availableMaps, setAvailableMaps] = useState<any[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string>("");
  const [availableMapsPagination, setAvailableMapsPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [availableMapsLoading, setAvailableMapsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
    mapTitle: string;
    isDeleted: boolean;
  }>({ open: false, id: null, mapTitle: "", isDeleted: false });

  // Use common notification hook
  const { showNotification, NotificationComponent } = useNotification({
    anchorOrigin: { vertical: "top", horizontal: "right" },
    autoHideDurationMs: 6000,
  });
  const fetchCourseMaps = async (page = 1) => {
    if (!course?.id) return;
    setCourseMapsLoading(true);
    try {
      const res = await axiosClient.get(ROUTES_API_COURSE_MAP.GET_ALL, {
        params: {
          courseId: course.id,
          PageNumber: page,
          PageSize: courseMapsPagination.pageSize,
          IncludeDeleted: true,
        },
      });
      const data = (res as any)?.data?.data;
      const items = Array.isArray(data?.items) ? data.items : [];
      setCourseMaps(items);
      setCourseMapsPagination((prev) => ({
        ...prev,
        page: page,
        total: data?.total || 0,
        totalPages: data?.totalPages || 1,
      }));
    } catch (_e) {
      setCourseMaps([]);
    } finally {
      setCourseMapsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseMaps(1);
  }, [course?.id]);

  // Load available maps for add dialog
  const fetchAvailableMaps = async (page = 1) => {
    setAvailableMapsLoading(true);
    try {
      const res = await axiosClient.get(ROUTES_API_MAP.GET_ALL, {
        params: {
          PageNumber: page,
          PageSize: availableMapsPagination.pageSize,
          IncludeDeleted: false,
        },
      });
      const data = (res as any)?.data?.data;
      const items = Array.isArray(data?.items) ? data.items : [];
      setAvailableMaps(items);
      setAvailableMapsPagination((prev) => ({
        ...prev,
        page: page,
        total: data?.total || 0,
        totalPages: data?.totalPages || 1,
      }));
    } catch (_) {
      setAvailableMaps([]);
    } finally {
      setAvailableMapsLoading(false);
    }
  };

  useEffect(() => {
    if (addDialogOpen) {
      fetchAvailableMaps(1);
    }
  }, [addDialogOpen]);

  const renderCourse = detail ?? course;

  if (detailLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (detailError) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography>{detailError}</Typography>
        <Button onClick={onBack} sx={{ mt: 2 }}>
          Quay lại
        </Button>
      </Box>
    );
  }

  if (!renderCourse) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography>Không tìm thấy thông tin khóa học</Typography>
        <Button onClick={onBack} sx={{ mt: 2 }}>
          Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 3 }}>
        Quay lại
      </Button>

      <Grid container spacing={3}>
        {/* Course Info */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{ mb: 3 }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    {renderCourse.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                    {renderCourse.description}
                  </Typography>

                  <Stack direction="row" spacing={3} flexWrap="wrap">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MenuBookIcon color="primary" fontSize="small" />
                      <Typography variant="body2">
                        {lessonsCount} bài học
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccessTimeIcon color="primary" fontSize="small" />
                      <Typography variant="body2">
                        {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <GroupIcon color="primary" fontSize="small" />
                      <Typography variant="body2">
                        {enrollmentsCount} học viên
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        label={`Loại: ${typeLabel}`}
                        size="small"
                        color={type === 2 ? "warning" : "success"}
                      />
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        label={`Giá: ${price.toLocaleString()} VND`}
                        size="small"
                      />
                    </Stack>
                  </Stack>
                </Box>
              </Stack>

              {renderCourse.imageUrl && (
                <Box sx={{ mb: 3 }}>
                  <img
                    src={renderCourse.imageUrl}
                    alt={renderCourse.title}
                    style={{
                      width: "100%",
                      maxHeight: "300px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Course Stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Thông tin khóa học
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Người tạo
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {renderCourse.createdByName?.charAt(0) || "?"}
                    </Avatar>
                    <Typography variant="subtitle2">
                      {renderCourse.createdByName || "Không xác định"}
                    </Typography>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Ngày tạo
                  </Typography>
                  <Typography variant="subtitle2">
                    {new Date(renderCourse.createdAt).toLocaleDateString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Cập nhật lần cuối
                  </Typography>
                  <Typography variant="subtitle2">
                    {new Date(renderCourse.updatedAt).toLocaleDateString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Trạng thái
                  </Typography>
                  <Chip
                    label="Đang hoạt động"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Course Robots Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <CourseRobotManagementSection
                courseId={renderCourse.id}
                courseName={renderCourse.title}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Course Maps Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 3 }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Course maps được sử dụng
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  size="small"
                  onClick={() => setAddDialogOpen(true)}
                >
                  Thêm course map
                </Button>
              </Stack>

              {courseMapsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : courseMaps.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <MapIcon
                    sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    Chưa gắn map nào cho khóa học này
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Thêm course map để sắp xếp thứ tự bản đồ sử dụng trong khóa
                    học
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Thứ tự</TableCell>
                        <TableCell>Tên map</TableCell>
                        <TableCell>Mô tả</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Ngày tạo</TableCell>
                        <TableCell align="right">Hành động</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...courseMaps]
                        .sort(
                          (a: any, b: any) => (a.order || 0) - (b.order || 0)
                        )
                        .map((m: any) => (
                          <TableRow key={m.id} hover>
                            <TableCell>
                              <Chip
                                label={m.order ?? "-"}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600 }}
                              >
                                {m.mapTitle || m.mapId}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {m.mapDescription || "-"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={m.isDeleted ? "Đã xóa" : "Hoạt động"}
                                size="small"
                                color={m.isDeleted ? "error" : "success"}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {m.createdAt
                                ? new Date(m.createdAt).toLocaleString("vi-VN")
                                : "-"}
                            </TableCell>
                            <TableCell align="right">
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="flex-end"
                              >
                                {m.isDeleted ? (
                                  <Button
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    onClick={() =>
                                      setDeleteDialog({
                                        open: true,
                                        id: m.id,
                                        mapTitle: m.mapTitle || m.mapId,
                                        isDeleted: true,
                                      })
                                    }
                                  >
                                    Khôi phục
                                  </Button>
                                ) : (
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      setDeleteDialog({
                                        open: true,
                                        id: m.id,
                                        mapTitle: m.mapTitle || m.mapId,
                                        isDeleted: false,
                                      })
                                    }
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Pagination */}
              {courseMapsPagination.totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Pagination
                    count={courseMapsPagination.totalPages}
                    page={courseMapsPagination.page}
                    onChange={(_, page) => fetchCourseMaps(page)}
                    color="primary"
                    size="small"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Add Course Map Dialog */}
        <Dialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Chọn map để thêm vào khóa học</DialogTitle>
          <DialogContent sx={{ pt: 2, pb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Chọn một map từ danh sách bên dưới để thêm vào khóa học
            </Typography>

            <Box
              sx={{
                maxHeight: 400,
                overflowY: "auto",
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 1,
              }}
            >
              {availableMapsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : availableMaps.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Không có map nào khả dụng
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {availableMaps.map((m: any) => (
                    <Box
                      key={m.id}
                      onClick={() => setSelectedMapId(m.id)}
                      sx={{
                        p: 2,
                        border:
                          selectedMapId === m.id
                            ? "2px solid #1976d2"
                            : "2px solid transparent",
                        borderRadius: 1,
                        bgcolor: selectedMapId === m.id ? "#f3f8ff" : "white",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          bgcolor:
                            selectedMapId === m.id ? "#f3f8ff" : "#f5f5f5",
                          borderColor:
                            selectedMapId === m.id ? "#1976d2" : "#e0e0e0",
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1,
                            bgcolor: "#e3f2fd",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Typography variant="h6" color="primary.main">
                            M
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            noWrap
                          >
                            {m.title || m.name || "Bản đồ không có tên"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {m.description || "Không có mô tả"}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            ID: {m.id}
                          </Typography>
                        </Box>
                        {selectedMapId === m.id && (
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              bgcolor: "#1976d2",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="white"
                              sx={{ fontSize: "14px" }}
                            >
                              ✓
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Pagination for available maps */}
            {availableMapsPagination.totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={availableMapsPagination.totalPages}
                  page={availableMapsPagination.page}
                  onChange={(_, page) => fetchAvailableMaps(page)}
                  color="primary"
                  size="small"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => {
                setAddDialogOpen(false);
                setSelectedMapId("");
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              disabled={!selectedMapId || submitting}
              onClick={async () => {
                if (!course?.id || !selectedMapId) return;
                setSubmitting(true);
                try {
                  await axiosClient.post(ROUTES_API_COURSE_MAP.CREATE, {
                    courseId: course.id,
                    mapId: selectedMapId,
                  });
                  setAddDialogOpen(false);
                  setSelectedMapId("");
                  // refresh list
                  await fetchCourseMaps(courseMapsPagination.page);
                  showNotification("Thêm course map thành công!", "success");
                } catch (error) {
                  const errorMessage = extractApiErrorMessage(
                    error,
                    "Có lỗi xảy ra khi thêm course map"
                  );
                  showNotification(errorMessage, "error");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "Đang thêm..." : "Thêm"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete/Restore Course Map Confirmation */}
        <Dialog
          open={deleteDialog.open}
          onClose={() =>
            setDeleteDialog({
              open: false,
              id: null,
              mapTitle: "",
              isDeleted: false,
            })
          }
        >
          <DialogTitle>
            {deleteDialog.isDeleted ? "Xác nhận khôi phục" : "Xác nhận xóa"}
          </DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc muốn {deleteDialog.isDeleted ? "khôi phục" : "xóa"}{" "}
              course map "{deleteDialog.mapTitle}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setDeleteDialog({
                  open: false,
                  id: null,
                  mapTitle: "",
                  isDeleted: false,
                })
              }
            >
              Hủy
            </Button>
            <Button
              color={deleteDialog.isDeleted ? "success" : "error"}
              variant="contained"
              onClick={async () => {
                if (!deleteDialog.id) return;
                try {
                  if (deleteDialog.isDeleted) {
                    // Restore
                    await axiosClient.post(
                      ROUTES_API_COURSE_MAP.RESTORE(deleteDialog.id)
                    );
                  } else {
                    // Delete
                    await axiosClient.delete(
                      ROUTES_API_COURSE_MAP.DELETE(deleteDialog.id)
                    );
                  }
                  // Refresh list
                  await fetchCourseMaps(courseMapsPagination.page);
                } catch (error) {
                  const errorMessage = extractApiErrorMessage(
                    error,
                    deleteDialog.isDeleted
                      ? "Có lỗi xảy ra khi khôi phục course map"
                      : "Có lỗi xảy ra khi xóa course map"
                  );
                  showNotification(errorMessage, "error");
                } finally {
                  setDeleteDialog({
                    open: false,
                    id: null,
                    mapTitle: "",
                    isDeleted: false,
                  });
                }
              }}
            >
              {deleteDialog.isDeleted ? "Khôi phục" : "Xóa"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Lessons List */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Danh sách bài học
              </Typography>

              {lessonsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : lessons.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <MenuBookIcon
                    sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    Chưa có bài học nào
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Thêm bài học đầu tiên cho khóa học này
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Thứ tự</TableCell>
                        <TableCell>Tên bài học</TableCell>
                        <TableCell>Thời lượng</TableCell>
                        <TableCell>Thử thách</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Ngày tạo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...lessons]
                        .sort((a, b) => a.order - b.order)
                        .map((lesson) => (
                          <TableRow
                            key={lesson.id}
                            hover
                            sx={{
                              opacity: lesson.isDeleted ? 0.6 : 1,
                              backgroundColor: lesson.isDeleted
                                ? "#ffebee"
                                : "inherit",
                            }}
                          >
                            <TableCell>
                              <Chip
                                label={lesson.order}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600 }}
                              >
                                {lesson.title}
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
                            </TableCell>
                            <TableCell>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <AccessTimeIcon
                                  fontSize="small"
                                  color="action"
                                />
                                <Typography variant="body2">
                                  {lesson.durationInMinutes} phút
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${getChallengesCountForLesson(
                                  lesson
                                )} thử thách`}
                                size="small"
                                color="info"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {lesson.isDeleted ? (
                                <Chip
                                  label="Đã xóa"
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                />
                              ) : (
                                <Chip
                                  label="Hoạt động"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(lesson.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Lessons Pagination */}
              {lessonsPagination.totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Pagination
                    count={lessonsPagination.totalPages}
                    page={lessonsPagination.page}
                    onChange={(_, page) => {
                      setLessonsPage(page);
                      fetchLessons(page);
                    }}
                    color="primary"
                    size="small"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Common Notification Component */}
      <NotificationComponent />
    </Box>
  );
}
