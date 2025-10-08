import { EngErrorMessageConstant } from "constants/EngErrorMessageConstant";

const errorMap: Record<string, string> = {
  [EngErrorMessageConstant.NotExistEmail]: "error.NotExistEmail",
  [EngErrorMessageConstant.AlreadyExistEmail]: "error.AlreadyExistEmail",
  [EngErrorMessageConstant.AlreadyExistCitizenNumber]:
    "error.AlreadyExistCitizenNumber",
  [EngErrorMessageConstant.DisabledAccount]: "error.DisabledAccount",
  [EngErrorMessageConstant.InvalidEmailOrPassword]:
    "error.InvalidEmailOrPassword",
  [EngErrorMessageConstant.AccountIdNotBelongYourAccount]:
    "error.AccountIdNotBelongYourAccount",
  [EngErrorMessageConstant.AccountNoLongerActive]:
    "error.AccountNoLongerActive",
  [EngErrorMessageConstant.NotAuthenticatedEmailBefore]:
    "error.NotAuthenticatedEmailBefore",
  [EngErrorMessageConstant.ExpiredOTPCode]: "error.ExpiredOTPCode",
  [EngErrorMessageConstant.NotMatchOTPCode]: "error.NotMatchOTPCode",
  [EngErrorMessageConstant.InvalidAccessToken]: "error.InvalidAccessToken",
  [EngErrorMessageConstant.NotExpiredAccessToken]:
    "error.NotExpiredAccessToken",
  [EngErrorMessageConstant.NotExistAuthenticationToken]:
    "error.NotExistAuthenticationToken",
  [EngErrorMessageConstant.NotExistRefreshToken]: "error.NotExistRefreshToken",
  [EngErrorMessageConstant.NotMatchAccessToken]: "error.NotMatchAccessToken",
  [EngErrorMessageConstant.ExpiredRefreshToken]: "error.ExpiredRefreshToken",
  [EngErrorMessageConstant.NotAuthenticatedEmail]:
    "error.NotAuthenticatedEmail",
  [EngErrorMessageConstant.NotVerifiedEmail]: "error.NotVerifiedEmail",
  [EngErrorMessageConstant.imageIsNotNull]: "error.imageIsNotNull",
  [EngErrorMessageConstant.logoIsNotNull]: "error.logoIsNotNull",
  [EngErrorMessageConstant.avatarIsNotNull]: "error.avatarIsNotNull",
};

/**
 * Chuyển đổi thông điệp lỗi từ server sang i18n key
 * @param serverMessage - Thông điệp lỗi từ server
 * @returns i18n key tương ứng
 */
export const toErrorKey = (serverMessage: string): string =>
  errorMap[serverMessage] ?? "error.Unknown";
