import { useState, useEffect } from "react";
import { Box, Grid } from "@mui/material";

import ProfileHeaderCard from "sections/user/studentProfile/parts/ProfileHeaderCard";
import StatsRow from "sections/user/studentProfile/parts/StatsRow";
import BadgeCard from "sections/user/studentProfile/parts/BadgeCard";
import LearningProgressCard from "sections/user/studentProfile/parts/LearningProgressCard";
import RecentChallengesCard from "sections/user/studentProfile/parts/RecentChallengesCard";

import { useAppDispatch, useAppSelector } from "store/config";
import { getMyEnrollmentsThunk } from "store/enrollment/enrollmentThunks";
import { getMySubmissionsThunk } from "store/submission/submissionThunks";
import { getMyLessonProgress } from "store/lessonProgress/lessonProgressSlice";
import { getMyChallengeProcesses } from "store/challengeProcess/challengeProcessSlice";
import StudentProfileEdit from "./StudentProfileEdit";
import { LessonProgressSortBy, SortDirection } from "common/@types/lessonProgress";

export default function StudentProfileDisplay() {
  const dispatch = useAppDispatch();
  const { currentStudent } = useAppSelector((state) => state.student);
  const { myEnrollments } = useAppSelector((state) => state.enrollment);
  const { mySubmissions } = useAppSelector((state) => state.submission);
  const { myLessonProgress } = useAppSelector((state) => state.lessonProgress);
  const { myChallengeProcesses } = useAppSelector((state) => state.challengeProcess);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch real data when component mounts
    if (currentStudent?.data) {
      dispatch(getMyEnrollmentsThunk({ pageNumber: 1, pageSize: 100 }));
      dispatch(getMySubmissionsThunk({ pageNumber: 1, pageSize: 100 }));
      dispatch(getMyLessonProgress({ pageNumber: 1, pageSize: 100, sortBy: LessonProgressSortBy.LessonOrder, sortDirection: SortDirection.Ascending }));
      dispatch(getMyChallengeProcesses({ page: 1, size: 100 }));
    }
  }, [dispatch, currentStudent]);

  if (!currentStudent || !currentStudent.data) {
    return null;
  }

  const student = currentStudent.data;


  // Real data tính toán từ API responses  
  const enrollmentsArray = myEnrollments?.data?.items || [];
  const submissionsArray = mySubmissions?.data?.items || []; // ✅ Fixed: data -> items
  const lessonProgressArray = myLessonProgress?.data?.items || [];
  const challengeProcessesArray = myChallengeProcesses?.data?.items || [];
  
  // Tính "tiến độ học tập": ưu tiên phần trăm từ enrollments (Progress 0..1), kết hợp lesson progress khi cần
  type CourseAgg = { title: string; total: number; completed: number; percent?: number };
  const courseProgressMap = new Map<string, CourseAgg>();

  // 1) Nạp từ enrollments trước (ổn định nhất) — khóa theo EnrollmentId để không bị trùng
  enrollmentsArray.forEach((en: any) => {
    const key = en.id || en.enrollmentId || en.courseId || 'unknown';
    let percent: number | undefined;
    const totalLessons = en.totalLessonsCount ?? 0;
    const completedLessons = en.completedLessonsCount ?? 0;
    if (totalLessons > 0) {
      percent = Math.round((completedLessons / totalLessons) * 100);
    } else if (typeof en.progress === 'number') {
      // BE có thể trả 0..1 hoặc số %/điểm — clamp về [0,100]
      percent = en.progress <= 1 ? Math.round(en.progress * 100) : Math.min(100, Math.round(en.progress));
    }
    courseProgressMap.set(key, {
      title: en.courseTitle || 'Khóa học',
      total: totalLessons,
      completed: completedLessons,
      percent: typeof percent === 'number' ? Math.max(0, Math.min(100, percent)) : undefined,
    });
  });

  // 2) Bổ sung từ lesson progress (nếu có) để tăng độ chính xác khi enrollments chưa cập nhật
  lessonProgressArray.forEach((lp: any) => {
    const key = lp.enrollmentId || 'unknown';
    const existing: CourseAgg = courseProgressMap.get(key) || { title: lp.courseTitle || 'Khóa học', total: 0, completed: 0 };
    existing.title = lp.courseTitle || existing.title;
    existing.total = Math.max(existing.total, lp.totalChallenges || existing.total); // nếu BE không trả tổng bài học, giữ nguyên
    // BE trả Status là số (0..3). 3 = Completed
    const isCompleted = typeof lp.status === 'number' ? lp.status === 3 : (lp.status === 'Completed');
    if (isCompleted) {
      existing.completed = Math.max(existing.completed, (existing.completed ?? 0) + 1);
    }
    const computed = (existing.total && existing.total > 0)
      ? Math.round((existing.completed / existing.total) * 100)
      : existing.percent; // nếu chưa biết total, giữ percent cũ
    if (typeof computed === 'number') {
      existing.percent = Math.max(existing.percent ?? 0, Math.min(100, computed));
    }
    courseProgressMap.set(key, existing);
  });

  const learningProgress = Array.from(courseProgressMap.values() as Iterable<CourseAgg>).map((c, index) => ({
    subject: c.title,
    progress: typeof c.percent === 'number' ? c.percent : (c.total ? Math.round((c.completed / c.total) * 100) : 0),
    color: ["#4caf50", "#2196f3", "#ff9800"][index % 3]
  })).slice(0, 3);

  // Tổng điểm từ submissions (3 sao tối đa)
  const totalPoints = submissionsArray.reduce((total: number, submission: any) => total + ((submission.star || 0) * 10), 0);

  const realData = {
  totalEnrollments: enrollmentsArray.length || student.enrollmentsCount || 0,
  totalSubmissions: submissionsArray.length || student.submissionsCount || 0,
  completedCourses: enrollmentsArray.filter((enrollment: any) => enrollment.isCompleted)?.length || 0,
  totalPoints,
  learningProgress,
  };
  
  // Phân phối sao từ challenge processes để hiển thị biểu đồ thanh (chỉ 1..3 sao)
  const starBuckets = [1,2,3].map((s) => ({
   star: s,
    count: challengeProcessesArray.filter((cp: any) => (cp.bestStar || 0) === s).length,
   }));
  
  const isLoading = myEnrollments.isLoading || mySubmissions.isLoading || myLessonProgress.isLoading || myChallengeProcesses.isLoading;
  
  if (isEditing) {
    return (
      <StudentProfileEdit
        onEditComplete={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Box sx={{ 
      bgcolor: "transparent",
      minHeight: "100vh", 
      p: { xs: 2, md: 3 },
      borderRadius: 4,
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
    }}>
      <ProfileHeaderCard student={student} onEdit={() => setIsEditing(true)} />

      <StatsRow
        totalEnrollments={realData.totalEnrollments}
        totalSubmissions={realData.totalSubmissions}
        completedCourses={realData.completedCourses}
        totalPoints={realData.totalPoints}
        loading={isLoading}
      />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <BadgeCard totalPoints={realData.totalPoints} loading={isLoading} />
        </Grid>
        <Grid item xs={12}>
          <LearningProgressCard items={realData.learningProgress} loading={isLoading} activityCount={submissionsArray.length} />
        </Grid>
        <Grid item xs={12}>
          <RecentChallengesCard items={challengeProcessesArray} starBuckets={starBuckets} />
        </Grid>
      </Grid>
    </Box>
  );
}