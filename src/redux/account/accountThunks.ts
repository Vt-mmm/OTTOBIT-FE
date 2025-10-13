import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_AUTH, ROUTES_API_ACCOUNT } from "constants/routesApiKeys";
import {
  AccountChangePasswordForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  Params,
} from "common/@types";
import { UserProfileData, UpdateProfileForm } from "common/@types/account";

// Define local action creator functions to avoid circular dependency
const setMessageSuccess = (message: string) => ({
  type: "account/setMessageSuccess",
  payload: message,
});

const setMessageError = (message: string) => ({
  type: "account/setMessageError",
  payload: message,
});

// API Response interface for standard backend response
interface ApiResponse<T = any> {
  message: string;
  data: T;
  errors: any[];
  errorCode: string | null;
  timestamp: string;
}

// Get my account profile
export const getMyProfileThunk = createAsyncThunk<
  UserProfileData,
  void,
  { rejectValue: string }
>("account/getMyProfile", async (_, thunkAPI) => {
  try {
    const response = await axiosClient.get<ApiResponse<UserProfileData>>(
      ROUTES_API_ACCOUNT.GET_PROFILE
    );

    if (!response.data || !response.data.data) {
      return thunkAPI.rejectWithValue("Không nhận được dữ liệu hồ sơ");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Lấy hồ sơ thất bại";
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Update my account profile
export const updateMyProfileThunk = createAsyncThunk<
  UserProfileData,
  Params<UpdateProfileForm>,
  { rejectValue: string }
>("account/updateMyProfile", async (params, thunkAPI) => {
  const data = params?.data;

  if (!data) {
    return thunkAPI.rejectWithValue("Dữ liệu không hợp lệ");
  }

  try {
    // Only send fields BE allows to update: avatarUrl and phoneNumber
    const response = await axiosClient.put<ApiResponse<UserProfileData>>(
      ROUTES_API_ACCOUNT.UPDATE_PROFILE,
      {
        avatarUrl: data.avatarUrl,
        phoneNumber: data.phoneNumber,
      }
    );

    if (!response.data || !response.data.data) {
      return thunkAPI.rejectWithValue(
        "Không nhận được dữ liệu hồ sơ sau khi cập nhật"
      );
    }

    const message = response.data.message || "Cập nhật hồ sơ thành công!";
    thunkAPI.dispatch(setMessageSuccess(message));
    return response.data.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Cập nhật hồ sơ thất bại. Vui lòng thử lại!";
    thunkAPI.dispatch(setMessageError(errorMessage));
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Change password thunk
export const changePasswordThunk = createAsyncThunk<
  ApiResponse,
  Params<AccountChangePasswordForm>,
  { rejectValue: string }
>("account/changePassword", async (params, thunkAPI) => {
  const data = params?.data;

  if (!data) {
    return thunkAPI.rejectWithValue("Dữ liệu không hợp lệ");
  }

  try {
    const response = await axiosClient.post<ApiResponse>(
      ROUTES_API_AUTH.CHANGE_PASSWORD,
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      }
    );

    const message = response.data.message || "Đổi mật khẩu thành công!";
    thunkAPI.dispatch(setMessageSuccess(message));
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Đổi mật khẩu thất bại. Vui lòng thử lại!";
    thunkAPI.dispatch(setMessageError(errorMessage));
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Forgot password thunk
export const forgotPasswordThunk = createAsyncThunk<
  ApiResponse,
  Params<ForgotPasswordForm>,
  { rejectValue: string }
>("account/forgotPassword", async (params, thunkAPI) => {
  const data = params?.data;

  if (!data) {
    return thunkAPI.rejectWithValue("Dữ liệu không hợp lệ");
  }

  try {
    const response = await axiosClient.post<ApiResponse>(
      ROUTES_API_AUTH.FORGOT_PASSWORD,
      {
        email: data.email,
      }
    );

    const message =
      response.data.message ||
      "Đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn!";
    thunkAPI.dispatch(setMessageSuccess(message));
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Gửi email thất bại. Vui lòng thử lại!";
    thunkAPI.dispatch(setMessageError(errorMessage));
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Reset password thunk
export const resetPasswordThunk = createAsyncThunk<
  ApiResponse,
  Params<ResetPasswordForm>,
  { rejectValue: string }
>("account/resetPassword", async (params, thunkAPI) => {
  const data = params?.data;

  if (!data) {
    return thunkAPI.rejectWithValue("Dữ liệu không hợp lệ");
  }

  try {
    const response = await axiosClient.post<ApiResponse>(
      ROUTES_API_AUTH.RESET_PASSWORD,
      {
        email: data.email,
        resetToken: data.resetToken,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      }
    );

    const message = response.data.message || "Đặt lại mật khẩu thành công!";
    thunkAPI.dispatch(setMessageSuccess(message));
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Đặt lại mật khẩu thất bại. Vui lòng thử lại!";
    thunkAPI.dispatch(setMessageError(errorMessage));
    return thunkAPI.rejectWithValue(errorMessage);
  }
});
