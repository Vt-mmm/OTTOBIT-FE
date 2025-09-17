import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "redux/config";
import {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  restoreLesson,
  clearLessons,
  setCurrentLesson,
  clearLessonErrors,
  resetLessonState,
} from "redux/lesson/lessonSlice";
import {
  GetLessonsParams,
  CreateLessonData,
  UpdateLessonData,
} from "common/@types/lesson";

export const useLesson = () => {
  const dispatch = useAppDispatch();
  const lessonState = useAppSelector((state) => state.lesson);

  // Fetch operations
  const fetchLessons = useCallback(
    (params?: GetLessonsParams) => {
      return dispatch(getLessons(params || {}));
    },
    [dispatch]
  );

  const fetchLessonById = useCallback(
    (id: string) => {
      return dispatch(getLessonById(id));
    },
    [dispatch]
  );

  // CRUD operations
  const createNewLesson = useCallback(
    (data: CreateLessonData) => {
      return dispatch(createLesson(data));
    },
    [dispatch]
  );

  const updateExistingLesson = useCallback(
    (id: string, data: UpdateLessonData) => {
      return dispatch(updateLesson({ id, data }));
    },
    [dispatch]
  );

  const deleteExistingLesson = useCallback(
    (id: string) => {
      return dispatch(deleteLesson(id));
    },
    [dispatch]
  );

  const restoreDeletedLesson = useCallback(
    (id: string) => {
      return dispatch(restoreLesson(id));
    },
    [dispatch]
  );

  // State management actions
  const clearAllLessons = useCallback(() => {
    dispatch(clearLessons());
  }, [dispatch]);

  const selectLesson = useCallback(
    (lesson: any) => {
      dispatch(setCurrentLesson(lesson));
    },
    [dispatch]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearLessonErrors());
  }, [dispatch]);

  const resetState = useCallback(() => {
    dispatch(resetLessonState());
  }, [dispatch]);

  // Computed values
  const isLoading = 
    lessonState.lessons.isLoading ||
    lessonState.currentLesson.isLoading ||
    lessonState.operations.isCreating ||
    lessonState.operations.isUpdating ||
    lessonState.operations.isDeleting ||
    lessonState.operations.isRestoring;

  const hasError = 
    !!lessonState.lessons.error ||
    !!lessonState.currentLesson.error ||
    !!lessonState.operations.createError ||
    !!lessonState.operations.updateError ||
    !!lessonState.operations.deleteError ||
    !!lessonState.operations.restoreError;

  return {
    // State
    lessons: lessonState.lessons.data?.items || [],
    totalLessons: lessonState.lessons.data?.total || 0,
    currentLesson: lessonState.currentLesson.data,
    lastQuery: lessonState.lessons.lastQuery,

    // Loading states
    isLoading,
    isLoadingLessons: lessonState.lessons.isLoading,
    isLoadingCurrentLesson: lessonState.currentLesson.isLoading,
    isCreating: lessonState.operations.isCreating,
    isUpdating: lessonState.operations.isUpdating,
    isDeleting: lessonState.operations.isDeleting,
    isRestoring: lessonState.operations.isRestoring,

    // Error states
    hasError,
    lessonsError: lessonState.lessons.error,
    currentLessonError: lessonState.currentLesson.error,
    createError: lessonState.operations.createError,
    updateError: lessonState.operations.updateError,
    deleteError: lessonState.operations.deleteError,
    restoreError: lessonState.operations.restoreError,

    // Actions
    fetchLessons,
    fetchLessonById,
    createNewLesson,
    updateExistingLesson,
    deleteExistingLesson,
    restoreDeletedLesson,
    clearAllLessons,
    selectLesson,
    clearErrors,
    resetState,
  };
};