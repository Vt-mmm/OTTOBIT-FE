import { PayloadAction, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { UserAuth, UserInfo } from "common/models";
import { toast } from "react-toastify";
import {
  getAuthenticated,
  getEmailVerify,
  getUserAuth,
  getUserInfo,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setAuthenticated,
  setEmailVerify,
  setRefreshToken,
  setUserAuth as setUserAuthUtil,
  clearAuthData,
} from "utils";
import {
  loginThunk,
  logoutThunk,
  registerThunk,
  confirmEmailThunk,
  resetPasswordThunk,
  forgotPasswordThunk,
  resendEmailConfirmationThunk,
} from "./authThunks";

export interface AuthState {
  isLogout: boolean;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isAuthenticated: boolean;
  message: string;
  status: string;
  email: string;
  userAuth: UserAuth | null;
  userInfo: UserInfo | null;
  errorMessage: string | null;
}

const getUserInStorage = getUserAuth() || null;
const getUserInfoInStorage = getUserInfo() || null;
const getIsAuthenticated = getAuthenticated() || false;
const getEmailInStorage = getEmailVerify() || "";

const initialState: AuthState = {
  isLogout: false,
  isLoading: false,
  isError: false,
  isSuccess: false,
  isAuthenticated: getIsAuthenticated,
  message: "",
  status: "",
  email: getEmailInStorage,
  userAuth: getUserInStorage,
  userInfo: getUserInfoInStorage,
  errorMessage: null,
};

// Don't redeclare the thunks here, use them directly from authThunks.ts
// These lines were causing the type error
// export const login = createAsyncThunk("auth/login", loginThunk);
// export const logout = createAsyncThunk("auth/logout", logoutThunk);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMessageSuccess: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
      toast.success(state.message);
    },
    setMessageError: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
      toast.error(state.message);
    },
    setStatus: (state) => {
      state.status = "";
    },
    setEmail: (state, action: PayloadAction<{ email: string }>) => {
      state.email = action.payload?.email;
      setEmailVerify(action.payload?.email);
    },
    setUserAuth: (state, action: PayloadAction<UserAuth>) => {
      state.userAuth = action.payload;
      setUserAuthUtil(action.payload);
    },
    setUserInfo: (state, action: PayloadAction<UserAuth>) => {
      state.userAuth = action.payload;
      setUserAuthUtil(action.payload);
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      if (action.payload) {
        setAuthenticated();
      }
    },
    setIsLogout: (state, action: PayloadAction<boolean>) => {
      state.isLogout = action.payload;
    },
    updateLocalAccessToken: (
      _state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      setAccessToken(action.payload.accessToken);
      setRefreshToken(action.payload.refreshToken);
    },
    removeToken: () => {
      removeAccessToken();
      removeRefreshToken();
    },
    resetAuth: () => {
      // Clean up all auth data
      clearAuthData();

      // Reset state to initial values with auth fields cleared
      return {
        ...initialState,
        isAuthenticated: false,
        userAuth: null,
        userInfo: null,
        email: "",
        isLogout: true,
      };
    },
    clearAuthErrors: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.errorMessage = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.userAuth = action.payload;
      })
      .addCase(loginThunk.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.isAuthenticated = false;
      })

      // Add register thunk cases
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.errorMessage = action.payload as string;
      })

      // Add Google login cases
      .addCase(googleLoginThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.userAuth = action.payload;
      })
      .addCase(googleLoginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.isAuthenticated = false;
        state.errorMessage = action.payload as string;
      })

      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true;
        state.isAuthenticated = false;
        state.userAuth = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.isAuthenticated = false;
        state.userAuth = null;
        state.isLogout = true;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      })

      // Email confirmation cases
      .addCase(confirmEmailThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(confirmEmailThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
      })
      .addCase(confirmEmailThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.errorMessage = action.payload as string;
      })

      // Reset password cases
      .addCase(resetPasswordThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPasswordThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.errorMessage = action.payload as string;
      })

      // Forgot password cases
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.errorMessage = action.payload as string;
      })

      // Resend email confirmation cases
      .addCase(resendEmailConfirmationThunk.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
        state.errorMessage = null;
      })
      .addCase(resendEmailConfirmationThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.message = action.payload;
        state.errorMessage = null;
      })
      .addCase(resendEmailConfirmationThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = "";
        state.errorMessage = action.payload as string;
      });
  },
});

export const {
  setMessageSuccess,
  setMessageError,
  setEmail,
  setUserAuth,
  setUserInfo,
  setIsAuthenticated,
  setIsLogout,
  updateLocalAccessToken,
  removeToken,
  setStatus,
  resetAuth,
  clearAuthErrors,
} = authSlice.actions;

// Export the thunks directly from the authThunks file for use elsewhere
export {
  loginThunk as login,
  logoutThunk as logout,
  registerThunk as register,
  confirmEmailThunk as confirmEmail,
  resetPasswordThunk as resetPassword,
  forgotPasswordThunk as forgotPassword,
  resendEmailConfirmationThunk as resendEmailConfirmation,
};

// Google login thunk
export const googleLoginThunk = createAsyncThunk<
  UserAuth,
  string,
  { rejectValue: string }
>("auth/googleLogin", async (credential, thunkAPI) => {
  try {
    const { axiosClient } = await import("axiosClient/axiosClient");
    const { ROUTES_API_AUTH } = await import("constants/routesApiKeys");

    // API call với đúng format backend mong đợi
    const apiResponse = await axiosClient.post(ROUTES_API_AUTH.LOGIN_GOOGLE, {
      GoogleIdToken: credential,
    });

    const response = apiResponse.data;
    if (
      !response ||
      !response.data ||
      !response.data.user ||
      !response.data.tokens
    ) {
      return thunkAPI.rejectWithValue("Invalid response from Google login");
    }

    // Tạo user object với structure mới
    const user: UserAuth = {
      userId: response.data.user.userId,
      email: response.data.user.email,
      username: response.data.user.email, // Use email as username (fullName removed from backend)
      roles: response.data.user.roles || ["OttoBitUser"],
      authProvider: "google",
    };

    // Store tokens với structure mới
    const { setAccessToken, setRefreshToken, setUserAuth, setAuthenticated } =
      await import("utils");
    setAccessToken(response.data.tokens.accessToken);
    setRefreshToken(response.data.tokens.refreshToken);
    setUserAuth(user);
    setAuthenticated();

    return user;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || "Google login failed";
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

const authReducer = authSlice.reducer;

export default authReducer;
