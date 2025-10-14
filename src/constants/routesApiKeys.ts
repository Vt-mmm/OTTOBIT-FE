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
const ROOTS_LESSON_PROGRESS = "/api/v1/lesson-process";
// New roots based on backend controllers/constants
const ROOTS_COMPONENT = "/api/v1/components";
const ROOTS_IMAGE = "/api/v1/images";
const ROOTS_ROBOT = "/api/v1/robots";
const ROOTS_COURSE_ROBOT = "/api/v1/course-robots";
const ROOTS_COURSE_MAP = "/api/v1/course-maps";
const ROOTS_LESSON_RESOURCE = "/api/v1/lesson-resources";
const ROOTS_LESSON_NOTE = "/api/v1/lesson-notes";
const ROOTS_ACTIVATION_CODE = "/api/v1/activation-codes";
const ROOTS_ROBOT_COMPONENT = "/api/v1/robot-components";
const ROOTS_CERTIFICATE = "/api/v1/certificates";
const ROOTS_CERTIFICATE_TEMPLATE = "/api/v1/certificate-templates";
const ROOTS_CART = "/api/v1/cart";
const ROOTS_CART_ITEM = "/api/v1/cart/items";
const ROOTS_ORDER = "/api/v1/orders";
const ROOTS_ORDER_ITEM = "/api/v1/order-items";
const ROOTS_PAYMENT_TRANSACTION = "/api/v1/payment-transactions";
const ROOTS_PAYOS = "/api/v1/payos";
const ROOTS_VOUCHER = "/api/v1/vouchers";
const ROOTS_VOUCHER_USAGE = "/api/v1/voucher-usages";
const ROOTS_BLOG = "/api/v1/Blog";
const ROOTS_TAG = "/api/v1/Tag";
const ROOTS_BLOG_COMMENT = "/api/v1/blog-comments";

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
  GET_PROFILE: path(ROOTS_ACCOUNT, `/profile`), // GET /api/v1/accounts/profile
  UPDATE_PROFILE: path(ROOTS_ACCOUNT, `/profile`), // PUT /api/v1/accounts/profile
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
  BY_COURSE: (courseId: string) =>
    path(ROOTS_LESSON, `/preview?courseId=${courseId}`),
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
  // User endpoints
  CREATE: ROOTS_SUBMISSION, // POST /api/v1/submissions
  GET_BY_ID: (id: string) => path(ROOTS_SUBMISSION, `/${id}`), // GET /api/v1/submissions/{id} (User only)
  MY_SUBMISSIONS: path(ROOTS_SUBMISSION, `/my-submissions`), // GET /api/v1/submissions/my-submissions
  BEST: ROOTS_SUBMISSION + "/best", // GET /api/v1/submissions/best

  // Admin endpoints
  ADMIN_GET_ALL: ROOTS_SUBMISSION, // GET /api/v1/submissions (Admin)
  ADMIN_GET_BY_ID: (id: string) => path(ROOTS_SUBMISSION, `/admin/${id}`), // GET /api/v1/submissions/admin/{id} (Admin)
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

export const ROUTES_API_LESSON_PROGRESS = {
  // Lesson Progress endpoints
  START_LESSON: (lessonId: string) =>
    path(ROOTS_LESSON_PROGRESS, `/start-lesson/${lessonId}`), // POST /api/v1/lesson-process/start-lesson/{lessonId}
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
  GET_ALL: ROOTS_COURSE_ROBOT, // GET /api/v1/course-robots (User only)
  GET_BY_COURSE: (courseId: string) =>
    path(ROOTS_COURSE_ROBOT, `/course/${courseId}`), // GET /api/v1/course-robots/course/{courseId}
  GET_BY_ID: (id: string) => path(ROOTS_COURSE_ROBOT, `/${id}`), // GET /api/v1/course-robots/{id}

  // Admin endpoints
  ADMIN_GET_ALL: path(ROOTS_COURSE_ROBOT, `/admin`), // GET /api/v1/course-robots/admin (Admin only)
  ADMIN_GET_BY_ID: (id: string) => path(ROOTS_COURSE_ROBOT, `/admin/${id}`), // GET /api/v1/course-robots/admin/{id} (Admin only)

  CREATE: ROOTS_COURSE_ROBOT, // POST /api/v1/course-robots (Admin)
  UPDATE: (id: string) => path(ROOTS_COURSE_ROBOT, `/${id}`), // PUT /api/v1/course-robots/{id} (Admin)
  DELETE: (id: string) => path(ROOTS_COURSE_ROBOT, `/${id}`), // DELETE /api/v1/course-robots/{id} (Admin)
  RESTORE: (id: string) => path(ROOTS_COURSE_ROBOT, `/${id}/restore`), // POST /api/v1/course-robots/{id}/restore (Admin)
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
  BY_LESSON: (lessonId: string) =>
    path(ROOTS_LESSON_RESOURCE, `/lesson/${lessonId}`), // GET /api/v1/lesson-resources/lesson/{lessonId} (User)

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
  ADMIN_UPDATE_STATUS: (id: string) =>
    path(ROOTS_ACTIVATION_CODE, `/${id}/status`), // PUT /api/v1/activation-codes/{id}/status (Admin)
  MY_CODES: path(ROOTS_ACTIVATION_CODE, `/my`), // GET /api/v1/activation-codes/my (User)
};

// New: Robot-Component endpoints
export const ROUTES_API_ROBOT_COMPONENT = {
  // Public/User endpoints
  GET_ALL: ROOTS_ROBOT_COMPONENT, // GET /api/v1/robot-components (Public)
  GET_BY_ID: (id: string) => path(ROOTS_ROBOT_COMPONENT, `/${id}`), // GET /api/v1/robot-components/{id} (Public)

  // Admin endpoints
  ADMIN_GET_ALL: path(ROOTS_ROBOT_COMPONENT, `/admin`), // GET /api/v1/robot-components/admin (Admin)
  ADMIN_GET_BY_ID: (id: string) => path(ROOTS_ROBOT_COMPONENT, `/admin/${id}`), // GET /api/v1/robot-components/admin/{id} (Admin)

  CREATE: ROOTS_ROBOT_COMPONENT, // POST /api/v1/robot-components (Admin)
  UPDATE: (id: string) => path(ROOTS_ROBOT_COMPONENT, `/${id}`), // PUT /api/v1/robot-components/{id} (Admin)
  DELETE: (id: string) => path(ROOTS_ROBOT_COMPONENT, `/${id}`), // DELETE /api/v1/robot-components/{id} (Admin)
  RESTORE: (id: string) => path(ROOTS_ROBOT_COMPONENT, `/${id}/restore`), // POST /api/v1/robot-components/{id}/restore (Admin)
};

// Certificate endpoints
export const ROUTES_API_CERTIFICATE = {
  // Admin endpoints
  GET_ALL: ROOTS_CERTIFICATE, // GET /api/v1/certificates (Admin)
  GET_BY_ID: (id: string) => path(ROOTS_CERTIFICATE, `/${id}`), // GET /api/v1/certificates/{id} (Admin)
  DELETE: (id: string) => path(ROOTS_CERTIFICATE, `/${id}`), // DELETE /api/v1/certificates/{id} (Admin)
  REVOKE: (id: string) => path(ROOTS_CERTIFICATE, `/${id}/revoke`), // POST /api/v1/certificates/{id}/revoke (Admin)

  // User endpoints
  MY_CERTIFICATES: path(ROOTS_CERTIFICATE, `/my`), // GET /api/v1/certificates/my (User)
};

// Certificate Template endpoints
export const ROUTES_API_CERTIFICATE_TEMPLATE = {
  // Admin endpoints
  GET_ALL: ROOTS_CERTIFICATE_TEMPLATE, // GET /api/v1/certificate-templates (Admin)
  CREATE: ROOTS_CERTIFICATE_TEMPLATE, // POST /api/v1/certificate-templates (Admin)
  UPDATE: (id: string) => path(ROOTS_CERTIFICATE_TEMPLATE, `/${id}`), // PUT /api/v1/certificate-templates/{id} (Admin)
  DELETE: (id: string) => path(ROOTS_CERTIFICATE_TEMPLATE, `/${id}`), // DELETE /api/v1/certificate-templates/{id} (Admin)

  // User/Admin endpoints
  GET_BY_ID: (id: string) => path(ROOTS_CERTIFICATE_TEMPLATE, `/${id}`), // GET /api/v1/certificate-templates/{id} (User,Admin)
};

// Cart endpoints
export const ROUTES_API_CART = {
  // Cart management
  GET_CART: ROOTS_CART, // GET /api/v1/cart (User)
  CREATE_CART: ROOTS_CART, // POST /api/v1/cart (User)
  CLEAR_CART: ROOTS_CART, // DELETE /api/v1/cart (User)
  GET_SUMMARY: path(ROOTS_CART, `/summary`), // GET /api/v1/cart/summary (User)
  VALIDATE_CART: path(ROOTS_CART, `/validate`), // POST /api/v1/cart/validate (User)
  APPLY_DISCOUNT: path(ROOTS_CART, `/discount`), // POST /api/v1/cart/discount (User)
  REMOVE_DISCOUNT: path(ROOTS_CART, `/discount`), // DELETE /api/v1/cart/discount (User)
};

// Cart Item endpoints
export const ROUTES_API_CART_ITEM = {
  // Cart items management
  GET_ITEMS: ROOTS_CART_ITEM, // GET /api/v1/cart/items (User)
  ADD_ITEM: ROOTS_CART_ITEM, // POST /api/v1/cart/items (User)
  REMOVE_ITEM: (courseId: string) => path(ROOTS_CART_ITEM, `/${courseId}`), // DELETE /api/v1/cart/items/{courseId} (User)
  UPDATE_ITEM_PRICE: (courseId: string) =>
    path(ROOTS_CART_ITEM, `/${courseId}/price`), // PUT /api/v1/cart/items/{courseId}/price (User)
  VALIDATE_ITEM: path(ROOTS_CART_ITEM, `/validate`), // POST /api/v1/cart/items/validate (User)
  CHECK_EXISTS: (courseId: string) =>
    path(ROOTS_CART_ITEM, `/exists/${courseId}`), // GET /api/v1/cart/items/exists/{courseId} (User)
};

// Order endpoints
export const ROUTES_API_ORDER = {
  // User endpoints
  CREATE_FROM_CART: ROOTS_ORDER, // POST /api/v1/orders (User)
  GET_ORDERS: ROOTS_ORDER, // GET /api/v1/orders (User - paginated)
  GET_BY_ID: (orderId: string) => path(ROOTS_ORDER, `/${orderId}`), // GET /api/v1/orders/{orderId} (User)
  CANCEL: (orderId: string) => path(ROOTS_ORDER, `/${orderId}/cancel`), // PUT /api/v1/orders/{orderId}/cancel (User)

  // Admin endpoints
  GET_ORDERS_ADMIN: path(ROOTS_ORDER, `/admin`), // GET /api/v1/orders/admin (Admin - paginated)
  GET_BY_ID_ADMIN: (orderId: string) => path(ROOTS_ORDER, `/admin/${orderId}`), // GET /api/v1/orders/admin/{orderId} (Admin)
  UPDATE_STATUS: (orderId: string) => path(ROOTS_ORDER, `/${orderId}/status`), // PUT /api/v1/orders/{orderId}/status (Admin)
};

// Order Item endpoints
export const ROUTES_API_ORDER_ITEM = {
  // User endpoints
  GET_BY_ORDER: (orderId: string) =>
    path(ROOTS_ORDER_ITEM, `/order/${orderId}`), // GET /api/v1/order-items/order/{orderId} (User/Admin)

  // Admin endpoints
  VALIDATE: path(ROOTS_ORDER_ITEM, `/validate`), // POST /api/v1/order-items/validate (Admin)
};

// Payment Transaction endpoints
export const ROUTES_API_PAYMENT = {
  // User endpoints
  GET_HISTORY: ROOTS_PAYMENT_TRANSACTION, // GET /api/v1/payment-transactions (User - paginated)
  GET_BY_ORDER_ID: (orderId: string) =>
    path(ROOTS_PAYMENT_TRANSACTION, `/${orderId}`), // GET /api/v1/payment-transactions/{orderId} (User)
  CANCEL_PAYMENT: (orderId: string) =>
    path(ROOTS_PAYMENT_TRANSACTION, `/${orderId}/cancel`), // POST /api/v1/payment-transactions/{orderId}/cancel (User)
};

// PayOS endpoints
export const ROUTES_API_PAYOS = {
  INITIATE: path(ROOTS_PAYOS, `/initiate`), // POST /api/v1/payos/initiate (User)
  WEBHOOK: path(ROOTS_PAYOS, `/webhook`), // POST /api/v1/payos/webhook (Public - for PayOS callbacks)
};

// Voucher endpoints
export const ROUTES_API_VOUCHER = {
  // Admin endpoints
  GET_ALL: ROOTS_VOUCHER, // GET /api/v1/vouchers (Admin - with pagination, search, IncludeDeleted)
  GET_BY_ID: (id: string) => path(ROOTS_VOUCHER, `/${id}`), // GET /api/v1/vouchers/{id} (Admin)
  CREATE: ROOTS_VOUCHER, // POST /api/v1/vouchers (Admin)
  UPDATE: (id: string) => path(ROOTS_VOUCHER, `/${id}`), // PUT /api/v1/vouchers/{id} (Admin)
  DELETE: (id: string) => path(ROOTS_VOUCHER, `/${id}`), // DELETE /api/v1/vouchers/{id} (Admin)
  RESTORE: (id: string) => path(ROOTS_VOUCHER, `/${id}/restore`), // POST /api/v1/vouchers/{id}/restore (Admin)

  // User endpoints
  VALIDATE: path(ROOTS_VOUCHER, `/validate`), // POST /api/v1/vouchers/validate (User)
  APPLY: path(ROOTS_VOUCHER, `/apply`), // POST /api/v1/vouchers/apply (User)
};

// Voucher Usage endpoints
export const ROUTES_API_VOUCHER_USAGE = {
  // Admin endpoints
  GET_ALL: ROOTS_VOUCHER_USAGE, // GET /api/v1/voucher-usages (Admin - with pagination, date filters, IncludeDeleted)
  GET_BY_ID: (id: string) => path(ROOTS_VOUCHER_USAGE, `/${id}`), // GET /api/v1/voucher-usages/{id} (Admin)
};

// Blog endpoints (Admin)
export const ROUTES_API_BLOG = {
  ADMIN_GET_ALL: path(ROOTS_BLOG, `/admin`), // GET /api/v1/Blog/admin
  ADMIN_GET_BY_ID: (id: string) => path(ROOTS_BLOG, `/admin/${id}`), // GET /api/v1/Blog/admin/{id}
  CREATE: ROOTS_BLOG, // POST /api/v1/Blog
  UPDATE: (id: string) => path(ROOTS_BLOG, `/${id}`), // PUT /api/v1/Blog/{id}
  DELETE: (id: string) => path(ROOTS_BLOG, `/${id}`), // DELETE /api/v1/Blog/{id}
  RESTORE: (id: string) => path(ROOTS_BLOG, `/${id}/restore`), // POST /api/v1/Blog/{id}/restore
  // Public endpoints
  GET_ALL: ROOTS_BLOG, // GET /api/v1/Blog?SearchTerm=&PageNumber=&PageSize=
  GET_BY_ID: (id: string) => path(ROOTS_BLOG, `/${id}`), // GET /api/v1/Blog/{id}
  GET_BY_SLUG: (slug: string) => path(ROOTS_BLOG, `/slug/${slug}`), // GET /api/v1/Blog/slug/{slug}
};

// Tag endpoints
export const ROUTES_API_TAG = {
  GET_ALL: ROOTS_TAG, // GET /api/v1/Tag
  CREATE: ROOTS_TAG, // POST /api/v1/Tag
  DELETE: (id: string) => path(ROOTS_TAG, `/${id}`), // DELETE /api/v1/Tag/{id}
};

// Blog Comment endpoints
export const ROUTES_API_BLOG_COMMENT = {
  GET_BY_BLOG: (blogId: string, page: number, size: number) =>
    `${ROOTS_BLOG_COMMENT}/by-blog/${blogId}?page=${page}&size=${size}`,
  CREATE: ROOTS_BLOG_COMMENT, // POST /api/v1/blog-comments
  UPDATE: (commentId: string) => path(ROOTS_BLOG_COMMENT, `/${commentId}`), // PUT /api/v1/blog-comments/{id}
  DELETE: (commentId: string) => path(ROOTS_BLOG_COMMENT, `/${commentId}`), // DELETE /api/v1/blog-comments/{id}
};
