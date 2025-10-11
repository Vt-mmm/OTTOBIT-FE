import {
  LessonResult,
  LessonProgressResult,
  LessonStatus,
} from "common/@types/lesson";

// Normalize status from BE (number enum) or FE (string enum) to a unified shape
function isCompletedStatus(status: number | string | undefined): boolean {
  if (status === undefined || status === null) return false;
  
  if (typeof status === "number") {
    // BE enum: 3 is Completed
    return status === 3;
  }
  
  // String enum - check multiple possible values
  const statusStr = String(status).toLowerCase();
  return statusStr === "completed" || statusStr === "3";
}

function isInProgressStatus(status: number | string | undefined): boolean {
  if (status === undefined || status === null) return false;
  
  if (typeof status === "number") {
    // BE enum: 2 is InProgress
    return status === 2;
  }
  
  // String enum - check multiple possible values
  const statusStr = String(status).toLowerCase();
  return statusStr === "inprogress" || statusStr === "2";
}

/**
 * Check if a lesson is accessible based on sequential completion logic
 * @param lesson - The lesson to check
 * @param lessonProgresses - Array of lesson progress
 * @returns boolean - true if lesson is accessible, false otherwise
 */
export function isLessonAccessible(
  lesson: LessonResult,
  lessonProgresses: LessonProgressResult[] = []
): boolean {
  // First lesson (order 1) is always accessible
  if (lesson.order <= 1) {
    return true;
  }

  // Check if all previous lessons in the same course are completed
  const previousLessons = lessonProgresses.filter(
    (progress) =>
      progress.lessonOrder < lesson.order && progress.lessonId !== lesson.id // Exclude current lesson
  );

  // For sequential access, we need all lessons from 1 to (current order - 1) to be completed
  for (let i = 1; i < lesson.order; i++) {
  const requiredProgress = previousLessons.find(
  (progress) => progress.lessonOrder === i
  );

  // If any previous lesson is not completed, current lesson is locked
  if (!requiredProgress || !isCompletedStatus(requiredProgress.status as any)) {
  return false;
  }
  }

  return true;
}

/**
 * Get lesson progress info (completion status, start date)
 * @param lessonId - The lesson ID to check
 * @param lessonProgresses - Array of lesson progress
 * @returns object with progress info
 */
export function getLessonProgress(
lessonId: string,
lessonProgresses: LessonProgressResult[] = []
) {
const progress = lessonProgresses.find((p) => p.lessonId === lessonId);

return {
isCompleted: isCompletedStatus(progress?.status as any),
isInProgress: isInProgressStatus(progress?.status as any),
isStarted: !!progress,
status: progress?.status ?? (LessonStatus as any).NotStarted,
startedAt: (progress as any)?.startedAt,
completedAt: (progress as any)?.completedAt,
currentChallengeOrder: (progress as any)?.currentChallengeOrder || 0,
  totalChallenges: (progress as any)?.totalChallenges ?? undefined,
  };
}

/**
 * Calculate overall course progress
 * @param lessons - All lessons in the course
 * @param lessonProgresses - Array of lesson progress
 * @returns progress statistics
 */
export function getCourseProgress(
  lessons: LessonResult[] = [],
  lessonProgresses: LessonProgressResult[] = []
) {
  const totalLessons = lessons.length;
  const completedLessons = lessonProgresses.filter(
    (progress) =>
      isCompletedStatus(progress.status as any) &&
      lessons.some((l) => l.id === progress.lessonId)
  ).length;

  const inProgressLessons = lessonProgresses.filter(
    (progress) =>
      isInProgressStatus(progress.status as any) &&
      lessons.some((l) => l.id === progress.lessonId)
  ).length;

  return {
    totalLessons,
    completedLessons,
    inProgressLessons,
    notStartedLessons: totalLessons - completedLessons - inProgressLessons,
    progressPercentage:
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
    isCompleted: totalLessons > 0 && completedLessons === totalLessons,
  };
}

/**
 * Get the next accessible lesson in a course
 * @param lessons - All lessons in the course (sorted by order)
 * @param lessonProgresses - Array of lesson progress
 * @returns the next lesson that user can access, or null if all completed
 */
export function getNextAccessibleLesson(
  lessons: LessonResult[] = [],
  lessonProgresses: LessonProgressResult[] = []
): LessonResult | null {
  // Sort lessons by order to ensure correct sequence
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  for (const lesson of sortedLessons) {
    const progress = getLessonProgress(lesson.id, lessonProgresses);

    // If lesson is not completed and is accessible, return it
    if (!progress.isCompleted && isLessonAccessible(lesson, lessonProgresses)) {
      return lesson;
    }
  }

  // All lessons are completed or none are accessible
  return null;
}

/**
 * Check if user has completed all lessons in a course
 * @param lessons - All lessons in the course
 * @param lessonProgresses - Array of lesson progress
 * @returns boolean - true if all lessons are completed
 */
export function isCourseCompleted(
  lessons: LessonResult[] = [],
  lessonProgresses: LessonProgressResult[] = []
): boolean {
  if (lessons.length === 0) return false;

  return lessons.every((lesson) => {
    const progress = getLessonProgress(lesson.id, lessonProgresses);
    return progress.isCompleted;
  });
}

/**
 * Get lesson status display text
 * @param lesson - The lesson
 * @param lessonProgresses - Array of lesson progress
 * @returns display text for lesson status
 */
export function getLessonStatusText(
  lesson: LessonResult,
  lessonProgresses: LessonProgressResult[] = []
): string {
  const progress = getLessonProgress(lesson.id, lessonProgresses);
  const isAccessible = isLessonAccessible(lesson, lessonProgresses);

  if (!isAccessible) {
    return " Bị khóa";
  }

  switch (progress.status) {
    case LessonStatus.Completed:
      return " Hoàn thành";
    case LessonStatus.InProgress:
      return " Đang học";
    case LessonStatus.NotStarted:
    default:
      return " Sẵn sàng";
  }
}

/**
 * Get lesson button text based on status
 * @param lesson - The lesson
 * @param lessonProgresses - Array of lesson progress
 * @returns button text
 */
export function getLessonButtonText(
  lesson: LessonResult,
  lessonProgresses: LessonProgressResult[] = []
): string {
  const progress = getLessonProgress(lesson.id, lessonProgresses);
  const isAccessible = isLessonAccessible(lesson, lessonProgresses);

  if (!isAccessible) {
    return " Chưa mở khóa";
  }

  switch (progress.status) {
    case LessonStatus.Completed:
      return " Xem lại";
    case LessonStatus.InProgress:
      return " Tiếp tục";
    case LessonStatus.NotStarted:
    default:
      return " Bắt đầu";
  }
}
