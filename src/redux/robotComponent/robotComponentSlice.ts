import { createSlice } from "@reduxjs/toolkit";
import type {
  RobotComponent,
  RobotComponentsResponse,
} from "common/@types/robotComponent";
import {
  getRobotComponentsThunk,
  getRobotComponentsForAdminThunk,
  getRobotComponentByIdThunk,
  getRobotComponentByIdForAdminThunk,
  createRobotComponentThunk,
  updateRobotComponentThunk,
  deleteRobotComponentThunk,
  restoreRobotComponentThunk,
} from "./robotComponentThunks";

interface RobotComponentState {
  robotComponents: RobotComponent[];
  currentRobotComponent: RobotComponent | null;
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

const initialState: RobotComponentState = {
  robotComponents: [],
  currentRobotComponent: null,
  totalCount: 0,
  totalPages: 0,
  pageNumber: 1,
  pageSize: 10,
  isLoading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
};

const robotComponentSlice = createSlice({
  name: "robotComponent",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRobotComponent: (state) => {
      state.currentRobotComponent = null;
    },
  },
  extraReducers: (builder) => {
    // Get all robot components (Public/User)
    builder
      .addCase(getRobotComponentsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRobotComponentsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const response = action.payload as RobotComponentsResponse;
        state.robotComponents = response.items || [];
        state.totalCount = response.totalCount || 0;
        state.totalPages = response.totalPages || 0;
        state.pageNumber = response.pageNumber || 1;
        state.pageSize = response.pageSize || 10;
      })
      .addCase(getRobotComponentsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get all robot components for admin (Admin)
    builder
      .addCase(getRobotComponentsForAdminThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRobotComponentsForAdminThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const response = action.payload as RobotComponentsResponse;
        state.robotComponents = response.items || [];
        state.totalCount = response.totalCount || 0;
        state.totalPages = response.totalPages || 0;
        state.pageNumber = response.pageNumber || 1;
        state.pageSize = response.pageSize || 10;
      })
      .addCase(getRobotComponentsForAdminThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get robot component by ID (Public/User)
    builder
      .addCase(getRobotComponentByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRobotComponentByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRobotComponent = action.payload;
      })
      .addCase(getRobotComponentByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get robot component by ID for admin (Admin)
    builder
      .addCase(getRobotComponentByIdForAdminThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getRobotComponentByIdForAdminThunk.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.currentRobotComponent = action.payload;
        }
      )
      .addCase(getRobotComponentByIdForAdminThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create robot component (Admin)
    builder
      .addCase(createRobotComponentThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createRobotComponentThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.robotComponents.push(action.payload);
        state.totalCount += 1;
      })
      .addCase(createRobotComponentThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update robot component (Admin)
    builder
      .addCase(updateRobotComponentThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateRobotComponentThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.robotComponents.findIndex(
          (rc) => rc.id === action.payload.id
        );
        if (index !== -1) {
          state.robotComponents[index] = action.payload;
        }
        if (state.currentRobotComponent?.id === action.payload.id) {
          state.currentRobotComponent = action.payload;
        }
      })
      .addCase(updateRobotComponentThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete robot component (Admin)
    builder
      .addCase(deleteRobotComponentThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteRobotComponentThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.robotComponents = state.robotComponents.filter(
          (rc) => rc.id !== action.payload
        );
        state.totalCount -= 1;
      })
      .addCase(deleteRobotComponentThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Restore robot component (Admin)
    builder
      .addCase(restoreRobotComponentThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restoreRobotComponentThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.robotComponents.findIndex(
          (rc) => rc.id === action.payload.id
        );
        if (index !== -1) {
          state.robotComponents[index] = action.payload;
        } else {
          state.robotComponents.push(action.payload);
          state.totalCount += 1;
        }
      })
      .addCase(restoreRobotComponentThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentRobotComponent } =
  robotComponentSlice.actions;

export default robotComponentSlice.reducer;
