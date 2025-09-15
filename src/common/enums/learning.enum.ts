// Enrollment status
export enum EnrollmentStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  PAUSED = "PAUSED",
  CANCELLED = "CANCELLED",
}

// Submission star ratings
export enum SubmissionStar {
  ZERO = 0,
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

// Course status
export enum CourseStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED",
}

// Lesson completion status
export enum LessonStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

// Star rating labels for UI
export const STAR_LABELS = {
  [SubmissionStar.ZERO]: "Chưa đánh giá",
  [SubmissionStar.ONE]: "1 sao - Rất tệ",
  [SubmissionStar.TWO]: "2 sao - Tệ",
  [SubmissionStar.THREE]: "3 sao - Trung bình",
  [SubmissionStar.FOUR]: "4 sao - Tốt",
  [SubmissionStar.FIVE]: "5 sao - Xuất sắc",
} as const;

// Progress levels for UI display
export const PROGRESS_LEVELS = {
  BEGINNER: { min: 0, max: 0.25, label: "Mới bắt đầu", color: "#FFC107" },
  NOVICE: { min: 0.25, max: 0.5, label: "Người mới", color: "#FF9800" },
  INTERMEDIATE: { min: 0.5, max: 0.75, label: "Trung cấp", color: "#2196F3" },
  ADVANCED: { min: 0.75, max: 1, label: "Nâng cao", color: "#4CAF50" },
} as const;