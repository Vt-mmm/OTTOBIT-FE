import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { RobotResult, RobotsResponse } from "common/@types/robot";
import {
  getRobotsThunk,
  getRobotByIdThunk,
  createRobotThunk,
  updateRobotThunk,
  deleteRobotThunk,
} from "./robotThunks";

interface RobotState {
  // Robots list
  robots: {
    data: RobotsResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // Current robot
  currentRobot: {
    data: RobotResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Operations state
  operations: {
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    createError: string | null;
    updateError: string | null;
    deleteError: string | null;
    createSuccess: boolean;
    updateSuccess: boolean;
    deleteSuccess: boolean;
  };
}

const initialState: RobotState = {
  robots: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  currentRobot: {
    data: null,
    isLoading: false,
    error: null,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    createError: null,
    updateError: null,
    deleteError: null,
    createSuccess: false,
    updateSuccess: false,
    deleteSuccess: false,
  },
};

const robotSlice = createSlice({
  name: "robot",
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.robots.error = null;
      state.currentRobot.error = null;
      state.operations.createError = null;
      state.operations.updateError = null;
      state.operations.deleteError = null;
    },
    // Clear success flags
    clearSuccessFlags: (state) => {
      state.operations.createSuccess = false;
      state.operations.updateSuccess = false;
      state.operations.deleteSuccess = false;
    },
    // Clear current robot
    clearCurrentRobot: (state) => {
      state.currentRobot.data = null;
      state.currentRobot.error = null;
    },
    // Set current robot
    setCurrentRobot: (state, action: PayloadAction<RobotResult>) => {
      state.currentRobot.data = action.payload;
      state.currentRobot.error = null;
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
    // Get Robots
    builder
      .addCase(getRobotsThunk.pending, (state, action) => {
        state.robots.isLoading = true;
        state.robots.error = null;
        state.robots.lastQuery = action.meta.arg;
      })
      .addCase(getRobotsThunk.fulfilled, (state, action) => {
        state.robots.isLoading = false;
        state.robots.data = action.payload;
        state.robots.error = null;
      })
      .addCase(getRobotsThunk.rejected, (state, action) => {
        state.robots.isLoading = false;
        state.robots.error = action.payload as string;
      });

    // Get Robot By ID
    builder
      .addCase(getRobotByIdThunk.pending, (state) => {
        state.currentRobot.isLoading = true;
        state.currentRobot.error = null;
      })
      .addCase(getRobotByIdThunk.fulfilled, (state, action) => {
        state.currentRobot.isLoading = false;
        state.currentRobot.data = action.payload;
        state.currentRobot.error = null;
      })
      .addCase(getRobotByIdThunk.rejected, (state, action) => {
        state.currentRobot.isLoading = false;
        state.currentRobot.error = action.payload as string;
      });

    // Create Robot
    builder
      .addCase(createRobotThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.operations.createError = null;
        state.operations.createSuccess = false;
      })
      .addCase(createRobotThunk.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createSuccess = true;
        state.operations.createError = null;
        
        // Add new robot to the list if list exists
        if (state.robots.data?.items) {
          state.robots.data.items.unshift(action.payload);
          state.robots.data.total += 1;
        }
      })
      .addCase(createRobotThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = action.payload as string;
        state.operations.createSuccess = false;
      });

    // Update Robot
    builder
      .addCase(updateRobotThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.operations.updateError = null;
        state.operations.updateSuccess = false;
      })
      .addCase(updateRobotThunk.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateSuccess = true;
        state.operations.updateError = null;
        
        // Update current robot if it matches
        if (state.currentRobot.data?.id === action.payload.id) {
          state.currentRobot.data = action.payload;
        }
        
        // Update robot in the list if list exists
        if (state.robots.data?.items) {
          const index = state.robots.data.items.findIndex(
            (robot) => robot.id === action.payload.id
          );
          if (index !== -1) {
            state.robots.data.items[index] = action.payload;
          }
        }
      })
      .addCase(updateRobotThunk.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = action.payload as string;
        state.operations.updateSuccess = false;
      });

    // Delete Robot
    builder
      .addCase(deleteRobotThunk.pending, (state) => {
        state.operations.isDeleting = true;
        state.operations.deleteError = null;
        state.operations.deleteSuccess = false;
      })
      .addCase(deleteRobotThunk.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteSuccess = true;
        state.operations.deleteError = null;
        
        // Hard delete - remove from list completely
        if (state.robots.data?.items) {
          const index = state.robots.data.items.findIndex(
            (robot) => robot.id === action.payload
          );
          if (index !== -1) {
            state.robots.data.items.splice(index, 1);
            state.robots.data.total -= 1;
          }
        }
        
        // Clear current robot if it matches deleted robot
        if (state.currentRobot.data?.id === action.payload) {
          state.currentRobot.data = null;
        }
      })
      .addCase(deleteRobotThunk.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = action.payload as string;
        state.operations.deleteSuccess = false;
      });

  },
});

export const {
  clearErrors,
  clearSuccessFlags,
  clearCurrentRobot,
  setCurrentRobot,
  setMessageSuccess,
  setMessageError,
} = robotSlice.actions;

export default robotSlice.reducer;
