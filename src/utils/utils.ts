import { ActionPayloadErrorData, ErrorResponse } from "common/@types/common";
import { Error } from "common/enums";
import { UserAuth, UserInfo } from "common/models";
import { StorageKeys } from "constants/storageKeys";
import Cookies from "js-cookie";
import { PATH_ERROR } from "routes/paths";
import { Md5 } from "ts-md5";
import { NavigateFunction } from "react-router-dom";

// localstorage
export const setLocalStorage = (name: string, value: string) => {
  try {
    localStorage.setItem(name, value);
  } catch (error) {
    // Handle localStorage errors (e.g., quota exceeded)
    console.warn("localStorage error:", error);
  }
};

export const getLocalStorage = (name: string) => {
  try {
    return localStorage.getItem(name);
  } catch (error) {
    console.warn("localStorage error:", error);
    return null;
  }
};

export const removeLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("localStorage error:", error);
  }
};

// User Auth Management
export const setUserAuth = (userAuth: UserAuth) =>
  setLocalStorage(StorageKeys.USER_AUTH, JSON.stringify(userAuth));

export const getUserAuth = (): UserAuth | undefined => {
  const userAuth = getLocalStorage(StorageKeys.USER_AUTH);
  if (
    userAuth === null ||
    userAuth === undefined ||
    userAuth.toString() === "undefined"
  ) {
    return undefined;
  } else {
    try {
      return JSON.parse(userAuth);
    } catch (error) {
      console.warn("Error parsing user auth data:", error);
      removeUserAuth(); // Clear invalid data
      return undefined;
    }
  }
};

export const removeUserAuth = () => removeLocalStorage(StorageKeys.USER_AUTH);

// User Info Management
export const setUserInfo = (userInfo: UserInfo) =>
  setLocalStorage(StorageKeys.USER_INFO, JSON.stringify(userInfo));

export const getUserInfo = (): UserInfo | undefined => {
  const userInfo = getLocalStorage(StorageKeys.USER_INFO);
  if (
    userInfo === null ||
    userInfo === undefined ||
    userInfo.toString() === "undefined"
  ) {
    return undefined;
  } else {
    try {
      return JSON.parse(userInfo);
    } catch (error) {
      console.warn("Error parsing user info data:", error);
      removeLocalStorage(StorageKeys.USER_INFO); // Clear invalid data
      return undefined;
    }
  }
};

// Token Management with Cookies
export const setAccessToken = (accessToken: string) => {
  try {
    Cookies.set(StorageKeys.ACCESS_TOKEN, accessToken, {
      secure: window.location.protocol === "https:",
      sameSite: "strict",
    });
  } catch (error) {
    console.warn("Cookie error:", error);
  }
};

export const getAccessToken = (): string | undefined => {
  try {
    return Cookies.get(StorageKeys.ACCESS_TOKEN);
  } catch (error) {
    console.warn("Cookie error:", error);
    return undefined;
  }
};

export const removeAccessToken = () => {
  try {
    Cookies.remove(StorageKeys.ACCESS_TOKEN);
  } catch (error) {
    console.warn("Cookie error:", error);
  }
};

export const setRefreshToken = (refreshToken: string) => {
  try {
    Cookies.set(StorageKeys.REFRESH_TOKEN, refreshToken, {
      secure: window.location.protocol === "https:",
      sameSite: "strict",
    });
  } catch (error) {
    console.warn("Cookie error:", error);
  }
};

export const getRefreshToken = (): string | undefined => {
  try {
    return Cookies.get(StorageKeys.REFRESH_TOKEN);
  } catch (error) {
    console.warn("Cookie error:", error);
    return undefined;
  }
};

export const removeRefreshToken = () => {
  try {
    Cookies.remove(StorageKeys.REFRESH_TOKEN);
  } catch (error) {
    console.warn("Cookie error:", error);
  }
};

// Combined token operations
export const setTokens = (accessToken: string, refreshToken: string) => {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
};
export const removeTokens = () => {
  removeAccessToken();
  removeRefreshToken();
};

// Complete auth data cleanup
export const clearAuthData = () => {
  // Remove tokens
  removeTokens();

  // Remove user data
  removeUserAuth();
  removeLocalStorage(StorageKeys.USER_INFO);

  // Remove other auth-related data
  removeAuthenticated();
  removeEmailVerify();

  // Clear session data
  try {
    sessionStorage.removeItem("app_initialized");
  } catch {
    // Ignore sessionStorage errors
  }

  // Dispatch logout event
  try {
    window.dispatchEvent(new Event("tellme:logout"));
  } catch {
    // Ignore event dispatch errors
  }
};

// hash password
export const hashPasswordMD5 = (password: string) => Md5.hashStr(password);

export const setAuthenticated = () =>
  setLocalStorage(StorageKeys.AUTHENTICATE, "true");

export const getAuthenticated = (): boolean => {
  const isAuthenticated = getLocalStorage(StorageKeys.AUTHENTICATE);
  if (isAuthenticated === null || isAuthenticated === undefined) {
    return false;
  }
  return Boolean(isAuthenticated);
};

export const removeAuthenticated = () =>
  removeLocalStorage(StorageKeys.AUTHENTICATE);

export const setEmailVerify = (email: string) =>
  setLocalStorage(StorageKeys.EMAIL_VERIFY, email);

export const getEmailVerify = (): string => {
  const emailStorage = getLocalStorage(StorageKeys.EMAIL_VERIFY);
  if (emailStorage === null || emailStorage === undefined) {
    return "";
  }
  return emailStorage;
};

export const removeEmailVerify = () =>
  removeLocalStorage(StorageKeys.EMAIL_VERIFY);

export const setLanguage = (language: string) =>
  setLocalStorage(StorageKeys.I18_LANGUAGE, language);

export const getLanguage = (): string | null =>
  getLocalStorage(StorageKeys.I18_LANGUAGE);

// Định nghĩa kiểu cho đối tượng lỗi API
interface ApiError {
  code?: string;
  data?: {
    StatusCode?: number;
    Message?: Array<{
      FieldNameError: string;
      DescriptionError: string[];
    }>;
  };
  status?: number;
  message?: string;
}

export const getErrorMessage = (
  error: unknown,
  navigate: NavigateFunction
): ErrorResponse | undefined => {
  // Ép kiểu error thành ApiError
  const apiError = error as ApiError;

  if (apiError.code === Error.SERVER_ERROR) {
    navigate(PATH_ERROR.serverError);
    return undefined;
  }

  if (apiError.data?.StatusCode === 403 || apiError.status === 403) {
    navigate(PATH_ERROR.noPermission);
    return undefined;
  }

  try {
    const errorData = apiError.data as ActionPayloadErrorData | undefined;

    if (errorData?.Message && errorData.Message.length > 0) {
      const errorMessage = errorData.Message[0].DescriptionError[0];
      const fieldNameError = errorData.Message[0].FieldNameError;
      const statusCode = errorData.StatusCode;

      const errorResponse: ErrorResponse = {
        errorMessage: errorMessage,
        fieldNameError: fieldNameError,
        statusCode: statusCode,
      };
      return errorResponse;
    }

    // Fallback for when error structure is different
    return {
      errorMessage: apiError.message || "Unknown error occurred",
      fieldNameError: "",
      statusCode: apiError.status || 500,
    };
  } catch (err) {
    console.error("Error parsing error data:", err);
    return {
      errorMessage: "Unknown error occurred",
      fieldNameError: "",
      statusCode: 500,
    };
  }
};

// Format currency to VND
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Format number with thousand separators for VND (without currency symbol)
export const formatVNDNumber = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN").format(amount);
};

// appendData
export const appendData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData();
  for (const key in data) {
    const value = data[key];

    // Xử lý các kiểu dữ liệu khác nhau
    if (value instanceof Blob || value instanceof File) {
      formData.append(key, value);
    } else if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else if (typeof value === "number" || typeof value === "boolean") {
      formData.append(key, value.toString());
    } else if (typeof value === "string") {
      formData.append(key, value);
    } else if (value === null || value === undefined) {
      // Bỏ qua các giá trị null hoặc undefined
      continue;
    } else if (typeof value === "object") {
      // Đối tượng sẽ được chuyển thành JSON
      formData.append(key, JSON.stringify(value));
    } else {
      // Fallback cho các kiểu dữ liệu khác
      formData.append(key, String(value));
    }
  }
  return formData;
};
