import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Paper,
  Typography,
  Button,
  Chip,
  Skeleton,
  Card,
  CardContent,
  Grid,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Divider,
  Alert,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon,
  MenuBook as LessonIcon,
  Quiz as ChallengeIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { getMySubmissionsThunk } from "store/submission/submissionThunks";
import { SubmissionResult } from "common/@types/submission";

// Import dialog
import SubmissionDetailDialog from "./SubmissionDetailDialog";

export default function MySubmissionsTab() {
  const dispatch = useAppDispatch();
  const { mySubmissions } = useAppSelector((state) => state.submission);

  // Filters and pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [starFilter, setStarFilter] = useState<number | "">("");

  // Dialog state
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const submissions = mySubmissions.data?.items || [];
  const total = mySubmissions.data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);
  const isLoading = mySubmissions.isLoading;
  const error = mySubmissions.error;

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const fetchData = () => {
    dispatch(
      getMySubmissionsThunk({
        pageNumber: page,
        pageSize: pageSize,
      })
    );
  };

  // Filter by star locally
  const filteredSubmissions =
    starFilter !== ""
      ? submissions.filter((s) => s.star === starFilter)
      : submissions;

  const handleViewDetails = (submission: SubmissionResult) => {
    setSelectedSubmission(submission);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSubmission(null);
  };

  const handlePageChange = (_: any, newPage: number) => {
    setPage(newPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStarColor = (star: number) => {
    if (star === 3) return "success"; // 3 sao = hoàn hảo
    if (star === 2) return "warning"; // 2 sao = khá
    return "default"; // 0-1 sao
  };

  // Loading skeleton
  if (isLoading && submissions.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={120} />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <AssignmentIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600}>
              Bài nộp của tôi
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={isLoading}
            size="small"
          >
            Làm mới
          </Button>
        </Stack>

        {/* Stats Summary */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={600} color="primary">
                {total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số bài nộp
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={600} color="success.main">
                {submissions.filter((s) => s.star === 3).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hoàn hảo (3⭐)
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={600} color="warning.main">
                {submissions.filter((s) => s.star === 2).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Khá (2⭐)
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filters */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Lọc theo sao</InputLabel>
            <Select
              value={starFilter}
              label="Lọc theo sao"
              onChange={(e) =>
                setStarFilter(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value={0}>0 ⭐</MenuItem>
              <MenuItem value={1}>1 ⭐</MenuItem>
              <MenuItem value={2}>2 ⭐</MenuItem>
              <MenuItem value={3}>3 ⭐</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Số lượng/trang</InputLabel>
            <Select
              value={pageSize}
              label="Số lượng/trang"
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <MenuItem value={6}>6</MenuItem>
              <MenuItem value={12}>12</MenuItem>
              <MenuItem value={24}>24</MenuItem>
              <MenuItem value={48}>48</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => {}}>
            {error}
          </Alert>
        )}

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <AssignmentIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {starFilter !== ""
                ? "Không có bài nộp nào với mức sao này"
                : "Chưa có bài nộp nào"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {starFilter !== ""
                ? "Thử thay đổi bộ lọc để xem các bài nộp khác"
                : "Hãy hoàn thành các thử thách để có bài nộp đầu tiên!"}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredSubmissions.map((submission) => (
              <Grid item xs={12} sm={6} md={4} key={submission.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack spacing={2}>
                      {/* Header with star rating */}
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Rating
                          value={submission.star}
                          max={3}
                          readOnly
                          size="small"
                        />
                        <Chip
                          label={`${submission.star}/3`}
                          color={getStarColor(submission.star)}
                          size="small"
                          icon={<TrophyIcon />}
                        />
                      </Stack>

                      <Divider />

                      {/* Challenge Info */}
                      <Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          mb={0.5}
                        >
                          <ChallengeIcon fontSize="small" color="primary" />
                          <Typography variant="caption" color="text.secondary">
                            Challenge
                          </Typography>
                        </Stack>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {submission.challengeTitle || "N/A"}
                        </Typography>
                      </Box>

                      {/* Lesson Info */}
                      {submission.lessonTitle && (
                        <Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            mb={0.5}
                          >
                            <LessonIcon fontSize="small" color="action" />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Bài học
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {submission.lessonTitle}
                          </Typography>
                        </Box>
                      )}

                      {/* Timestamp */}
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ScheduleIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(submission.createdAt)}
                        </Typography>
                      </Stack>

                      {/* View Details Button */}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(submission)}
                        fullWidth
                      >
                        Xem chi tiết
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Stack alignItems="center" sx={{ mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Stack>
        )}
      </Stack>

      {/* Detail Dialog */}
      <SubmissionDetailDialog
        open={dialogOpen}
        submission={selectedSubmission}
        onClose={handleCloseDialog}
      />
    </Box>
  );
}
