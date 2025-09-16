import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LessonResult, LessonsResponse } from "common/@types/lesson";
import {
  getLessonsThunk,
  getLessonByIdThunk,
  getLessonsByCourseThunk,
  createLessonThunk,
  updateLessonThunk,
  deleteLessonThunk,
  restoreLessonThunk,
} from "./lessonThunks";

interface LessonState {
  // Lessons list
  lessons: {
    data: LessonsResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // Course lessons (lessons for a specific course)
  courseLessons: {
    data: LessonsResponse | null;
    isLoading: boolean;
    error: string | null;
    courseId: string | null;
  };
  // Current lesson
  currentLesson: {
    data: LessonResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Operations state
  operations: {
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    isRestoring: boolean;
    createError: string | null;
    updateError: string | null;
    deleteError: string | null;
    restoreError: string | null;
  };
}

const initialState: LessonState = {
  lessons: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  courseLessons: {
    data: null,
    isLoading: false,
    error: null,
    courseId: null,
  },
  currentLesson: {
    data: null,
    isLoading: false,
    error: null,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isRestoring: false,
    createError: null,
    updateError: null,
    deleteError: null,
    restoreError: null,
  },
};

const lessonSlice = createSlice({
  name: "lesson",
  initialState,
  reducers: {
    // Clear lessons list
    clearLessons: (state) => {
      state.lessons.data = null;
      state.lessons.error = null;
      state.lessons.lastQuery = null;
    },

    // Clear course lessons
    clearCourseLessons: (state) => {
      state.courseLessons.data = null;
      state.courseLessons.error = null;
      state.courseLessons.courseId = null;
    },

    // Clear current lesson
    clearCurrentLesson: (state) => {
      state.currentLesson.data = null;
      state.currentLesson.error = null;
    },

    // Set current lesson
    setCurrentLesson: (state, action: PayloadAction<LessonResult>) => {
      state.currentLesson.data = action.payload;
      state.currentLesson.error = null;
    },

    // Clear all errors
    clearLessonErrors: (state) => {
      state.lessons.error = null;
      state.courseLessons.error = null;
      state.currentLesson.error = null;
      state.operations.createError = null;
      state.operations.updateError = null;
      state.operations.deleteError = null;
      state.operations.restoreError = null;
    },

    // Reset entire state
    resetLessonState: () => {
      return initialState;
    },

    // Reorder lessons (optimistic update for drag & drop)
    reorderLessons: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      const { fromIndex, toIndex } = action.payload;

      // Reorder in course lessons
      if (state.courseLessons.data?.items) {
        const lessons = [...state.courseLessons.data.items];
        const [movedLesson] = lessons.splice(fromIndex, 1);
        lessons.splice(toIndex, 0, movedLesson);
        
        // Update order property
        lessons.forEach((lesson, index) => {
          lesson.order = index + 1;
        });
        
        state.courseLessons.data.items = lessons;
      }

      // Also update in main lessons list if it contains the same lessons
      if (state.lessons.data?.items) {
        const lessons = [...state.lessons.data.items];
        const fromLesson = lessons[fromIndex];
        const toLesson = lessons[toIndex];
        
        if (fromLesson && toLesson) {
          lessons.splice(fromIndex, 1);
          lessons.splice(toIndex, 0, fromLesson);
          
          lessons.forEach((lesson, index) => {
            lesson.order = index + 1;
          });
          
          state.lessons.data.items = lessons;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get lessons
      .addCase(getLessonsThunk.pending, (state, action) => {
        state.lessons.isLoading = true;
        state.lessons.error = null;
        state.lessons.lastQuery = action.meta.arg;
      })
      .addCase(getLessonsThunk.fulfilled, (state, action) => {
        state.lessons.isLoading = false;
        state.lessons.error = null;
        state.lessons.data = action.payload;
      })
      .addCase(getLessonsThunk.rejected, (state, action) => {
        state.lessons.isLoading = false;
        state.lessons.error = action.payload || "Failed to fetch lessons";
      })

      // Get lesson by ID
      .addCase(getLessonByIdThunk.pending, (state) => {
        state.currentLesson.isLoading = true;
        state.currentLesson.error = null;
      })
      .addCase(getLessonByIdThunk.fulfilled, (state, action) => {
        state.currentLesson.isLoading = false;
        state.currentLesson.error = null;
        state.currentLesson.data = action.payload;
      })
      .addCase(getLessonByIdThunk.rejected, (state, action) => {
        state.currentLesson.isLoading = false;
        state.currentLesson.error = action.payload || "Failed to fetch lesson";
      })

      // Get lessons by course
      .addCase(getLessonsByCourseThunk.pending, (state, action) => {
        state.courseLessons.isLoading = true;
        state.courseLessons.error = null;
        state.courseLessons.courseId = action.meta.arg.courseId;
      })
      .addCase(getLessonsByCourseThunk.fulfilled, (state, action) => {
        state.courseLessons.isLoading = false;
        state.courseLessons.error = null;
        state.courseLessons.data = action.payload;
      })
      .addCase(getLessonsByCourseThunk.rejected, (state, action) => {
        state.courseLessons.isLoading = false;
        state.courseLessons.error = action.payload || "Failed to fetch course lessons";
      })

      // Create lesson
      .addCase(createLessonThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.operations.createError = null;
      })
      .addCase(createLessonThunk.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = null;
        
        // Add to lessons list if exists
        if (state.lessons.data?.items) {
          state.lessons.data.items.unshift(action.payload);
          state.lessons.data.total += 1;
        }
        
        // Add to course lessons if same course
        if (state.courseLessons.courseId === action.payload.courseId && state.courseLessons.data?.items) {
          // Insert in correct order position
          const newLesson = action.payload;
          const lessons = [...state.courseLessons.data.items];
          
          // Find correct insertion point based on order
          let insertIndex = lessons.findIndex(lesson => lesson.order > newLesson.order);
          if (insertIndex === -1) {
            insertIndex = lessons.length;
          }
          
          lessons.splice(insertIndex, 0, newLesson);
          state.courseLessons.data.items = lessons;
          state.courseLessons.data.total += 1;
        }
      })
      .addCase(createLessonThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = action.payload || "Failed to create lesson";
      })

      // Update lesson
      .addCase(updateLessonThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.operations.updateError = null;
      })
      .addCase(updateLessonThunk.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = null;

        // Update current lesson if same ID
        if (state.currentLesson.data?.id === action.payload.id) {
          state.currentLesson.data = action.payload;
        }

        // Update in lessons list
        if (state.lessons.data?.items) {
          const index = state.lessons.data.items.findIndex(
            (lesson) => lesson.id === action.payload.id
          );
          if (index !== -1) {
            state.lessons.data.items[index] = action.payload;
          }
        }

        // Update in course lessons
        if (state.courseLessons.data?.items) {
          const index = state.courseLessons.data.items.findIndex(
            (lesson) => lesson.id === action.payload.id
          );
          if (index !== -1) {
            state.courseLessons.data.items[index] = action.payload;
          }
        }
      })
      .addCase(updateLessonThunk.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = action.payload || "Failed to update lesson";
      })

      // Delete lesson
      .addCase(deleteLessonThunk.pending, (state) => {
        state.operations.isDeleting = true;
        state.operations.deleteError = null;
      })
      .addCase(deleteLessonThunk.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = null;

        const lessonId = action.payload;

        // Clear current lesson if same ID
        if (state.currentLesson.data?.id === lessonId) {
          state.currentLesson.data = null;
        }

        // Remove from lessons list
        if (state.lessons.data?.items) {
          const index = state.lessons.data.items.findIndex(
            (lesson) => lesson.id === lessonId
          );
          if (index !== -1) {
            state.lessons.data.items.splice(index, 1);
            state.lessons.data.total -= 1;
          }
        }

        // Remove from course lessons
        if (state.courseLessons.data?.items) {
          const index = state.courseLessons.data.items.findIndex(
            (lesson) => lesson.id === lessonId
          );
          if (index !== -1) {
            state.courseLessons.data.items.splice(index, 1);
            state.courseLessons.data.total -= 1;
          }
        }
      })
      .addCase(deleteLessonThunk.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = action.payload || "Failed to delete lesson";
      })

      // Restore lesson
      .addCase(restoreLessonThunk.pending, (state) => {
        state.operations.isRestoring = true;
        state.operations.restoreError = null;
      })
      .addCase(restoreLessonThunk.fulfilled, (state, action) => {
        state.operations.isRestoring = false;
        state.operations.restoreError = null;
        
        // Add back to lessons list if exists
        if (state.lessons.data?.items) {
          state.lessons.data.items.unshift(action.payload);
          state.lessons.data.total += 1;
        }
        
        // Add back to course lessons if same course
        if (state.courseLessons.courseId === action.payload.courseId && state.courseLessons.data?.items) {
          state.courseLessons.data.items.unshift(action.payload);
          state.courseLessons.data.total += 1;
        }
      })
      .addCase(restoreLessonThunk.rejected, (state, action) => {
        state.operations.isRestoring = false;
        state.operations.restoreError = action.payload || "Failed to restore lesson";
      });
  },
});

export const {
  clearLessons,
  clearCourseLessons,
  clearCurrentLesson,
  setCurrentLesson,
  clearLessonErrors,
  resetLessonState,
  reorderLessons,
} = lessonSlice.actions;

// Export thunks
export {
  getLessonsThunk as getLessons,
  getLessonByIdThunk as getLessonById,
  getLessonsByCourseThunk as getLessonsByCourse,
  createLessonThunk as createLesson,
  updateLessonThunk as updateLesson,
  deleteLessonThunk as deleteLesson,
  restoreLessonThunk as restoreLesson,
};

const lessonReducer = lessonSlice.reducer;
export default lessonReducer;