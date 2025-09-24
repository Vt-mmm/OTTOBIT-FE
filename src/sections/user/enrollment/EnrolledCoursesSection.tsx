import {
  Box,
  Stack,
  Paper,
  Typography,
  LinearProgress,
  Button,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PATH_USER } from "routes/paths";

import { useEffect, useMemo, useState } from "react";
import { Chip, Divider, IconButton, Skeleton, Tooltip } from "@mui/material";
import { LessonStatus } from "common/@types/lessonProgress";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_ENROLLMENT, ROUTES_API_LESSON, ROUTES_API_LESSON_PROGRESS } from "constants/routesApiKeys";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MenuBookIcon from "@mui/icons-material/MenuBook";

// API response wrapper
interface ApiResponse<T> { message: string; data: T; }

// Enrollment item shape (subset used here)
interface EnrollmentItem {
  id: string;
  courseId: string;
  courseTitle?: string;
  courseDescription?: string;
  courseImageUrl?: string;
}

// Lesson progress subset for rendering
interface LessonProgItem {
  id: string;
  lessonId: string;
  status: LessonStatus;
  currentChallengeOrder?: number;
  lesson?: { title?: string };
}

export default function EnrolledCoursesSection() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<"IN_PROGRESS" | "COMPLETED">("IN_PROGRESS");
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, { total: number; completed: number; percent: number }>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [lessonsMap, setLessonsMap] = useState<Record<string, { loading: boolean; error: string | null; items: LessonProgItem[]; page: number; size: number; total: number }>>({});

  // Load all enrollments (both completed and in-progress) then compute per-course stats
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rIn, rDone] = await Promise.all([
          axiosClient.get<ApiResponse<any>>(ROUTES_API_ENROLLMENT.MY_ENROLLMENTS, { params: { pageNumber: 1, pageSize: 50, isCompleted: false } }),
          axiosClient.get<ApiResponse<any>>(ROUTES_API_ENROLLMENT.MY_ENROLLMENTS, { params: { pageNumber: 1, pageSize: 50, isCompleted: true } }),
        ]);
        const list: EnrollmentItem[] = [
          ...(rIn.data?.data?.items ?? []),
          ...(rDone.data?.data?.items ?? []),
        ];
        if (!mounted) return;
        setEnrollments(list);
        // Fetch stats for each distinct course
        const courseIds = Array.from(new Set(list.map((e) => e.courseId)));
        const statsEntries = await Promise.all(courseIds.map(async (courseId) => {
          const [lessonsRes, completedRes] = await Promise.all([
            axiosClient.get<ApiResponse<any>>(ROUTES_API_LESSON.PREVIEW, { params: { courseId, pageNumber: 1, pageSize: 1 } }),
            axiosClient.get<ApiResponse<any>>(ROUTES_API_LESSON_PROGRESS.MY_PROGRESS, { params: { pageNumber: 1, pageSize: 1, courseId, status: LessonStatus.Completed } }),
          ]);
          const total = (lessonsRes.data?.data?.total ?? lessonsRes.data?.data?.items?.length ?? lessonsRes.data?.data?.length ?? 0) as number;
          const completed = completedRes.data?.data?.total ?? 0;
          const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
          return [courseId, { total, completed, percent }] as const;
        }));
        if (!mounted) return;
        setStats(Object.fromEntries(statsEntries));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Không thể tải dữ liệu");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const items = enrollments;

  const isComplete = (courseId: string) => {
    const s = stats[courseId];
    return s ? s.percent >= 100 && s.total > 0 : false;
  };

  const inProgress = useMemo(
    () => items.filter((e) => !isComplete(e.courseId)),
    [items, stats]
  );
  const completed = useMemo(
    () => items.filter((e) => isComplete(e.courseId)),
    [items, stats]
  );
  const visible = tab === "IN_PROGRESS" ? inProgress : completed;

  return (
    <Stack spacing={2} sx={{ maxWidth: 1080, mx: "auto", px: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>My Learning</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            label={`In Progress (${inProgress.length})`}
            color={tab === "IN_PROGRESS" ? "primary" : "default"}
            onClick={() => setTab("IN_PROGRESS")}
            variant={tab === "IN_PROGRESS" ? "filled" : "outlined"}
            size="small"
          />
          <Chip
            label={`Completed (${completed.length})`}
            color={tab === "COMPLETED" ? "primary" : "default"}
            onClick={() => setTab("COMPLETED")}
            variant={tab === "COMPLETED" ? "filled" : "outlined"}
            size="small"
          />
        </Box>
      </Box>
      <Divider />

      {loading && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="body2">Đang tải danh sách khóa học...</Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </Paper>
      )}

      {error && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {!loading && !error && visible.length === 0 && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography>
            {tab === "IN_PROGRESS" ? "Không có khóa học đang học." : "Chưa hoàn thành khóa học nào."}
          </Typography>
        </Paper>
      )}

      {!loading && !error && visible.map((enrollment) => {
        const s = stats[enrollment.courseId];
        const progressPct = s ? s.percent : 0;
        const detailPath = PATH_USER.courseDetail.replace(":id", enrollment.courseId);
        const isOpen = !!expanded[enrollment.courseId];
        const lessonsState = lessonsMap[enrollment.courseId];
        const toggle = async () => {
          setExpanded((prev) => ({ ...prev, [enrollment.courseId]: !prev[enrollment.courseId] }));
          const nowOpen = !isOpen;
          if (nowOpen && !lessonsState) {
          setLessonsMap((m) => ({ ...m, [enrollment.courseId]: { loading: true, error: null, items: [], page: 1, size: 10, total: 0 } }));
          try {
          const page = 1; const size = 20;
          // 1) Fetch lesson progress for the course
          const res = await axiosClient.get<ApiResponse<any>>(ROUTES_API_LESSON_PROGRESS.MY_PROGRESS, { params: { courseId: enrollment.courseId, pageNumber: page, pageSize: size } });
          const rawItems: LessonProgItem[] = res.data?.data?.items ?? [];
          const total: number = res.data?.data?.total ?? rawItems.length;

          // 2) De-duplicate by lessonId to avoid showing the same lesson multiple times
            const dedupedMap = new Map<string, LessonProgItem>();
              for (const it of rawItems) {
                 if (!dedupedMap.has(it.lessonId)) dedupedMap.set(it.lessonId, it);
               }
               let items = Array.from(dedupedMap.values());

               // 3) Load lesson titles for the course and attach to items for better UI
               try {
                 // Page size is limited to 100 by API validation; paginate if needed
                 const pageSize = 100;
                 let pageNum = 1;
                 const acc: Array<{ id: string; title?: string }> = [];
                 const first = await axiosClient.get<ApiResponse<any>>(ROUTES_API_LESSON.PREVIEW, { params: { courseId: enrollment.courseId, pageNumber: pageNum, pageSize: pageSize } });
                 const firstList: Array<{ id: string; title?: string }> = first.data?.data?.items ?? first.data?.data ?? [];
                 const totalLessons: number = first.data?.data?.total ?? firstList.length;
                 acc.push(...firstList);
                 const totalPages = Math.ceil(totalLessons / pageSize);
                 for (let p = 2; p <= totalPages; p++) {
                   const r = await axiosClient.get<ApiResponse<any>>(ROUTES_API_LESSON.PREVIEW, { params: { courseId: enrollment.courseId, pageNumber: p, pageSize: pageSize } });
                   const list: Array<{ id: string; title?: string }> = r.data?.data?.items ?? r.data?.data ?? [];
                   if (list?.length) acc.push(...list);
                 }
                 const titleById = new Map<string, string>();
                 for (const l of acc) {
                   if (l?.id) titleById.set(l.id, l.title ?? "");
                 }
                 items = items.map((it) => ({ ...it, lesson: { title: titleById.get(it.lessonId) || undefined } }));
               } catch {}

               setLessonsMap((m) => ({ ...m, [enrollment.courseId]: { loading: false, error: null, items, page, size, total } }));
             } catch (e: any) {
               setLessonsMap((m) => ({ ...m, [enrollment.courseId]: { loading: false, error: e?.message || 'Không thể tải bài học', items: [], page: 1, size: 10, total: 0 } }));
             }
           }
        };
        return (
          <Paper key={enrollment.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar src={enrollment.courseImageUrl || undefined} variant="rounded" sx={{ width: 56, height: 56 }}>
                {enrollment.courseTitle?.charAt(0) || "C"}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography noWrap sx={{ fontWeight: 700, flexGrow: 1 }}>{enrollment.courseTitle || "Khóa học"}</Typography>
                  <Tooltip title={isOpen ? 'Thu gọn' : 'Xem các bài học đã tham gia'}>
                    <IconButton size="small" onClick={toggle} sx={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                      <ExpandMoreIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <LinearProgress variant="determinate" value={progressPct} sx={{ height: 8, borderRadius: 1 }} />
                  <Typography variant="caption" color="text.secondary">{progressPct}% complete</Typography>
                </Box>
              </Box>
              {tab === "COMPLETED" ? (
                <Button startIcon={<CheckCircleOutlineIcon />} variant="text" onClick={() => navigate(detailPath)}>Xem chứng chỉ</Button>
              ) : (
                <Button startIcon={<PlayArrowIcon />} variant="text" onClick={() => navigate(detailPath)}>Tiếp tục học</Button>
              )}
            </Box>
            {isOpen && (
              <Box sx={{ mt: 2, pl: 7 }}>
                {(!lessonsState || lessonsState.loading) && (
                  <Stack spacing={1.25}>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} variant="rounded" height={52} />
                    ))}
                  </Stack>
                )}
                {lessonsState?.error && (
                  <Typography variant="body2" color="error">{lessonsState.error}</Typography>
                )}
                {lessonsState && !lessonsState.loading && !lessonsState.error && (
                  <Stack spacing={1.25}>
                    {lessonsState.items.length === 0 && (
                      <Typography variant="body2" color="text.secondary">Chưa tham gia bài học nào.</Typography>
                    )}
                    {lessonsState.items.map((lp) => {
                      const title = lp.lesson?.title || `Bài học ${lp.lessonId}`;
                      const lsDetail = PATH_USER.lessonDetail.replace(":id", lp.lessonId);
                      const color = lp.status === LessonStatus.Completed ? 'success' : (lp.status === LessonStatus.InProgress ? 'warning' : 'default');
                      return (
                        <Paper key={lp.id} variant="outlined" sx={{ p: 1.25, borderRadius: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <MenuBookIcon fontSize="small" color="action" />
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography noWrap sx={{ fontWeight: 600 }}>{title}</Typography>
                            <Chip size="small" label={lp.status} color={color as any} sx={{ mt: 0.25 }} />
                          </Box>
                          <Button size="small" variant="text" onClick={() => navigate(lsDetail)}>
                            {lp.status === LessonStatus.Completed ? 'Xem lại' : 'Tiếp tục học'}
                          </Button>
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
