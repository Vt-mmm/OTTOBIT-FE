
import { path } from "utils";

// Backend sử dụng số nhiều (authentications, accounts, maps, lesson-processes)
const ROOTS_AUTH = "/api/v1/authentications";
const ROOTS_ACCOUNT = "/api/v1/accounts";
const ROOTS_STUDENT = "/api/v1/students";
const ROOTS_COURSE = "/api/v1/courses";
const ROOTS_LESSON = "/api/v1/lessons";
const ROOTS_CHALLENGE = "/api/v1/challenges";
const ROOTS_ENROLLMENT = "/api/v1/enrollments";
const ROOTS_SUBMISSION = "/api/v1/submissions";
const ROOTS_MAP = "/api/v1/maps";
const ROOTS_CHALLENGE_PROCESS = "/api/v1/challenge-process";
const ROOTS_LESSON_PROGRESS = "/api/v1/lesson-process";
// New roots based on backend controllers/constants
const ROOTS_COMPONENT = "/api/v1/components";
const ROOTS_IMAGE = "/api/v1/images";
const ROOTS_ROBOT = "/api/v1/robots";
const ROOTS_COURSE_ROBOT = "/api/v1/course-robots";
const ROOTS_STUDENT_ROBOT = "/api/v1/student-robots";
const ROOTS_COURSE_MAP = "/api/v1/course-maps";
const ROOTS_LESSON_RESOURCE = "/api/v1/lesson-resources";
const ROOTS_LESSON_NOTE = "/api/v1/lesson-notes";
const ROOTS_ACTIVATION_CODE = "/api/v1/activation-codes";

export const ROUTES_API_AUTH = {
  // Authentication endpoints
  LOGIN: path(ROOTS_AUTH, `/login`),
  REGISTER: path(ROOTS_AUTH, `/register`),
  ADMIN_REGISTER: path(ROOTS_AUTH, `/admin-register`),
  REFRESH_TOKEN: path(ROOTS_AUTH, `/refresh-token`),
  LOGIN_GOOGLE: path(ROOTS_AUTH, `/login-google`),
  CONFIRM_EMAIL: path(ROOTS_AUTH, `/confirm-email`),
  RESEND_EMAIL_CONFIRMATION: path(ROOTS_AUTH, `/resend-email-confirmation`),

  // Account endpoints
  FORGOT_PASSWORD: path(ROOTS_ACCOUNT, `/forgot-password`),
  RESET_PASSWORD: path(ROOTS_ACCOUNT, `/reset-password`),
  CHANGE_PASSWORD: path(ROOTS_ACCOUNT, `/change-password`),
};

// Account profile endpoints
export const ROUTES_API_ACCOUNT = {
  PROFILE: path(ROOTS_ACCOUNT, `/profile`), // GET/PUT /api/v1/accounts/profile
};

export const ROUTES_API_STUDENT = {
  // Student endpoints (admin GET list, user-specific by-user)
  GET_ALL: ROOTS_STUDENT, // GET /api/v1/students (Admin)
  GET_BY_USER: path(ROOTS_STUDENT, `/by-user`), // GET /api/v1/students/by-user (User)
  CREATE: ROOTS_STUDENT, // POST /api/v1/students (User)
  UPDATE: (id: string) => path(ROOTS_STUDENT, `/${id}`), // PUT /api/v1/students/{id} (User)
  ADMIN_GET_BY_ID: (id: string) => path(ROOTS_STUDENT, `/${id}`), // GET /api/v1/students/{id} (Admin)
};

export const ROUTES_API_COURSE = {
  // Course endpoints
  GET_ALL_FOR_ADMIN: path(ROOTS_COURSE, `/admin`), // GET /api/v1/courses/admin (with pagination)
  GET_BY_ID_FOR_ADMIN: (id: string) => path(ROOTS_COURSE, `/admin/${id}`), // GET /api/v1/courses/admin/{id}
  GET_ALL: ROOTS_COURSE, // GET /api/v1/courses (with pagination)
  GET_BY_ID: (id: string) => path(ROOTS_COURSE, `/${id}`), // GET /api/v1/courses/{id}
  CREATE: ROOTS_COURSE, // POST /api/v1/courses
  UPDATE: (id: string) => path(ROOTS_COURSE, `/${id}`), // PUT /api/v1/courses/{id}
  DELETE: (id: string) => path(ROOTS_COURSE, `/${id}`), // DELETE /api/v1/courses/{id}
  RESTORE: (id: string) => path(ROOTS_COURSE, `/${id}/restore`), // POST /api/v1/courses/{id}/restore
};

export const ROUTES_API_LESSON = {
  // Lesson endpoints
  GET_BY_ID_FOR_ADMIN: (id: string) => path(ROOTS_LESSON, `/admin/${id}`), // GET /api/v1/lessons/admin/{id}
  GET_ALL_FOR_ADMIN: path(ROOTS_LESSON, `/admin`), // GET /api/v1/lessons/admin (Admin)
  // Backward-compatible alias
  GET_ALL: path(ROOTS_LESSON, `/admin`),
  GET_BY_ID: (id: string) => path(ROOTS_LESSON, `/${id}`), // GET /api/v1/lessons/{id} (User; returns preview if not enrolled)
  PREVIEW: path(ROOTS_LESSON, `/preview`), // GET /api/v1/lessons/preview
  // Legacy alias to fetch lessons by course via preview + courseId filter
  BY_COURSE: (courseId: string) => path(ROOTS_LESSON, `/preview?courseId=${courseId}`),
  CREATE: ROOTS_LESSON, // POST /api/v1/lessons
  UPDATE: (id: string) => path(ROOTS_LESSON, `/${id}`), // PUT /api/v1/lessons/{id}
  DELETE: (id: string) => path(ROOTS_LESSON, `/${id}`), // DELETE /api/v1/lessons/{id}
  RESTORE: (id: string) => path(ROOTS_LESSON, `/${id}/restore`), // POST /api/v1/lessons/{id}/restore
};

export const ROUTES_API_CHALLENGE = {
  // Challenge endpoints for users
  GET_BY_ID: (id: string) => path(ROOTS_CHALLENGE, `/${id}`), // GET /api/v1/challenges/{id} (User)
  BY_LESSON: (lessonId: string) => path(ROOTS_CHALLENGE, `/lesson/${lessonId}`), // GET /api/v1/challenges/lesson/{lessonId} (User)
  SOLUTION: (id: string) => path(ROOTS_CHALLENGE, `/${id}/solution`), // GET /api/v1/challenges/{id}/solution (User)

  // Challenge endpoints for admin
  ADMIN_GET_ALL: path(ROOTS_CHALLENGE, `/admin`), // GET /api/v1/challenges/admin
  ADMIN_GET_BY_ID: (id: string) => path(ROOTS_CHALLENGE, `/admin/${id}`), // GET /api/v1/challenges/admin/{id}
  CREATE: ROOTS_CHALLENGE, // POST /api/v1/challenges
  ADMIN_UPDATE: (id: string) => path(ROOTS_CHALLENGE, `/admin/${id}`), // PUT /api/v1/challenges/admin/{id}
  ADMIN_DELETE: (id: string) => path(ROOTS_CHALLENGE, `/admin/${id}`), // DELETE /api/v1/challenges/admin/{id}
  ADMIN_RESTORE: (id: string) => path(ROOTS_CHALLENGE, `/admin/${id}/restore`), // POST /api/v1/challenges/admin/{id}/restore
};

export const ROUTES_API_ENROLLMENT = {
  // Enrollment endpoints
  ADMIN_GET_ALL: path(ROOTS_ENROLLMENT, `/admin`), // GET /api/v1/enrollments/admin (Admin)
  // Backward-compatible alias
  GET_ALL: path(ROOTS_ENROLLMENT, `/admin`),
  ADMIN_GET_BY_ID: (id: string) => path(ROOTS_ENROLLMENT, `/admin/${id}`), // GET /api/v1/enrollments/admin/{id} (Admin)
  GET_BY_ID: (id: string) => path(ROOTS_ENROLLMENT, `/${id}`), // GET /api/v1/enrollments/{id} (User)
  CREATE: ROOTS_ENROLLMENT, // POST /api/v1/enrollments (User)
  // Legacy endpoint kept for compatibility; backend may not implement anymore
  COMPLETE: (id: string) => path(ROOTS_ENROLLMENT, `/${id}/complete`), // POST /api/v1/enrollments/{id}/complete
  MY_ENROLLMENTS: path(ROOTS_ENROLLMENT, `/my-enrollments`), // GET /api/v1/enrollments/my-enrollments (User)
};

export const ROUTES_API_SUBMISSION = {
  // Submission endpoints
  ADMIN_GET_ALL: ROOTS_SUBMISSION, // GET /api/v1/submissions (Admin)
  // Backward-compatible alias
  GET_ALL: ROOTS_SUBMISSION,
  GET_BY_ID: (id: string) => path(ROOTS_SUBMISSION, `/${id}`), // GET /api/v1/submissions/{id} (User/Admin)
  CREATE: ROOTS_SUBMISSION, // POST /api/v1/submissions (User)
  // Legacy endpoints kept for compatibility; backend may not implement anymore
  UPDATE: (id: string) => path(ROOTS_SUBMISSION, `/${id}`), // PUT /api/v1/submissions/{id}
  DELETE: (id: string) => path(ROOTS_SUBMISSION, `/${id}`), // DELETE /api/v1/submissions/{id}
  BY_CHALLENGE: (challengeId: string) => path(ROOTS_SUBMISSION, `/by-challenge/${challengeId}`), // GET /api/v1/submissions/by-challenge/{challengeId}
  MY_SUBMISSIONS: path(ROOTS_SUBMISSION, `/my-submissions`), // GET /api/v1/submissions/my-submissions (User)
};

export const ROUTES_API_MAP = {
  // Map endpoints
  GET_ALL: ROOTS_MAP, // GET /api/v1/maps (with pagination)
  GET_BY_ID: (id: string) => path(ROOTS_MAP, `/${id}`), // GET /api/v1/maps/{id}
  CREATE: ROOTS_MAP, // POST /api/v1/maps
  UPDATE: (id: string) => path(ROOTS_MAP, `/${id}`), // PUT /api/v1/maps/{id}
  DELETE: (id: string) => path(ROOTS_MAP, `/${id}`), // DELETE /api/v1/maps/{id}
  RESTORE: (id: string) => path(ROOTS_MAP, `/${id}/restore`), // POST /api/v1/maps/{id}/restore
};

export const ROUTES_API_CHALLENGE_PROCESS = {
  // Challenge Process endpoints
  MY_CHALLENGES: path(ROOTS_CHALLENGE_PROCESS, `/my-challenges`), // GET /api/v1/challenge-process/my-challenges
};

export const ROUTES_API_LESSON_PROGRESS = {
  // Lesson Progress endpoints
  START_LESSON: (lessonId: string) => path(ROOTS_LESSON_PROGRESS, `/start-lesson/${lessonId}`), // POST /api/v1/lesson-process/start-lesson/{lessonId}
  MY_PROGRESS: path(ROOTS_LESSON_PROGRESS, `/my-progress`), // GET /api/v1/lesson-process/my-progress
};

// New: Component endpoints
export const ROUTES_API_COMPONENT = {
  GET_ALL: ROOTS_COMPONENT, // GET /api/v1/components
  GET_BY_ID: (id: string) => path(ROOTS_COMPONENT, `/${id}`), // GET /api/v1/components/{id}
  CREATE: ROOTS_COMPONENT, // POST /api/v1/components (Admin)
  UPDATE: (id: string) => path(ROOTS_COMPONENT, `/${id}`), // PUT /api/v1/components/{id} (Admin)
  DELETE: (id: string) => path(ROOTS_COMPONENT, `/${id}`), // DELETE /api/v1/components/{id} (Admin)
};

// New: Image endpoints
export const ROUTES_API_IMAGE = {
  GET_ALL: ROOTS_IMAGE, // GET /api/v1/images
  GET_BY_ID: (id: string) => path(ROOTS_IMAGE, `/${id}`), // GET /api/v1/images/{id}
  CREATE: ROOTS_IMAGE, // POST /api/v1/images (Admin)
  UPDATE: (id: string) => path(ROOTS_IMAGE, `/${id}`), // PUT /api/v1/images/{id} (Admin)
  DELETE: (id: string) => path(ROOTS_IMAGE, `/${id}`), // DELETE /api/v1/images/{id} (Admin)
};

// New: Robot endpoints
export const ROUTES_API_ROBOT = {
  GET_ALL: ROOTS_ROBOT, // GET /api/v1/robots
  GET_BY_ID: (id: string) => path(ROOTS_ROBOT, `/${id}`), // GET /api/v1/robots/{id}
  CREATE: ROOTS_ROBOT, // POST /api/v1/robots (Admin)
  UPDATE: (id: string) => path(ROOTS_ROBOT, `/${id}`), // PUT /api/v1/robots/{id} (Admin)
  DELETE: (id: string) => path(ROOTS_ROBOT, `/${id}`), // DELETE /api/v1/robots/{id} (Admin)
};

// New: Course-Robot endpoints
export const ROUTES_API_COURSE_ROBOT = {
  GET_ALL: ROOTS_COURSE_ROBOT, // GET /api/v1/course-robots
  GET_BY_COURSE: (courseId: string) => path(ROOTS_COURSE_ROBOT, `/course/${courseId}`), // GET /api/v1/course-robots/course/{courseId}
  GET_BY_ID: (id: string) => path(ROOTS_COURSE_ROBOT, `/${id}`), // GET /api/v1/course-robots/{id}
  CREATE: ROOTS_COURSE_ROBOT, // POST /api/v1/course-robots (Admin)
  UPDATE: (id: string) => path(ROOTS_COURSE_ROBOT, `/${id}`), // PUT /api/v1/course-robots/{id} (Admin)
  DELETE: (id: string) => path(ROOTS_COURSE_ROBOT, `/${id}`), // DELETE /api/v1/course-robots/{id} (Admin)
};

// New: Student-Robot endpoints
export const ROUTES_API_STUDENT_ROBOT = {
  MY_ROBOTS: path(ROOTS_STUDENT_ROBOT, `/my-robots`), // GET /api/v1/student-robots/my-robots (User)
  ACTIVATE: path(ROOTS_STUDENT_ROBOT, `/activate`), // POST /api/v1/student-robots/activate (User)
  UPDATE_SETTINGS: (id: string) => path(ROOTS_STUDENT_ROBOT, `/${id}/settings`), // PUT /api/v1/student-robots/{id}/settings (User)
  GET_BY_ID: (id: string) => path(ROOTS_STUDENT_ROBOT, `/${id}`), // GET /api/v1/student-robots/{id} (User)
};

// New: Course-Map endpoints
export const ROUTES_API_COURSE_MAP = {
  GET_ALL: ROOTS_COURSE_MAP, // GET /api/v1/course-maps (Admin)
  GET_BY_ID: (id: string) => path(ROOTS_COURSE_MAP, `/${id}`), // GET /api/v1/course-maps/{id} (Admin)
  CREATE: ROOTS_COURSE_MAP, // POST /api/v1/course-maps (Admin)
  UPDATE: (id: string) => path(ROOTS_COURSE_MAP, `/${id}`), // PUT /api/v1/course-maps/{id} (Admin)
  DELETE: (id: string) => path(ROOTS_COURSE_MAP, `/${id}`), // DELETE /api/v1/course-maps/{id} (Admin)
  RESTORE: (id: string) => path(ROOTS_COURSE_MAP, `/${id}/restore`), // POST /api/v1/course-maps/{id}/restore (Admin)
};

// New: Lesson-Resource endpoints
export const ROUTES_API_LESSON_RESOURCE = {
  GET_BY_ID: (id: string) => path(ROOTS_LESSON_RESOURCE, `/${id}`), // GET /api/v1/lesson-resources/{id} (User)
  BY_LESSON: (lessonId: string) => path(ROOTS_LESSON_RESOURCE, `/lesson/${lessonId}`), // GET /api/v1/lesson-resources/lesson/{lessonId} (User)

  // Admin
  ADMIN_GET_ALL: path(ROOTS_LESSON_RESOURCE, `/admin`), // GET /api/v1/lesson-resources/admin (Admin)
  ADMIN_GET_BY_ID: (id: string) => path(ROOTS_LESSON_RESOURCE, `/admin/${id}`), // GET /api/v1/lesson-resources/admin/{id}
  CREATE: ROOTS_LESSON_RESOURCE, // POST /api/v1/lesson-resources (Admin)
  UPDATE: (id: string) => path(ROOTS_LESSON_RESOURCE, `/${id}`), // PUT /api/v1/lesson-resources/{id} (Admin)
  DELETE: (id: string) => path(ROOTS_LESSON_RESOURCE, `/${id}`), // DELETE /api/v1/lesson-resources/{id} (Admin)
  RESTORE: (id: string) => path(ROOTS_LESSON_RESOURCE, `/${id}/restore`), // POST /api/v1/lesson-resources/{id}/restore (Admin)
};

// New: Lesson-Note endpoints (User)
export const ROUTES_API_LESSON_NOTE = {
  CREATE: ROOTS_LESSON_NOTE, // POST /api/v1/lesson-notes (User)
  GET_BY_ID: (id: string) => path(ROOTS_LESSON_NOTE, `/${id}`), // GET /api/v1/lesson-notes/{id} (User)
  MY_NOTES: path(ROOTS_LESSON_NOTE, `/my-notes`), // GET /api/v1/lesson-notes/my-notes (User)
  UPDATE: (id: string) => path(ROOTS_LESSON_NOTE, `/${id}`), // PUT /api/v1/lesson-notes/{id} (User)
  DELETE: (id: string) => path(ROOTS_LESSON_NOTE, `/${id}`), // DELETE /api/v1/lesson-notes/{id} (User)
};

// New: Activation-Code endpoints
export const ROUTES_API_ACTIVATION_CODE = {
  // User endpoints
  VALIDATE: path(ROOTS_ACTIVATION_CODE, `/validate`), // POST /api/v1/activation-codes/validate (User) - kiểm tra mã có hợp lệ không (NOT IMPLEMENTED YET)
  REDEEM: path(ROOTS_ACTIVATION_CODE, `/redeem`), // POST /api/v1/activation-codes/redeem (User) - kích hoạt robot với mã
  // Admin endpoints
  ADMIN_GET_ALL: ROOTS_ACTIVATION_CODE, // GET /api/v1/activation-codes (Admin)
  ADMIN_GET_BY_ID: (id: string) => path(ROOTS_ACTIVATION_CODE, `/${id}`), // GET /api/v1/activation-codes/{id} (Admin)
  ADMIN_CREATE_BATCH: path(ROOTS_ACTIVATION_CODE, `/batch`), // POST /api/v1/activation-codes/batch (Admin) - Tạo nhiều mã cùng lúc
  ADMIN_DELETE: (id: string) => path(ROOTS_ACTIVATION_CODE, `/${id}`), // DELETE /api/v1/activation-codes/{id} (Admin - NOT IMPLEMENTED YET)
  ADMIN_REVOKE: path(ROOTS_ACTIVATION_CODE, `/revoke`), // POST /api/v1/activation-codes/revoke (Admin)
  ADMIN_EXPORT_CSV: path(ROOTS_ACTIVATION_CODE, `/export-csv`), // GET /api/v1/activation-codes/export-csv (Admin)
  ADMIN_UPDATE_STATUS: (id: string) => path(ROOTS_ACTIVATION_CODE, `/${id}/status`), // PUT /api/v1/activation-codes/{id}/status (Admin)
};
