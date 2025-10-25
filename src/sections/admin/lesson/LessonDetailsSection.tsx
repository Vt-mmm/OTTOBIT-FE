import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Pagination,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import FolderIcon from "@mui/icons-material/Folder";
import { LessonResult } from "../../../common/@types/lesson";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getChallenges } from "../../../redux/challenge/challengeSlice";
import { useEffect, useState } from "react";
import { axiosClient } from "axiosClient";

interface Props {
  lesson: LessonResult | null;
  onBack: () => void;
}

export default function LessonDetailsSection({ lesson, onBack }: Props) {
  const dispatch = useAppDispatch();
  const [detail, setDetail] = useState<LessonResult | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState<boolean>(false);
  const [resourcesError, setResourcesError] = useState<string | null>(null);
  const [resourcesPage, setResourcesPage] = useState<number>(1);
  const [resourcesPageSize] = useState<number>(12);
  const [resourcesTotalPages, setResourcesTotalPages] = useState<number>(1);
  // Challenges pagination
  const [challengePage, setChallengePage] = useState<number>(1);
  const [challengePageSize] = useState<number>(12);
  const [challengeTotalPages, setChallengeTotalPages] = useState<number>(1);
  const {
    data: challengesData,
    isLoading: challengesLoading,
    error: challengesError,
  } = useAppSelector((s) => s.challenge.challenges);

  // Fetch latest lesson detail by id when opening details (admin)
  useEffect(() => {
    const fetchDetail = async () => {
      if (!lesson?.id) return;
      setDetailLoading(true);
      setDetailError(null);
      try {
        const { data } = await axiosClient.get(
          `/api/v1/lessons/admin/${lesson.id}`
        );
        const apiData = (data && data.data) as LessonResult | undefined;
        if (apiData) setDetail(apiData);
      } catch (err) {
        setDetailError("Không tải được chi tiết bài học");
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [lesson?.id]);

  // Fetch challenges for this lesson
  useEffect(() => {
    if (lesson?.id) {
      dispatch(
        getChallenges({
          lessonId: lesson.id,
          includeDeleted: true,
          pageNumber: challengePage,
          pageSize: challengePageSize,
        })
      );
    }
  }, [dispatch, lesson?.id, challengePage, challengePageSize]);

  // Update challenges total pages from response meta
  useEffect(() => {
    const meta: any = challengesData as any;
    if (meta?.totalPages) {
      setChallengeTotalPages(meta.totalPages);
    } else if (meta?.total && meta?.size) {
      setChallengeTotalPages(Math.max(1, Math.ceil(meta.total / meta.size)));
    }
  }, [challengesData]);

  // Fetch lesson resources (IncludeDeleted=true)
  useEffect(() => {
    const fetchResources = async (page: number) => {
      if (!lesson?.id) return;
      setResourcesLoading(true);
      setResourcesError(null);
      try {
        const res = await axiosClient.get("/api/v1/lesson-resources/admin", {
          params: {
            LessonId: lesson.id,
            IncludeDeleted: true,
            PageNumber: page,
            PageSize: resourcesPageSize,
          },
        });
        const data = (res as any)?.data?.data;
        const items = Array.isArray(data?.items) ? data.items : [];
        setResources(items);
        const totalPages = data?.totalPages || 1;
        setResourcesTotalPages(totalPages);
      } catch (_e) {
        setResourcesError("Không tải được danh sách tài nguyên học tập");
        setResources([]);
        setResourcesTotalPages(1);
      } finally {
        setResourcesLoading(false);
      }
    };

    fetchResources(resourcesPage);
  }, [lesson?.id, resourcesPage, resourcesPageSize]);

  const renderLesson = detail ?? lesson;

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
        <Alert severity="error" sx={{ mb: 2 }}>
          {detailError}
        </Alert>
        <Button onClick={onBack}>Quay lại</Button>
      </Box>
    );
  }

  if (!renderLesson) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography>Không tìm thấy thông tin bài học</Typography>
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
        {/* Lesson Content */}
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
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 2 }}
                  >
                    <Chip
                      label={`Bài ${renderLesson.order}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={renderLesson.courseTitle || "Không xác định"}
                      variant="outlined"
                    />
                  </Stack>

                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    {renderLesson.title}
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={3}
                    sx={{ mb: 3 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccessTimeIcon color="primary" fontSize="small" />
                      <Typography variant="body2">
                        {renderLesson.durationInMinutes} phút
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SchoolIcon color="primary" fontSize="small" />
                      <Typography variant="body2">
                        {renderLesson.challengesCount || 0} thử thách
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Nội dung bài học
              </Typography>

              <Box
                sx={{
                  p: 3,
                  backgroundColor: "#f8f9fa",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {renderLesson.content}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lesson Info Sidebar */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Thông tin bài học
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Khóa học
                  </Typography>
                  <Typography variant="subtitle2">
                    {renderLesson.courseTitle || "Không xác định"}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Thời lượng
                  </Typography>
                  <Typography variant="subtitle2">
                    {renderLesson.durationInMinutes} phút
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Thứ tự
                  </Typography>
                  <Typography variant="subtitle2">
                    Bài {renderLesson.order}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Số thử thách
                  </Typography>
                  <Typography variant="subtitle2">
                    {renderLesson.challengesCount || 0} thử thách
                  </Typography>
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
                    {new Date(renderLesson.createdAt).toLocaleDateString(
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
                    {new Date(renderLesson.updatedAt).toLocaleDateString(
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

        {/* Challenges List */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Danh sách thử thách
              </Typography>

              {challengesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : challengesError ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {challengesError}
                </Alert>
              ) : !challengesData?.items ||
                challengesData.items.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <SchoolIcon
                    sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    Chưa có thử thách nào
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Thêm thử thách đầu tiên cho bài học này
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{
                      maxWidth: "100%",
                    }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell align="center">Thứ tự</TableCell>
                          <TableCell>Tên thử thách</TableCell>
                          <TableCell>Mô tả</TableCell>
                          <TableCell align="center">Chế độ</TableCell>
                          <TableCell align="center">Độ khó</TableCell>
                          <TableCell align="center">Trạng thái</TableCell>
                          <TableCell>Ngày tạo</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {challengesData.items.map((challenge) => (
                          <TableRow
                            key={challenge.id}
                            hover
                            sx={{
                              opacity: challenge.isDeleted ? 0.6 : 1,
                              backgroundColor: challenge.isDeleted
                                ? "#ffebee"
                                : "inherit",
                            }}
                          >
                            <TableCell align="center">
                              {challenge.order}
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600 }}
                              >
                                {challenge.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 200,
                                }}
                                title={challenge.description}
                              >
                                {challenge.description}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={
                                  (challenge.challengeMode as number) === 1
                                    ? "Simulator"
                                    : "Vật lý"
                                }
                                size="small"
                                color={
                                  (challenge.challengeMode as number) === 1
                                    ? "primary"
                                    : "success"
                                }
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`Level ${challenge.difficulty}`}
                                size="small"
                                color="info"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">
                              {challenge.isDeleted ? (
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
                                {new Date(
                                  challenge.createdAt
                                ).toLocaleDateString("vi-VN")}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {challengeTotalPages > 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                    >
                      <Pagination
                        count={challengeTotalPages}
                        page={challengePage}
                        onChange={(_, page) => setChallengePage(page)}
                        color="primary"
                        size="small"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Lesson Resources List */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Tài nguyên học tập
              </Typography>

              {resourcesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : resourcesError ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {resourcesError}
                </Alert>
              ) : !resources || resources.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <FolderIcon
                    sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    Chưa có tài nguyên nào
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Thêm video, file hoặc liên kết để hỗ trợ bài học
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Tiêu đề</TableCell>
                          <TableCell>Mô tả</TableCell>
                          <TableCell>Loại</TableCell>
                          <TableCell>Liên kết</TableCell>
                          <TableCell>Trạng thái</TableCell>
                          <TableCell>Ngày tạo</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {resources.map((r: any) => (
                          <TableRow
                            key={r.id}
                            hover
                            sx={{
                              opacity: r.isDeleted ? 0.6 : 1,
                              backgroundColor: r.isDeleted
                                ? "#ffebee"
                                : "inherit",
                            }}
                          >
                            <TableCell>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600 }}
                              >
                                {r.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 240,
                                }}
                                title={r.description}
                              >
                                {r.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  r.type === 1
                                    ? "Video"
                                    : r.type === 2
                                    ? "Tệp"
                                    : "Liên kết"
                                }
                                size="small"
                                color={
                                  r.type === 1
                                    ? "info"
                                    : r.type === 2
                                    ? "warning"
                                    : "default"
                                }
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {r.fileUrl ? (
                                <Typography
                                  variant="body2"
                                  color="primary"
                                  component="a"
                                  href={r.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ textDecoration: "none" }}
                                >
                                  Mở
                                </Typography>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.disabled"
                                >
                                  -
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {r.isDeleted ? (
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
                                {r.createdAt
                                  ? new Date(r.createdAt).toLocaleDateString(
                                      "vi-VN"
                                    )
                                  : "-"}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {resourcesTotalPages > 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                    >
                      <Pagination
                        count={resourcesTotalPages}
                        page={resourcesPage}
                        onChange={(_, page) => setResourcesPage(page)}
                        color="primary"
                        size="small"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
