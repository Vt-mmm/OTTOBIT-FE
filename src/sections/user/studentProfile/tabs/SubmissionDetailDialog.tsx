import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  Divider,
  Rating,
  Chip,
  Paper,
  IconButton,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  MenuBook as LessonIcon,
  School as CourseIcon,
  Schedule as ScheduleIcon,
  Code as CodeIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import { SubmissionResult } from "common/@types/submission";

interface SubmissionDetailDialogProps {
  open: boolean;
  submission: SubmissionResult | null;
  onClose: () => void;
}

export default function SubmissionDetailDialog({
  open,
  submission,
  onClose,
}: SubmissionDetailDialogProps) {
  if (!submission) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const parseCodeJson = (codeJson: string) => {
    try {
      const parsed = JSON.parse(codeJson);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return codeJson;
    }
  };

  const getStarColor = (star: number) => {
    if (star === 3) return "success"; // 3 sao = hoàn hảo
    if (star === 2) return "warning"; // 2 sao = khá
    return "default"; // 0-1 sao
  };

  const getStarMessage = (star: number) => {
    if (star === 3) return "Xuất sắc! Hoàn hảo!";
    if (star === 2) return "Rất tốt!";
    if (star === 1) return "Cần cải thiện";
    return "Chưa đạt";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <AssignmentIcon color="primary" />
            <Typography variant="h6">Chi tiết Bài nộp</Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Stack spacing={3}>
          {/* Rating Section */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: "center",
              backgroundColor: (theme) =>
                submission.star === 3
                  ? theme.palette.success.lighter
                  : submission.star === 2
                  ? theme.palette.warning.lighter
                  : theme.palette.grey[100],
            }}
          >
            <Stack spacing={2} alignItems="center">
              <TrophyIcon
                sx={{
                  fontSize: 48,
                  color: (theme) =>
                    submission.star === 3
                      ? theme.palette.success.main
                      : submission.star === 2
                      ? theme.palette.warning.main
                      : theme.palette.grey[500],
                }}
              />
              <Rating
                value={submission.star}
                max={3}
                readOnly
                size="large"
                sx={{ fontSize: "3rem" }}
              />
              <Typography variant="h4" fontWeight={600}>
                {submission.star}/3
              </Typography>
              <Chip
                label={getStarMessage(submission.star)}
                color={getStarColor(submission.star)}
                size="medium"
              />
            </Stack>
          </Paper>

          {/* Challenge Info */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <AssignmentIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600}>
                Thông tin Challenge
              </Typography>
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tên Challenge
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {submission.challengeTitle || "N/A"}
                </Typography>
              </Box>

              {submission.lessonTitle && (
                <Box>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <LessonIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Bài học
                    </Typography>
                  </Stack>
                  <Typography variant="body2">
                    {submission.lessonTitle}
                  </Typography>
                </Box>
              )}

              {submission.courseTitle && (
                <Box>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CourseIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Khóa học
                    </Typography>
                  </Stack>
                  <Typography variant="body2">
                    {submission.courseTitle}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Timestamps */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <ScheduleIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600}>
                Thời gian
              </Typography>
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Ngày nộp
                </Typography>
                <Typography variant="body2">
                  {formatDate(submission.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Cập nhật lần cuối
                </Typography>
                <Typography variant="body2">
                  {formatDate(submission.updatedAt)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Code JSON Preview */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <CodeIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600}>
                Code JSON
              </Typography>
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                maxHeight: 300,
                overflow: "auto",
                backgroundColor: "#1e1e1e",
                color: "#d4d4d4",
                fontFamily: "monospace",
                fontSize: "0.875rem",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {parseCodeJson(submission.codeJson)}
              </pre>
            </Paper>
          </Box>

          {/* IDs (for advanced users/debugging) */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              ID chi tiết (dành cho debug)
            </Typography>
            <Paper
              variant="outlined"
              sx={{ p: 1.5, backgroundColor: "grey.50" }}
            >
              <Stack spacing={0.5}>
                <Typography
                  variant="caption"
                  sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                >
                  <strong>Submission ID:</strong> {submission.id}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                >
                  <strong>Challenge ID:</strong> {submission.challengeId}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                >
                  <strong>Student ID:</strong> {submission.studentId}
                </Typography>
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
