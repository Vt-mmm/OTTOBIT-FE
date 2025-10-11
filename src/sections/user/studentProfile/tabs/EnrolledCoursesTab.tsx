import {
  Box,
  Stack,
  Paper,
  Typography,
  LinearProgress,
  Button,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PATH_USER } from "routes/paths";
import { useLocales } from "hooks";
import { useEffect, useMemo, useState } from "react";
import { LessonStatus } from "common/@types/lessonProgress";
import { axiosClient } from "axiosClient/axiosClient";
import {
  ROUTES_API_ENROLLMENT,
  ROUTES_API_LESSON,
  ROUTES_API_LESSON_PROGRESS,
} from "constants/routesApiKeys";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MenuBookIcon from "@mui/icons-material/MenuBook";

// API response wrapper
interface ApiResponse<T> {
  message: string;
  data: T;
}

// Enrollment item shape
interface EnrollmentItem {
  id: string;
  courseId: string;
  courseTitle?: string;
  courseDescription?: string;
  courseImageUrl?: string;
  progress?: number; // Progress percentage from backend
  isCompleted?: boolean; // Completion status from backend
}

// Lesson progress subset for rendering
interface LessonProgItem {
  id: string;
  lessonId: string;
  status: LessonStatus;
  currentChallengeOrder?: number;
  lesson?: { title?: string };
}

interface EnrolledCoursesTabProps {
  enrollments?: EnrollmentItem[];
  loading?: boolean;
}

export default function EnrolledCoursesTab({
  enrollments: propEnrollments,
  loading: propLoading,
}: EnrolledCoursesTabProps) {
  const navigate = useNavigate();
  const { translate } = useLocales();

  const [tab, setTab] = useState<"IN_PROGRESS" | "COMPLETED">("IN_PROGRESS");
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>(
    propEnrollments || []
  );
  const [loading, setLoading] = useState<boolean>(
    propLoading !== undefined ? propLoading : true
  );
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<
    Record<string, { total: number; completed: number; percent: number }>
  >({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [lessonsMap, setLessonsMap] = useState<
    Record<
      string,
      {
        loading: boolean;
        error: string | null;
        items: LessonProgItem[];
        page: number;
        size: number;
        total: number;
      }
    >
  >({});

  // Load all enrollments (both completed and in-progress) then compute per-course stats
  useEffect(() => {
    // Skip if parent provided enrollments
    if (propEnrollments && propEnrollments.length > 0) {
      setEnrollments(propEnrollments);
      setLoading(false);
      return;
    }

    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rIn, rDone] = await Promise.all([
          axiosClient.get<ApiResponse<any>>(
            ROUTES_API_ENROLLMENT.MY_ENROLLMENTS,
            { params: { pageNumber: 1, pageSize: 50, isCompleted: false } }
          ),
          axiosClient.get<ApiResponse<any>>(
            ROUTES_API_ENROLLMENT.MY_ENROLLMENTS,
            { params: { pageNumber: 1, pageSize: 50, isCompleted: true } }
          ),
        ]);
        const list: EnrollmentItem[] = [
          ...(rIn.data?.data?.items ?? []),
          ...(rDone.data?.data?.items ?? []),
        ];
        if (!mounted) return;
        setEnrollments(list);
        // Fetch stats for each distinct course
        const courseIds = Array.from(new Set(list.map((e) => e.courseId)));
        const statsEntries = await Promise.all(
          courseIds.map(async (courseId) => {
            const [lessonsRes, completedRes] = await Promise.all([
              axiosClient.get<ApiResponse<any>>(ROUTES_API_LESSON.PREVIEW, {
                params: { courseId, pageNumber: 1, pageSize: 1 },
              }),
              axiosClient.get<ApiResponse<any>>(
                ROUTES_API_LESSON_PROGRESS.MY_PROGRESS,
                {
                  params: {
                    pageNumber: 1,
                    pageSize: 1,
                    courseId,
                    status: 3, // Backend expects numeric enum: 3 = Completed
                  },
                }
              ),
            ]);
            const total =
              lessonsRes.data?.data?.total ??
              lessonsRes.data?.data?.items?.length ??
              0;
            const completed = completedRes.data?.data?.total ?? 0;
            const percent =
              total > 0
                ? Math.min(100, Math.round((completed / total) * 100))
                : 0;
            return [courseId, { total, completed, percent }] as const;
          })
        );
        if (!mounted) return;
        setStats(Object.fromEntries(statsEntries));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Bạn chưa tham gia khóa học nào");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [propEnrollments]);

  const items = enrollments;

  const isComplete = (enrollment: EnrollmentItem) => {
    // Use backend isCompleted if available
    if (enrollment.isCompleted !== undefined) {
      return enrollment.isCompleted;
    }
    // Fallback to checking progress percentage
    if (enrollment.progress !== undefined) {
      return enrollment.progress >= 100;
    }
    // Final fallback to computed stats
    const s = stats[enrollment.courseId];
    return s ? s.percent >= 100 && s.total > 0 : false;
  };

  const inProgress = useMemo(
    () => items.filter((e) => !isComplete(e)),
    [items, stats]
  );
  const completed = useMemo(
    () => items.filter((e) => isComplete(e)),
    [items, stats]
  );
  const visible = tab === "IN_PROGRESS" ? inProgress : completed;

  // Loading state
  if (loading) {
    return (
      <Stack spacing={2}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Skeleton variant="text" width={200} height={40} />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Skeleton variant="rounded" width={120} height={32} />
            <Skeleton variant="rounded" width={120} height={32} />
          </Box>
        </Box>
        <Divider />
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 2 }}
          />
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1.5, sm: 0 },
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, fontSize: { xs: "1.125rem", sm: "1.25rem" } }}
        >
          {translate("student.MyCourses")}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={`${translate("student.Learning")} (${inProgress.length})`}
            color={tab === "IN_PROGRESS" ? "primary" : "default"}
            onClick={() => setTab("IN_PROGRESS")}
            variant={tab === "IN_PROGRESS" ? "filled" : "outlined"}
            size="small"
          />
          <Chip
            label={`Hoàn thành (${completed.length})`}
            color={tab === "COMPLETED" ? "primary" : "default"}
            onClick={() => setTab("COMPLETED")}
            variant={tab === "COMPLETED" ? "filled" : "outlined"}
            size="small"
          />
        </Box>
      </Box>
      <Divider />

      {error && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {!loading && !error && visible.length === 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 6,
            borderRadius: 2,
            textAlign: "center",
            bgcolor: "grey.50",
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {tab === "IN_PROGRESS"
              ? translate("student.NoActiveCoursesProgress")
              : translate("student.NoCourseCompleted")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tab === "IN_PROGRESS"
              ? translate("student.EnrollNewCourse")
              : translate("student.CompleteCourses")}
          </Typography>
        </Paper>
      )}

      {!loading &&
        !error &&
        visible.map((enrollment) => {
          // Use progress from backend if available, fallback to computed stats
          const progressPct = enrollment.progress ?? stats[enrollment.courseId]?.percent ?? 0;
          const detailPath = PATH_USER.courseDetail.replace(
            ":id",
            enrollment.courseId
          );
          const isOpen = !!expanded[enrollment.courseId];
          const lessonsState = lessonsMap[enrollment.courseId];

          const toggle = async () => {
            setExpanded((prev) => ({
              ...prev,
              [enrollment.courseId]: !prev[enrollment.courseId],
            }));
            const nowOpen = !isOpen;
            if (nowOpen && !lessonsState) {
              setLessonsMap((m) => ({
                ...m,
                [enrollment.courseId]: {
                  loading: true,
                  error: null,
                  items: [],
                  page: 1,
                  size: 10,
                  total: 0,
                },
              }));
              try {
                const page = 1;
                const size = 20;
                const res = await axiosClient.get<ApiResponse<any>>(
                  ROUTES_API_LESSON_PROGRESS.MY_PROGRESS,
                  {
                    params: {
                      courseId: enrollment.courseId,
                      pageNumber: page,
                      pageSize: size,
                    },
                  }
                );
                const rawItems: LessonProgItem[] = res.data?.data?.items ?? [];
                const total: number = res.data?.data?.total ?? rawItems.length;

                const dedupedMap = new Map<string, LessonProgItem>();
                for (const it of rawItems) {
                  if (!dedupedMap.has(it.lessonId))
                    dedupedMap.set(it.lessonId, it);
                }
                let items = Array.from(dedupedMap.values());

                // Load lesson titles
                try {
                  const lessonsRes = await axiosClient.get<ApiResponse<any>>(
                    ROUTES_API_LESSON.PREVIEW,
                    {
                      params: {
                        courseId: enrollment.courseId,
                        pageNumber: 1,
                        pageSize: 100,
                      },
                    }
                  );
                  const lessonsList: Array<{ id: string; title?: string }> =
                    lessonsRes.data?.data?.items ?? [];
                  const titleById = new Map<string, string>();
                  for (const l of lessonsList) {
                    if (l?.id) titleById.set(l.id, l.title ?? "");
                  }
                  items = items.map((it) => ({
                    ...it,
                    lesson: { title: titleById.get(it.lessonId) || undefined },
                  }));
                } catch {}

                setLessonsMap((m) => ({
                  ...m,
                  [enrollment.courseId]: {
                    loading: false,
                    error: null,
                    items,
                    page,
                    size,
                    total,
                  },
                }));
              } catch (e: any) {
                setLessonsMap((m) => ({
                  ...m,
                  [enrollment.courseId]: {
                    loading: false,
                    error: e?.message || translate("student.CannotLoadLessons"),
                    items: [],
                    page: 1,
                    size: 10,
                    total: 0,
                  },
                }));
              }
            }
          };

          return (
            <Paper
              key={enrollment.id}
              variant="outlined"
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: 2,
                },
                minWidth: 0,
                maxWidth: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: { xs: 1.5, sm: 2 },
                  flexWrap: { xs: "wrap", md: "nowrap" },
                }}
              >
                <Avatar
                  src={enrollment.courseImageUrl || undefined}
                  variant="rounded"
                  sx={{
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    flexShrink: 0,
                  }}
                >
                  {enrollment.courseTitle?.charAt(0) || "C"}
                </Avatar>
                <Box
                  sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    maxWidth: { xs: "calc(100% - 64px)", md: "100%" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 0.5, sm: 1 },
                    }}
                  >
                    <Typography
                      noWrap
                      sx={{
                        fontWeight: 700,
                        flexGrow: 1,
                        fontSize: { xs: "0.9375rem", sm: "1rem" },
                      }}
                    >
                      {enrollment.courseTitle || translate("student.Course")}
                    </Typography>
                    <Tooltip
                      title={
                        isOpen
                          ? translate("student.Collapse")
                          : translate("student.ViewJoinedLessons")
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={toggle}
                        sx={{
                          transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                          transition: "transform 0.2s",
                        }}
                      >
                        <ExpandMoreIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progressPct}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {progressPct}% hoàn thành
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    width: { xs: "100%", md: "auto" },
                    display: "flex",
                    justifyContent: { xs: "stretch", md: "flex-end" },
                    order: { xs: 3, md: 0 },
                    mt: { xs: 1, md: 0 },
                  }}
                >
                  {tab === "COMPLETED" ? (
                    <Button
                      startIcon={<CheckCircleOutlineIcon />}
                      variant="text"
                      onClick={() => navigate(detailPath)}
                      size="small"
                      sx={{
                        minHeight: { xs: 44, sm: 36 },
                        fontSize: { xs: "0.875rem", sm: "0.8125rem" },
                        flexShrink: 0,
                        width: { xs: "100%", md: "auto" },
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  ) : (
                    <Button
                      startIcon={<PlayArrowIcon />}
                      variant="contained"
                      onClick={() => navigate(detailPath)}
                      size="small"
                      sx={{
                        minHeight: { xs: 44, sm: 36 },
                        fontSize: { xs: "0.875rem", sm: "0.8125rem" },
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                        width: { xs: "100%", md: "auto" },
                      }}
                    >
                      {translate("courses.ContinueLearning")}
                    </Button>
                  )}
                </Box>
              </Box>
              {isOpen && (
                <Box sx={{ mt: 2, pl: { xs: 0, sm: 7 } }}>
                  {(!lessonsState || lessonsState.loading) && (
                    <Stack spacing={1.25}>
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={52} />
                      ))}
                    </Stack>
                  )}
                  {lessonsState?.error && (
                    <Typography variant="body2" color="error">
                      {lessonsState.error}
                    </Typography>
                  )}
                  {lessonsState &&
                    !lessonsState.loading &&
                    !lessonsState.error && (
                      <Stack spacing={1.25}>
                        {lessonsState.items.length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            {translate("student.NoLessonsJoined")}
                          </Typography>
                        )}
                        {lessonsState.items.map((lp) => {
                          const title =
                            lp.lesson?.title || `Bài học ${lp.lessonId}`;
                          const lsDetail = PATH_USER.lessonDetail.replace(
                            ":id",
                            lp.lessonId
                          );
                          
                          // Backend returns numeric enum: 0=Locked, 1=Available, 2=InProgress, 3=Completed
                          const status = typeof lp.status === 'number' ? lp.status : parseInt(String(lp.status));
                          const isCompleted = status === 3 || lp.status === LessonStatus.Completed || lp.status === "Completed";
                          const isInProgress = status === 2 || lp.status === LessonStatus.InProgress || lp.status === "InProgress";
                          
                          const statusColor = isCompleted
                            ? "success"
                            : isInProgress
                            ? "warning"
                            : "default";
                          const statusText = isCompleted
                            ? translate("student.Completed")
                            : isInProgress
                            ? translate("student.Learning")
                            : translate("student.NotStarted");
                          return (
                            <Paper
                              key={lp.id}
                              variant="outlined"
                              sx={{
                                p: 1.5,
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                "&:hover": {
                                  bgcolor: "action.hover",
                                },
                              }}
                              onClick={() => navigate(lsDetail)}
                            >
                              <MenuBookIcon
                                fontSize="small"
                                color={statusColor as any}
                              />
                              <Typography
                                variant="body2"
                                sx={{ flexGrow: 1, fontWeight: 500 }}
                              >
                                {title}
                              </Typography>
                              <Chip
                                label={statusText}
                                size="small"
                                color={statusColor as any}
                                variant="outlined"
                              />
                            </Paper>
                          );
                        })}
                      </Stack>
                    )}
                </Box>
              )}
            </Paper>
          );
        })}
    </Stack>
  );
}
