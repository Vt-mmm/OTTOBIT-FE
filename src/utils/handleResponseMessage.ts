import { getLanguage } from "utils";
import { Language } from "common/enums";
import { EngMessageConstant } from "constants/EngMessageConstant";
import { VieMessageConstant } from "constants/VieMessageConstant";
import { EngErrorMessageConstant } from "constants/EngErrorMessageConstant";
import { VieErrorMessageConstant } from "constants/VieErrorMessageConstant";

export const handleResponseMessage = (response: string) => {
  const currentLanguage = getLanguage();

  const responseMessage =
    currentLanguage === Language.EN
      ? response === EngMessageConstant.LoginSuccessfully
        ? EngMessageConstant.LoginSuccessfully
        : response === EngMessageConstant.ResetPasswordSuccessfully
        ? EngMessageConstant.ResetPasswordSuccessfully
        : response === EngMessageConstant.UpdateAccountSuccessfully
        ? EngMessageConstant.UpdateAccountSuccessfully
        : response === EngMessageConstant.SentEmailConfirmationSuccessfully
        ? EngMessageConstant.SentEmailConfirmationSuccessfully
        : response === EngMessageConstant.ConfirmedOTPCodeSuccessfully
        ? EngMessageConstant.ConfirmedOTPCodeSuccessfully
        : response === EngErrorMessageConstant.imageIsNotNull
        ? EngErrorMessageConstant.imageIsNotNull
        : response === EngErrorMessageConstant.logoIsNotNull
        ? EngErrorMessageConstant.logoIsNotNull
        : response === EngErrorMessageConstant.NotExistEmail
        ? EngErrorMessageConstant.NotExistEmail
        : response === EngErrorMessageConstant.AlreadyExistEmail
        ? EngErrorMessageConstant.AlreadyExistEmail
        : response === EngErrorMessageConstant.AlreadyExistCitizenNumber
        ? EngErrorMessageConstant.AlreadyExistCitizenNumber
        : response === EngErrorMessageConstant.DisabledAccount
        ? EngErrorMessageConstant.DisabledAccount
        : response === EngErrorMessageConstant.InvalidEmailOrPassword
        ? EngErrorMessageConstant.InvalidEmailOrPassword
        : response === EngErrorMessageConstant.AccountIdNotBelongYourAccount
        ? EngErrorMessageConstant.AccountIdNotBelongYourAccount
        : response === EngErrorMessageConstant.NotAuthenticatedEmailBefore
        ? EngErrorMessageConstant.NotAuthenticatedEmailBefore
        : response === EngErrorMessageConstant.InvalidAccessToken
        ? EngErrorMessageConstant.InvalidAccessToken
        : response === EngErrorMessageConstant.NotExpiredAccessToken
        ? EngErrorMessageConstant.NotExpiredAccessToken
        : response === EngErrorMessageConstant.NotExistAuthenticationToken
        ? EngErrorMessageConstant.NotExistAuthenticationToken
        : response === EngErrorMessageConstant.NotExistRefreshToken
        ? EngErrorMessageConstant.NotExistRefreshToken
        : response === EngErrorMessageConstant.NotMatchAccessToken
        ? EngErrorMessageConstant.NotMatchAccessToken
        : response === EngErrorMessageConstant.ExpiredRefreshToken
        ? EngErrorMessageConstant.ExpiredRefreshToken
        : response === EngErrorMessageConstant.NotAuthenticatedEmail
        ? EngErrorMessageConstant.NotAuthenticatedEmail
        : response === EngErrorMessageConstant.NotVerifiedEmail
        ? EngErrorMessageConstant.NotVerifiedEmail
        : response
      : currentLanguage === Language.VI
      ? response === EngMessageConstant.LoginSuccessfully
        ? VieMessageConstant.LoginSuccessfully
        : response === EngMessageConstant.ResetPasswordSuccessfully
        ? VieMessageConstant.ResetPasswordSuccessfully
        : response === EngMessageConstant.UpdateAccountSuccessfully
        ? VieMessageConstant.UpdateAccountSuccessfully
        : response === EngMessageConstant.SentEmailConfirmationSuccessfully
        ? VieMessageConstant.SentEmailConfirmationSuccessfully
        : response === EngErrorMessageConstant.imageIsNotNull
        ? VieErrorMessageConstant.imageIsNotNull
        : response === EngErrorMessageConstant.logoIsNotNull
        ? VieErrorMessageConstant.logoIsNotNull
        : response === EngErrorMessageConstant.NotExistEmail
        ? VieErrorMessageConstant.NotExistEmail
        : response === EngErrorMessageConstant.AlreadyExistEmail
        ? VieErrorMessageConstant.AlreadyExistEmail
        : response === EngErrorMessageConstant.AlreadyExistCitizenNumber
        ? VieErrorMessageConstant.AlreadyExistCitizenNumber
        : response === EngErrorMessageConstant.DisabledAccount
        ? VieErrorMessageConstant.DisabledAccount
        : response === EngErrorMessageConstant.InvalidEmailOrPassword
        ? VieErrorMessageConstant.InvalidEmailOrPassword
        : response === EngErrorMessageConstant.AccountIdNotBelongYourAccount
        ? VieErrorMessageConstant.AccountIdNotBelongYourAccount
        : response === EngErrorMessageConstant.NotAuthenticatedEmailBefore
        ? VieErrorMessageConstant.NotAuthenticatedEmailBefore
        : response === EngErrorMessageConstant.InvalidAccessToken
        ? VieErrorMessageConstant.InvalidAccessToken
        : response === EngErrorMessageConstant.NotExpiredAccessToken
        ? VieErrorMessageConstant.NotExpiredAccessToken
        : response === EngErrorMessageConstant.NotExistAuthenticationToken
        ? VieErrorMessageConstant.NotExistAuthenticationToken
        : response === EngErrorMessageConstant.NotExistRefreshToken
        ? VieErrorMessageConstant.NotExistRefreshToken
        : response === EngErrorMessageConstant.NotMatchAccessToken
        ? VieErrorMessageConstant.NotMatchAccessToken
        : response === EngErrorMessageConstant.ExpiredRefreshToken
        ? VieErrorMessageConstant.ExpiredRefreshToken
        : response === EngErrorMessageConstant.NotAuthenticatedEmail
        ? VieErrorMessageConstant.NotAuthenticatedEmail
        : response
      : response;

  return responseMessage;
};

// Function để check xem có phải lỗi network không
export const isNetworkError = (error: string | null): boolean => {
  if (!error) return false;

  const networkErrorIndicators = [
    "Không thể kết nối đến server",
    "ERR_NETWORK",
    "ERR_CONNECTION_REFUSED",
    "Failed to fetch",
    "Network Error",
    "timeout",
    "ECONNREFUSED",
  ];

  return networkErrorIndicators.some((indicator) =>
    error.toLowerCase().includes(indicator.toLowerCase())
  );
};

// Function để get user-friendly error message
export const getNetworkErrorMessage = (error: string | null): string => {
  if (isNetworkError(error)) {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.";
  }

  return error || "Đã xảy ra lỗi không xác định.";
};
