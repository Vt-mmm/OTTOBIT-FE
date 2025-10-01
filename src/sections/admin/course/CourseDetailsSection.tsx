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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getLessons } from "../../../redux/lesson/lessonSlice";
import { CourseResult } from "../../../common/@types/course";
import CourseRobotManagementSection from "./CourseRobotManagementSection";
import { axiosClient } from "axiosClient";
import { ROUTES_API_COURSE_MAP, ROUTES_API_MAP } from "constants/routesApiKeys";

interface Props {
  course: CourseResult | null;
  onBack: () => void;
  onEdit: (course: CourseResult) => void;
}

export default function CourseDetailsSection({
  course,
  onBack,
  onEdit,
}: Props) {
  const dispatch = useAppDispatch();
  const { data: lessonsData, isLoading: lessonsLoading } = useAppSelector(
    (s) => s.lesson.lessons
  );

  // Sử dụng dữ liệu từ API lessons
  const lessons = lessonsData?.items || [];
  const activeLessons = lessons.filter((lesson) => !lesson.isDeleted);
  const lessonsCount = activeLessons.length;
  const enrollmentsCount = course?.enrollmentsCount || 0;
  const totalDuration = activeLessons.reduce(
    (sum, lesson) => sum + lesson.durationInMinutes,
    0
  );

  // Get challenges count for each lesson (using challengesCount field from lesson)
  const getChallengesCountForLesson = (lesson: any) => {
    return lesson.challengesCount || 0;
  };

  useEffect(() => {
    if (course?.id) {
      dispatch(
        getLessons({
          courseId: course.id,
          includeDeleted: true,
          pageNumber: 1,
          pageSize: 100, // Lấy tất cả lessons của course
        })
      );
    }
  }, [dispatch, course?.id]);

  // Fetch course maps for this course
  const [courseMaps, setCourseMaps] = useState<any[]>([]);
  const [courseMapsLoading, setCourseMapsLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [availableMaps, setAvailableMaps] = useState<any[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string>("");
  const [mapOrder, setMapOrder] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
    mapTitle: string;
  }>({ open: false, id: null, mapTitle: "" });
  useEffect(() => {
    const fetchCourseMaps = async () => {
      if (!course?.id) return;
      setCourseMapsLoading(true);
      try {
        const res = await axiosClient.get(ROUTES_API_COURSE_MAP.GET_ALL, {
          params: { courseId: course.id },
        });
        const data = (res as any)?.data?.data;
        // Support both paged and flat arrays just in case
        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : data
          ? [data]
          : [];
        setCourseMaps(items);
      } catch (_e) {
        setCourseMaps([]);
      } finally {
        setCourseMapsLoading(false);
      }
    };
    fetchCourseMaps();
  }, [course?.id]);

  // Load available maps for add dialog
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const res = await axiosClient.get(ROUTES_API_MAP.GET_ALL, {
          params: { PageNumber: 1, PageSize: 100 },
        });
        const data = (res as any)?.data?.data;
        const items = Array.isArray(data?.items) ? data.items : [];
        setAvailableMaps(items);
      } catch (_) {
        setAvailableMaps([]);
      }
    };
    if (addDialogOpen) fetchMaps();
  }, [addDialogOpen]);

  if (!course) {
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
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Quay lại
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Chi tiết khóa học
        </Typography>
      </Stack>

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
                    {course.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                    {course.description}
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
                  </Stack>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => onEdit(course)}
                  sx={{ ml: 2 }}
                >
                  Chỉnh sửa
                </Button>
              </Stack>

              {course.imageUrl && (
                <Box sx={{ mb: 3 }}>
                  <img
                    src={course.imageUrl}
                    alt={course.title}
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
                      {course.createdByName?.charAt(0) || "?"}
                    </Avatar>
                    <Typography variant="subtitle2">
                      {course.createdByName || "Không xác định"}
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
                    {new Date(course.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
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
                    {new Date(course.updatedAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
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
                courseId={course.id}
                courseName={course.title}
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
                        <TableCell>Ngày tạo</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
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
                              {m.createdAt
                                ? new Date(m.createdAt).toLocaleString("vi-VN")
                                : "-"}
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                startIcon={<DeleteIcon />}
                                onClick={() =>
                                  setDeleteDialog({
                                    open: true,
                                    id: m.id,
                                    mapTitle: m.mapTitle || m.mapId,
                                  })
                                }
                              >
                                Xóa
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Add Course Map Dialog */}
        <Dialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Thêm course map</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Chọn map</InputLabel>
                <Select
                  label="Chọn map"
                  value={selectedMapId}
                  onChange={(e) => setSelectedMapId(e.target.value as string)}
                >
                  {availableMaps.map((m: any) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.title || m.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                type="number"
                label="Thứ tự (order)"
                value={mapOrder}
                onChange={(e) => setMapOrder(Number(e.target.value))}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)}>Hủy</Button>
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
                    order: Number(mapOrder) || 0,
                  });
                  setAddDialogOpen(false);
                  setSelectedMapId("");
                  setMapOrder(0);
                  // refresh list
                  const res = await axiosClient.get(
                    ROUTES_API_COURSE_MAP.GET_ALL,
                    {
                      params: { courseId: course.id },
                    }
                  );
                  const data = (res as any)?.data?.data;
                  const items = Array.isArray(data?.items)
                    ? data.items
                    : Array.isArray(data)
                    ? data
                    : data
                    ? [data]
                    : [];
                  setCourseMaps(items);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              Thêm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Course Map Confirmation */}
        <Dialog
          open={deleteDialog.open}
          onClose={() =>
            setDeleteDialog({ open: false, id: null, mapTitle: "" })
          }
        >
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc muốn xóa course map "{deleteDialog.mapTitle}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setDeleteDialog({ open: false, id: null, mapTitle: "" })
              }
            >
              Hủy
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={async () => {
                if (!deleteDialog.id) return;
                try {
                  await axiosClient.delete(
                    ROUTES_API_COURSE_MAP.DELETE(deleteDialog.id)
                  );
                  setCourseMaps((prev) =>
                    prev.filter((x: any) => x.id !== deleteDialog.id)
                  );
                } finally {
                  setDeleteDialog({ open: false, id: null, mapTitle: "" });
                }
              }}
            >
              Xóa
            </Button>
          </DialogActions>
        </Dialog>

        {/* Lessons List */}
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
                  Danh sách bài học
                </Typography>
                <Chip
                  label={`${lessonsCount} bài học`}
                  color="primary"
                  variant="outlined"
                />
              </Stack>

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
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    maxHeight: 400,
                    overflowY: "auto",
                  }}
                >
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
