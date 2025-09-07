import { path } from "utils";

// Backend sử dụng số nhiều (authentications, accounts, maps)
const ROOTS_AUTH = "/api/v1/authentications";
const ROOTS_ACCOUNT = "/api/v1/accounts";
const ROOTS_MAP = "/api/v1/maps";

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

export const ROUTES_API_MAP = {
  // Map endpoints
  GET_ALL: ROOTS_MAP,
  GET_LESSON_MAPS: path(ROOTS_MAP, `/lessons`),
  CLEAR_LESSON_CACHE: path(ROOTS_MAP, `/lessons/cache`),
};
