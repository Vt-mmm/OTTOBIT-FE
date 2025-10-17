import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  LessonResult,
  LessonsResponse,
  LessonsPreviewResponse,
  LessonProgressResponse,
} from "common/@types/lesson";
import {
  getLessonsThunk,
  getLessonByIdThunk,
  getLessonByIdForAdminThunk,
  getLessonsByCourseThunk,
  getLessonsPreviewThunk,
  createLessonThunk,
  updateLessonThunk,
  deleteLessonThunk,
  restoreLessonThunk,
  getLessonProgressThunk,
  startLessonThunk,
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
  // Lesson preview (for non-enrolled users)
  lessonsPreview: {
    data: LessonsPreviewResponse | null;
    isLoading: boolean;
    error: string | null;
    courseId: string | null;
  };
  // Current lesson (for users)
  currentLesson: {
    data: LessonResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Current lesson (for admin)
  adminCurrentLesson: {
    data: LessonResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Lesson progress (for enrolled users)
  lessonProgress: {
    data: LessonProgressResponse | null;
    isLoading: boolean;
    error: string | null;
    courseId: string | null;
  };
  // Operations state
  operations: {
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    isRestoring: boolean;
    isStarting: boolean;
    createError: string | null;
    updateError: string | null;
    deleteError: string | null;
    restoreError: string | null;
    startError: string | null;
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
  lessonsPreview: {
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
  adminCurrentLesson: {
    data: null,
    isLoading: false,
    error: null,
  },
  lessonProgress: {
    data: null,
    isLoading: false,
    error: null,
    courseId: null,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isRestoring: false,
    isStarting: false,
    createError: null,
    updateError: null,
    deleteError: null,
    restoreError: null,
    startError: null,
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

    // Clear lesson preview
    clearLessonsPreview: (state) => {
      state.lessonsPreview.data = null;
      state.lessonsPreview.error = null;
      state.lessonsPreview.courseId = null;
    },

    // Clear lesson progress
    clearLessonProgress: (state) => {
      state.lessonProgress.data = null;
      state.lessonProgress.error = null;
      state.lessonProgress.courseId = null;
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
      state.lessonsPreview.error = null;
      state.currentLesson.error = null;
      state.lessonProgress.error = null;
      state.operations.createError = null;
      state.operations.updateError = null;
      state.operations.deleteError = null;
      state.operations.restoreError = null;
      state.operations.startError = null;
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

    // Toast actions
    setMessageSuccess: (_state, action: PayloadAction<string>) => {
      toast.success(action.payload);
    },
    setMessageError: (_state, action: PayloadAction<string>) => {
      toast.error(action.payload);
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

      // Get lesson by ID for admin
      .addCase(getLessonByIdForAdminThunk.pending, (state) => {
        state.adminCurrentLesson.isLoading = true;
        state.adminCurrentLesson.error = null;
      })
      .addCase(getLessonByIdForAdminThunk.fulfilled, (state, action) => {
        state.adminCurrentLesson.isLoading = false;
        state.adminCurrentLesson.error = null;
        state.adminCurrentLesson.data = action.payload;
      })
      .addCase(getLessonByIdForAdminThunk.rejected, (state, action) => {
        state.adminCurrentLesson.isLoading = false;
        state.adminCurrentLesson.error =
          action.payload || "Failed to fetch lesson";
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
        state.courseLessons.error =
          action.payload || "Failed to fetch course lessons";
      })

      // Get lessons preview
      .addCase(getLessonsPreviewThunk.pending, (state, action) => {
        state.lessonsPreview.isLoading = true;
        state.lessonsPreview.error = null;
        state.lessonsPreview.courseId = action.meta.arg.courseId || null;
      })
      .addCase(getLessonsPreviewThunk.fulfilled, (state, action) => {
        state.lessonsPreview.isLoading = false;
        state.lessonsPreview.error = null;
        state.lessonsPreview.data = action.payload;
      })
      .addCase(getLessonsPreviewThunk.rejected, (state, action) => {
        state.lessonsPreview.isLoading = false;
        state.lessonsPreview.error =
          action.payload || "Failed to fetch lesson preview";
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
        if (
          state.courseLessons.courseId === action.payload.courseId &&
          state.courseLessons.data?.items
        ) {
          // Insert in correct order position
          const newLesson = action.payload;
          const lessons = [...state.courseLessons.data.items];

          // Find correct insertion point based on order
          let insertIndex = lessons.findIndex(
            (lesson) => lesson.order > newLesson.order
          );
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
        state.operations.createError =
          action.payload || "Failed to create lesson";
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
        state.operations.updateError =
          action.payload || "Failed to update lesson";
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
        state.operations.deleteError =
          action.payload || "Failed to delete lesson";
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
        if (
          state.courseLessons.courseId === action.payload.courseId &&
          state.courseLessons.data?.items
        ) {
          state.courseLessons.data.items.unshift(action.payload);
          state.courseLessons.data.total += 1;
        }
      })
      .addCase(restoreLessonThunk.rejected, (state, action) => {
        state.operations.isRestoring = false;
        state.operations.restoreError =
          action.payload || "Failed to restore lesson";
      })

      // Get lesson progress
      .addCase(getLessonProgressThunk.pending, (state, action) => {
        state.lessonProgress.isLoading = true;
        state.lessonProgress.error = null;
        state.lessonProgress.courseId = action.meta.arg.courseId || null;
      })
      .addCase(getLessonProgressThunk.fulfilled, (state, action) => {
        state.lessonProgress.isLoading = false;
        state.lessonProgress.error = null;
        state.lessonProgress.data = action.payload;
      })
      .addCase(getLessonProgressThunk.rejected, (state, action) => {
        state.lessonProgress.isLoading = false;
        state.lessonProgress.error =
          action.payload || "Failed to fetch lesson progress";
      })

      // Start lesson
      .addCase(startLessonThunk.pending, (state) => {
        state.operations.isStarting = true;
        state.operations.startError = null;
      })
      .addCase(startLessonThunk.fulfilled, (state, action) => {
        state.operations.isStarting = false;
        state.operations.startError = null;

        // Update lesson progress data if it exists
        if (state.lessonProgress.data?.items) {
          const existingIndex = state.lessonProgress.data.items.findIndex(
            (progress) => progress.lessonId === action.payload.lessonId
          );

          if (existingIndex !== -1) {
            state.lessonProgress.data.items[existingIndex] = action.payload;
          } else {
            state.lessonProgress.data.items.unshift(action.payload);
            state.lessonProgress.data.total += 1;
          }
        }
      })
      .addCase(startLessonThunk.rejected, (state, action) => {
        state.operations.isStarting = false;
        state.operations.startError =
          action.payload || "Failed to start lesson";
      });
  },
});

export const {
  clearLessons,
  clearCourseLessons,
  clearLessonsPreview,
  clearLessonProgress,
  clearCurrentLesson,
  setCurrentLesson,
  clearLessonErrors,
  resetLessonState,
  reorderLessons,
  setMessageSuccess,
  setMessageError,
} = lessonSlice.actions;

// Export thunks
export {
  getLessonsThunk as getLessons,
  getLessonByIdThunk as getLessonById,
  getLessonByIdForAdminThunk as getLessonByIdForAdmin,
  getLessonsByCourseThunk as getLessonsByCourse,
  getLessonsPreviewThunk as getLessonsPreview,
  getLessonProgressThunk as getLessonProgress,
  startLessonThunk as startLesson,
  createLessonThunk as createLesson,
  updateLessonThunk as updateLesson,
  deleteLessonThunk as deleteLesson,
  restoreLessonThunk as restoreLesson,
};

const lessonReducer = lessonSlice.reducer;
export default lessonReducer;
