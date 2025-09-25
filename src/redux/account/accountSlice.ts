import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { UserProfileData } from 'common/@types/account';
import {
  changePasswordThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  getMyProfileThunk,
} from './accountThunks';

// Account state interface
export interface AccountState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
  errorMessage: string | null;
  profile: {
    data: UserProfileData | null;
    isLoading: boolean;
    error: string | null;
  };
}

// Initial state
const initialState: AccountState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  errorMessage: null,
  profile: {
    data: null,
    isLoading: false,
    error: null,
  },
};

// Create slice
const accountSlice = createSlice({
  name: 'account',
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
    clearMessage: (state) => {
      state.message = '';
      state.errorMessage = null;
    },
    resetAccountState: () => initialState,
  },
  extraReducers: (builder) => {
    // Get my profile cases
    builder
      .addCase(getMyProfileThunk.pending, (state) => {
        state.profile.isLoading = true;
        state.profile.error = null;
      })
      .addCase(getMyProfileThunk.fulfilled, (state, action) => {
        state.profile.isLoading = false;
        state.profile.data = action.payload;
      })
      .addCase(getMyProfileThunk.rejected, (state, action) => {
        state.profile.isLoading = false;
        state.profile.error = (action.payload as string) || 'Lỗi tải hồ sơ';
        state.profile.data = null;
      })

      // Change password cases
      .addCase(changePasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.errorMessage = action.payload as string;
      })
      
      // Forgot password cases
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
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
      
      // Reset password cases
      .addCase(resetPasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
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
      });
  },
});

// Export thunks
export {
  changePasswordThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  getMyProfileThunk,
} from './accountThunks';

// Export actions
export const {
  setMessageSuccess,
  setMessageError,
  clearMessage,
  resetAccountState,
} = accountSlice.actions;

// Export reducer
export default accountSlice.reducer;
