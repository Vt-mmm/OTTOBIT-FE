import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import {
  changePasswordThunk,
  forgotPasswordThunk,
  resetPasswordThunk
} from './accountThunks';

// Account state interface
export interface AccountState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
  errorMessage: string | null;
}

// Initial state
const initialState: AccountState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  errorMessage: null,
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
    // Change password cases
    builder
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
  resetPasswordThunk
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
