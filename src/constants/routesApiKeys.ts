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

export const ROUTES_API_AUTH = {
  // Authentication endpoints
  LOGIN: path(ROOTS_AUTH, `/login`),
  REGISTER: path(ROOTS_AUTH, `/register`),
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
  PROFILE: path(ROOTS_ACCOUNT, `/profile`), // GET /api/v1/accounts/profile
};


export const ROUTES_API_STUDENT = {
  // Student endpoints
  GET_ALL: ROOTS_STUDENT, // GET /api/v1/students (with pagination)
  GET_BY_USER: path(ROOTS_STUDENT, `/by-user`), // GET /api/v1/students/by-user
  CREATE: ROOTS_STUDENT, // POST /api/v1/students
  UPDATE: (id: string) => path(ROOTS_STUDENT, `/${id}`), // PUT /api/v1/students/{id}
};

export const ROUTES_API_COURSE = {
  // Course endpoints
  GET_ALL: ROOTS_COURSE, // GET /api/v1/courses (with pagination)
  GET_BY_ID: (id: string) => path(ROOTS_COURSE, `/${id}`), // GET /api/v1/courses/{id}
  CREATE: ROOTS_COURSE, // POST /api/v1/courses
  UPDATE: (id: string) => path(ROOTS_COURSE, `/${id}`), // PUT /api/v1/courses/{id}
  DELETE: (id: string) => path(ROOTS_COURSE, `/${id}`), // DELETE /api/v1/courses/{id}
  RESTORE: (id: string) => path(ROOTS_COURSE, `/${id}/restore`), // POST /api/v1/courses/{id}/restore
};

export const ROUTES_API_LESSON = {
  // Lesson endpoints
  GET_ALL: path(ROOTS_LESSON, `/admin`), // GET /api/v1/lessons/admin (for Admin)
  GET_BY_ID: (id: string) => path(ROOTS_LESSON, `/${id}`), // GET /api/v1/lessons/{id}
  BY_COURSE: (courseId: string) => path(ROOTS_LESSON, `/by-course/${courseId}`), // GET /api/v1/lessons/by-course/{courseId}
  PREVIEW: path(ROOTS_LESSON, `/preview`), // GET /api/v1/lessons/preview
  CREATE: ROOTS_LESSON, // POST /api/v1/lessons
  UPDATE: (id: string) => path(ROOTS_LESSON, `/${id}`), // PUT /api/v1/lessons/{id}
  DELETE: (id: string) => path(ROOTS_LESSON, `/${id}`), // DELETE /api/v1/lessons/{id}
  RESTORE: (id: string) => path(ROOTS_LESSON, `/${id}/restore`), // POST /api/v1/lessons/{id}/restore
};

export const ROUTES_API_CHALLENGE = {
  // Challenge endpoints for users
  GET_BY_ID: (id: string) => path(ROOTS_CHALLENGE, `/${id}`), // GET /api/v1/challenges/{id} (for users)
  BY_LESSON: (lessonId: string) => path(ROOTS_CHALLENGE, `/lesson/${lessonId}`), // GET /api/v1/challenges/lesson/{lessonId} (for users)
  
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
  GET_ALL: path(ROOTS_ENROLLMENT, `/admin`), // GET /api/v1/enrollments/admin (for Admin)
  GET_BY_ID: (id: string) => path(ROOTS_ENROLLMENT, `/${id}`), // GET /api/v1/enrollments/{id}
  CREATE: ROOTS_ENROLLMENT, // POST /api/v1/enrollments
  COMPLETE: (id: string) => path(ROOTS_ENROLLMENT, `/${id}/complete`), // POST /api/v1/enrollments/{id}/complete
  MY_ENROLLMENTS: path(ROOTS_ENROLLMENT, `/my-enrollments`), // GET /api/v1/enrollments/my-enrollments
};

export const ROUTES_API_SUBMISSION = {
  // Submission endpoints
  GET_ALL: ROOTS_SUBMISSION, // GET /api/v1/submissions (with pagination)
  GET_BY_ID: (id: string) => path(ROOTS_SUBMISSION, `/${id}`), // GET /api/v1/submissions/{id}
  CREATE: ROOTS_SUBMISSION, // POST /api/v1/submissions
  UPDATE: (id: string) => path(ROOTS_SUBMISSION, `/${id}`), // PUT /api/v1/submissions/{id}
  DELETE: (id: string) => path(ROOTS_SUBMISSION, `/${id}`), // DELETE /api/v1/submissions/{id}
  MY_SUBMISSIONS: path(ROOTS_SUBMISSION, `/my-submissions`), // GET /api/v1/submissions/my-submissions
  BY_CHALLENGE: (challengeId: string) => path(ROOTS_SUBMISSION, `/by-challenge/${challengeId}`), // GET /api/v1/submissions/by-challenge/{challengeId}
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
