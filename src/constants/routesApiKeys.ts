import { path } from "utils";
const ROOTS_AUTH = "/api/v1/authentication";
const ROOTS_ACCOUNT = "/api/v1/account";

export const ROUTES_API_AUTH = {
  LOGIN: path(ROOTS_AUTH, `/login`),
  REGISTER: path(ROOTS_AUTH, `/register`),
  REFRESH_TOKEN: path(ROOTS_AUTH, `/refresh-token`),
  LOGIN_GOOGLE: path(ROOTS_AUTH, `/login-google`),
  FORGOT_PASSWORD: path(ROOTS_ACCOUNT, `/forgot-password`),
  RESET_PASSWORD: path(ROOTS_ACCOUNT, `/reset-password`),
  CHANGE_PASSWORD: path(ROOTS_ACCOUNT, `/change-password`),
};
