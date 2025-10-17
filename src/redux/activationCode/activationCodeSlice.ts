import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { ActivationCodesResponse } from "common/@types/activationCode";
import {
  getActivationCodesThunk,
  getMyActivationCodesThunk,
  createActivationCodeBatchThunk,
  deleteActivationCodeThunk,
  updateActivationCodeStatusThunk,
  exportActivationCodesCsvThunk,
  redeemActivationCodeThunk,
} from "./activationCodeThunks";

interface ActivationCodeState {
  // Activation Codes list (Admin)
  activationCodes: {
    data: ActivationCodesResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // My Activation Codes (User)
  myCodes: {
    data: ActivationCodesResponse | null;
    isLoading: boolean;
    error: string | null;
  };
  // Operations state
  operations: {
    isCreating: boolean;
    isDeleting: boolean;
    isUpdating: boolean;
    isExporting: boolean;
    isRedeeming: boolean;
    createError: string | null;
    deleteError: string | null;
    updateError: string | null;
    exportError: string | null;
    redeemError: string | null;
    createSuccess: boolean;
    deleteSuccess: boolean;
    updateSuccess: boolean;
    exportSuccess: boolean;
    redeemSuccess: boolean;
    lastCreatedCodes?: string[];
    lastRedeemedRobot?: any;
  };
}

const initialState: ActivationCodeState = {
  activationCodes: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  myCodes: {
    data: null,
    isLoading: false,
    error: null,
  },
  operations: {
    isCreating: false,
    isDeleting: false,
    isUpdating: false,
    isExporting: false,
    isRedeeming: false,
    createError: null,
    deleteError: null,
    updateError: null,
    exportError: null,
    redeemError: null,
    createSuccess: false,
    deleteSuccess: false,
    updateSuccess: false,
    exportSuccess: false,
    redeemSuccess: false,
  },
};

const activationCodeSlice = createSlice({
  name: "activationCode",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.activationCodes.error = null;
      state.operations.createError = null;
      state.operations.deleteError = null;
      state.operations.updateError = null;
      state.operations.exportError = null;
      state.operations.redeemError = null;
    },
    clearSuccessFlags: (state) => {
      state.operations.createSuccess = false;
      state.operations.deleteSuccess = false;
      state.operations.updateSuccess = false;
      state.operations.exportSuccess = false;
      state.operations.redeemSuccess = false;
      state.operations.lastCreatedCodes = undefined;
      state.operations.lastRedeemedRobot = undefined;
    },
    clearRedeemStatus: (state) => {
      state.operations.redeemError = null;
      state.operations.redeemSuccess = false;
      state.operations.lastRedeemedRobot = undefined;
    },

    // Toast actions
    setMessageSuccess: (_state, action: PayloadAction<string>) => {
      toast.success(action.payload);
    },
    setMessageError: (_state, action: PayloadAction<string>) => {
      toast.error(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Get Activation Codes
    builder
      .addCase(getActivationCodesThunk.pending, (state, action) => {
        state.activationCodes.isLoading = true;
        state.activationCodes.error = null;
        state.activationCodes.lastQuery = action.meta.arg;
      })
      .addCase(getActivationCodesThunk.fulfilled, (state, action) => {
        state.activationCodes.isLoading = false;
        state.activationCodes.data = action.payload;
        state.activationCodes.error = null;
      })
      .addCase(getActivationCodesThunk.rejected, (state, action) => {
        state.activationCodes.isLoading = false;
        state.activationCodes.error = action.payload as string;
      });

    // Create Activation Code Batch
    builder
      .addCase(createActivationCodeBatchThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.operations.createError = null;
        state.operations.createSuccess = false;
      })
      .addCase(createActivationCodeBatchThunk.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createSuccess = true;
        state.operations.createError = null;
        state.operations.lastCreatedCodes = action.payload.codes;
      })
      .addCase(createActivationCodeBatchThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = action.payload as string;
        state.operations.createSuccess = false;
      });

    // Update Activation Code Status
    builder
      .addCase(updateActivationCodeStatusThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.operations.updateError = null;
        state.operations.updateSuccess = false;
      })
      .addCase(updateActivationCodeStatusThunk.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateSuccess = true;
        state.operations.updateError = null;

        // Update in list
        if (state.activationCodes.data?.items) {
          const index = state.activationCodes.data.items.findIndex(
            (item) => item.id === action.payload.id
          );
          if (index !== -1) {
            state.activationCodes.data.items[index] = action.payload;
          }
        }
      })
      .addCase(updateActivationCodeStatusThunk.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = action.payload as string;
        state.operations.updateSuccess = false;
      });

    // Export Activation Codes CSV
    builder
      .addCase(exportActivationCodesCsvThunk.pending, (state) => {
        state.operations.isExporting = true;
        state.operations.exportError = null;
        state.operations.exportSuccess = false;
      })
      .addCase(exportActivationCodesCsvThunk.fulfilled, (state) => {
        state.operations.isExporting = false;
        state.operations.exportSuccess = true;
        state.operations.exportError = null;
      })
      .addCase(exportActivationCodesCsvThunk.rejected, (state, action) => {
        state.operations.isExporting = false;
        state.operations.exportError = action.payload as string;
        state.operations.exportSuccess = false;
      });

    // Delete Activation Code
    builder
      .addCase(deleteActivationCodeThunk.pending, (state) => {
        state.operations.isDeleting = true;
        state.operations.deleteError = null;
        state.operations.deleteSuccess = false;
      })
      .addCase(deleteActivationCodeThunk.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteSuccess = true;
        state.operations.deleteError = null;

        // Remove from list
        if (state.activationCodes.data?.items) {
          const index = state.activationCodes.data.items.findIndex(
            (item) => item.id === action.payload
          );
          if (index !== -1) {
            state.activationCodes.data.items.splice(index, 1);
            state.activationCodes.data.total -= 1;
          }
        }
      })
      .addCase(deleteActivationCodeThunk.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = action.payload as string;
        state.operations.deleteSuccess = false;
      })

      // Redeem Activation Code
      .addCase(redeemActivationCodeThunk.pending, (state) => {
        state.operations.isRedeeming = true;
        state.operations.redeemError = null;
        state.operations.redeemSuccess = false;
      })
      .addCase(redeemActivationCodeThunk.fulfilled, (state, action) => {
        state.operations.isRedeeming = false;
        state.operations.redeemSuccess = true;
        state.operations.redeemError = null;
        state.operations.lastRedeemedRobot = action.payload.robot;
      })
      .addCase(redeemActivationCodeThunk.rejected, (state, action) => {
        state.operations.isRedeeming = false;
        state.operations.redeemError = action.payload as string;
        state.operations.redeemSuccess = false;
      });

    // Get My Activation Codes (User)
    builder
      .addCase(getMyActivationCodesThunk.pending, (state) => {
        state.myCodes.isLoading = true;
        state.myCodes.error = null;
      })
      .addCase(getMyActivationCodesThunk.fulfilled, (state, action) => {
        state.myCodes.isLoading = false;
        state.myCodes.data = action.payload;
        state.myCodes.error = null;
      })
      .addCase(getMyActivationCodesThunk.rejected, (state, action) => {
        state.myCodes.isLoading = false;
        state.myCodes.error = action.payload as string;
      });
  },
});

export const {
  clearErrors,
  clearSuccessFlags,
  clearRedeemStatus,
  setMessageSuccess,
  setMessageError,
} = activationCodeSlice.actions;

export default activationCodeSlice.reducer;
