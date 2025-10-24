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
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
  Chip,
  Tooltip,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import LinkIcon from "@mui/icons-material/Link";
import ExtensionIcon from "@mui/icons-material/Extension";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import EditIcon from "@mui/icons-material/Edit";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { ROUTES_API_LESSON_RESOURCE } from "constants/routesApiKeys";
import { axiosClient } from "axiosClient";
import { extractApiErrorMessage } from "utils/errorHandler";
import { getCoursesForAdmin } from "../../../redux/course/courseSlice";
import { getLessons } from "../../../redux/lesson/lessonSlice";
import PopupSelect from "components/common/PopupSelect";
import { ROUTES_API_LESSON_RESOURCE as LR } from "constants/routesApiKeys";
import { useNavigate } from "react-router-dom";

export default function LessonResourceListSection({
  onCreateNew,
  onEditItem,
  onNotify,
  selectedId,
  onViewDetail,
}: {
  onCreateNew?: () => void;
  onEditItem?: (id: string) => void;
  onNotify?: (message: string) => void;
  selectedId?: string | null;
  onViewDetail?: (id: string) => void;
}) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const adminCourses = useAppSelector(
    (s) => (s as any).course.adminCourses?.data
  );
  const lessonsState = useAppSelector((s) => (s as any).lesson.lessons?.data);
  const formLessonsState = useAppSelector(
    (s) => (s as any).lesson.lessons?.data
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string>("");
  const [lessonId, setLessonId] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [status, setStatus] = useState<"all" | "active">("all");

  // Committed filter states (only sent to API when search is triggered)
  const [committedCourseId, setCommittedCourseId] = useState<string>("");
  const [committedLessonId, setCommittedLessonId] = useState<string>("");
  const [committedTypeFilter, setCommittedTypeFilter] = useState<string>("");
  const [committedStatus, setCommittedStatus] = useState<"all" | "active">(
    "all"
  );

  // Pagination states for course and lesson selection
  const [coursePage, setCoursePage] = useState(1);
  const [lessonPage, setLessonPage] = useState(1);
  const [courseLoading, setCourseLoading] = useState(false);
  const [lessonLoading, setLessonLoading] = useState(false);

  // Separate states for form course and lesson selection
  const [formCoursePage, setFormCoursePage] = useState(1);
  const [formLessonPage, setFormLessonPage] = useState(1);
  const [formCourseLoading, setFormCourseLoading] = useState(false);
  const [formLessonLoading, setFormLessonLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<any | null>(null);

  // Create / Edit / Detail states
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [form, setForm] = useState({
    courseId: "",
    lessonId: "",
    title: "",
    description: "",
    type: "1",
    fileUrl: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // removed unused resetForm

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
    if (!form.courseId) errs.courseId = "Vui lòng chọn khóa học";
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
      setLessonId(""); // Reset lesson selection when course changes
      setLessonPage(1); // Reset lesson page when course changes
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

  // Fetch courses for form with pagination
  useEffect(() => {
    const fetchFormCourses = async () => {
      setFormCourseLoading(true);
      try {
        await dispatch(
          getCoursesForAdmin({
            pageNumber: formCoursePage,
            pageSize: 12,
            includeDeleted: true,
          }) as any
        );
      } finally {
        setFormCourseLoading(false);
      }
    };
    fetchFormCourses();
  }, [dispatch, formCoursePage]);

  // Fetch lessons when form.courseId changes (for create/edit form)
  useEffect(() => {
    if (form.courseId) {
      setFormLessonPage(1); // Reset lesson page when course changes
    }
  }, [form.courseId]);

  // Fetch lessons for form when form.courseId or formLessonPage changes
  useEffect(() => {
    if (form.courseId) {
      const fetchFormLessons = async () => {
        setFormLessonLoading(true);
        try {
          await dispatch(
            getLessons({
              pageNumber: formLessonPage,
              pageSize: 12,
              includeDeleted: true,
              courseId: form.courseId,
            }) as any
          );
        } finally {
          setFormLessonLoading(false);
        }
      };
      fetchFormLessons();
    }
  }, [dispatch, form.courseId, formLessonPage]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get(
        ROUTES_API_LESSON_RESOURCE.ADMIN_GET_ALL,
        {
          params: {
            PageNumber: page,
            PageSize: pageSize,
            SearchTerm: committedSearch || undefined,
            IncludeDeleted: committedStatus === "all",
            CourseId: committedCourseId || undefined,
            LessonId: committedLessonId || undefined,
            Type: committedTypeFilter || undefined,
          },
        }
      );
      const data = res?.data?.data;
      const raw = data?.items || [];
      setItems(raw);
      const total = data?.total || 0;
      const size = data?.size || pageSize;
      setTotalPages(Math.max(1, Math.ceil(total / size)));
    } catch (e: any) {
      setError(extractApiErrorMessage(e, "Failed to load lesson resources"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    committedSearch,
    page,
    pageSize,
    committedCourseId,
    committedLessonId,
    committedTypeFilter,
    committedStatus,
  ]);

  const refresh = () => fetchData();

  const triggerSearch = () => {
    setCommittedSearch(searchTerm.trim());
    setCommittedCourseId(courseId);
    setCommittedLessonId(lessonId);
    setCommittedTypeFilter(typeFilter);
    setCommittedStatus(status);
    setPage(1);
  };

  const getTypeIcon = (type: number) => {
    switch (type) {
      case 1:
        return <VideoLibraryIcon />;
      case 2:
        return <DescriptionIcon />;
      case 3:
        return <ImageIcon />;
      case 4:
        return <AudioFileIcon />;
      case 5:
        return <LinkIcon />;
      case 6:
        return <ExtensionIcon />;
      case 7:
        return <SlideshowIcon />;
      default:
        return <DescriptionIcon />;
    }
  };

  const getTypeLabel = (type: number) => {
    switch (type) {
      case 1:
        return "Video";
      case 2:
        return "Document";
      case 3:
        return "Image";
      case 4:
        return "Audio";
      case 5:
        return "External Link";
      case 6:
        return "Interactive";
      case 7:
        return "Slides";
      default:
        return "Unknown";
    }
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await axiosClient.delete(
        ROUTES_API_LESSON_RESOURCE.DELETE(confirmDelete.id)
      );
      if (onNotify) onNotify("Xóa tài nguyên thành công");
      refresh();
    } catch (e: any) {
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleRestore = async () => {
    if (!confirmRestore) return;
    try {
      await axiosClient.post(
        ROUTES_API_LESSON_RESOURCE.RESTORE(confirmRestore.id)
      );
      if (onNotify) onNotify("Khôi phục tài nguyên thành công");
      refresh();
    } catch (e: any) {
    } finally {
      setConfirmRestore(null);
    }
  };

  // If viewing detail, show detail component instead of list
  if (selectedId) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Inline detail view has been removed
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Selected ID: {selectedId}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
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
              placeholder="Tìm kiếm tài nguyên theo tiêu đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  triggerSearch();
                }
              }}
              sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end" onClick={triggerSearch}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <PopupSelect
              label="Khóa học"
              value={courseId}
              onChange={(value) => {
                setCourseId(value);
                setLessonId("");
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
              value={lessonId}
              onChange={setLessonId}
              items={lessonsState?.items || []}
              loading={lessonLoading}
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
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                label="Trạng thái"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as any);
                  setPage(1);
                }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Đang hoạt động</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Loại tài nguyên</InputLabel>
              <Select
                label="Loại tài nguyên"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as string)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="1">Video</MenuItem>
                <MenuItem value="2">Document</MenuItem>
                <MenuItem value="3">Image</MenuItem>
                <MenuItem value="4">Audio</MenuItem>
                <MenuItem value="5">External Link</MenuItem>
                <MenuItem value="6">Interactive</MenuItem>
                <MenuItem value="7">Slides</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={() =>
                onCreateNew
                  ? onCreateNew()
                  : navigate(`/admin/lesson-resource-management/create`)
              }
            >
              Thêm tài nguyên
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
        <Alert severity="info">Chưa có tài nguyên nào</Alert>
      ) : (
        <Grid container spacing={2}>
          {items.map((it) => (
            <Grid item xs={12} md={6} lg={4} key={it.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: it.isDeleted ? "rgba(255,0,0,0.04)" : undefined,
                  outline: it.isDeleted
                    ? "1px dashed rgba(244,67,54,0.6)"
                    : undefined,
                  outlineOffset: it.isDeleted ? "-1px" : undefined,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ flex: 1, pb: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ color: "primary.main" }}>
                      {getTypeIcon(it.type)}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Tooltip title={it.title}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            lineHeight: 1.2,
                          }}
                        >
                          {truncateText(it.title, 25)}
                        </Typography>
                      </Tooltip>
                    </Box>
                    <Chip
                      size="small"
                      label={getTypeLabel(it.type)}
                      variant="outlined"
                      color="primary"
                      sx={{ fontSize: "0.7rem", height: 20 }}
                    />
                  </Box>

                  <Tooltip title={it.description || "No description"}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1.5,
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {it.description || "No description"}
                    </Typography>
                  </Tooltip>

                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      <strong>Lesson:</strong>{" "}
                      {truncateText(it.lessonTitle || "-", 20)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      <strong>Course:</strong>{" "}
                      {truncateText(it.courseTitle || "-", 20)}
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    <strong>Ngày tạo:</strong>{" "}
                    {new Date(it.createdAt).toLocaleDateString("vi-VN")}
                  </Typography>
                </CardContent>
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
                    title="Xem chi tiết"
                    onClick={() => {
                      console.log("Click view detail for ID:", it.id);
                      onViewDetail?.(it.id);
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {!it.isDeleted && (
                    <IconButton
                      size="small"
                      title="Chỉnh sửa"
                      onClick={() =>
                        onEditItem
                          ? onEditItem(it.id)
                          : navigate(
                              `/admin/lesson-resource-management/${it.id}/edit`
                            )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {it.isDeleted ? (
                    <IconButton
                      size="small"
                      color="success"
                      title="Khôi phục"
                      onClick={() => setConfirmRestore(it)}
                    >
                      <RestoreIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      color="error"
                      title="Xóa"
                      onClick={() => setConfirmDelete(it)}
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
            justifyContent: "space-between",
            alignItems: "center",
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

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc muốn xóa tài nguyên "{confirmDelete?.title}"?
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
          Bạn có chắc muốn khôi phục tài nguyên "{confirmRestore?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRestore(null)}>Hủy</Button>
          <Button color="success" onClick={handleRestore}>
            Khôi phục
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog
        open={createOpen || !!editItem}
        onClose={() => {
          setCreateOpen(false);
          setEditItem(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editItem ? "Chỉnh sửa tài nguyên" : "Thêm tài nguyên"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <PopupSelect
              label="Khóa học"
              value={form.courseId}
              onChange={(value) => {
                setForm((f) => ({ ...f, courseId: value, lessonId: "" }));
                setFormLessonPage(1); // Reset lesson page when course changes
              }}
              items={adminCourses?.items || []}
              loading={formCourseLoading}
              error={!!formErrors.courseId}
              helperText={formErrors.courseId}
              pageSize={12}
              getItemLabel={(course) => course.title}
              getItemValue={(course) => course.id}
              noDataMessage="Không có khóa học nào"
              currentPage={formCoursePage}
              onPageChange={setFormCoursePage}
              totalPages={adminCourses?.totalPages || 1}
              title="Chọn khóa học"
            />
            <PopupSelect
              label="Bài học"
              value={form.lessonId}
              onChange={(value) => setForm((f) => ({ ...f, lessonId: value }))}
              items={formLessonsState?.items || []}
              loading={formLessonLoading}
              error={!!formErrors.lessonId}
              helperText={formErrors.lessonId}
              disabled={!form.courseId}
              pageSize={12}
              getItemLabel={(lesson) => lesson.title}
              getItemValue={(lesson) => lesson.id}
              noDataMessage={
                !form.courseId
                  ? "Vui lòng chọn khóa học trước"
                  : "Không có bài học nào cho khóa học này"
              }
              currentPage={formLessonPage}
              onPageChange={setFormLessonPage}
              totalPages={formLessonsState?.totalPages || 1}
              title="Chọn bài học"
            />
            <TextField
              size="small"
              label="Tiêu đề"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              error={!!formErrors.title}
              helperText={formErrors.title}
              fullWidth
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
              minRows={2}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateOpen(false);
              setEditItem(null);
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!validateForm()) return;
              try {
                if (editItem) {
                  await axiosClient.put(LR.UPDATE(editItem.id), {
                    title: form.title.trim(),
                    description: form.description.trim(),
                    type: Number(form.type),
                    fileUrl: form.fileUrl.trim(),
                  });
                } else {
                  await axiosClient.post(LR.CREATE, {
                    lessonId: form.lessonId,
                    title: form.title.trim(),
                    description: form.description.trim(),
                    type: Number(form.type),
                    fileUrl: form.fileUrl.trim(),
                  });
                }
                setCreateOpen(false);
                setEditItem(null);
                refresh();
              } catch (e: any) {}
            }}
          >
            {editItem ? "Lưu thay đổi" : "Tạo mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
