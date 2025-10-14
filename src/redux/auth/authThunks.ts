import { createAsyncThunk, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { axiosClient } from "axiosClient/axiosClient";
import {
  LoginForm,
  Params,
  ChangePasswordForm,
  ResendEmailConfirmationRequest,
} from "common/@types";
import { Role } from "common/enums";
import { UserAuth } from "common/models";
import { ROUTES_API_AUTH } from "constants/routesApiKeys";
import { PATH_AUTH, PATH_USER, PATH_ADMIN } from "routes/paths";
import {
  /* getAccessToken, */ // Commenting out unused import
  handleResponseMessage,
  removeAuthenticated,
  removeSession,
  setAccessToken,
  setAuthenticated,
  setRefreshToken,
  setUserAuth,
  getUserAuth,
} from "utils";

// Define local action creator functions instead of importing from the slice
// This breaks the circular dependency
const setMessageSuccess = (message: string) => ({
  type: "auth/setMessageSuccess",
  payload: message,
});

const setMessageError = (message: string) => ({
  type: "auth/setMessageError",
  payload: message,
});

const setStatus = () => ({
  type: "auth/setStatus",
});

// Define a type for the API response based on backend response models
interface LoginApiResponse {
  message: string;
  data: {
    user: {
      userId: string;
      email: string;
      // fullName removed - backend no longer returns this field
      roles: string[];
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresAtUtc: string;
    };
  };
  errors: null;
  errorCode: null;
  timestamp: string;
}

// Define RegisterForm interface - BE only requires email, password, confirmPassword
interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
}

// Định nghĩa kiểu cho ThunkAPI để tránh sử dụng any
interface GoogleLoginThunkAPI {
  dispatch: Dispatch<PayloadAction<string>>;
  rejectWithValue: <T>(value: T) => T;
}

// Hàm helper để đảm bảo người dùng có vai trò cần thiết
const ensureUserRoles = (roles?: string[] | null): string[] => {
  if (!roles || roles.length === 0) {
    return [Role.OTTOBIT_USER]; // Thêm vai trò User mặc định nếu không có vai trò nào
  }

  // Kiểm tra nếu mảng roles chỉ chứa giá trị null, undefined, hoặc chuỗi rỗng
  if (roles.every((role) => !role)) {
    return [Role.OTTOBIT_USER];
  }

  return roles;
};

// Login thunk
export const loginThunk = createAsyncThunk<
  UserAuth,
  Params<LoginForm>,
  { rejectValue: string }
>("auth/login", async (params, thunkAPI) => {
  // Safely extract data from params with a default empty object
  const data: Partial<LoginForm> = params?.data || {};
  const navigate = params?.navigate;

  try {
    const apiResponse = await axiosClient.post<LoginApiResponse>(
      ROUTES_API_AUTH.LOGIN,
      data
    );

    // Now we get full AxiosResponse, so we need to access apiResponse.data
    const response = apiResponse.data as LoginApiResponse;
    
    console.log("[Login] Full axios response:", apiResponse);
    console.log("[Login] Response body:", response);
    console.log("[Login] Response type:", typeof response);

    if (
      !response ||
      !response.data ||
      !response.data.user ||
      !response.data.tokens
    ) {
      console.error("[Login] Invalid response structure:", response);
      throw new Error("Invalid response format from API");
    }

    // Đảm bảo vai trò User
    const userRoles = ensureUserRoles(response.data.user.roles);

    // Tạo userStorage với structure mới
    const userStorage: UserAuth = {
      userId: response.data.user.userId,
      username: response.data.user.email, // Use email as username (fullName removed from backend)
      email: response.data.user.email,
      roles: userRoles,
      authProvider: "password",
    };

    // Store tokens với structure mới
    setAccessToken(response.data.tokens.accessToken);
    setRefreshToken(response.data.tokens.refreshToken);
    setUserAuth(userStorage);
    setAuthenticated();

    const message = handleResponseMessage("Login successful.");
    thunkAPI.dispatch(setMessageSuccess(message));

    // Navigate based on user role if a navigator is provided
    if (navigate) {
      if (userRoles.includes(Role.OTTOBIT_ADMIN)) {
        window.location.href = PATH_ADMIN.dashboard;
      } else {
        navigate(PATH_USER.homepage);
      }
    }

    return userStorage;
  } catch (error: unknown) {
    const err = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    };

    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      handleResponseMessage("Invalid username or password. Please try again!");
    thunkAPI.dispatch(setMessageError(errorMessage));
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Register thunk
export const registerThunk = createAsyncThunk<
  void,
  Params<RegisterForm>,
  { rejectValue: string }
>("auth/register", async (params, thunkAPI) => {
  // Safely extract data from params with a default empty object
  const data: Partial<RegisterForm> = params?.data || {};
  const navigate = params?.navigate;

  try {
    // Backend mong đợi tất cả các fields bao gồm cả confirmPassword
    if (data && typeof data === "object") {
      // Gửi tất cả dữ liệu cho backend, bao gồm confirmPassword để backend validate
      const registerData = data as RegisterForm;

      await axiosClient.post(ROUTES_API_AUTH.REGISTER, {
        email: registerData.email,
        password: registerData.password,
        confirmPassword: registerData.confirmPassword,
      });

      const message = handleResponseMessage(
        "Registration successful. Please login to continue."
      );
      thunkAPI.dispatch(setMessageSuccess(message));

      // Navigate to login page after successful registration
      if (navigate) {
        navigate(PATH_AUTH.login);
      }
    } else {
      throw new Error("Invalid registration data");
    }
  } catch (error: unknown) {
    const err = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    };

    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      handleResponseMessage("Registration failed. Please try again!");
    thunkAPI.dispatch(setMessageError(errorMessage));
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Logout thunk
export const logoutThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logout", async (_, thunkAPI) => {
  try {
    // Clear auth data
    removeAuthenticated();
    removeSession();
    localStorage.clear();

    // Reset interceptor state and clean up axios
    try {
      const { resetInterceptorState } = await import(
        "axiosClient/setupClientInterceptors"
      );
      resetInterceptorState();
    } catch (/* eslint-disable @typescript-eslint/no-unused-vars */ _error /* eslint-enable */) {
      // Error handling silently preserved
    }

    // Reset app state
    thunkAPI.dispatch(setStatus());

    // Reset all related slices
    thunkAPI.dispatch({ type: "student/resetStudentState" });
    thunkAPI.dispatch({ type: "course/resetCourseState" });
    thunkAPI.dispatch({ type: "enrollment/resetEnrollmentState" });
    thunkAPI.dispatch({ type: "lesson/resetLessonState" });
    thunkAPI.dispatch({ type: "challenge/resetChallengeState" });
    thunkAPI.dispatch({ type: "submission/resetSubmissionState" });

    // Đảm bảo xóa headers của axios instances
    try {
      const { resetAuthHeaders } = await import("axiosClient/axiosClient");
      resetAuthHeaders();
    } catch (/* eslint-disable @typescript-eslint/no-unused-vars */ _err /* eslint-enable */) {
      // Ignore errors
    }
  } catch (/* eslint-disable @typescript-eslint/no-unused-vars */ _error /* eslint-enable */) {
    return thunkAPI.rejectWithValue("Logout failed");
  }
});

// Change Password thunk
export const changePasswordThunk = createAsyncThunk<
  void,
  Params<ChangePasswordForm>,
  { rejectValue: string }
>("auth/changePassword", async (params, thunkAPI) => {
  // Safely extract data from params with a default empty object
  const data: Partial<ChangePasswordForm> = params?.data || {};
  const callback = params?.callback;

  try {
    // Kiểm tra xem người dùng đăng nhập bằng Google hay không
    const userAuth = getUserAuth();
    if (userAuth && userAuth.authProvider === "google") {
      const errorMessage =
        "Tài khoản của bạn đăng nhập bằng Google. Vui lòng sử dụng tính năng quản lý tài khoản của Google để đổi mật khẩu.";
      thunkAPI.dispatch(setMessageError(errorMessage));

      // Call the error callback if provided
      if (callback?.onError) {
        callback.onError(errorMessage);
      }

      return thunkAPI.rejectWithValue(errorMessage);
    }

    await axiosClient.post(ROUTES_API_AUTH.CHANGE_PASSWORD, data);

    const message = handleResponseMessage("Đổi mật khẩu thành công!");
    thunkAPI.dispatch(setMessageSuccess(message));

    // Call the success callback if provided
    if (callback?.onSuccess) {
      callback.onSuccess();
    }
  } catch (error: unknown) {
    const err = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    };

    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      handleResponseMessage("Đổi mật khẩu thất bại. Vui lòng thử lại!");
    thunkAPI.dispatch(setMessageError(errorMessage));

    // Call the error callback if provided
    if (callback?.onError) {
      callback.onError(errorMessage);
    }

    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Google Login thunk implementation - sửa lại định nghĩa để tương thích hơn với AsyncThunk
export const googleLoginThunk = async (
  googleToken: string,
  thunkAPI: GoogleLoginThunkAPI
): Promise<UserAuth> => {
  try {
    // Đúng format mà API backend mong đợi { "GoogleIdToken": "string" }
    const apiResponse = await axiosClient.post<LoginApiResponse>(
      ROUTES_API_AUTH.LOGIN_GOOGLE,
      { GoogleIdToken: googleToken }
    );

    // Now we get full AxiosResponse, so we need to access apiResponse.data
    const response = apiResponse.data as LoginApiResponse;
    
    console.log("[Google Login] Full axios response:", apiResponse);
    console.log("[Google Login] Response body:", response);

    if (
      !response ||
      !response.data ||
      !response.data.user ||
      !response.data.tokens
    ) {
      console.error("[Google Login] Invalid response structure:", response);
      const message = handleResponseMessage(
        "Error: Backend did not return valid user information."
      );
      thunkAPI.dispatch(setMessageError(message));
      return thunkAPI.rejectWithValue(message) as unknown as UserAuth;
    }

    // Đảm bảo vai trò User
    const userRoles = ensureUserRoles(response.data.user.roles);

    // Ánh xạ dữ liệu từ backend sang model frontend với structure mới
    const user: UserAuth = {
      userId: response.data.user.userId,
      email: response.data.user.email,
      username: response.data.user.email, // Use email as username (fullName removed from backend)
      roles: userRoles,
      authProvider: "google",
    };

    // Store tokens với structure mới
    setAccessToken(response.data.tokens.accessToken);
    setRefreshToken(response.data.tokens.refreshToken);

    setUserAuth(user);
    setAuthenticated();
    const message = handleResponseMessage("Đăng nhập Google thành công.");
    thunkAPI.dispatch(setMessageSuccess(message));
    return user;
  } catch (error: unknown) {
    let errorMessage = "Đăng nhập Google thất bại. Vui lòng thử lại!";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "object" && error !== null) {
      const errorObj = error as Record<string, unknown>;

      // Kiểm tra cụ thể cho lỗi "Email already exists"
      if (
        "response" in errorObj &&
        errorObj.response &&
        typeof errorObj.response === "object"
      ) {
        const responseObj = errorObj.response as Record<string, unknown>;

        if (
          "data" in responseObj &&
          responseObj.data &&
          typeof responseObj.data === "object"
        ) {
          const dataObj = responseObj.data as Record<string, unknown>;

          // Kiểm tra cấu trúc lỗi của API
          if (
            "message" in dataObj &&
            Array.isArray(dataObj.message) &&
            dataObj.message.length > 0
          ) {
            const messageArr = dataObj.message as Array<{ message: string }>;

            if (messageArr[0].message === "Email already exists.") {
              errorMessage =
                "Email này đã được đăng ký trước đó bằng mật khẩu. Vui lòng đăng nhập bằng email và mật khẩu thay vì Google.";
            } else {
              errorMessage = messageArr[0].message;
            }
          } else if (
            "message" in dataObj &&
            typeof dataObj.message === "string"
          ) {
            errorMessage = dataObj.message as string;
          }
        }
      }
    }

    const formattedErrorMessage = handleResponseMessage(errorMessage);
    thunkAPI.dispatch(setMessageError(formattedErrorMessage));
    return thunkAPI.rejectWithValue(
      formattedErrorMessage
    ) as unknown as UserAuth;
  }
};

// Email Confirmation thunk
export const confirmEmailThunk = createAsyncThunk<
  { message: string },
  { userId: string; token: string },
  { rejectValue: string }
>("auth/confirmEmail", async ({ userId, token }, thunkAPI) => {
  try {
    const response = await axiosClient.get(
      `${ROUTES_API_AUTH.CONFIRM_EMAIL}?userId=${encodeURIComponent(
        userId
      )}&token=${encodeURIComponent(token)}`
    );

    const message = handleResponseMessage(
      response.data.message || "Email confirmed successfully"
    );
    thunkAPI.dispatch(setMessageSuccess(message));

    return { message: response.data.message };
  } catch (error: unknown) {
    const err = error as {
      response?: {
        data?: {
          message?: string;
          errors?: string[];
        };
      };
      message?: string;
    };

    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      handleResponseMessage("Email confirmation failed");
    thunkAPI.dispatch(setMessageError(errorMessage));
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Reset Password thunk
export const resetPasswordThunk = createAsyncThunk<
  { message: string },
  {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmNewPassword: string;
  },
  { rejectValue: string }
>("auth/resetPassword", async (params, thunkAPI) => {
  try {
    // Clean reset token
    const cleanResetToken = decodeURIComponent(params.resetToken).replace(
      / /g,
      "+"
    );

    const response = await axiosClient.post(ROUTES_API_AUTH.RESET_PASSWORD, {
      Email: params.email,
      ResetToken: cleanResetToken,
      NewPassword: params.newPassword,
      ConfirmNewPassword: params.confirmNewPassword,
    });

    const message = handleResponseMessage(
      "Password reset successfully. You can now login with your new password."
    );
    thunkAPI.dispatch(setMessageSuccess(message));

    return { message: response.data.message || "Password reset successfully" };
  } catch (error: unknown) {
    const err = error as {
      response?: {
        data?: {
          message?: string;
          errors?: string[];
        };
      };
      message?: string;
    };

    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      handleResponseMessage("Password reset failed. Please try again.");
    thunkAPI.dispatch(setMessageError(errorMessage));
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Forgot Password thunk
export const forgotPasswordThunk = createAsyncThunk<
  { message: string },
  { email: string },
  { rejectValue: string }
>("auth/forgotPassword", async ({ email }, thunkAPI) => {
  try {
    const response = await axiosClient.post(ROUTES_API_AUTH.FORGOT_PASSWORD, {
      Email: email,
    });

    const message = handleResponseMessage(
      "If the email exists, password reset instructions have been sent."
    );
    thunkAPI.dispatch(setMessageSuccess(message));

    return { message: response.data.message || "Reset instructions sent" };
  } catch (error: unknown) {
    const err = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    };

    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      handleResponseMessage("Failed to send reset instructions");
    thunkAPI.dispatch(setMessageError(errorMessage));
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Resend email confirmation thunk
export const resendEmailConfirmationThunk = createAsyncThunk<
  string,
  ResendEmailConfirmationRequest,
  { rejectValue: string }
>("auth/resendEmailConfirmation", async (request, thunkAPI) => {
  try {
    const response = await axiosClient.post(
      ROUTES_API_AUTH.RESEND_EMAIL_CONFIRMATION,
      request
    );

    const successMessage =
      response.data?.message || "Email xác nhận đã được gửi lại thành công!";
    // Không dùng toast, chỉ return message để form handle
    return successMessage;
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Gửi lại email xác nhận thất bại";
    // Không dùng toast, chỉ return error để form handle
    return thunkAPI.rejectWithValue(errorMessage);
  }
});
