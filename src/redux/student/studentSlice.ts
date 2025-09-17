import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StudentResult, StudentsResponse } from "common/@types/student";
import {
  getStudentByUserThunk,
  getStudentsThunk,
  createStudentThunk,
  updateStudentThunk,
} from "./studentThunks";

// Student state interface
interface StudentState {
  // Current user's student profile
  currentStudent: {
    data: StudentResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // All students (admin view)
  students: {
    data: StudentsResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // Operations state
  operations: {
    isCreating: boolean;
    isUpdating: boolean;
    createError: string | null;
    updateError: string | null;
  };
}

const initialState: StudentState = {
  currentStudent: {
    data: null,
    isLoading: false,
    error: null,
  },
  students: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    createError: null,
    updateError: null,
  },
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    // Clear current student
    clearCurrentStudent: (state) => {
      state.currentStudent.data = null;
      state.currentStudent.error = null;
    },

    // Clear students list
    clearStudents: (state) => {
      state.students.data = null;
      state.students.error = null;
      state.students.lastQuery = null;
    },

    // Clear all errors
    clearStudentErrors: (state) => {
      state.currentStudent.error = null;
      state.students.error = null;
      state.operations.createError = null;
      state.operations.updateError = null;
    },

    // Set current student directly
    setCurrentStudent: (state, action: PayloadAction<StudentResult>) => {
      state.currentStudent.data = action.payload;
      state.currentStudent.error = null;
    },

    // Reset entire student state
    resetStudentState: () => {
      return initialState;
    },

    // Update current student data (useful for optimistic updates)
    updateCurrentStudentData: (
      state,
      action: PayloadAction<Partial<StudentResult>>
    ) => {
      if (state.currentStudent.data) {
        state.currentStudent.data = {
          ...state.currentStudent.data,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get current user's student profile
      .addCase(getStudentByUserThunk.pending, (state) => {
        state.currentStudent.isLoading = true;
        state.currentStudent.error = null;
      })
      .addCase(getStudentByUserThunk.fulfilled, (state, action) => {
        state.currentStudent.isLoading = false;
        state.currentStudent.error = null;
        state.currentStudent.data = action.payload;
      })
      .addCase(getStudentByUserThunk.rejected, (state, action) => {
        state.currentStudent.isLoading = false;
        state.currentStudent.error =
          action.payload || "Failed to fetch student profile";
        state.currentStudent.data = null;
      })

      // Get students (admin)
      .addCase(getStudentsThunk.pending, (state, action) => {
        state.students.isLoading = true;
        state.students.error = null;
        state.students.lastQuery = action.meta.arg;
      })
      .addCase(getStudentsThunk.fulfilled, (state, action) => {
        state.students.isLoading = false;
        state.students.error = null;
        state.students.data = action.payload;
      })
      .addCase(getStudentsThunk.rejected, (state, action) => {
        state.students.isLoading = false;
        state.students.error = action.payload || "Failed to fetch students";
        state.students.data = null;
      })

      // Create student
      .addCase(createStudentThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.operations.createError = null;
      })
      .addCase(createStudentThunk.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = null;
        // Set as current student since user is creating their own profile
        state.currentStudent.data = action.payload;
      })
      .addCase(createStudentThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError =
          action.payload || "Failed to create student";
      })

      // Update student
      .addCase(updateStudentThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.operations.updateError = null;
      })
      .addCase(updateStudentThunk.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = null;
        // Update current student if it's the same ID
        if (
          state.currentStudent.data &&
          state.currentStudent.data.id === action.payload.id
        ) {
          state.currentStudent.data = action.payload;
        }
        // Update in students list if exists
        if (state.students.data?.data) {
          const index = state.students.data.data.findIndex(
            (student) => student.id === action.payload.id
          );
          if (index !== -1) {
            state.students.data.data[index] = action.payload;
          }
        }
      })
      .addCase(updateStudentThunk.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError =
          action.payload || "Failed to update student";
      });
  },
});

export const {
  clearCurrentStudent,
  clearStudents,
  clearStudentErrors,
  setCurrentStudent,
  resetStudentState,
  updateCurrentStudentData,
} = studentSlice.actions;

// Export the thunks for use elsewhere
export {
  getStudentByUserThunk as getStudentByUser,
  getStudentsThunk as getStudents,
  createStudentThunk as createStudent,
  updateStudentThunk as updateStudent,
};

const studentReducer = studentSlice.reducer;
export default studentReducer;