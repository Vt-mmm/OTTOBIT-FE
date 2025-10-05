import { path } from "utils";
const ROOTS_ERROR = "/error";
export const ROOTS_ADMIN_DASHBOARD = "/admin";
export const ROOTS_USER = "/user";
export const ROOTS_PUBLIC = "/"; // Thêm đường dẫn gốc cho trang công khai

const ROOTS_AUTH = "/auth";
export const PATH_ERROR = {
  noPermission: path(ROOTS_ERROR, "/403"),
  notFound: path(ROOTS_ERROR, "/404"),
  serverError: path(ROOTS_ERROR, "/500"),
};

export const PATH_AUTH = {
  login: path(ROOTS_AUTH, "/login"),
  register: path(ROOTS_AUTH, "/register"),
  forgotPassword: path(ROOTS_AUTH, "/forgot-password"),
  resetPassword: path(ROOTS_AUTH, "/reset-password"),
  verifyEmail: path(ROOTS_AUTH, "/verify-email"),
  confirmEmail: path(ROOTS_AUTH, "/confirm-email"),
  resendEmailConfirmation: path(ROOTS_AUTH, "/resend-email-confirmation"),
};
export const PATH_PUBLIC = {
  homepage: "/", // Đường dẫn gốc cho người dùng không cần đăng nhập
  store: "/store",
  robots: "/store/robots",
  robotDetail: "/store/robots/:id",
  components: "/store/components",
  componentDetail: "/store/components/:id",
};

export const PATH_USER = {
  homepage: path(ROOTS_USER, "/homepage"),
  // Store pages
  store: path(ROOTS_USER, "/store"),
  robots: path(ROOTS_USER, "/store/robots"),
  robotDetail: path(ROOTS_USER, "/store/robots/:id"),
  components: path(ROOTS_USER, "/store/components"),
  componentDetail: path(ROOTS_USER, "/store/components/:id"),
  // Public listing pages
  courses: path(ROOTS_USER, "/courses"),
  courseDetail: path(ROOTS_USER, "/courses/:id"),
  lessons: path(ROOTS_USER, "/lessons"),
  lessonDetail: path(ROOTS_USER, "/lessons/:id"),
  // Shopping cart
  cart: path(ROOTS_USER, "/cart"),
  // User management pages - myCourses, myRobots, myCertificates moved to Student Profile tabs
  challenges: path(ROOTS_USER, "/challenges"),
  challengeDetail: path(ROOTS_USER, "/challenges/:id"),
  studio: "/studio",
  studioWithChallenge: "/studio/:challengeId",
  profile: path(ROOTS_USER, "/profile"),
  studentProfile: path(ROOTS_USER, "/student-profile"),
  security: path(ROOTS_USER, "/security"),
};

export const PATH_ADMIN = {
  dashboard: path(ROOTS_ADMIN_DASHBOARD, "/dashboard"),
  mapDesigner: path(ROOTS_ADMIN_DASHBOARD, "/map-designer"),
  challengeDesigner: path(ROOTS_ADMIN_DASHBOARD, "/challenge-designer"),
  mapManagement: path(ROOTS_ADMIN_DASHBOARD, "/map-management"),
  courseManagement: path(ROOTS_ADMIN_DASHBOARD, "/course-management"),
  lessonManagement: path(ROOTS_ADMIN_DASHBOARD, "/lesson-management"),
  challengeManagement: path(ROOTS_ADMIN_DASHBOARD, "/challenge-management"),
  enrollmentManagement: path(ROOTS_ADMIN_DASHBOARD, "/enrollment-management"),
  studentManagement: path(ROOTS_ADMIN_DASHBOARD, "/student-management"),
  robotManagement: path(ROOTS_ADMIN_DASHBOARD, "/robot-management"),
  componentManagement: path(ROOTS_ADMIN_DASHBOARD, "/component-management"),
  cartManagement: path(ROOTS_ADMIN_DASHBOARD, "/cart-management"),
  lessonResourceManagement: path(
    ROOTS_ADMIN_DASHBOARD,
    "/lesson-resource-management"
  ),
  activationCodeManagement: path(
    ROOTS_ADMIN_DASHBOARD,
    "/activation-code-management"
  ),
  certificateManagement: path(ROOTS_ADMIN_DASHBOARD, "/certificate-management"),
  certificateTemplateManagement: path(
    ROOTS_ADMIN_DASHBOARD,
    "/certificate-template-management"
  ),
};
