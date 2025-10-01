import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StudentRobotResult } from "common/@types/studentRobot";
import {
  getMyRobotsThunk,
  activateRobotThunk,
  updateStudentRobotSettingsThunk,
  getStudentRobotByIdThunk,
} from "./studentRobotThunks";

interface StudentRobotState {
  // My Robots
  myRobots: {
    data: StudentRobotResult[] | null;
    isLoading: boolean;
    error: string | null;
  };
  // Current Student Robot
  currentStudentRobot: {
    data: StudentRobotResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Activation state
  activation: {
    isActivating: boolean;
    activationError: string | null;
    activationSuccess: boolean;
    lastActivatedRobotId?: string;
  };
  // Update settings state
  updateSettings: {
    isUpdating: boolean;
    updateError: string | null;
    updateSuccess: boolean;
  };
}

const initialState: StudentRobotState = {
  myRobots: {
    data: null,
    isLoading: false,
    error: null,
  },
  currentStudentRobot: {
    data: null,
    isLoading: false,
    error: null,
  },
  activation: {
    isActivating: false,
    activationError: null,
    activationSuccess: false,
  },
  updateSettings: {
    isUpdating: false,
    updateError: null,
    updateSuccess: false,
  },
};

const studentRobotSlice = createSlice({
  name: "studentRobot",
  initialState,
  reducers: {
    clearActivationStatus: (state) => {
      state.activation.activationError = null;
      state.activation.activationSuccess = false;
      state.activation.lastActivatedRobotId = undefined;
    },
    clearUpdateStatus: (state) => {
      state.updateSettings.updateError = null;
      state.updateSettings.updateSuccess = false;
    },
    clearErrors: (state) => {
      state.myRobots.error = null;
      state.currentStudentRobot.error = null;
      state.activation.activationError = null;
      state.updateSettings.updateError = null;
    },
    setCurrentStudentRobot: (state, action: PayloadAction<StudentRobotResult>) => {
      state.currentStudentRobot.data = action.payload;
      state.currentStudentRobot.error = null;
    },
    clearCurrentStudentRobot: (state) => {
      state.currentStudentRobot.data = null;
      state.currentStudentRobot.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get My Robots
    builder
      .addCase(getMyRobotsThunk.pending, (state) => {
        state.myRobots.isLoading = true;
        state.myRobots.error = null;
      })
      .addCase(getMyRobotsThunk.fulfilled, (state, action) => {
        state.myRobots.isLoading = false;
        state.myRobots.data = action.payload;
        state.myRobots.error = null;
      })
      .addCase(getMyRobotsThunk.rejected, (state, action) => {
        state.myRobots.isLoading = false;
        state.myRobots.error = action.payload as string;
      });

    // Activate Robot
    builder
      .addCase(activateRobotThunk.pending, (state) => {
        state.activation.isActivating = true;
        state.activation.activationError = null;
        state.activation.activationSuccess = false;
      })
      .addCase(activateRobotThunk.fulfilled, (state, action) => {
        state.activation.isActivating = false;
        state.activation.activationSuccess = true;
        state.activation.activationError = null;

        // Store the activated robot ID
        if (action.payload.studentRobotId) {
          state.activation.lastActivatedRobotId = action.payload.studentRobotId;
        }

        // Add to my robots list if we have the full robot data
        if (action.payload.studentRobot && state.myRobots.data) {
          // Check if not already in list
          const exists = state.myRobots.data.some(
            (r) => r.id === action.payload.studentRobotId
          );
          if (!exists) {
            state.myRobots.data.push(action.payload.studentRobot as StudentRobotResult);
          }
        }
      })
      .addCase(activateRobotThunk.rejected, (state, action) => {
        state.activation.isActivating = false;
        state.activation.activationError = action.payload as string;
        state.activation.activationSuccess = false;
      });

    // Get Student Robot By ID
    builder
      .addCase(getStudentRobotByIdThunk.pending, (state) => {
        state.currentStudentRobot.isLoading = true;
        state.currentStudentRobot.error = null;
      })
      .addCase(getStudentRobotByIdThunk.fulfilled, (state, action) => {
        state.currentStudentRobot.isLoading = false;
        state.currentStudentRobot.data = action.payload;
        state.currentStudentRobot.error = null;
      })
      .addCase(getStudentRobotByIdThunk.rejected, (state, action) => {
        state.currentStudentRobot.isLoading = false;
        state.currentStudentRobot.error = action.payload as string;
      });

    // Update Student Robot Settings
    builder
      .addCase(updateStudentRobotSettingsThunk.pending, (state) => {
        state.updateSettings.isUpdating = true;
        state.updateSettings.updateError = null;
        state.updateSettings.updateSuccess = false;
      })
      .addCase(updateStudentRobotSettingsThunk.fulfilled, (state, action) => {
        state.updateSettings.isUpdating = false;
        state.updateSettings.updateSuccess = true;
        state.updateSettings.updateError = null;

        // Update current robot if it matches
        if (state.currentStudentRobot.data?.id === action.payload.id) {
          state.currentStudentRobot.data = action.payload;
        }

        // Update in my robots list
        if (state.myRobots.data) {
          const index = state.myRobots.data.findIndex(
            (r) => r.id === action.payload.id
          );
          if (index !== -1) {
            state.myRobots.data[index] = action.payload;
          }
        }
      })
      .addCase(updateStudentRobotSettingsThunk.rejected, (state, action) => {
        state.updateSettings.isUpdating = false;
        state.updateSettings.updateError = action.payload as string;
        state.updateSettings.updateSuccess = false;
      });
  },
});

export const {
  clearActivationStatus,
  clearUpdateStatus,
  clearErrors,
  setCurrentStudentRobot,
  clearCurrentStudentRobot,
} = studentRobotSlice.actions;

export default studentRobotSlice.reducer;