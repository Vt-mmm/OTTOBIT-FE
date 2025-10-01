import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CourseRobotResult, CourseRobotsResponse } from "common/@types/courseRobot";
import {
  getCourseRobotsThunk,
  getCourseRobotsByCourseThunk,
  getCourseRobotByIdThunk,
  createCourseRobotThunk,
  updateCourseRobotThunk,
  deleteCourseRobotThunk,
} from "./courseRobotThunks";

interface CourseRobotState {
  // CourseRobots list
  courseRobots: {
    data: CourseRobotsResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // Robots by course (for specific course view)
  robotsByCourse: {
    [courseId: string]: {
      data: CourseRobotResult[] | null;
      isLoading: boolean;
      error: string | null;
    };
  };
  // Current courseRobot
  currentCourseRobot: {
    data: CourseRobotResult | null;
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

const initialState: CourseRobotState = {
  courseRobots: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  robotsByCourse: {},
  currentCourseRobot: {
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

const courseRobotSlice = createSlice({
  name: "courseRobot",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.courseRobots.error = null;
      state.currentCourseRobot.error = null;
      state.operations.createError = null;
      state.operations.updateError = null;
      state.operations.deleteError = null;
    },
    clearSuccessFlags: (state) => {
      state.operations.createSuccess = false;
      state.operations.updateSuccess = false;
      state.operations.deleteSuccess = false;
    },
    clearCurrentCourseRobot: (state) => {
      state.currentCourseRobot.data = null;
      state.currentCourseRobot.error = null;
    },
    setCurrentCourseRobot: (state, action: PayloadAction<CourseRobotResult>) => {
      state.currentCourseRobot.data = action.payload;
      state.currentCourseRobot.error = null;
    },
    clearRobotsByCourse: (state, action: PayloadAction<string>) => {
      delete state.robotsByCourse[action.payload];
    },
  },
  extraReducers: (builder) => {
    // Get CourseRobots
    builder
      .addCase(getCourseRobotsThunk.pending, (state, action) => {
        state.courseRobots.isLoading = true;
        state.courseRobots.error = null;
        state.courseRobots.lastQuery = action.meta.arg;
      })
      .addCase(getCourseRobotsThunk.fulfilled, (state, action) => {
        state.courseRobots.isLoading = false;
        state.courseRobots.data = action.payload;
        state.courseRobots.error = null;
      })
      .addCase(getCourseRobotsThunk.rejected, (state, action) => {
        state.courseRobots.isLoading = false;
        state.courseRobots.error = action.payload as string;
      });

    // Get CourseRobots by Course
    builder
      .addCase(getCourseRobotsByCourseThunk.pending, (state, action) => {
        const courseId = action.meta.arg;
        if (!state.robotsByCourse[courseId]) {
          state.robotsByCourse[courseId] = { data: null, isLoading: false, error: null };
        }
        state.robotsByCourse[courseId].isLoading = true;
        state.robotsByCourse[courseId].error = null;
      })
      .addCase(getCourseRobotsByCourseThunk.fulfilled, (state, action) => {
        const courseId = action.meta.arg;
        if (state.robotsByCourse[courseId]) {
          state.robotsByCourse[courseId].isLoading = false;
          state.robotsByCourse[courseId].data = action.payload;
          state.robotsByCourse[courseId].error = null;
        }
      })
      .addCase(getCourseRobotsByCourseThunk.rejected, (state, action) => {
        const courseId = action.meta.arg;
        if (state.robotsByCourse[courseId]) {
          state.robotsByCourse[courseId].isLoading = false;
          state.robotsByCourse[courseId].error = action.payload as string;
        }
      });

    // Get CourseRobot By ID
    builder
      .addCase(getCourseRobotByIdThunk.pending, (state) => {
        state.currentCourseRobot.isLoading = true;
        state.currentCourseRobot.error = null;
      })
      .addCase(getCourseRobotByIdThunk.fulfilled, (state, action) => {
        state.currentCourseRobot.isLoading = false;
        state.currentCourseRobot.data = action.payload;
        state.currentCourseRobot.error = null;
      })
      .addCase(getCourseRobotByIdThunk.rejected, (state, action) => {
        state.currentCourseRobot.isLoading = false;
        state.currentCourseRobot.error = action.payload as string;
      });

    // Create CourseRobot
    builder
      .addCase(createCourseRobotThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.operations.createError = null;
        state.operations.createSuccess = false;
      })
      .addCase(createCourseRobotThunk.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createSuccess = true;
        state.operations.createError = null;

        // Add new courseRobot to the list if list exists
        if (state.courseRobots.data?.items) {
          state.courseRobots.data.items.unshift(action.payload);
          state.courseRobots.data.total += 1;
        }

        // Add to robotsByCourse if relevant
        const courseId = action.payload.courseId;
        if (state.robotsByCourse[courseId]?.data) {
          state.robotsByCourse[courseId].data!.unshift(action.payload);
        }
      })
      .addCase(createCourseRobotThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = action.payload as string;
        state.operations.createSuccess = false;
      });

    // Update CourseRobot
    builder
      .addCase(updateCourseRobotThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.operations.updateError = null;
        state.operations.updateSuccess = false;
      })
      .addCase(updateCourseRobotThunk.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateSuccess = true;
        state.operations.updateError = null;

        // Update current courseRobot if it matches
        if (state.currentCourseRobot.data?.id === action.payload.id) {
          state.currentCourseRobot.data = action.payload;
        }

        // Update courseRobot in the list if list exists
        if (state.courseRobots.data?.items) {
          const index = state.courseRobots.data.items.findIndex(
            (item) => item.id === action.payload.id
          );
          if (index !== -1) {
            state.courseRobots.data.items[index] = action.payload;
          }
        }

        // Update in robotsByCourse if relevant
        const courseId = action.payload.courseId;
        if (state.robotsByCourse[courseId]?.data) {
          const index = state.robotsByCourse[courseId].data!.findIndex(
            (item) => item.id === action.payload.id
          );
          if (index !== -1) {
            state.robotsByCourse[courseId].data![index] = action.payload;
          }
        }
      })
      .addCase(updateCourseRobotThunk.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = action.payload as string;
        state.operations.updateSuccess = false;
      });

    // Delete CourseRobot
    builder
      .addCase(deleteCourseRobotThunk.pending, (state) => {
        state.operations.isDeleting = true;
        state.operations.deleteError = null;
        state.operations.deleteSuccess = false;
      })
      .addCase(deleteCourseRobotThunk.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteSuccess = true;
        state.operations.deleteError = null;

        const deletedId = action.payload;

        // Remove from list
        if (state.courseRobots.data?.items) {
          const index = state.courseRobots.data.items.findIndex(
            (item) => item.id === deletedId
          );
          if (index !== -1) {
            state.courseRobots.data.items.splice(index, 1);
            state.courseRobots.data.total -= 1;
          }
        }

        // Clear current if it matches
        if (state.currentCourseRobot.data?.id === deletedId) {
          state.currentCourseRobot.data = null;
        }

        // Remove from robotsByCourse
        Object.keys(state.robotsByCourse).forEach((courseId) => {
          if (state.robotsByCourse[courseId]?.data) {
            const index = state.robotsByCourse[courseId].data!.findIndex(
              (item) => item.id === deletedId
            );
            if (index !== -1) {
              state.robotsByCourse[courseId].data!.splice(index, 1);
            }
          }
        });
      })
      .addCase(deleteCourseRobotThunk.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = action.payload as string;
        state.operations.deleteSuccess = false;
      });
  },
});

export const {
  clearErrors,
  clearSuccessFlags,
  clearCurrentCourseRobot,
  setCurrentCourseRobot,
  clearRobotsByCourse,
} = courseRobotSlice.actions;

export default courseRobotSlice.reducer;