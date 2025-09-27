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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import { LessonResult } from "../../../common/@types/lesson";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getChallenges } from "../../../redux/challenge/challengeSlice";
import { useEffect } from "react";

interface Props {
  lesson: LessonResult | null;
  onBack: () => void;
  onEdit: (lesson: LessonResult) => void;
}

export default function LessonDetailsSection({
  lesson,
  onBack,
  onEdit,
}: Props) {
  const dispatch = useAppDispatch();
  const {
    data: challengesData,
    isLoading: challengesLoading,
    error: challengesError,
  } = useAppSelector((s) => s.challenge.challenges);

  // Fetch challenges for this lesson
  useEffect(() => {
    if (lesson?.id) {
      dispatch(
        getChallenges({
          lessonId: lesson.id,
          includeDeleted: true,
          pageNumber: 1,
          pageSize: 100,
        })
      );
    }
  }, [dispatch, lesson?.id]);

  if (!lesson) {
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
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Quay lại
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Chi tiết bài học
        </Typography>
      </Stack>

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
                      label={`Bài ${lesson.order}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={lesson.courseTitle || "Không xác định"}
                      variant="outlined"
                    />
                  </Stack>

                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    {lesson.title}
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
                        {lesson.durationInMinutes} phút
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SchoolIcon color="primary" fontSize="small" />
                      <Typography variant="body2">
                        {lesson.challengesCount || 0} thử thách
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => onEdit(lesson)}
                  sx={{ ml: 2 }}
                >
                  Chỉnh sửa
                </Button>
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
                  {lesson.content}
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
                    {lesson.courseTitle || "Không xác định"}
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
                    {lesson.durationInMinutes} phút
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
                    Bài {lesson.order}
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
                    {lesson.challengesCount || 0} thử thách
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
                    {new Date(lesson.createdAt).toLocaleDateString("vi-VN", {
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
                    {new Date(lesson.updatedAt).toLocaleDateString("vi-VN", {
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

        {/* Challenges List */}
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
                  Danh sách thử thách
                </Typography>
                <Chip
                  label={`${challengesData?.items?.length || 0} thử thách`}
                  color="primary"
                  variant="outlined"
                />
              </Stack>

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
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    maxHeight: 400,
                    overflowY: "auto",
                    maxWidth: "100%",
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
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
                                challenge.challengeMode === "Simulation"
                                  ? "Practice"
                                  : "Test"
                              }
                              size="small"
                              color={
                                challenge.challengeMode === "Simulation"
                                  ? "primary"
                                  : "secondary"
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
                              {new Date(challenge.createdAt).toLocaleDateString(
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
