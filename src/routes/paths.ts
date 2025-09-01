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
  forgotPassword: path(ROOTS_AUTH, "/Kh"),
  resetPassword: path(ROOTS_AUTH, "/reset-password"),
  verifyEmail: path(ROOTS_AUTH, "/verify-email"),
  confirmEmail: path(ROOTS_AUTH, "/confirm-email"),
  resendEmailConfirmation: path(ROOTS_AUTH, "/resend-email-confirmation"),
};
export const PATH_PUBLIC = {
  homepage: "/", // Đường dẫn gốc cho người dùng không cần đăng nhập
};

export const PATH_USER = {
  homepage: path(ROOTS_USER, "/homepage"),
  studio: "/studio",
  profile: path(ROOTS_USER, "/profile"),
};

export const PATH_ADMIN = {
  dashboard: path(ROOTS_ADMIN_DASHBOARD, "/dashboard"),
};
