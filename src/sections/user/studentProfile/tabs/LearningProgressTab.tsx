import { useState } from "react";
import { Box, Card, CardContent, Typography, Chip, Skeleton, LinearProgress, Pagination, Button } from "@mui/material";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUpOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMoreOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLessOutlined";

interface LessonProgressItem {
  id: string;
  lessonTitle: string;
  courseTitle: string;
  status: number | string;
  completedAt?: string;
  timeSpent?: number;
}

interface SubmissionItem {
  id: string;
  challengeTitle: string;
  submittedAt: string;
  star?: number;
  status?: string;
}

interface LearningProgressTabProps {
  lessonProgress: LessonProgressItem[];
  submissions: SubmissionItem[];
  loading?: boolean;
}

export default function LearningProgressTab({ lessonProgress, submissions, loading }: LearningProgressTabProps) {
  const [lessonPage, setLessonPage] = useState(1);
  const [submissionPage, setSubmissionPage] = useState(1);
  const [showAllLessons, setShowAllLessons] = useState(false);
  const [showAllSubmissions, setShowAllSubmissions] = useState(false);
  
  const ITEMS_PER_PAGE = 5;
  
  const getStatusInfo = (status: number | string) => {
    if (typeof status === "number") {
      switch (status) {
        case 0:
          return { label: "Chưa bắt đầu", color: "default" };
        case 1:
          return { label: "Đang học", color: "info" };
        case 2:
          return { label: "Đã xem", color: "warning" };
        case 3:
          return { label: "Hoàn thành", color: "success" };
        default:
          return { label: "Chưa bắt đầu", color: "default" };
      }
    }
    return { label: status, color: "default" };
  };

  const completedLessons = lessonProgress.filter((lp) => {
    const status = typeof lp.status === "number" ? lp.status : 0;
    return status === 3;
  }).length;

  const progressPercent = lessonProgress.length > 0 ? Math.round((completedLessons / lessonProgress.length) * 100) : 0;

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Summary Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            border: "1px solid",
            borderColor: "divider",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <TrendingUpIcon />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Tổng quan tiến độ
              </Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 3,
              }}
            >
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {lessonProgress.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Tổng số bài học
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {completedLessons}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Đã hoàn thành
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {progressPercent}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Tỷ lệ hoàn thành
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "rgba(255, 255, 255, 0.3)",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "white",
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Lesson Progress List */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
            📖 Bài học gần đây
          </Typography>

          {lessonProgress.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Chưa có dữ liệu tiến độ bài học
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {lessonProgress
                  .slice(
                    showAllLessons ? 0 : (lessonPage - 1) * ITEMS_PER_PAGE,
                    showAllLessons ? lessonProgress.length : lessonPage * ITEMS_PER_PAGE
                  )
                  .map((lesson, index) => {
                const statusInfo = getStatusInfo(lesson.status);
                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "grey.50",
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "grey.100",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {lesson.lessonTitle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {lesson.courseTitle}
                          </Typography>
                        </Box>
                        <Chip
                          label={statusInfo.label}
                          size="small"
                          color={statusInfo.color as any}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      {lesson.completedAt && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">
                            Hoàn thành: {dayjs(lesson.completedAt).format("DD/MM/YYYY HH:mm")}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </motion.div>
                  );
                })}
              </Box>
              
              {lessonProgress.length > ITEMS_PER_PAGE && (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 3 }}>
                  {!showAllLessons ? (
                    <>
                      <Pagination
                        count={Math.ceil(lessonProgress.length / ITEMS_PER_PAGE)}
                        page={lessonPage}
                        onChange={(_, page) => setLessonPage(page)}
                        color="primary"
                        size="medium"
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowAllLessons(true)}
                        startIcon={<ExpandMoreIcon />}
                      >
                        Xem tất cả ({lessonProgress.length})
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => { setShowAllLessons(false); setLessonPage(1); }}
                      startIcon={<ExpandLessIcon />}
                    >
                      Thu gọn
                    </Button>
                  )}
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
            <AssignmentTurnedInIcon /> Bài nộp gần đây
          </Typography>

          {submissions.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Chưa có bài nộp nào
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {submissions
                  .slice(
                    showAllSubmissions ? 0 : (submissionPage - 1) * ITEMS_PER_PAGE,
                    showAllSubmissions ? submissions.length : submissionPage * ITEMS_PER_PAGE
                  )
                  .map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "grey.50",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "grey.100",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {submission.challengeTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Nộp lúc: {dayjs(submission.submittedAt).format("DD/MM/YYYY HH:mm")}
                        </Typography>
                      </Box>
                      {submission.star !== undefined && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {[...Array(3)].map((_, i) => (
                            <Box
                              key={i}
                              sx={{
                                fontSize: 20,
                                color: i < (submission.star || 0) ? "#ffc107" : "#e0e0e0",
                              }}
                            >
                              ⭐
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </motion.div>
                ))}
              </Box>
              
              {submissions.length > ITEMS_PER_PAGE && (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 3 }}>
                  {!showAllSubmissions ? (
                    <>
                      <Pagination
                        count={Math.ceil(submissions.length / ITEMS_PER_PAGE)}
                        page={submissionPage}
                        onChange={(_, page) => setSubmissionPage(page)}
                        color="primary"
                        size="medium"
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowAllSubmissions(true)}
                        startIcon={<ExpandMoreIcon />}
                      >
                        Xem tất cả ({submissions.length})
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => { setShowAllSubmissions(false); setSubmissionPage(1); }}
                      startIcon={<ExpandLessIcon />}
                    >
                      Thu gọn
                    </Button>
                  )}
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
