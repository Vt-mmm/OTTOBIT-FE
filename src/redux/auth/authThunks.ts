import { createAsyncThunk, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { axiosClient } from "axiosClient/axiosClient";
import { LoginForm, Params, ChangePasswordForm } from "common/@types";
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

// Define a type for the API response based on what we expect to receive
interface ApiUserResponse {
  userId?: string;
  id?: string;
  email: string;
  fullName?: string;
  username?: string;
  roles?: string[];
  role?: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

// Define RegisterForm interface
interface RegisterForm {
  fullName: string;
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
    const apiResponse = await axiosClient.post<ApiUserResponse>(
      ROUTES_API_AUTH.LOGIN,
      data
    );

    // The response is directly in apiResponse.data
    const response = apiResponse.data;

    // If we're still getting undefined, try accessing apiResponse directly
    if (!response) {
      // Try to extract data directly from the response if necessary
      // This is a fallback for unusual API response structures
      const directResponse = apiResponse as unknown as ApiUserResponse;

      if (directResponse.userId || directResponse.id) {
        // Đảm bảo vai trò User
        const userRoles = ensureUserRoles(
          directResponse.roles ||
            (directResponse.role ? [directResponse.role] : null)
        );

        // The data is directly in apiResponse
        const userStorage: UserAuth = {
          userId: directResponse.userId || directResponse.id || "",
          username:
            directResponse.fullName ||
            directResponse.username ||
            directResponse.email,
          email: directResponse.email,
          roles: userRoles,
          authProvider: "password",
        };

        if (directResponse.tokens) {
          setAccessToken(directResponse.tokens.accessToken);
          setRefreshToken(directResponse.tokens.refreshToken);
        } else if (directResponse.accessToken) {
          setAccessToken(directResponse.accessToken);
          setRefreshToken(directResponse.refreshToken || "");
        }

        setUserAuth(userStorage);
        setAuthenticated();
        const message = handleResponseMessage("Login successful.");
        thunkAPI.dispatch(setMessageSuccess(message));

        // Navigate based on user role if a navigator is provided
        if (navigate) {
          if (userRoles.includes(Role.OTTOBIT_ADMIN)) {
            // Using window.location.href for a "hard" navigation to avoid React Router confusion
            window.location.href = PATH_ADMIN.dashboard;
          } else {
            navigate(PATH_USER.homepage);
          }
        }

        return userStorage;
      }
      throw new Error("Cannot find user data in response");
    }

    // Validate required fields in the response
    const userId = response.userId || response.id;
    // Đảm bảo vai trò User
    const userRoles = ensureUserRoles(
      response.roles || (response.role ? [response.role] : null)
    );
    const email = response.email;
    const username = response.fullName || response.username || response.email;
    const tokens = response.tokens || {
      accessToken: response.accessToken || "",
      refreshToken: response.refreshToken || "",
    };

    if (!userId || !email || !tokens.accessToken) {
      throw new Error("Invalid response format from API");
    }

    const userStorage: UserAuth = {
      userId,
      username,
      email,
      roles: userRoles,
      authProvider: "password",
    };

    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setUserAuth(userStorage);
    setAuthenticated();
    const message = handleResponseMessage("Login successful.");
    thunkAPI.dispatch(setMessageSuccess(message));

    // Navigate based on user role if a navigator is provided
    if (navigate) {
      if (userRoles.includes(Role.OTTOBIT_ADMIN)) {
        // Using window.location.href for a "hard" navigation to avoid React Router confusion
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
    // Remove confirmPassword from the payload before sending to API
    if (data && typeof data === "object") {
      // Use object destructuring to separate confirmPassword from the data
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data as RegisterForm;

      // Thêm vai trò User mặc định
      const registerWithRole = {
        ...registerData,
        roleId: [Role.OTTOBIT_USER], // Thêm vai trò User mặc định
      };

      await axiosClient.post(ROUTES_API_AUTH.REGISTER, registerWithRole);

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
    thunkAPI.dispatch({ type: "psychologist/resetPsychologistState" });
    thunkAPI.dispatch({ type: "package/resetPackageState" });
    thunkAPI.dispatch({ type: "user/resetUser" });
    thunkAPI.dispatch({ type: "appointment/resetAppointmentState" });
    thunkAPI.dispatch({ type: "payment/resetPaymentState" });
    thunkAPI.dispatch({ type: "usertest/resetUserTestState" });

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
    // Đúng format mà API backend mong đợi { "token": "string" }
    const apiResponse = await axiosClient.post(
      `${ROUTES_API_AUTH.LOGIN_GOOGLE}`,
      { token: googleToken }
    );

    // Xử lý dữ liệu phụ thuộc vào cấu trúc thực tế của apiResponse
    interface GoogleLoginResponse {
      userId: string;
      email: string;
      fullName?: string;
      roles: string[];
      tokens: {
        accessToken: string;
        refreshToken: string;
      };
    }

    // Nếu apiResponse.data tồn tại và có userId, dùng nó
    // Nếu không, kiểm tra xem apiResponse có trực tiếp userId không
    const responseData: GoogleLoginResponse =
      apiResponse.data &&
      typeof apiResponse.data === "object" &&
      "userId" in apiResponse.data
        ? (apiResponse.data as GoogleLoginResponse)
        : (apiResponse as unknown as GoogleLoginResponse);

    if (!responseData || !responseData.userId) {
      const message = handleResponseMessage(
        "Error: Backend did not return valid user information."
      );
      thunkAPI.dispatch(setMessageError(message));
      // Sử dụng non-null assertion thay vì as any
      return thunkAPI.rejectWithValue(message) as unknown as UserAuth;
    }

    // Ánh xạ dữ liệu từ backend sang model frontend
    const user: UserAuth = {
      userId: responseData.userId,
      email: responseData.email,
      username: responseData.fullName || responseData.email,
      roles: Array.isArray(responseData.roles) ? responseData.roles : [],
      authProvider: "google",
    };

    // Store tokens and user data
    if (
      responseData.tokens &&
      responseData.tokens.accessToken &&
      responseData.tokens.refreshToken
    ) {
      setAccessToken(responseData.tokens.accessToken);
      setRefreshToken(responseData.tokens.refreshToken);
    } else {
      const errorMsg = "Token không được cung cấp từ API";
      thunkAPI.dispatch(setMessageError(errorMsg));
      return thunkAPI.rejectWithValue(errorMsg) as unknown as UserAuth;
    }

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
